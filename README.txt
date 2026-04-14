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
