// Embedded clinic data
const clinicData = {
    "clinic_info": {
        "name": "FMC - Family Medical Center",
        "address": "A12 Saigon Villas Hill, 99 Lê Văn Việt, Thành phố Thủ Đức, TP.HCM 700000",
        "phone": "028 3535 5353",
        "working_hours": {
            "weekday": "Thứ 2 - Thứ 7: 8:00 - 20:00",
            "sunday": "Chủ nhật: 8:00 - 12:00"
        }
    },
    "departments": [
        {
            "name": "Chuyên Khoa Sản Phụ Khoa",
            "description": "Phòng khám tự hào với đội ngũ bác sĩ giàu kinh nghiệm đến từ Bệnh viện Từ Dũ - một trong những trung tâm sản khoa hàng đầu khu vực phía Nam. Các bác sĩ chuyên về điều trị các bệnh lý phụ khoa phức tạp như u xơ tử cung, u nang buồng trứng, và tầm soát ung thư cổ tử cung. Đồng thời, chúng tôi cung cấp dịch vụ chăm sóc thai sản toàn diện, từ khám thai định kỳ, sàng lọc trước sinh đến hỗ trợ sinh tại Bệnh viện Từ Dũ.",
            "doctors": [
                {
                    "name": "BS. Nguyễn Hoàng Lam",
                    "degree": "Chuyên khoa 2",
                    "position": "Phó Khoa"
                },
                {
                    "name": "BS. Đào Hoàng Hoa Hà Hải Âu",
                    "degree": "Chuyên khoa I"
                },
                {
                    "name": "BS. Nguyễn Thị Việt Linh",
                    "degree": "Chuyên khoa I"
                }
            ]
        },
        {
            "name": "Chuyên Khoa Tai Mũi Họng",
            "description": "Với đội ngũ chuyên gia đến từ Vinmec, phòng khám mang đến dịch vụ khám và điều trị các bệnh lý tai mũi họng chất lượng cao. Các bác sĩ có nhiều năm kinh nghiệm trong điều trị các bệnh lý như viêm xoang mãn tính, viêm amidan, viêm mũi dị ứng và đặc biệt là tầm soát ung thư vòm họng. Phòng khám được trang bị hệ thống nội soi hiện đại, giúp chẩn đoán chính xác và điều trị hiệu quả.",
            "doctors": [
                {
                    "name": "BS. Đặng Thị Thùy Tran",
                    "degree": "Chuyên khoa 2",
                    "position": "Trưởng khoa",
                    "hospital": "Bệnh viện Vinmec"
                },
                {
                    "name": "BS. Dương Minh Trọng",
                    "degree": "Chuyên khoa 1"
                },
                {
                    "name": "BS. Sử Ngọc Kiều Chinh",
                    "degree": "Chuyên khoa 1"
                }
            ]
        },
        {
            "name": "Chuyên Khoa Nội",
            "description": "Phòng khám quy tụ các chuyên gia đến từ Bệnh viện FV với đa dạng chuyên môn sâu. Các lĩnh vực chuyên sâu bao gồm: Nội tổng quát với khám và điều trị các bệnh lý thông thường, Tim mạch chuyên chẩn đoán và điều trị các bệnh về tim mạch, Tim mạch can thiệp phụ trách tư vấn và theo dõi các ca bệnh phức tạp, và Nội tiết chuyển hóa chuyên sâu về đái tháo đường, rối loạn tuyến giáp và các bệnh chuyển hóa khác.",
            "specialties": [
                "Nội tổng quát",
                "Tim mạch",
                "Tim mạch can thiệp",
                "Nội tiết chuyển hóa"
            ],
            "doctors": [
                {
                    "name": "BS. Đỗ Thành Long",
                    "degree": "Chuyên khoa 1"
                },
                {
                    "name": "BS. Nguyễn Anh Hoàng",
                    "degree": "Chuyên khoa 1"
                }
            ]
        }
    ],
    "services": {
        "san_phu_khoa": [
            "Khám thai định kỳ",
            "Sàng lọc trước sinh",
            "Điều trị u xơ tử cung",
            "Điều trị u nang buồng trứng",
            "Tầm soát ung thư cổ tử cung"
        ],
        "tai_mui_hong": [
            "Điều trị viêm xoang mãn tính",
            "Điều trị viêm amidan",
            "Điều trị viêm mũi dị ứng",
            "Tầm soát ung thư vòm họng",
            "Nội soi tai mũi họng"
        ],
        "noi": [
            "Khám nội tổng quát",
            "Chẩn đoán và điều trị bệnh tim mạch",
            "Tư vấn tim mạch can thiệp",
            "Điều trị đái tháo đường",
            "Điều trị rối loạn tuyến giáp"
        ]
    },
    "quick_replies": [
        "Đặt lịch khám",
        "Xem giờ làm việc",
        "Tìm bác sĩ",
        "Xem chuyên khoa",
        "Địa chỉ phòng khám"
    ]
};

// State
let isMinimized = false;

// DOM Elements
const chatMessages = document.getElementById('chatMessages');
const chatInput = document.getElementById('chatInput');
const sendButton = document.querySelector('.send-btn');
const minimizeBtn = document.querySelector('.minimize-btn');
const quickRepliesContainer = document.querySelector('.quick-replies');

// Initialize quick replies
function initializeQuickReplies() {
    quickRepliesContainer.innerHTML = '';
    clinicData.quick_replies.forEach(reply => {
        const button = document.createElement('button');
        button.className = 'quick-reply-btn';
        button.textContent = reply;
        button.addEventListener('click', () => handleQuickReply(reply));
        quickRepliesContainer.appendChild(button);
    });
}

