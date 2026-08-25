# Promotion core guide

Tài liệu này là chuẩn tạo, xuất bản, bảo trì và lưu trữ chương trình khuyến mãi. Entry point của module là `promotion/promotion.html`; không di chuyển hoặc đổi tên vì `index.html` tải trực tiếp file này.

## 1. Kiến trúc thư mục

```text
promotion/
├── promotion.html                  Entry point, CSS và JS scoped
├── assets/
│   ├── README.md
│   ├── images/
│   │   ├── active/<campaign-slug>/ Ảnh chương trình đang chạy
│   │   └── legacy/<campaign-slug>/ Ảnh chương trình cũ
│   └── videos/
│       ├── active/<campaign-slug>/ Video chương trình đang chạy (khi có)
│       └── legacy/<campaign-slug>/ Video chương trình cũ
├── archived/
│   ├── README.md
│   └── <campaign-slug>/
│       ├── campaign.html           Snapshot độc lập
│       ├── README.md               Trạng thái và cách tái sử dụng
│       └── assets/                 Media cục bộ của snapshot
└── docs/
    └── promotion-card-core.md

promo/
├── promo-common.css                CSS dùng chung của landing page
└── <landing-page>.html             URL công khai, nếu cần
```

### Nguyên tắc bất biến

- Không đặt ảnh hoặc video trực tiếp trong thư mục gốc `promotion/`.
- Không di chuyển `promotion/promotion.html`.
- Slug dùng chữ thường, không dấu, phân tách bằng gạch ngang, ví dụ `male-checkup`.
- Media đang dùng thuộc `assets/.../active/<campaign-slug>/`.
- Media cũ thuộc `assets/.../legacy/<campaign-slug>/`.
- Chương trình kết thúc có snapshot trong `archived/<campaign-slug>/`.
- Không liên kết snapshot archived từ trang chủ và không dùng snapshot để nhận đăng ký.
- Không sửa `promo/promo-common.css` cho riêng một chiến dịch nếu CSS scoped đáp ứng được.

## 2. Vòng đời chương trình

```text
Chuẩn bị nội dung
    ↓
assets/images/active/<slug>/
    ↓
Card trong promotion.html
    ↓
Landing page trong promo/ (nếu cần URL riêng)
    ↓
Kiểm thử và xuất bản
    ↓
Hết hạn
    ↓
Snapshot trong archived/<slug>/ + media chuyển sang legacy
```

Không xóa ngay landing page đã được chia sẻ. Nếu cần bảo toàn URL, giữ trang, hiển thị rõ chương trình đã kết thúc và thay CTA đăng ký bằng liên kết tới chương trình hiện hành.

## 3. Dữ liệu đầu vào

Chuẩn bị dữ liệu trước khi viết HTML:

```yaml
slug: "<campaign-slug>"
ten_chuong_trinh: "<Tên chương trình>"
trang_thai: "active"
theme: "theme-<ten-theme>"
badge: "<NHÓM CHƯƠNG TRÌNH>"
tieu_de: "<Tiêu đề chính>"
thong_diep_noi_bat: "<Lợi ích nổi bật>"
mo_ta: "<Đối tượng + lợi ích + lý do hành động>"
bat_dau: "<YYYY-MM-DD>"
ket_thuc: "<YYYY-MM-DD>"
hinh_anh: "/promotion/assets/images/active/<campaign-slug>/poster.png"
alt_hinh_anh: "<Mô tả chính xác hình ảnh và chương trình>"
quyen_loi:
  - "<Quyền lợi 1>"
  - "<Quyền lợi 2>"
goi_kham:
  - ten: "<Tên gói>"
    gia_tien: "<Ví dụ: 3.128.000 VNĐ>"
    hang_muc: ["<Hạng mục 1>", "<Hạng mục 2>"]
dieu_kien: "<Đối tượng, số lượng, thời gian hoặc điều kiện>"
link_chi_tiet: "/promo/<landing-page>.html"
link_dang_ky: "#contact-slot"
```

Ngày, giá, quyền lợi và điều kiện phải được xác nhận trước khi xuất bản. Không mang placeholder hoặc dữ liệu của chiến dịch cũ vào chương trình mới.

## 4. Mẫu card nội dung

```text
fmc-promo-card theme-<theme>
├── fmc-col-img
│   └── img
└── fmc-col-info
    ├── fmc-sticker                 Tuỳ chọn
    ├── fmc-badge
    ├── fmc-title > highlight
    ├── fmc-desc
    ├── khối giá/quyền lợi          Tuỳ nội dung
    ├── fmc-list-grid               Tuỳ chọn
    ├── fmc-info-box                Tuỳ chọn
    ├── fmc-countdown               Tuỳ chọn
    └── fmc-btn-group
```

