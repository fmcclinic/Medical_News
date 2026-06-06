# Nâng cấp giao diện chuyên khoa - Friend Medical Clinic

Gói này chứa bản nâng cấp giao diện mục **Chuyên khoa** theo mockup đã chọn: khối giới thiệu lớn bên trái và các card chuyên khoa hiện đại bên phải.

## File trong gói

- `specialist-v2.html`  
  File component chính, dạng drop-in replacement cho `specialist.html` hiện tại.

- `specialist-v2-preview.html`  
  File mở thử trực tiếp trên trình duyệt để xem giao diện. Lưu ý: ảnh chỉ hiển thị đúng nếu file được đặt trong môi trường có thư mục ảnh `specialist/image/...`.

- `backup/specialist-current-backup.html`  
  Bản sao lưu file `specialist.html` hiện tại.

- `reference/selected-modern-ui-reference.jpeg`  
  Ảnh mockup giao diện đã chọn, dùng để đối chiếu.

## Cách tích hợp nhanh

1. Sao lưu file cũ trên website:

```text
specialist.html -> specialist.old.html
```

2. Copy nội dung trong file:

```text
specialist-v2.html
```

vào file:

```text
specialist.html
```

3. Đảm bảo thư mục ảnh hiện tại vẫn tồn tại:

```text
specialist/image/
```

Bản V2 đang dùng lại các đường dẫn ảnh cũ như:

```text
specialist/image/specialist1-1.jpg
specialist/image/specialist2-3.jpg
specialist/image/specialist3-1.jpg
specialist/image/specialist4-1.jpg
specialist/image/doctor1.jpg
...
```

## Điểm đã nâng cấp

- Chuyển layout danh sách dọc thành giao diện hiện đại dạng hero + card chuyên khoa.
- Giữ scope CSS trong `#specialist-component-wrapper` để hạn chế ảnh hưởng sang phần khác của website.
- Giữ dữ liệu chuyên khoa, mô tả và đội ngũ bác sĩ từ file cũ.
- Thêm card màu riêng cho từng chuyên khoa:
  - Sản Phụ Khoa: hồng
  - Tai Mũi Họng: xanh teal
  - Nội: xanh dương
  - Nhi: xanh cyan
- Thêm nút `Tìm hiểu thêm` để mở panel chi tiết chuyên khoa.
- Thêm carousel/card navigation bằng mũi tên, dots và hỗ trợ phím trái/phải.
- Tối ưu responsive cho desktop, tablet và mobile.

## Kiểm tra sau khi thay

Nên kiểm tra các kích thước màn hình:

- Desktop 1920px
- Laptop 1366px
- Tablet 768px
- Mobile 390px / 430px

Nếu trình duyệt vẫn hiện giao diện cũ, hãy hard refresh:

```text
Ctrl + F5
```

hoặc xóa cache trình duyệt.
