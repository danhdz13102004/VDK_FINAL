# Hệ Thống Giám Sát và Điều Khiển Máy Ấp Trứng

Đây là một hệ thống web được thiết kế để giám sát và điều khiển máy ấp trứng từ xa thông qua giao diện web.

## Tổng Quan

Hệ thống bao gồm hai phần chính:
- **Backend**: Máy chủ Node.js với Express.js và WebSocket để xử lý dữ liệu cảm biến và lệnh điều khiển.
- **Frontend**: Giao diện web hiển thị dữ liệu cảm biến và các nút điều khiển.

Hệ thống cho phép:
- Giám sát nhiệt độ và độ ẩm trong thời gian thực
- Xem dữ liệu lịch sử qua biểu đồ
- Điều khiển các thiết bị từ xa
- Lưu trữ dữ liệu cảm biến vào cơ sở dữ liệu MongoDB

## Cấu Trúc Dự Án

```
├── backend/
│   ├── index.js        # Mã nguồn chính của máy chủ
│   ├── package.json    # Cấu hình và dependencies
│   └── public/         # Thư mục chứa frontend
│       └── index.html  # Giao diện web
```

## Công Nghệ Sử Dụng

### Backend
- **Node.js & Express**: Để xây dựng máy chủ web
- **WebSocket (ws)**: Kết nối thời gian thực với thiết bị ESP32 và giao diện người dùng
- **MongoDB & Mongoose**: Lưu trữ dữ liệu cảm biến
- **CORS**: Cho phép truy cập từ các nguồn khác nhau

### Frontend
- **HTML, CSS, JavaScript**: Giao diện người dùng
- **Chart.js**: Hiển thị biểu đồ dữ liệu
- **WebSocket**: Giao tiếp thời gian thực với máy chủ

## Cài Đặt và Chạy

### Yêu Cầu
- Node.js (v12 trở lên)
- MongoDB

### Các Bước Cài Đặt

1. Clone dự án:
```bash
git clone <đường_dẫn_repo>
cd WEB_FINAL
```

2. Cài đặt các gói phụ thuộc:
```bash
cd backend
npm install
```

3. Khởi động máy chủ:
```bash
npm start
```

4. Truy cập ứng dụng web tại địa chỉ: `http://localhost:3000`

## Tính Năng

### Giám Sát
- Hiển thị nhiệt độ và độ ẩm theo thời gian thực
- Thông báo khi nhiệt độ/độ ẩm vượt ngưỡng
- Xem dữ liệu lịch sử theo ngày, tuần, tháng

### Điều Khiển
- Bật/tắt hệ thống làm mát
- Điều chỉnh cài đặt nhiệt độ và độ ẩm
- Điều khiển các thiết bị khác trong máy ấp trứng

## Kết Nối Phần Cứng

Hệ thống kết nối với thiết bị ESP32 qua WebSocket hoặc HTTP:
- ESP32 gửi dữ liệu cảm biến tới máy chủ
- Máy chủ gửi lệnh điều khiển đến ESP32
- Dữ liệu được lưu trữ trong MongoDB mỗi 10 phút

## API Endpoints

### HTTP Endpoints
- `POST /sensor-data`: Nhận dữ liệu cảm biến từ ESP32
- `POST /control`: Gửi lệnh điều khiển đến ESP32
- `GET /api/history`: Lấy dữ liệu lịch sử cảm biến với các tùy chọn lọc

### WebSocket
- Kết nối với máy chủ để nhận dữ liệu cảm biến theo thời gian thực
- Gửi và nhận lệnh điều khiển


---
