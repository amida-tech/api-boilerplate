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
                cp .env.example .env
                yarn build
            }
        }
        stage('Test') {
            steps {
                echo 'Testing...'
                yarn test
            }
        }
        stage('Deploy') {
            steps {
                echo 'Deploying...'
            }
        }
    }
}