```html
<div class="fmc-promo-card theme-<ten-theme>">
    <div class="fmc-sticker"><ƯU ĐÃI></div>

    <div class="fmc-col-img">
        <img
            src="/promotion/assets/images/active/<campaign-slug>/poster.png"
            alt="<Mô tả chính xác hình ảnh và chương trình>">
    </div>

    <div class="fmc-col-info">
        <span class="fmc-badge"><NHÓM CHƯƠNG TRÌNH></span>
        <h2 class="fmc-title">
            <Tiêu đề chính><br>
            <span class="highlight"><Thông điệp nổi bật></span>
        </h2>
        <p class="fmc-desc"><Đối tượng, lợi ích và lý do hành động></p>

        <div class="fmc-list-grid" aria-label="Quyền lợi chương trình">
            <span><i class="fas fa-check-circle"></i> <Quyền lợi 1></span>
            <span><i class="fas fa-check-circle"></i> <Quyền lợi 2></span>
        </div>

        <div class="fmc-info-box">
            <strong><Thông tin quan trọng></strong><br>
            <Điều kiện, thời gian hoặc lưu ý>
        </div>

        <div class="fmc-btn-group">
            <a href="/news/articles/<duong-dan>.html" class="fmc-btn fmc-btn-outline">
                <i class="fas fa-external-link-alt"></i> Xem chi tiết
            </a>
            <a href="#contact-slot" class="fmc-btn"
               onclick="smoothScroll('contact-slot'); return false;">
                <span class="fmc-btn-icon-group">
                    <i class="fas fa-phone-alt"></i>
                    <i class="far fa-calendar-alt"></i>
                </span>
                Đặt lịch hẹn ngay
            </a>
        </div>
    </div>
</div>
```

Xóa hoàn toàn khối tùy chọn không dùng. Không để phần tử rỗng hoặc placeholder trong bản xuất bản.

## 5. Gói khám nhiều lựa chọn

Áp dụng khi một chương trình có từ 2 gói trở lên, ví dụ gói Nam/Nữ hoặc Cơ bản/Chuyên sâu. Card chỉ tóm tắt; landing page là nơi hiển thị bảng chi tiết.

### Quy tắc nội dung dành cho khách hàng

- Chỉ hiển thị các tên gói và hạng mục đã được xác nhận từ nguồn dữ liệu.
- Dùng nhãn `Giá tiền` cho giá công khai. Chỉ dùng `Chỉ còn` khi đã có giá ưu đãi được duyệt; khi đó giá gốc phải gạch ngang và số tiền ưu đãi phải chính xác.
- Không hiển thị cột hoặc ghi chú nội bộ như `Nhóm`, `Ưu đãi / ghi chú`, `phụ thu`, cách tính nội bộ, nguồn giá, hoặc quy tắc cộng trùng dịch vụ.
- Không tự suy diễn mức giảm, quà tặng, hạn dùng hay điều kiện y khoa khi dữ liệu đầu vào không nêu rõ.
- Mô tả gói dùng 3–4 ý ngắn, ưu tiên hạng mục khách hàng dễ hiểu. Tránh lặp toàn bộ danh sách xét nghiệm trong card.
- Tên và thứ tự gói phải nhất quán giữa card, landing page, tiêu đề bảng và CTA.

### Cấu trúc card

```text
fmc-package-grid
├── fmc-package-card                 Gói 1
├── fmc-package-card is-advanced     Gói 2 (nếu có)
└── fmc-package-card is-complete     Gói 3 (nếu có)
```

- Hai gói: đặt `grid-template-columns: repeat(2, minmax(0, 1fr))` trong theme của chiến dịch.
- Ba gói: dùng lưới ba cột hiện có.
- Trên mobile, luôn chuyển thành một cột.
- Khi số gói thay đổi, xóa hẳn card và cột bảng không còn dùng; không chỉ đổi nhãn hoặc ẩn bằng CSS.

### Cấu trúc landing page

```text
promo/<landing-page>.html
├── Hero: tên chương trình, đối tượng phù hợp, CTA, ảnh
├── Tổng quan: một thẻ cho mỗi gói
└── Bảng chi tiết
    ├── Hạng mục
    ├── Giá tham khảo / Giá niêm yết
    └── Một cột cho mỗi gói đang bán
```

Yêu cầu bảng chi tiết:

