// Clinic Data
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
                    "degree": "Chuyên khoa 1"
                },
                {
                    "name": "BS. Nguyễn Thị Việt Linh",
                    "degree": "Chuyên khoa 1"
                }
            ]
        },
        {
            "name": "Chuyên Khoa Tai Mũi Họng",
            "description": "Với đội ngũ chuyên gia đến từ Vinmec, phòng khám mang đến dịch vụ khám và điều trị các bệnh lý tai mũi họng chất lượng cao. Các bác sĩ có nhiều năm kinh nghiệm trong điều trị các bệnh lý như viêm xoang mãn tính, viêm amidan, viêm mũi dị ứng và đặc biệt là tầm soát ung thư vòm họng. Phòng khám được trang bị hệ thống nội soi hiện đại, giúp chẩn đoán chính xác và điều trị hiệu quả.",
            "doctors": [
                {
                    "name": "BS. Đặng Thị Thùy Trang",
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

// Keyword Intelligence System
const keywordMap = {
    "giờ_làm_việc": {
        keywords: ["giờ", "thời gian", "làm việc", "mở cửa", "đóng cửa", "lịch"],
        variations: ["khi nào", "mấy giờ", "khám được", "còn làm không"],
        priority: 1,
        handler: () => {
            return `Giờ làm việc của phòng khám:\n${clinicData.clinic_info.working_hours.weekday}\n${clinicData.clinic_info.working_hours.sunday}`;
        }
    },
    "địa_điểm": {
        keywords: ["địa chỉ", "ở đâu", "chỗ nào", "tới", "đường", "quận"],
        variations: ["chỉ đường", "tìm đường", "đi như thế nào", "bản đồ"],
        priority: 1,
        handler: () => {
            return `Địa chỉ phòng khám: ${clinicData.clinic_info.address}\nSố điện thoại liên hệ: ${clinicData.clinic_info.phone}`;
        }
    },
    "bác_sĩ": {
        keywords: ["bác sĩ", "bs", "doctor", "chuyên gia"],
        variations: ["ai khám", "người khám", "bs nào", "bác sỹ"],
        departmentRelated: ["sản", "phụ khoa", "tai mũi họng", "nội"],
        priority: 2,
        handler: (dept) => {
            let response = 'Danh sách bác sĩ';
            if (dept) {
                response += ` ${dept}:\n\n`;
                const doctors = findDoctorsByDepartment(dept);
                doctors.forEach(doctor => {
                    response += `- ${doctor.name} (${doctor.degree})\n`;
                });
            } else {
                response += ' theo chuyên khoa:\n\n';
                clinicData.departments.forEach(dept => {
                    response += `${dept.name}:\n`;
                    dept.doctors.forEach(doctor => {
                        response += `- ${doctor.name} (${doctor.degree})\n`;
                    });
                    response += '\n';
                });
            }
            return response;
        }
    },
    "chuyên_khoa": {
        keywords: ["chuyên khoa", "khoa", "bệnh", "điều trị"],
        variations: ["chữa được", "có khám", "trị được"],
        priority: 2,
        handler: (specialty) => {
            let response = '';
            if (specialty) {
                const dept = findDepartmentBySpecialty(specialty);
                if (dept) {
                    response = `${dept.name}:\n${dept.description}`;
                }
            } else {
                response = 'Các chuyên khoa tại phòng khám:\n\n';
                clinicData.departments.forEach(dept => {
                    response += `${dept.name}:\n${dept.description}\n\n`;
                });
            }
            return response;
        }
    },
    "dịch_vụ": {
        keywords: ["dịch vụ", "khám gì", "điều trị gì"],
        variations: ["có những gì", "làm được gì"],
        priority: 2,
        handler: (dept) => {
            let response = 'Các dịch vụ tại phòng khám:\n\n';
            if (dept) {
                const services = findServicesByDepartment(dept);
                if (services) {
                    response = `Dịch vụ ${dept}:\n`;
                    services.forEach(service => {
                        response += `- ${service}\n`;
                    });
                }
            } else {
                Object.entries(clinicData.services).forEach(([key, services]) => {
                    const deptName = findDepartmentNameByKey(key);
                    response += `${deptName}:\n`;
                    services.forEach(service => {
                        response += `- ${service}\n`;
                    });
                    response += '\n';
                });
            }
            return response;
        }
    }
};

// Helper Functions
function findDoctorsByDepartment(deptName) {
    const dept = clinicData.departments.find(d => 
        d.name.toLowerCase().includes(deptName.toLowerCase())
    );
    return dept ? dept.doctors : [];
}

function findDepartmentBySpecialty(specialty) {
    return clinicData.departments.find(d => 
        d.name.toLowerCase().includes(specialty.toLowerCase())
    );
}

function findServicesByDepartment(deptName) {
    const key = Object.keys(clinicData.services).find(key => 
        key.includes(deptName.toLowerCase().replace(/\s+/g, '_'))
    );
    return key ? clinicData.services[key] : null;
}

function findDepartmentNameByKey(key) {
    return clinicData.departments.find(dept => 
        dept.name.toLowerCase().includes(key.replace(/_/g, ' '))
    )?.name || key.replace(/_/g, ' ').toUpperCase();
}

// Intent Detection
function detectIntent(message) {
    const lowerMessage = message.toLowerCase();
    let maxScore = 0;
    let bestIntent = null;

    for (const [intent, data] of Object.entries(keywordMap)) {
        let score = 0;
        let matched = false;

        // Check main keywords
        data.keywords.forEach(keyword => {
            if (lowerMessage.includes(keyword)) {
                score += 2;
                matched = true;
            }
        });

        // Check variations
        data.variations.forEach(variant => {
            if (lowerMessage.includes(variant)) {
                score += 1;
                matched = true;
            }
        });

        // Check department related keywords
        if (data.departmentRelated) {
            data.departmentRelated.forEach(dept => {
                if (lowerMessage.includes(dept)) {
                    score += 1;
                    matched = true;
                }
            });
        }

        if (matched && score > maxScore) {
            maxScore = score;
            bestIntent = {
                intent: intent,
                score: score,
                data: data
            };
        }
    }

    return bestIntent;
}

// Message Processing
function processClinicQuery(message) {
    const intent = detectIntent(message);
    
    if (intent && intent.score >= 2) {
        let context = null;
        if (intent.data.departmentRelated) {
            intent.data.departmentRelated.forEach(dept => {
                if (message.toLowerCase().includes(dept.toLowerCase())) {
                    context = dept;
                }
            });
        }
        
        return intent.data.handler(context);
    }
    
    return [
        "Xin lỗi, tôi không hiểu câu hỏi của bạn. Bạn có thể hỏi về:",
        "- Giờ làm việc và địa chỉ phòng khám",
        "- Thông tin các chuyên khoa",
        "- Đội ngũ bác sĩ",
        "- Các dịch vụ khám và điều trị"
    ].join('\n');
}

// DOM Elements
let chatMessages;
let chatInput;
let sendButton;
let minimizeBtn;
let quickRepliesContainer;
let isMinimized = false;

// Initialize Chat
function initChat() {
    // Get DOM elements
    chatMessages = document.getElementById('chatMessages');
    chatInput = document.getElementById('chatInput');
    sendButton = document.querySelector('.send-btn');
    minimizeBtn = document.querySelector('.minimize-btn');
    quickRepliesContainer = document.querySelector('.quick-replies');

    // Initialize quick replies
    initializeQuickReplies();

    // Add event listeners
    sendButton.addEventListener('click', handleSendMessage);
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleSendMessage();
        }
    });
    minimizeBtn.addEventListener('click', toggleChat);

    // Add welcome message
    addMessage("Xin chào! Tôi là trợ lý ảo của phòng khám FMC. Tôi có thể giúp bạn:", 'bot');
    addMessage("- Xem thông tin giờ làm việc và địa chỉ\n- Tìm hiểu về các chuyên khoa\n- Tra cứu thông tin bác sĩ\n- Xem các dịch vụ khám và điều trị", 'bot');
}

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
        
        // Remove typing indicator and show response after delay
        setTimeout(() => {
            removeTypingIndicator();
            addMessage(response, 'bot');

            // Save to chat history
            saveChatHistory({
                message: message,
                response: response,
                timestamp: new Date().toISOString()
            });
        }, 1000);
    }
}

