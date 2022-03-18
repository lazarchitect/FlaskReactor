pipeline {
    agent {
        docker {
            image 'python:3.7.3' 
        }
    }
    stages {
        stage('Confirm_Details') {
            steps {
                echo "Image details"
                sh 'python --version'
            }
        }
        stage("Docker_Deploy") {
            steps {
                echo "stay tuned for updates!"
            }
        }
    }
}