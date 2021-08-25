pipeline {
    agent any

    stages {
        stage('Info') {
            steps {
                sh 'pwd'
                sh 'cd /home/pi'
                sh 'pwd; ls'
            }
        }
        stage('Build') {
            steps {
                echo 'Building..'
            }
        }
        
	}
}