pipeline {
    agent any

    stages {
        stage('Build') {
            steps {
                echo 'Building..'
            }
        }
        stage('Deploy') {
            steps {
                sh 'ls'
                sh 'cd ~'
                sh 'ls'
            }
        }
        stage('Zany!') {
            steps {
                echo 'hello, wacky world!'
            }
        }
	}
}