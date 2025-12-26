pipeline {
    agent {
        label 'my-node-1'
    }

    parameters {
        choice(name: 'ACTION', choices: ['apply', 'destroy'], description: 'Select whether to create or destroy the infrastructure.')
    }

    environment {
        // Adding local bin to PATH
        PATH = "${WORKSPACE}/bin:${PATH}"
    }

    stages {
        stage('Install Dependencies') {
            steps {
                script {
                    // Create bin directory
                    sh "mkdir -p ${WORKSPACE}/bin"
                    
                    // Check for unzip and install if missing (requires sudo on the node)
                    sh '''
                        if ! command -v unzip &> /dev/null; then
                            echo "unzip not found, attempting install..."
                            sudo apt-get update && sudo apt-get install -y unzip
                        fi
                    '''

                    // Download Terraform only if it doesn't exist to save time
                    sh '''
                        if [ ! -f "${WORKSPACE}/bin/terraform" ]; then
                            echo "--- Downloading Terraform ---"
                            curl -O https://releases.hashicorp.com/terraform/1.9.5/terraform_1.9.5_linux_amd64.zip
                            unzip -o terraform_1.9.5_linux_amd64.zip -d ${WORKSPACE}/bin
                            chmod +x ${WORKSPACE}/bin/terraform
                            rm terraform_1.9.5_linux_amd64.zip
                        fi
                    '''
                }
            }
        }

        stage('Terraform Init') {
            steps {
                // Ensure this folder name matches your GitHub repo exactly
                dir('terraform') {
                    withCredentials([aws(credentialsId: 'aws-svc-acct', 
                                        accessKeyVariable: 'AWS_ACCESS_KEY_ID', 
                                        secretKeyVariable: 'AWS_SECRET_ACCESS_KEY')]) {
                        sh 'terraform init'
                    }
                }
            }
        }

        stage('Terraform Plan') {
            steps {
                dir('terraform') {
                    withCredentials([aws(credentialsId: 'aws-svc-acct', 
                                        accessKeyVariable: 'AWS_ACCESS_KEY_ID', 
                                        secretKeyVariable: 'AWS_SECRET_ACCESS_KEY')]) {
                        script {
                            if (params.ACTION == 'apply') {
                                sh 'terraform plan -out=tfplan'
                            } else {
                                sh 'terraform plan -destroy -out=tfplan'
                            }
                        }
                    }
                }
            }
        }

        stage('Approval') {
            steps {
                input message: "Proceed with ${params.ACTION}?", ok: 'Yes'
            }
        }

        stage('Terraform Execution') {
            steps {
                dir('terraform') {
                    withCredentials([aws(credentialsId: 'aws-svc-acct', 
                                        accessKeyVariable: 'AWS_ACCESS_KEY_ID', 
                                        secretKeyVariable: 'AWS_SECRET_ACCESS_KEY')]) {
                        sh 'terraform apply -input=false tfplan'
                    }
                }
            }
        }
    }

    post {
        always {
            // Clean up the plan file but keep the binary if you want to speed up next run
            sh "rm -f terraform/tfplan"
        }
        success {
            echo "Terraform ${params.ACTION} completed successfully."
        }
        failure {
            echo "Pipeline failed. Check the logs for unzip, terraform, or AWS permission errors."
        }
    }
}
