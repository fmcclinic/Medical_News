// config/clinic.config.js

export const clinicConfig = {
    // Basic Info
    info: {
        name: "FMC - Family Medical Center",
        address: "A12 Saigon Villas Hill, 99 Lê Văn Việt, Thành phố Thủ Đức, TP.HCM 700000",
        phone: "028 3535 5353",
        workingHours: {
            weekday: "Thứ 2 - Thứ 7: 8:00 - 20:00",
            sunday: "Chủ nhật: 8:00 - 12:00"
        }
    },

    // Departments
    departments: [
        {
            name: "Chuyên Khoa Sản Phụ Khoa",
            description: "Phòng khám tự hào với đội ngũ bác sĩ giàu kinh nghiệm đến từ Bệnh viện Từ Dũ - một trong những trung tâm sản khoa hàng đầu khu vực phía Nam. Các bác sĩ chuyên về điều trị các bệnh lý phụ khoa phức tạp như u xơ tử cung, u nang buồng trứng, và tầm soát ung thư cổ tử cung. Đồng thời, chúng tôi cung cấp dịch vụ chăm sóc thai sản toàn diện, từ khám thai định kỳ, sàng lọc trước sinh đến hỗ trợ sinh tại Bệnh viện Từ Dũ.",
            doctors: [
                {
                    name: "BS. Nguyễn Hoàng Lam",
                    degree: "Chuyên khoa 2",
                    position: "Phó Khoa"
                },
                {
                    name: "BS. Đào Hoàng Hoa Hà Hải Âu",
                    degree: "Chuyên khoa I"
                },
                {
                    name: "BS. Nguyễn Thị Việt Linh",
                    degree: "Chuyên khoa I"
                }
            ],
            services: [
                "Khám thai định kỳ",
                "Sàng lọc trước sinh",
                "Điều trị u xơ tử cung",
                "Điều trị u nang buồng trứng",
                "Tầm soát ung thư cổ tử cung"
            ]
        },
        {
            name: "Chuyên Khoa Tai Mũi Họng",
            description: "Với đội ngũ chuyên gia đến từ Vinmec, phòng khám mang đến dịch vụ khám và điều trị các bệnh lý tai mũi họng chất lượng cao. Các bác sĩ có nhiều năm kinh nghiệm trong điều trị các bệnh lý như viêm xoang mãn tính, viêm amidan, viêm mũi dị ứng và đặc biệt là tầm soát ung thư vòm họng. Phòng khám được trang bị hệ thống nội soi hiện đại, giúp chẩn đoán chính xác và điều trị hiệu quả.",
            doctors: [
                {
                    name: "BS. Đặng Thị Thùy Trang",
                    degree: "Chuyên khoa 2",
                    position: "Trưởng khoa",
                    hospital: "Bệnh viện Vinmec"
                },
                {
                    name: "BS. Dương Minh Trọng",
                    degree: "Chuyên khoa 1"
                },
                {
                    name: "BS. Sử Ngọc Kiều Chinh",
                    degree: "Chuyên khoa 1"
                }
            ],
            services: [
                "Điều trị viêm xoang mãn tính",
                "Điều trị viêm amidan",
                "Điều trị viêm mũi dị ứng",
                "Tầm soát ung thư vòm họng",
                "Nội soi tai mũi họng"
            ]
        },
        {
            name: "Chuyên Khoa Nội",
            description: "Phòng khám quy tụ các chuyên gia đến từ Bệnh viện FV với đa dạng chuyên môn sâu. Các lĩnh vực chuyên sâu bao gồm: Nội tổng quát với khám và điều trị các bệnh lý thông thường, Tim mạch chuyên chẩn đoán và điều trị các bệnh về tim mạch, Tim mạch can thiệp phụ trách tư vấn và theo dõi các ca bệnh phức tạp, và Nội tiết chuyển hóa chuyên sâu về đái tháo đường, rối loạn tuyến giáp và các bệnh chuyển hóa khác.",
            specialties: [
                "Nội tổng quát",
                "Tim mạch",
                "Tim mạch can thiệp",
                "Nội tiết chuyển hóa"
            ],
            doctors: [
                {
                    name: "BS. Đỗ Thành Long",
                    degree: "Chuyên khoa 1"
                },
                {
                    name: "BS. Nguyễn Anh Hoàng",
                    degree: "Chuyên khoa 1"
                }
            ],
            services: [
                "Khám nội tổng quát",
                "Chẩn đoán và điều trị bệnh tim mạch",
                "Tư vấn tim mạch can thiệp",
                "Điều trị đái tháo đường",
                "Điều trị rối loạn tuyến giáp",
                "..."
            ]
        }
    ],

    // Quick Replies for UI
    quickReplies: [
        "Đặt lịch khám",
        "Xem giờ làm việc",
        "Tìm bác sĩ",
        "Xem chuyên khoa",
        "Địa chỉ phòng khám",
        "Điện thoại"
    ],

    // UI Messages
    ui: {
        welcomeMessages: [
            "Xin chào! Tôi là trợ lý ảo của phòng khám FMC. Tôi có thể giúp bạn:",
            "- Xem thông tin giờ làm việc và địa chỉ\n- Tìm hiểu về các chuyên khoa\n- Tra cứu thông tin bác sĩ\n- Xem các dịch vụ khám và điều trị"
        ],
        errorMessages: {
            general: "Xin lỗi, có lỗi xảy ra. Vui lòng thử lại sau.",
            notUnderstood: "Xin lỗi, tôi không hiểu câu hỏi của bạn. Bạn có thể hỏi về giờ làm việc, địa chỉ, các chuyên khoa, hoặc dịch vụ của phòng khám."
        }
    }
};

// System Configuration
export const CONFIG = {
    // Chat History
    MAX_CHAT_HISTORY: 100,
    
    // GitHub Sync
    SYNC_INTERVAL: 30 * 60 * 1000, // 30 minutes
    
    // Learning
    MIN_SCORE_THRESHOLD: 0.7,
    MAX_PATTERNS: 1000,
    PATTERN_CLEANUP_THRESHOLD: 0.3,
    
    // UI
    TYPING_DELAY: 1000,
    FEEDBACK_TIMEOUT: 5000,
    
    // Mobile
    MOBILE_BREAKPOINT: 480
};