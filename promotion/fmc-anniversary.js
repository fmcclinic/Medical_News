(() => {
    const start = Date.parse('2026-10-20T00:00:00+07:00');
    const end = Date.parse('2026-12-31T00:00:00+07:00');
    const update = () => {
        const now = Date.now();
        const expired = now >= end;
        document.querySelectorAll('[data-fmc-anniversary]').forEach(campaign => {
            const label = campaign.querySelector('[data-anniversary-status]');
            if (label) label.textContent = expired ? 'Đã kết thúc' : now < start ? 'Sắp diễn ra từ 20/10/2026' : 'Đang áp dụng';
            campaign.querySelectorAll('[data-anniversary-contact]').forEach(link => {
                link.textContent = expired ? 'Xem chương trình hiện hành' : 'Liên hệ nhận phiếu';
                link.href = expired ? '/index.html#promotion-slot' : '/index.html#contact-slot';
            });
        });
    };
    update();
    window.setInterval(update, 60000);
})();