- Dùng `✓` cho hạng mục có trong gói và `—` cho hạng mục không có.
- Không tạo cột ẩn, cột gói cũ hoặc cột chỉ còn dùng trong mã nguồn.
- Giá từng dòng phải cùng một nguồn giá đã xác nhận; tổng giá gói phải khớp tổng các hạng mục thực tế trong gói.
- Nếu một gói chỉ có thêm hạng mục so với gói khác, vẫn hiển thị độc lập và không dùng câu “toàn bộ nội dung gói cũ” sau khi gói cũ đã bị gỡ.

### Ảnh minh họa

- Mỗi chương trình có ảnh riêng tại `promotion/assets/images/active/<campaign-slug>/poster.png`.
- Ảnh phải phù hợp đối tượng và dịch vụ, không chứa giá, ngày, logo đối tác, watermark hoặc chữ khó đọc.
- Card dùng đường dẫn từ gốc `/promotion/...`; landing page dùng đường dẫn tương đối `../promotion/...`.
- Khi thay ảnh, cập nhật đồng thời card, hero landing page, `og:image` và `twitter:image`.

## 6. Mẫu banner có fallback

Dùng banner khi nội dung và CTA đã được thiết kế trong một ảnh ngang. Hotspot chỉ phù hợp khi bố cục ảnh cố định.

```html
<div class="fmc-promo-card vip-banner-card">
    <div class="vip-banner-wrap">
        <img
            class="vip-banner-img"
            src="/promotion/assets/images/active/<campaign-slug>/banner.png"
            alt="<Tóm tắt đầy đủ nội dung quan trọng trên banner>"
            onerror="this.onerror=null; this.src='/promotion/assets/images/active/<campaign-slug>/card.png'; this.closest('.vip-banner-card').classList.add('is-fallback');">

        <a class="vip-banner-hotspot vip-banner-detail"
           href="/promo/<landing-page>.html"
           aria-label="Xem chi tiết <tên chương trình>">
            <span class="fmc-sr-only">Xem chi tiết</span>
        </a>
        <a class="vip-banner-hotspot vip-banner-register"
           href="#contact-slot"
           onclick="smoothScroll('contact-slot'); return false;"
           aria-label="Đăng ký <tên chương trình>">
            <span class="fmc-sr-only">Đăng ký</span>
        </a>
    </div>
</div>
```

Quy tắc fallback:

- File fallback phải tồn tại trước khi xuất bản.
- Luôn đặt `this.onerror=null` trước khi đổi `src` để tránh vòng lặp lỗi.
- `is-fallback` phải ẩn hotspot nếu ảnh fallback không có cùng bố cục.
- Không dùng hotspot nếu vị trí CTA thay đổi theo breakpoint.

## 7. Quy tắc thành phần

| Thành phần | Bắt buộc | Quy tắc |
|---|---:|---|
| `.fmc-promo-card` | Có | Kèm theme hoặc class biến thể rõ ràng |
| `.fmc-col-img` | Card hai cột | Ảnh phù hợp và luôn có `alt` |
| `.fmc-badge` | Có | Ngắn, khoảng 2–5 từ |
| `.fmc-title` | Có | Không nên quá hai dòng chính trên desktop |
| `.highlight` | Nên có | Chỉ nhấn một thông điệp |
| `.fmc-desc` | Có | Nêu đối tượng và lợi ích, không lặp tiêu đề |
| `.fmc-sticker` | Tuỳ chọn | Chỉ dùng cho ưu đãi đã xác nhận |
| `.fmc-info-box` | Tuỳ chọn | Điều kiện, thời hạn hoặc lưu ý |
| `.fmc-list-grid` | Tuỳ chọn | Khoảng 2–6 ý ngắn, có `aria-label` |
| `.fmc-countdown` | Tuỳ chọn | Chỉ dùng khi có ngày hết hạn và JS cập nhật |
| `.fmc-btn-group` | Có | CTA phù hợp trạng thái chương trình |

Giá, thời gian và điều kiện quan trọng phải có trong HTML, không chỉ nằm trong ảnh.

## 8. Theme hiện có

