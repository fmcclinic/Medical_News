GÓI FILE KHUYẾN MÃI CHIA SẺ FACEBOOK

File có trong gói:
- index.html: đã thêm meta Open Graph cho trang chủ
- promotion/promotion.html: đã thêm nút "Xem Chi Tiết" cho từng chương trình
- promo/promo-common.css: CSS dùng chung cho các landing page
- promo/vip-member.html
- promo/hpv-co-tu-cung.html
- promo/ung-thu-vu.html
- promo/ung-thu-tuyen-giap.html

Cách đưa vào site:
1. Thay file index.html hiện tại bằng file trong gói
2. Thay file promotion/promotion.html hiện tại bằng file trong gói
3. Tạo thư mục promo/ và chép 5 file trong thư mục promo/ vào đó

Lưu ý:
- Các landing page đang dùng lại ảnh hiện có trong thư mục promotion/
- OG image hiện đang trỏ trực tiếp đến các ảnh poster hiện có
- Muốn preview đẹp hơn trên Facebook, nên tạo thêm ảnh ngang 1200x630 rồi thay meta og:image trong từng file promo/*.html
- Sau khi deploy, mở Meta Sharing Debugger và bấm Scrape Again cho từng URL:
  https://friendmedicalclinic.com/promo/vip-member.html
  https://friendmedicalclinic.com/promo/hpv-co-tu-cung.html
  https://friendmedicalclinic.com/promo/ung-thu-vu.html
  https://friendmedicalclinic.com/promo/ung-thu-tuyen-giap.html


Bạn là AI Frontend Developer.

Nhiệm vụ của bạn chỉ tập trung vào PHẦN PROMOTION của website, không phân tích hay sửa các module khác ngoài phạm vi được mô tả dưới đây.

## MỤC TIÊU

Từ file `promotion/promotion.html` hiện có, hãy tách từng khối khuyến mãi thành các file HTML độc lập để mỗi chương trình khuyến mãi có thể có URL riêng, dùng để chia sẻ lên Facebook với preview riêng biệt.

## PHẠM VI CÔNG VIỆC

Chỉ làm các việc sau:

1. Đọc nội dung trong `promotion/promotion.html`
2. Xác định từng block khuyến mãi riêng biệt
3. Tạo các file HTML độc lập cho từng promotion
4. Giữ nguyên tinh thần thiết kế, màu sắc, nội dung, CTA của từng promotion
5. Nếu cần, tạo thêm một file CSS dùng chung cho các landing page promotion
6. Có thể chỉnh lại `promotion/promotion.html` chỉ để thêm nút hoặc link sang các landing page riêng
7. Không sửa các phần khác của website ngoài promotion

## KHÔNG ĐƯỢC LÀM

- Không sửa `hero`
- Không sửa `specialist`
- Không sửa `news`
- Không sửa `contact`
- Không đổi kiến trúc toàn site ngoài phần promotion
- Không tự ý viết lại nội dung marketing theo hướng khác
- Không thay đổi ý nghĩa chương trình khuyến mãi
- Không thêm framework mới

## YÊU CẦU KỸ THUẬT

### 1. Mỗi promotion phải có một file HTML riêng
Ví dụ:
- `promo/vip-member.html`
- `promo/hpv-co-tu-cung.html`
- `promo/ung-thu-vu.html`
- `promo/ung-thu-tuyen-giap.html`

### 2. Mỗi file HTML riêng phải có đầy đủ cấu trúc:
- `<!DOCTYPE html>`
- `<html lang="vi">`
- `<head>`
- `<meta charset="UTF-8">`
- `<meta name="viewport" content="width=device-width, initial-scale=1.0">`
- `<title>`
- `<meta name="description">`
- `<link rel="canonical">`

### 3. Phải có Open Graph cho từng trang promotion
Mỗi file riêng phải có:
- `og:type`
- `og:site_name`
- `og:title`
- `og:description`
- `og:url`
- `og:image`
- `og:image:width`
- `og:image:height`
- `og:locale`

và thêm:
- `twitter:card`
- `twitter:title`
- `twitter:description`
- `twitter:image`

### 4. Về nội dung
Mỗi file HTML phải lấy đúng nội dung từ block promotion tương ứng trong `promotion.html`, bao gồm:
- tiêu đề
- badge
- mô tả
- giá
- giảm giá
- danh sách quyền lợi / tính năng
- ghi chú
- CTA

### 5. Về giao diện
- Giữ phong cách giao diện gần nhất với block gốc trong `promotion.html`
- Responsive tốt trên mobile
- Không phụ thuộc JS của trang chủ
- Nếu cần countdown thì phải tự chạy độc lập trong file đó
- Nếu không cần countdown thì có thể bỏ, nhưng phải giữ nội dung khuyến mãi chính

### 6. Về liên kết CTA
Trong mỗi landing page promotion:
- nút CTA chính phải dẫn về trang chính hoặc khu vực liên hệ/đặt lịch
- ví dụ:
  - `https://friendmedicalclinic.com/#contact-slot`
  - hoặc số điện thoại / zalo nếu đã có sẵn trong hệ thống

### 7. Về file promotion gốc
Trong `promotion/promotion.html`, mỗi block promotion nên có thêm nút:
- `Xem Chi Tiết`
trỏ tới landing page riêng của promotion đó

Ví dụ:
- VIP → `https://friendmedicalclinic.com/promo/vip-member.html`
- HPV → `https://friendmedicalclinic.com/promo/hpv-co-tu-cung.html`

## ĐẦU RA MONG MUỐN

Hãy xuất kết quả theo dạng:

### A. Danh sách file sẽ tạo / sửa
Ví dụ:
- `promotion/promotion.html` (sửa)
- `promo/vip-member.html` (mới)
- `promo/hpv-co-tu-cung.html` (mới)
- `promo/ung-thu-vu.html` (mới)
- `promo/ung-thu-tuyen-giap.html` (mới)
- `promo/promo-common.css` (mới, nếu cần)

### B. Viết FULL CODE hoàn chỉnh cho từng file
Không viết diff.
Không viết pseudo-code.
Phải viết full code hoàn chỉnh, sẵn sàng lưu file.

### C. Code phải production-ready
- Không để placeholder mơ hồ
- Không để comment kiểu “thêm sau”
- Không bỏ dở phần head/meta
- Đường dẫn ảnh phải hợp lý theo cấu trúc file hiện có
- Nếu dùng ảnh từ thư mục `promotion/` hiện tại, hãy map đúng ảnh tương ứng

## NGUYÊN TẮC QUAN TRỌNG

- Chỉ làm phần promotion
- Không lan sang các module khác
- Không phân tích dài dòng
- Ưu tiên kết quả thực thi được ngay
- Nếu thấy nội dung trong `promotion.html` đã đủ, hãy bám sát nội dung gốc tối đa
- Nếu cần tái sử dụng CSS, ưu tiên tạo `promo/promo-common.css` để tránh lặp code quá nhiều

## BỐI CẢNH MỤC ĐÍCH

Mục tiêu cuối cùng là:
- mỗi khuyến mãi có 1 URL riêng
- khi dán link đó lên Facebook thì có preview riêng
- dễ chạy quảng cáo / chia sẻ / ghim bài trên Facebook Page

Bây giờ hãy đọc `promotion/promotion.html` và tạo toàn bộ các file cần thiết theo đúng yêu cầu trên.