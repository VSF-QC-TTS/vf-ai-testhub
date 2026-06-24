pipeline {
    agent any

    options {
        // Giới hạn số lượng bản build log lưu lại để tránh đầy ổ cứng Jenkins
        buildDiscarder(logRotator(numToKeepStr: '10'))
        // Thêm timeout để tránh job bị treo vô thời hạn (15 phút)
        timeout(time: 15, unit: 'MINUTES')
        // In thêm thời gian vào log để dễ dò lỗi
        timestamps()
    }

    stages {
        stage('Pull Code') {
            steps {
                echo ' Đang tải code mới nhất từ kho lưu trữ...'
                checkout scm
            }
        }

        stage('Prepare Environment') {
            steps {
                echo 'Chuẩn bị file biến môi trường (.env)...'
                // Ghi chú: Mở comment 3 dòng dưới sau khi tạo Secret trên Jenkins
                 withCredentials([file(credentialsId: 'fd513faa-6df3-4155-b041-149463ea60ce', variable: 'SECRET_ENV')]) {
                     sh 'cp $SECRET_ENV .env'
                }
            }
        }

        stage('Build Images') {
            steps {
                echo ' Build các Docker image (Client, API, Runner)...'
                // Tách riêng bước Build để kiểm tra lỗi Compile trước khi chạy
                sh 'docker compose build'
            }
        }

        stage('Deploy System') {
            steps {
                echo 'Tắt hệ thống cũ và khởi động hệ thống mới...'
                // Nếu Build ở trên thành công thì mới thực hiện tắt hệ thống cũ
                sh 'docker compose down'
                sh 'docker compose up -d'
            }
        }

        stage('Clean Up (Optimize)') {
            steps {
                echo 'Dọn dẹp rác Docker để tránh đầy ổ cứng Server...'
                // Xóa các image "mồ côi" không còn được sử dụng
                sh 'docker image prune -f'
            }
        }
    }
    
    post {
        always {
            echo 'Hoàn tất chu trình CI/CD.'
        }
        success {
            echo 'SUCCESS: Deploy lên Server thành công rực rỡ!'
        }
        failure {
            echo 'FAILED: Deploy thất bại! Vui lòng kiểm tra lại log.'
            // Có thể cấu hình gửi tin nhắn Slack/Teams báo lỗi ở đây
        }
    }
}