| Class | Trạng thái | Phù hợp với |
|---|---|---|
| `theme-male-checkup` | Active | Gói khám nam, tim mạch, đột quỵ |
| `theme-female-checkup` | Active | Gói sức khỏe nữ |
| `theme-premarital` | Active | Gói khám tiền hôn nhân |
| `theme-allergy-screening` | Active | Tầm soát dị ứng IgE và rối loạn sau ăn |
| `theme-first-prenatal` | Active | Khám thai và siêu âm thai lần đầu |
| `theme-abdominal-ultrasound` | Active | Khám Nội và siêu âm bụng tổng quát |
| `theme-vip` | Có thể tái sử dụng | Thành viên, gói cao cấp |
| `theme-stroke-screening` | Legacy | Rung nhĩ và nguy cơ đột quỵ |
| `theme-cervical` | Legacy | HPV, phụ khoa, cổ tử cung |
| `theme-breast-screening` | Legacy | Tầm soát tuyến vú |
| `theme-thyroid-advanced` | Legacy | Tuyến giáp, chẩn đoán kỹ thuật |
| `theme-family-thyroid` | Legacy | Gia đình, cộng đồng |

Theme legacy có thể tái sử dụng, nhưng phải tạo chiến dịch active mới, xác nhận lại nội dung và đưa media vào thư mục active. Không liên kết snapshot cũ.

Theme mới phải là class riêng trong phần `THEMES` của CSS scoped trong `promotion.html`. Không sửa theme dùng chung theo cách làm đổi giao diện chiến dịch khác.

```css
.theme-<ten-theme> {
    background: linear-gradient(135deg, <mau-nhat> 0%, #fff 55%);
    border: 1px solid <mau-vien>;
}
.theme-<ten-theme> .fmc-badge {
    background: <mau-nen-badge>;
    color: <mau-chu-badge>;
}
.theme-<ten-theme> .highlight { color: <mau-nhan>; }
.theme-<ten-theme> .fmc-btn {
    background: linear-gradient(90deg, <mau-dam-1>, <mau-dam-2>);
}
```

## 9. Ảnh và video

### Tên file

- Dùng chữ thường, số và gạch ngang.
- Không dùng dấu tiếng Việt, khoảng trắng, UUID hoặc hậu tố mơ hồ như `cu`, `final-2`.
- Đặt theo vai trò: `poster.png`, `banner.png`, `card.png`, `thumbnail.jpg`, `intro.mp4`.
- Phiên bản cũ dùng tên rõ nghĩa như `poster-legacy.png` hoặc nằm trong snapshot.

### Đường dẫn chuẩn

```text
/promotion/assets/images/active/<campaign-slug>/poster.png
/promotion/assets/images/legacy/<campaign-slug>/poster.png
/promotion/assets/videos/active/<campaign-slug>/intro.mp4
/promotion/assets/videos/legacy/<campaign-slug>/intro.mp4
```

- Dùng đường dẫn từ gốc `/` trong `promotion.html` và social metadata.
- `alt` mô tả nội dung, không dùng tên file hoặc từ chung chung như `image`.
- Video khai báo đúng `type`, có `controls` khi cần và không tự phát âm thanh.

## 10. Landing page và social metadata

Tạo landing page trong `promo/` khi cần URL riêng. Head tối thiểu:

```html
<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><Tên chương trình></title>
    <meta name="description" content="<Mô tả ngắn>">
    <link rel="canonical" href="https://friendmedicalclinic.com/promo/<landing-page>.html">
    <meta property="og:type" content="website">
    <meta property="og:title" content="<Tên chương trình>">
    <meta property="og:description" content="<Mô tả ngắn>">
    <meta property="og:url" content="https://friendmedicalclinic.com/promo/<landing-page>.html">
    <meta property="og:image" content="https://friendmedicalclinic.com/promotion/assets/images/active/<campaign-slug>/poster.png">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="<Tên chương trình>">
    <meta name="twitter:description" content="<Mô tả ngắn>">
    <meta name="twitter:image" content="https://friendmedicalclinic.com/promotion/assets/images/active/<campaign-slug>/poster.png">
</head>
```

Social image dùng URL tuyệt đối HTTPS, phải tồn tại trên môi trường deploy và đúng chiến dịch.

## 11. Countdown

`.fmc-countdown` chỉ cung cấp giao diện. Chỉ thêm khi JS trong `promotion.html` đọc `data-date` và cập nhật `.d`, `.h`, `.m`, `.s`.

```html
<div class="fmc-countdown" data-date="<YYYY-MM-DDTHH:MM:SS>"
     aria-label="Thời gian ưu đãi còn lại">
    <div class="fmc-timer-group">
        <div class="fmc-time-box"><span class="fmc-time-val d">00</span><span class="fmc-time-lbl">Ngày</span></div>
        <div class="fmc-time-box"><span class="fmc-time-val h">00</span><span class="fmc-time-lbl">Giờ</span></div>
        <div class="fmc-time-box"><span class="fmc-time-val m">00</span><span class="fmc-time-lbl">Phút</span></div>
        <div class="fmc-time-box"><span class="fmc-time-val s">00</span><span class="fmc-time-lbl">Giây</span></div>
    </div>
</div>
```

