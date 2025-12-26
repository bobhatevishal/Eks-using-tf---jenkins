pipeline {
    agent {
        label 'my-node-1'
    }

    parameters {
        choice(name: 'ACTION', choices: ['apply', 'destroy'], description: 'Select whether to create or destroy the infrastructure.')
    }

    environment {
        // IDs must match exactly what you saved in Jenkins Credentials
        AWS_CREDS = credentials('aws-svc-acct') 
        PATH      = "${WORKSPACE}/bin:${PATH}"
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
                        
                        if [ ! -f "terraform" ]; then
                            echo "--- Downloading Terraform ---"
                            curl -LO https://releases.hashicorp.com/terraform/1.9.5/terraform_1.9.5_linux_amd64.zip
                            
                            echo "--- Extracting without sudo ---"
                            # Attempt extraction using unzip, fallback to python3 if unzip is missing
                            if command -v unzip &> /dev/null; then
                                unzip -o terraform_1.9.5_linux_amd64.zip
                            elif command -v python3 &> /dev/null; then
                                python3 -m zipfile -e terraform_1.9.5_linux_amd64.zip .
                            else
                                echo "ERROR: No unzip or python3 found on this node."
                                exit 1
                            fi
                            
                            chmod +x terraform
                            rm terraform_1.9.5_linux_amd64.zip
                        fi
                        
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
                // This creates a button in the Jenkins UI you must click to proceed
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
            // Clean up the plan file to keep the workspace clean
            sh "rm -f terraform/tfplan"
        }
    }
}
