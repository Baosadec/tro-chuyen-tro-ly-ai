# Gemini AI Playground VN

Ứng dụng React đơn giản để test Gemini API (Chat & Vision), chạy trực tiếp trên trình duyệt mà không cần cài đặt môi trường phức tạp (No-Build).

## 🚀 Cách chạy trên máy tính (Local)

Bạn không thể mở trực tiếp file `index.html` bằng cách click đúp (do chính sách bảo mật CORS của trình duyệt). Hãy làm theo cách sau:

1. **Cách dễ nhất:**
   - Chạy file `start.bat` trong thư mục này.
   - Trình duyệt sẽ mở (hoặc bạn truy cập `http://localhost:8000`).

2. **Yêu cầu:** Máy tính cần cài sẵn **Python** hoặc **Node.js** để `start.bat` hoạt động.

## 🌐 Cách đưa lên GitHub (GitHub Pages)

Để chia sẻ hoặc test online:

1. Tạo một Repository mới trên GitHub.
2. Upload toàn bộ các file trong thư mục này lên Repository đó.
3. Vào **Settings** > **Pages**.
4. Tại mục **Branch**, chọn `main` (hoặc `master`) và nhấn **Save**.
5. Đợi lát GitHub sẽ cung cấp link trang web cho bạn.

## 🔑 Cấu hình API Key

Vì đây là ứng dụng chạy phía Client (trình duyệt) và không có Backend riêng:

1. Mở file `index.html`.
2. Tìm dòng: `API_KEY: ''`.
3. Điền Google Gemini API Key của bạn vào đó. Ví dụ: `API_KEY: 'AIzaSuxxxxx...'`.
4. Lưu file và chạy lại.

**Lưu ý bảo mật:** Nếu bạn để API Key trong code và đưa lên GitHub public, người khác có thể dùng key của bạn. Chỉ nên dùng cách này cho các repo **Private** hoặc mục đích test nhanh, sau đó xóa key hoặc Regenerate key mới.