- Dùng thời gian địa phương đã xác nhận, ví dụ `2026-12-31T23:59:59`.
- Không để card hết hạn tiếp tục nhận đăng ký hoặc countdown đứng ở `00`.
- Không có logic cập nhật thì xóa toàn bộ countdown.

## 12. Quy trình archive

1. Gỡ card khỏi luồng active trong `promotion.html`. Comment chỉ là bước tạm, không phải bản lưu trữ lâu dài.
2. Tạo `promotion/archived/<campaign-slug>/`.
3. Tạo `campaign.html` độc lập, dùng CSS scoped/inline, không phụ thuộc JS trang chủ.
4. Thêm `<meta name="robots" content="noindex, nofollow">`.
5. Sao chép media cần thiết vào `archived/<campaign-slug>/assets/`.
6. Tạo `README.md` ghi trạng thái, thời gian cũ, URL cũ, nguồn và việc cần kiểm tra khi tái sử dụng.
7. Chuyển media dùng chung cần giữ sang `assets/.../legacy/<campaign-slug>/`.
8. Nếu giữ landing page, thêm thông báo hết hạn và thay CTA bằng liên kết tới `/#promotion-slot`.
9. Quét repository để bảo đảm không còn CTA nhận đăng ký ưu đãi cũ.

README tối thiểu:

```markdown
# <Campaign name> — archived

- Trạng thái: đã kết thúc.
- Thời gian cũ: <bắt đầu>–<kết thúc>.
- Snapshot độc lập: `campaign.html`.
- Landing page cũ: `<URL hoặc không có>`.
- Media: `assets/`.

Trước khi tái kích hoạt, cập nhật thời gian, giá, điều kiện, CTA,
nội dung chuyên môn và social metadata.
```

## 13. Quy trình tái kích hoạt

Không đưa nguyên snapshot archived lên trang chủ:

1. Tạo slug mới nếu đợt chương trình mới cần phân biệt URL hoặc dữ liệu.
2. Sao chép media đã duyệt sang `assets/.../active/<campaign-slug>/`.
3. Cập nhật ngày, giá, quyền lợi, điều kiện và nội dung chuyên môn.
4. Tạo card active mới từ mẫu trong tài liệu này.
5. Tạo hoặc cập nhật landing page và Open Graph.
6. Kiểm tra CTA, responsive, accessibility và asset.
7. Chỉ xuất bản khi không còn dữ liệu cũ ngoài phần lịch sử chủ ý giữ lại.

## 14. Checklist xuất bản

### Cấu trúc

- [ ] `promotion/promotion.html` vẫn ở đúng vị trí.
- [ ] Slug dùng chữ thường, không dấu và gạch ngang.
- [ ] Không có media trực tiếp trong thư mục gốc `promotion/`.
- [ ] Media nằm đúng `active/<campaign-slug>/`.

### Nội dung và hành vi

- [ ] Tên, ngày, giá, quyền lợi và điều kiện đã được xác nhận.
- [ ] Với chương trình nhiều gói: số card, số thẻ tổng quan và số cột gói trong bảng chi tiết khớp nhau.
- [ ] Không có cột/ghi chú nội bộ, phụ thu, nguồn giá hoặc thông tin gói đã gỡ trong phần khách hàng nhìn thấy.
- [ ] Không còn placeholder `<...>` hoặc `[...]` trong file xuất bản.
- [ ] Card hiển thị đúng trên desktop và mobile.
- [ ] `alt`, `aria-label` và HTML truyền tải đủ thông tin chính.
- [ ] Link chi tiết và CTA hoạt động.
- [ ] Countdown có JS và ngày đúng, hoặc đã bị xóa.
- [ ] Fallback media tồn tại và không tạo vòng lặp lỗi.

### Landing page và media

- [ ] Canonical và Open Graph dùng URL production chính xác.
- [ ] `og:image` và `twitter:image` tồn tại, dùng HTTPS và đúng chiến dịch.
- [ ] Không còn tham chiếu tới media ở gốc `promotion/`.
- [ ] Không sửa file dùng chung ngoài phạm vi đã duyệt.

### Kỹ thuật và rollback

- [ ] Quét repository tìm tên file hoặc URL cũ.
- [ ] Kiểm tra mọi `src`, `href`, `og:image` và `twitter:image`.
- [ ] Chạy `git diff --check`.
- [ ] Xem diff để không ghi đè thay đổi chưa commit.
- [ ] Ghi lại cách rollback trước khi deploy.
