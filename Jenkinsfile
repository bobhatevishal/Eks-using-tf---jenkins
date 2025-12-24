pipeline {
    agent any

    parameters {
        choice(name: 'ACTION', choices: ['apply', 'destroy'], description: 'Select whether to create or destroy the infrastructure.')
    }

    environment {
        AWS_CREDS    = 'aws-svc-acct' 
        AWS_REGION   = 'us-east-1'
        CLUSTER_NAME = 'industry-eks-cluster'
        DOCKER_CREDS = 'docker-CREDS'
        DOCKER_USER  = 'bobhatevishal'   
        IMAGE_NAME   = 'practice-app'    
    }

    stages {
        // The 'Declarative: Checkout SCM' stage happens automatically.
        // We remove the manual 'Checkout Github Repo' stage to avoid 'Revision not found' errors.

        stage('Terraform Infrastructure') {
            steps {
                withCredentials([aws(credentialsId: "${AWS_CREDS}", 
                                    accessKeyVariable: 'AWS_ACCESS_KEY_ID', 
                                    secretKeyVariable: 'AWS_SECRET_ACCESS_KEY')]) {
                    script {
                        dir('practice') { 
                            sh 'terraform init'
                            if (params.ACTION == 'apply') {
                                sh 'terraform plan'
                                sh 'terraform apply -auto-approve'
                            } else {
                                sh 'terraform destroy -auto-approve'
                            }
                        }
                    }
                }
            }
        }

        stage('Build & Push to Docker Hub') {
            when {
                expression { params.ACTION == 'apply' }
            }
            steps {
                withCredentials([usernamePassword(credentialsId: "${DOCKER_CREDS}", 
                                                 passwordVariable: 'DOCKER_PASS', 
                                                 usernameVariable: 'DOCKER_USER_ID')]) {
                    script {
                        sh "echo ${DOCKER_PASS} | docker login -u ${DOCKER_USER_ID} --password-stdin"
                        sh "docker build -t ${DOCKER_USER}/${IMAGE_NAME}:${BUILD_NUMBER} ."
                        sh "docker build -t ${DOCKER_USER}/${IMAGE_NAME}:latest ."
                        sh "docker push ${DOCKER_USER}/${IMAGE_NAME}:${BUILD_NUMBER}"
                        sh "docker push ${DOCKER_USER}/${IMAGE_NAME}:latest"
                    }
                }
            }
        }

        stage('Deploy to EKS Cluster') {
            when {
                expression { params.ACTION == 'apply' }
            }
            steps {
                withCredentials([aws(credentialsId: "${AWS_CREDS}", 
                                    accessKeyVariable: 'AWS_ACCESS_KEY_ID', 
                                    secretKeyVariable: 'AWS_SECRET_ACCESS_KEY')]) {
                    script {
                        sh "aws eks update-kubeconfig --region ${AWS_REGION} --name ${CLUSTER_NAME}"
                        sh "sed -i 's|IMAGE_PLACEHOLDER|${DOCKER_USER}/${IMAGE_NAME}:${BUILD_NUMBER}|g' k8s/deployment.yaml"
                        sh "kubectl apply -f k8s/deployment.yaml"
                        sh "kubectl rollout status deployment/my-app-deployment"
                    }
                }
            }
        }
    }

    post {
        success {
            script {
                if (params.ACTION == 'apply') {
                    echo "Successfully built Infra and Deployed App!"
                    sh "kubectl get nodes"
                    sh "kubectl get svc"
                } else {
                    echo "Infrastructure successfully destroyed."
                }
            }
        }
        failure {
            echo "Pipeline failed. Check Jenkins logs for details."
        }
        always {
            sh "docker logout || true"
        }
    }
}
