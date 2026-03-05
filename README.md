# 📚 Website Đánh Giá Học Sinh - Gia Sư Online

Website đánh giá và theo dõi tiến độ học tập của học sinh **Phạm Quang Tuấn**, dành cho gia sư và phụ huynh.  
Dữ liệu được lưu trữ bằng file **CSV**, quản lý offline và commit lên GitHub.

---

## 📁 Cấu trúc file

```
📂 PhamQuangTuan/
├── 📄 index.html     → Dashboard read-only (GitHub Pages)
├── 🎨 style.css      → Giao diện CSS (responsive)
├── ⚙️ script.js      → Logic đọc & hiển thị dữ liệu từ CSV
├── 📊 data.csv       → Dữ liệu buổi học (commit lên GitHub)
├── 🛠️ admin.html     → Trang quản lý offline (KHÔNG upload GitHub)
├── 🖼️ qr-code.png    → Ảnh QR chuyển khoản
└── 📝 README.md      → Hướng dẫn này
```

---

## 🔄 Quy trình sử dụng

### Sau mỗi buổi dạy:

1. **Mở `admin.html`** trên máy tính (mở trực tiếp bằng trình duyệt, không cần server).
2. **Tải file CSV hiện tại**: Nhấn **"Mở file CSV"** → chọn file `data.csv` trong thư mục project.
3. **Thêm/Sửa/Xoá** buổi học qua giao diện.
4. **Tải CSV xuống**: Nhấn **"Tải CSV xuống"** → file `data.csv` mới sẽ được tải về.
5. **Thay thế file cũ**: Copy file `data.csv` vừa tải về vào thư mục project (ghi đè file cũ).
6. **Commit lên GitHub**:
   ```bash
   git add data.csv
   git commit -m "Cập nhật buổi học ngày DD/MM/YYYY"
   git push
   ```
7. Website trên GitHub Pages sẽ tự động hiển thị dữ liệu mới.

---

## 📊 Định dạng file CSV

File `data.csv` có các cột:

| Cột | Mô tả | Ví dụ |
|-----|--------|-------|
| `id` | Mã buổi học (tự tạo) | `m1abc2d3ef` |
| `date` | Ngày học (YYYY-MM-DD) | `2025-01-15` |
| `content` | Nội dung buổi học | `Giải tích - Nguyên hàm` |
| `homework` | Bài tập (JSON array) | `[{"name":"Bài 1","completed":true}]` |
| `comment` | Nhận xét gia sư | `Hiểu bài tốt` |
| `reviewNeeded` | Cần ôn tập thêm | `Tích phân` |
| `understandLevel` | Mức hiểu bài (1-10) | `7` |

> **Lưu ý**: Cột `homework` chứa chuỗi JSON. Không cần sửa thủ công, dùng `admin.html` để quản lý.

---

## 🚀 Hướng dẫn deploy GitHub Pages

### Bước 1: Tạo Repository
1. Đăng nhập [github.com](https://github.com).
2. Tạo repository mới (chọn **Public**).

### Bước 2: Upload files
Upload các file sau lên repository:
- `index.html`
- `style.css`
- `script.js`
- `data.csv`
- `qr-code.png`
- `README.md`

> ⚠️ **KHÔNG upload** `admin.html` (chỉ dùng offline trên máy).

### Bước 3: Bật GitHub Pages
1. Vào **Settings** → **Pages**.
2. Source: **main** branch, folder: **/ (root)**.
3. Nhấn **Save**.
4. Website sẽ có link dạng: `https://TEN-GITHUB.github.io/TEN-REPO/`

---

## ✨ Tính năng

| Tính năng | Mô tả |
|-----------|--------|
| 📊 Dashboard | Thông tin học sinh, thống kê, biểu đồ |
| 📅 Lọc theo tháng | Xem buổi học và thống kê theo từng tháng |
| 📝 Admin offline | Thêm/sửa/xoá buổi học qua giao diện, xuất CSV |
| 💳 Thanh toán | Mã QR chuyển khoản cho phụ huynh |
| 📱 Responsive | Giao diện phù hợp điện thoại |
| 📂 CSV-based | Dữ liệu lưu file CSV, dễ quản lý và backup |

---

## 🎨 Tuỳ chỉnh

### Thay ảnh QR
Thay file `qr-code.png` trong thư mục project.

### Thay thông tin ngân hàng
Trong `index.html`, tìm `<div class="bank-details">` và sửa thông tin.

---

**© 2026 Gia Sư Online**
