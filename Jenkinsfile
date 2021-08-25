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
                ls
                cd ~
                ls
            }
        }
        stage('Zany!') {
            steps {
                echo 'hello, wacky world!'
            }
        }
	}
}