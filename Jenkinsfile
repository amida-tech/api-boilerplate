pipeline {
    agent any

    stages {
        stage('Checkout') {
            git branch: 'master', url: 'git@github.com:amida-tech/api-boilerplate.git'
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