// Add message to chat
function addMessage(message, sender) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}-message`;
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    contentDiv.innerHTML = message.replace(/\n/g, '<br>');
    
    messageDiv.appendChild(contentDiv);
    chatMessages.appendChild(messageDiv);
    
    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;

    // Play sound for bot messages
    if (sender === 'bot') {
        playMessageSound();
    }
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
    showTypingIndicator();
    
    const response = processClinicQuery(message);
    setTimeout(() => {
        removeTypingIndicator();
        addMessage(response, 'bot');

        // Save to chat history
        saveChatHistory({
            message: message,
            response: response,
            timestamp: new Date().toISOString()
        });
    }, 500);
}

// Toggle chat
function toggleChat() {
    const chatContainer = document.querySelector('.chat-container');
    isMinimized = !isMinimized;
    
    if (isMinimized) {
        chatContainer.style.height = '60px';
        chatContainer.classList.add('minimized');
        minimizeBtn.innerHTML = '<i class="fas fa-expand"></i>';
    } else {
        chatContainer.style.height = '500px';
        chatContainer.classList.remove('minimized');
        minimizeBtn.innerHTML = '<i class="fas fa-minus"></i>';
    }
}

// Chat history functions
function saveChatHistory(chatData) {
    let history = getChatHistory();
    history.push(chatData);
    localStorage.setItem('fmcChatHistory', JSON.stringify(history));
}

function getChatHistory() {
    const history = localStorage.getItem('fmcChatHistory');
    return history ? JSON.parse(history) : [];
}

// Sound effects
function playMessageSound() {
    const audio = new Audio('data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4LjI5LjEwMAAAAAAAAAAAAAAA//OEAAAAAAAAAAAAAAAAAAAAAAAASW5mbwAAAA8AAAASAAAeMwAUFBQUFCIiIiIiIjAwMDAwPj4+Pj4+TExMTExZWVlZWVlnZ2dnZ3V1dXV1dYODg4ODkZGRkZGRn5+fn5+frKysrKy6urq6urrIyMjIyNbW1tbW1uTk5OTk8vLy8vLy//////8AAAAATGF2YzU4LjU0AAAAAAAAAAAAAAAAJAQKAAAAAAAAHjOZTf9/AAAAAAAAAAAAAAAAAAAAAP/7kGQAAANUMEoFPeACNQV40KEYABEY41g5vAAA9RjpZxRwAImU+W8eshaFpAQgALAAYALATx/nYDYCMJ0HITQYYA7AH4c7MoGsnCMU5pnW+OQnBcDrQ9Xx7w37/D+PimYavV8elKUpT5fqx5VjV6vZ38eJR48eRKa9KUp7v396UgPHkQwMAAAAAA//8MAOp39CECAAhlIEEIIECBAgTT1oj///tEQYT0wgEIYxgDC09aIiE7u7u7uIiIz+LtoIQGE/+XAGYLjpTAIOGYYy0ZACgDgSNFxC7YYiINocwERjAEDhIy0mRoGwAE7lOTBsGhb1OQlBomkGhUFfYfwKHieNFxC7YYiINocwERjAEDhIy0mRoGwAE7lOTBsGhb1OQlBomkGhUFfYfwKHieNFxC7YYiINocwERjAEDhIy0mRoGwAE7lOTBsGhb1OQlBomkGhUFfYfwKHieNFxC7YYiINocwERjAEDhIy0mRoGwAE7lOTBsGhb1OQlBomkGhUFfYfwKHieNFxC7YYiINocwERjAEDhIy0mRoGwAE7lOTBsGhb1OQlBomkGhUFfYfwKHieNFxC7YYiINocwERjAEDhIy0mRoGwAE7lOTBsGhb1OQlBomkGhUFfYfwKHieNFxC7YYiINocwERjAEDhIy0mRoGwAE7lOTBsGhb1OQlBomkGhUFfYfwKHieNFxC7YYiINocwERjAEDhIy0mRoGwAE7lOTBsGhb1OQlBomkGhUFfYfwKHieNFxC7YYiINocwERjAEDhIy0mRoGwAE7lOTBsGhb1OQlBomkGhUFfYfwKHieNFxC7YYiINocwERjAEDhIy0mRoGwAE7lOTBsGhb1OQlBomkGhUFfYfwKHieNFxC7YYiINocwERjAEDhIy0mRoGwAE7lOTBsGhb1OQlBomkGhUFfYfwKHieNFxC7YYiINocwERjAEDhIy0mRoGwAE7lOTBsGhb1OQlBomkGhUFfYfwKHieNFxC7YYiINocwERjAEDhIy0mRoGwAE7lOTBsGhb1OQlBomkGhUFfYfwKHieNFxC7YYiINocwERjAEDhIy0mRoGwAE7lOTBsGhb1OQlBomkGhUFfYfwKHieNFxC7YYiINocwERjAEDhIy0mRoGwAE7lOTBsGhb1OQlBomkGhb2X8CgAAAAAAgAAEAAAAAAAAEaAAAAAAAAA==');
    audio.play().catch(error => {
        console.log('Audio playback failed:', error);
    });
}

// Mobile detection
function isMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

// Adjust chat container for mobile
function adjustForMobile() {
    if (isMobile()) {
        const chatContainer = document.querySelector('.chat-container');
        chatContainer.style.width = '100%';
        chatContainer.style.height = '100%';
        chatContainer.style.right = '0';
        chatContainer.style.bottom = '0';
        chatContainer.style.borderRadius = '0';
    }
}

// Start the chat
window.onload = function() {
    initChat();
    adjustForMobile();
};