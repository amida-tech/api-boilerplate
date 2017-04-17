pipeline {
    agent any

    stages {
        stage('Checkout') {
            steps {
                def nodeHome = tool name: '6.10.0', type: 'jenkins.plugins.nodejs.tools.NodeJSInstallation'
                env.PATH = "${nodeHome}/bin:${env.PATH}"
                checkout scm
            }
        }
        stage('Build') {
            steps {
                echo 'Building...'
                sh 'cp .env.example .env'
                sh 'node -v'
                sh 'yarn'
                sh 'yarn build'
            }
        }
        stage('Test') {
            steps {
                echo 'Testing...'
                sh 'yarn test'
            }
        }
        stage('Deploy') {
            steps {
                echo 'Deploying...'
            }
        }
    }
}