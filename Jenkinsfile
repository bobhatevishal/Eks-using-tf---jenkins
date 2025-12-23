pipeline {
    agent any

    environment {
 
        AWS_CREDS    = 'aws-svc-acct' 
        AWS_REGION   = 'us-east-1'
        CLUSTER_NAME = 'industry-eks-cluster'
        DOCKER_CREDS = 'docker-CREDS'
        DOCKER_USER  = 'bobhatevishal'   
        IMAGE_NAME   = 'practice-app'    
    }

    stages {
        stage('Checkout Github Repo') {
            steps {
                git 'https://github.com/bobhatevishal/Eks-using-tf---jenkins.git'
            }
        }

        stage('Terraform Infrastructure') {
            steps {
                withCredentials([aws(credentialsId: "${AWS_CREDS}", 
                                    accessKeyVariable: 'AWS_ACCESS_KEY_ID', 
                                    secretKeyVariable: 'AWS_SECRET_ACCESS_KEY')]) {
                    script {
                
                        dir('practice') { 
                            sh 'terraform init'
                            sh 'terraform plan'
                        }
                    }
                }
            }
        }

        stage('Build & Push to Docker Hub') {
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
            echo "Successfully built Infra and Deployed App!"
            sh "kubectl get nodes"
            sh "kubectl get svc"
        }
        failure {
            echo "Pipeline failed. Check Jenkins logs for details."
        }
    }
}
