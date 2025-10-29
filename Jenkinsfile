pipeline {
    agent any

    environment {
        DOCKER_HUB_CREDENTIALS = credentials('dockerhub-credentials')
        DOCKER_HUB_USERNAME = 'infinithin'

        FRONTEND_IMAGE = "${DOCKER_HUB_USERNAME}/cure-connect-frontend"
        BACKEND_IMAGE  = "${DOCKER_HUB_USERNAME}/cure-connect-backend"

        VERSION = "${BUILD_NUMBER}"
    }

    stages {
        stage('Checkout') {
            steps {
                echo 'Checking out code from GitHub...'
                checkout scm
            }
        }

        stage('Build Backend') {
            steps {
                echo 'Building Backend with Maven...'
                dir('backend') {
                    sh 'mvn clean package -DskipTests'
                }
            }
        }

        stage('Build Frontend') {
            steps {
                echo 'Building Frontend with npm...'
                dir('frontend') {
                    sh 'npm ci --legacy-peer-deps'
                    sh 'npm run build -- --configuration production'
                }
            }
        }

        stage('Build Docker Images') {
            steps {
                echo 'Building Docker images...'
                sh "docker build -t ${BACKEND_IMAGE}:${VERSION} -t ${BACKEND_IMAGE}:latest ./backend"
                sh "docker build -t ${FRONTEND_IMAGE}:${VERSION} -t ${FRONTEND_IMAGE}:latest ./frontend"
            }
        }

        stage('Push to Docker Hub') {
            steps {
                echo 'Pushing images to Docker Hub...'
                sh "echo ${DOCKER_HUB_CREDENTIALS_PSW} | docker login -u ${DOCKER_HUB_CREDENTIALS_USR} --password-stdin"
                sh "docker push ${BACKEND_IMAGE}:${VERSION}"
                sh "docker push ${BACKEND_IMAGE}:latest"
                sh "docker push ${FRONTEND_IMAGE}:${VERSION}"
                sh "docker push ${FRONTEND_IMAGE}:latest"
            }
        }

        stage('Deploy Application') {
            steps {
                echo 'Deploying application on same EC2...'
                sh '''
                    # Copy compose file to app directory
                    cp docker-compose.yml /home/ubuntu/cure-connect/
                    cd /home/ubuntu/cure-connect

                    # Pull latest images
                    docker-compose -f docker-compose.yml pull

                    # Stop old containers (ignore errors if first run)
                    docker-compose -f docker-compose.yml down || true

                    # Start new containers
                    docker-compose -f docker-compose.yml up -d

                    # Clean up old images
                    docker image prune -f

                    # Show running containers
                    echo "Deployment complete! Running containers:"
                    docker ps
                '''
            }
        }
    }
}
