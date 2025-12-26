pipeline {
    agent {
        label 'my-node-1'
    }

    parameters {
        choice(name: 'ACTION', choices: ['apply', 'destroy'], description: 'Select whether to create or destroy the infrastructure.')
    }

    environment {
        // IDs must match exactly what you saved in Jenkins Credentials
        AWS_ACCESS_KEY_ID     = credentials('aws-access-key')
        AWS_SECRET_ACCESS_KEY = credentials('aws-secret-key')
        PATH                  = "${WORKSPACE}/bin:${PATH}"
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }
    }

        stage('Install Terraform') {
            steps {
                script {
                    sh '''
                        mkdir -p ${WORKSPACE}/bin
                        cd ${WORKSPACE}/bin
                        
                        echo "--- Downloading Terraform ---"
                        curl -LO https://releases.hashicorp.com/terraform/1.9.5/terraform_1.9.5_linux_amd64.zip
                        
                        echo "--- Extracting Terraform ---"
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

        stage('Approval') {
            steps {
                input message: "Confirm ${params.ACTION}?", ok: 'Proceed'
            }
        }

        stage('Terraform Execution') {
            steps {
                dir('terraform') {
                    sh 'terraform apply -input=false tfplan'
                }
            }
        }
    }

    post {
        always {
            sh "rm -f terraform/tfplan"
        }
    }
}
