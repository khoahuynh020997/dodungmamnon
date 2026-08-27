# Đồ Dùng Mầm Non — Quản lý đơn hàng

Ứng dụng quản lý đơn hàng cho cửa hàng **Đồ Dùng Mầm Non**. Giao diện đỏ – trắng, dùng được trên điện thoại và máy tính.

**Ứng dụng:** https://khoahuynh020997.github.io/dodungmamnon/

## Tính năng

- **Trang chủ** — đơn hôm nay, đang giao, doanh thu tuần / tháng
- **Tạo đơn hàng** — nhập tên, số điện thoại, địa chỉ, giá tiền
- **3 trạng thái** — Đang giao → Đã giao thành công → Đã nhận tiền về tài khoản
- **Lịch sử đơn** — tìm kiếm, lọc theo trạng thái
- **Khách hàng** — tự lưu khi tạo đơn, bấm **Đặt lại** để điền nhanh
- **Báo cáo** — tuần này, tháng này, năm nay, hoặc chọn khoảng ngày; biểu đồ số tiền đã thu

Dữ liệu lưu trên trình duyệt (không cần đăng nhập). Có sẵn dữ liệu mẫu — bấm **Xóa dữ liệu mẫu** khi bắt đầu dùng thật.

## Chạy local

```bash
npm install
npm run dev
```

## Build & deploy

```bash
npm run build
```

GitHub Actions tự build và deploy lên GitHub Pages khi push lên `main`.

Sau khi Actions chạy xong, bật Pages (nếu chưa): **Settings → Pages → Source = GitHub Actions**.

## Trạng thái đơn

| Trạng thái | Ý nghĩa |
|---|---|
| Đang giao | Đơn mới, đang trên đường |
| Đã giao thành công | Khách đã nhận hàng |
| Đã nhận tiền | Tiền đã về tài khoản — tính vào doanh thu |
