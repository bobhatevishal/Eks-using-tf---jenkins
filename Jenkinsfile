pipeline {
    agent {
        // Run directly on the agent, do NOT spin up a sibling container
        label 'my-node-1'
    }

    parameters {
        choice(name: 'ACTION', choices: ['apply', 'destroy'], description: 'Select whether to create or destroy the infrastructure.')
    }
    
    environment {
        AWS_ACCESS_KEY_ID     = credentials('aws-access-key')
        AWS_SECRET_ACCESS_KEY = credentials('aws-secret-key')
        // Add local bin to PATH so the shell can find the 'terraform' command we install
        PATH                  = "${WORKSPACE}/bin:${PATH}"
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Install Terraform') {
            steps {
                script {
                    sh '''
                        mkdir -p ${WORKSPACE}/bin
                        cd ${WORKSPACE}/bin
                        
                        echo "--- Downloading Terraform ---"
                        # Downloading a specific stable version (Linux AMD64)
                        curl -O https://releases.hashicorp.com/terraform/1.9.5/terraform_1.9.5_linux_amd64.zip
                        
                        echo "--- Installing ---"
                        unzip -o terraform_1.9.5_linux_amd64.zip
                        chmod +x terraform
                        rm terraform_1.9.5_linux_amd64.zip
                        
                        echo "--- Verifying ---"
                        ./terraform --version
                    '''
                }
            }
        }

        stage('Terraform Init') {
            steps {
                dir('terraform') {
                    sh 'terraform init'
                }
            }
        }

        stage('Terraform Plan') {
            steps {
                dir('terraform') {
                    sh 'terraform plan -out=tfplan'
                }
            }
        }

        stage('Approval') {
            steps {
                input message: 'Create/Update Infrastructure?', ok: 'Yes'
            }
        }

        stage('Terraform Apply') {
            steps {
                dir('terraform') {
                    sh 'terraform apply -input=false tfplan'
                }
            }
        }
    }
}
