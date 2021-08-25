pipeline {
    agent any

    stages {
        stage('Info') {
            steps {
                sh 'echo \'current directory is:\'; pwd'
            }
        }
        // stage('Install Dependencies') {
        //     steps {
        //         sh 'pip install -r requirements.txt'
        //     }
        // }
        stage('Run') {
            steps {
                sh 'python app.py local_db'
            }
        }
        
	}
}