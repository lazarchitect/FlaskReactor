pipeline {
    agent {
        docker {
            image 'python:3-buster' 
        }
    }
    stages {
        stage('Confirm_Details') {
            steps {
                echo "Image details"
                sh "python --version"
                docker "ps"
            }
        }
        stage("Docker_Stop_Existing_Container") {
            steps {
                docker "stop app"
            }
        }
        stage("Docker_Build_New_Image") {
            steps {
                docker "build -t flaskreactor:latest ."
            }
        }
        stage("Docker_Run_New_Container") {
            steps {
                docker "run -d -p 5000:5000 --name app flaskreactor:latest"
            }
        }
        stage("Docker_Confirm") {
            steps {
                docker "image inspect app"
            }
        }
    }
}