// Process clinic related queries
function processClinicQuery(message) {
    const lowerMessage = message.toLowerCase();
    
    // Xử lý các từ khóa về giờ làm việc
    if (lowerMessage.includes('giờ') || lowerMessage.includes('thời gian') || lowerMessage.includes('làm việc')) {
        return `Giờ làm việc của phòng khám:\n${clinicData.clinic_info.working_hours.weekday}\n${clinicData.clinic_info.working_hours.sunday}`;
    }

    // Xử lý địa chỉ
    if (lowerMessage.includes('địa chỉ') || lowerMessage.includes('ở đâu') || lowerMessage.includes('chỗ nào')) {
        return `Địa chỉ phòng khám: ${clinicData.clinic_info.address}`;
    }

    // Xử lý số điện thoại
    if (lowerMessage.includes('điện thoại') || lowerMessage.includes('liên hệ') || lowerMessage.includes('số phone')) {
        return `Số điện thoại liên hệ: ${clinicData.clinic_info.phone}`;
    }

    // Xử lý tìm bác sĩ
    if (lowerMessage.includes('bác sĩ') || lowerMessage.includes('bs') || lowerMessage.includes('doctor')) {
        let response = 'Danh sách bác sĩ theo chuyên khoa:\n\n';
        clinicData.departments.forEach(dept => {
            response += `${dept.name}:\n`;
            dept.doctors.forEach(doctor => {
                response += `- ${doctor.name} (${doctor.degree})\n`;
            });
            response += '\n';
        });
        return response;
    }

    // Xử lý chuyên khoa
    if (lowerMessage.includes('chuyên khoa') || lowerMessage.includes('khoa')) {
        let response = 'Các chuyên khoa tại phòng khám:\n\n';
        clinicData.departments.forEach(dept => {
            response += `${dept.name}:\n${dept.description}\n\n`;
        });
        return response;
    }

    // Xử lý dịch vụ
    if (lowerMessage.includes('dịch vụ') || lowerMessage.includes('khám gì')) {
        let response = 'Các dịch vụ tại phòng khám:\n\n';
        Object.entries(clinicData.services).forEach(([key, services]) => {
            const deptName = clinicData.departments.find(dept => 
                dept.name.toLowerCase().includes(key.replace(/_/g, ' '))
            )?.name || key.replace(/_/g, ' ').toUpperCase();
            
            response += `${deptName}:\n`;
            services.forEach(service => {
                response += `- ${service}\n`;
            });
            response += '\n';
        });
        return response;
    }

    // Default response
    return null;
}

// Handle send message
function handleSendMessage() {
    const message = chatInput.value.trim();
    if (message) {
        addMessage(message, 'user');
        chatInput.value = '';
        
        // Show typing indicator
        showTypingIndicator();
        
        // Process message
        const response = processClinicQuery(message);
        
        // Remove typing indicator and show response
        setTimeout(() => {
            removeTypingIndicator();
            if (response) {
                addMessage(response, 'bot');
            } else {
                addMessage("Xin lỗi, tôi không hiểu câu hỏi của bạn. Bạn có thể hỏi về giờ làm việc, địa chỉ, các chuyên khoa, hoặc dịch vụ của phòng khám.", 'bot');
            }
        }, 1000);
    }
}

// Add message to chat
function addMessage(message, sender) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}-message`;
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    // Xử lý xuống dòng trong tin nhắn
    contentDiv.innerHTML = message.replace(/\n/g, '<br>');
    
    messageDiv.appendChild(contentDiv);
    chatMessages.appendChild(messageDiv);
    
    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Show typing indicator
function showTypingIndicator() {
    const typingDiv = document.createElement('div');
    typingDiv.className = 'message bot-message typing-indicator';
    typingDiv.innerHTML = '<div class="dots"><span></span><span></span><span></span></div>';
    chatMessages.appendChild(typingDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Remove typing indicator
function removeTypingIndicator() {
    const typingIndicator = document.querySelector('.typing-indicator');
    if (typingIndicator) {
        typingIndicator.remove();
    }
}

// Handle quick reply
function handleQuickReply(message) {
    addMessage(message, 'user');
    // Show typing indicator
    showTypingIndicator();
    
    const response = processClinicQuery(message);
    setTimeout(() => {
        removeTypingIndicator();
        if (response) {
            addMessage(response, 'bot');
        }
    }, 500);
}

// Toggle chat
function toggleChat() {
    const chatContainer = document.querySelector('.chat-container');
    isMinimized = !isMinimized;
    
    if (isMinimized) {
        chatContainer.style.height = '60px';
        minimizeBtn.innerHTML = '<i class="fas fa-expand"></i>';
    } else {
        chatContainer.style.height = '500px';
        minimizeBtn.innerHTML = '<i class="fas fa-minus"></i>';
    }
}

// Event Listeners
sendButton.addEventListener('click', handleSendMessage);
chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        handleSendMessage();
    }
});
minimizeBtn.addEventListener('click', toggleChat);

// Initialize
function initChat() {
    initializeQuickReplies();
    addMessage("Xin chào! Tôi là trợ lý ảo của phòng khám FMC. Tôi có thể giúp bạn:", 'bot');
    addMessage("- Xem thông tin giờ làm việc và địa chỉ\n- Tìm hiểu về các chuyên khoa\n- Tra cứu thông tin bác sĩ\n- Xem các dịch vụ khám và điều trị", 'bot');
}

// Start the chat
initChat();