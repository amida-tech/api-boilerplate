pipeline {
    agent any

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }
        stage('Build') {
            steps {
                echo 'Building...'
                sh 'cp .env.example .env'
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