# AI Hỗ Trợ Điều Tra - Multi-Agent System

Hệ thống demo sử dụng **NestJS** (Backend) + **React** (Frontend) với tích hợp **Ollama/Qwen3.6**.

---

## 🚀 Cách Chạy Demo

### Bước 1: Cài đặt Dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### Bước 2: Kiểm tra Ollama

```bash
# Kiểm tra Ollama đã cài chưa
ollama list

# Nếu chưa có Qwen3.6
ollama pull qwen3.6
```

### Bước 3: Chạy Ứng Dụng

```bash
# Terminal 1: Chạy Backend (port 3001)
cd backend
npm run dev

# Terminal 2: Chạy Frontend (port 3000)
cd frontend
npm run dev
```

### Bước 4: Mở Demo

Mở trình duyệt: **http://localhost:3000**

---

## 📋 Luồng Demo A-Z

### 1. Đăng nhập với tư cách Lãnh đạo (Ông A)

- Sidebar bên trái → Chọn "Ông A" từ dropdown
- Click "📁 Vụ Án" → "Tạo Vụ Án Mới"

### 2. Tạo Vụ Án

- Tiêu đề: "Vụ trộm tài sản tại Ngõ 5"
- Mô tả: "Tối ngày 14/08, tại cửa hàng tiện lợi Ngõ 5, phát hiện kẻ gian đột nhập..."
- Độ ưu tiên: Cao
- Click "Tạo Vụ Án"

### 3. AI Gợi Ý Phân Công

- Sau khi tạo vụ án, click **"🤖 Gợi Ý Phân Công Bằng AI"**
- AI sẽ phân tích và đề xuất phân công dựa trên kỹ năng
- Click **"✅ Chấp Nhận Phân Công"**

### 4. Chuyển sang Cán Bộ

- Sidebar → Chọn "Anh B" hoặc "Anh C"
- Vào chi tiết vụ án vừa tạo

### 5. Làm Checklist

- Tick các mục trong checklist để hoàn thành công việc
- Tiến độ sẽ được cập nhật

### 6. Viết Báo Cáo

- Khi hoàn thành checklist → Click **"📝 Viết Báo Cáo"**
- Điền nội dung báo cáo
- Click **"📤 Nộp Báo Cáo"**
- AI sẽ kiểm tra và đưa ra đánh giá

### 7. Chat Trong Kênh Vụ Án

- Kênh chat bên phải hiển thị tin nhắn của các thành viên
- Có thể chat trực tiếp với các cán bộ khác trong vụ án

---

## 🏗️ Cấu Trúc Project

```
AiAgentPolice/
├── backend/                    # NestJS Backend
│   ├── src/
│   │   ├── users/            # Module quản lý users
│   │   ├── cases/            # Module quản lý vụ án
│   │   ├── tasks/            # Module checklist
│   │   ├── chat/             # Module chat
│   │   └── ai/               # Module AI (Ollama)
│   └── package.json
│
├── frontend/                   # React Frontend
│   ├── src/
│   │   ├── components/       # Layout
│   │   ├── pages/            # Dashboard, CaseList, CaseDetail...
│   │   ├── services/         # API calls
│   │   └── context/           # AppContext
│   └── package.json
│
└── README.md
```

---

## 🔌 API Endpoints

| Method | Endpoint | Mô tả |
|--------|----------|--------|
| GET | `/api/users` | Lấy danh sách users |
| POST | `/api/users` | Thêm user mới |
| GET | `/api/cases` | Lấy danh sách vụ án |
| POST | `/api/cases` | Tạo vụ án mới |
| GET | `/api/cases/:id` | Chi tiết vụ án |
| POST | `/api/cases/:id/assign` | Phân công nhiệm vụ |
| PUT | `/api/cases/:id/tasks/:taskId` | Cập nhật task |
| PUT | `/api/cases/:id/report` | Nộp báo cáo |
| GET | `/api/tasks/templates` | Lấy template checklist |
| POST | `/api/tasks/user` | Tạo task cho user |
| GET | `/api/chat/channels/case/:caseId/messages` | Tin nhắn chat |
| POST | `/api/chat/channels/:channelId/messages` | Gửi tin nhắn |
| GET | `/api/ai/status` | Kiểm tra AI |
| POST | `/api/ai/suggest-assignment` | AI gợi ý phân công |
| POST | `/api/ai/check-report` | AI kiểm tra báo cáo |

---

## 🤖 Tích Hợp AI

### Ollama

```bash
# Cài Ollama (Linux/Mac)
curl -fsSL https://ollama.com/install.sh | sh

# Windows: Tải từ https://ollama.com/download
```

### Model

```bash
ollama pull qwen3.6
```

### Fallback

Nếu Ollama không chạy, hệ thống sẽ tự động trả về mock response để demo tiếp.

---

## 📱 Tính Năng

- ✅ Tạo vụ án với mô tả chi tiết
- ✅ AI gợi ý phân công dựa trên kỹ năng
- ✅ Checklist công việc cho từng cán bộ
- ✅ Kênh chat nhóm cho vụ án
- ✅ AI kiểm tra báo cáo
- ✅ Quản lý danh sách cán bộ (thêm/sửa/xóa)
- ✅ Chuyển đổi giữa các vai trò (Lãnh đạo/Cán bộ)

---

## 🛠️ Tech Stack

| Thành phần | Công nghệ |
|------------|-----------|
| Backend | NestJS |
| Frontend | React + Vite |
| AI | Ollama + Qwen3.6 |
| Styling | CSS thuần |
