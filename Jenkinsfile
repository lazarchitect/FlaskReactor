pipeline {
    agent { docker { image 'python:3.7.3' } }
    stages {
        stage('build') {
            steps {
                sh 'python --version'
            }
        }
    }
}

// scripted pipeline
// node('docker') {
//     checkout scm
//     stage('Build') {
//         docker.image('python:3.5.1').inside {
//             sh 'python --version'
//         }
//     }
// }