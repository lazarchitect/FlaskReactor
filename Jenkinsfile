pipeline {
    agent any

    stages {
        stage('Info') {
            steps {
                sh 'echo \'current directory is:\'; pwd'
                sh 'python3 -c \'import sys; print(sys.path)\''
                sh 'python3 -c "import sys; print(sys.path)"'
            }
        }
        // stage('Install Dependencies') {
        //     steps {
        //         sh 'pip install -r requirements.txt'
        //     }
        // }
        stage('Run') {
            steps {
                sh 'python3 app.py local_db'
            }
        }
        
	}
}