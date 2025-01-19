// services/keyword.service.js

import { clinicConfig } from '../config/clinic.config.js';
import { normalizeText } from '../utils/chat.utils.js';

class KeywordService {
    constructor() {
        console.log('Initializing KeywordService...');
        this.initializeKeywordMap();
    }

    initializeKeywordMap() {
        this.keywordMap = {
        "giờ_làm_việc": {
                "keywords": [
                    "giờ",
                    "thời gian",
                    "làm việc",
                    "mở cửa",
                    "đóng cửa",
                    "lịch"
                ],
                "variations": [
                    "khi nào",
                    "mấy giờ",
                    "khám được",
                    "còn làm không"
                ],
                "priority": 1,
                "handler": () => {
                                                    return `Giờ làm việc của phòng khám:\n${clinicConfig.info.workingHours.weekday}\n${clinicConfig.info.workingHours.sunday}`;
                                                }
            },

        "địa_điểm": {
                "keywords": [
                    "địa chỉ",
                    "ở đâu",
                    "chỗ nào",
                    "tới",
                    "đường",
                    "quận"
                ],
                "variations": [
                    "chỉ đường",
                    "tìm đường",
                    "đi như thế nào",
                    "bản đồ",
                    "địa điểm"
                ],
                "priority": 1,
                "handler": () => {
                                                    return `Địa chỉ phòng khám: ${clinicConfig.info.address}\nSố điện thoại liên hệ: ${clinicConfig.info.phone}`;
                                                }
            },

        "đặt_lịch": {
                "keywords": [
                    "đặt lịch",
                    "đặt hẹn",
                    "booking",
                    "lịch khám",
                    "hẹn khám",
                    "đăng ký khám"
                ],
                "variations": [
                    "muốn khám",
                    "đăng ký",
                    "book lịch",
                    "lấy lịch",
                    "xin lịch"
                ],
                "priority": 1,
                "handler": () => {
                                                    return this.getBookingInfo();
                                                }
            },

        "bác_sĩ": {
                "keywords": [
                    "BS",
                    "bác sĩ",
                    "doctor",
                    "bác sỹ",
                    "bacsi"
                ],
                "variations": [
                    "ai khám",
                    "người khám",
                    "bs nào",
                    "bác sĩ nào",
                    "bs giỏi"
                ],
                "priority": 2,
                "departmentRelated": [
                    "sản",
                    "phụ khoa",
                    "tai mũi họng",
                    "nội"
                ],
                "handler": (dept) => {
                                                    return this.getDoctorInfo(dept);
                                                }
            },

        "chuyên_khoa": {
                "keywords": [
                    "chuyên khoa",
                    "khoa",
                    "bệnh",
                    "điều trị",
                    "chuyên môn"
                ],
                "variations": [
                    "chữa được",
                    "có khám",
                    "trị được",
                    "chuyên gì"
                ],
                "priority": 2,
                "handler": (specialty) => {
                                                    return this.getDepartmentInfo(specialty);
                                                }
            },

        "dịch_vụ": {
                "keywords": [
                    "dịch vụ",
                    "khám gì",
                    "điều trị gì",
                    "làm được gì"
                ],
                "variations": [
                    "có những gì",
                    "khám những gì",
                    "dịch vụ gì",
                    "khám bệnh gì"
                ],
                "priority": 2,
                "handler": (dept) => {
                                                    return this.getServiceInfo(dept);
                                                }
            },

        "điện_thoại": {
                "keywords": [
                    "điện thoại",
                    "số điện thoại"
                ],
                "variations": [
                    "phone",
                    "số phone",
                    "liên hệ",
                    "liên lạc"
                ],
                "priority": 2,
                "handler": () => {
                                        return `Số điện thoại phòng khám: ${clinicConfig.info.phone}`;
                                    }
            },

        "tang_huyet_ap": {
                "keywords": [
                    "tăng huyết áp",
                    "huyết áp cao",
                    "cao huyết áp",
                    "bệnh huyết áp",
                    "đo huyết áp",
                    "huyết áp"
                ],
                "variations": [
                    "đau đầu chóng mặt",
                    "nhức đầu hoa mắt",
                    "tim đập nhanh",
                    "mỏi gáy",
                    "áp cao",
                    "máu cao",
                    "điều trị huyết áp",
                    "khám huyết áp",
                    "đi khám huyết áp",
                    "đo huyết áp",
                    "theo dõi huyết áp"
                ],
                "priority": 1,
                "handler": (dept) => {
                return this.getDoctorInfo(dept);}
            }
};
        console.log('KeywordMap initialized with intents:', Object.keys(this.keywordMap));
    }

    detectIntent(message) {
        try {
            console.log('Detecting intent for:', message);
            const normalizedMessage = normalizeText(message);
            console.log('Normalized message:', normalizedMessage);
            
            let bestMatch = null;
            let maxScore = 0;

            // Log all available intents for debugging
            console.log('Checking against intents:', Object.keys(this.keywordMap));

            Object.entries(this.keywordMap).forEach(([intent, data]) => {
                let score = 0;
                let matched = false;

                // Check exact matches first (highest priority)
                if (data.keywords.some(k => normalizedMessage === normalizeText(k))) {
                    score += 5;
                    matched = true;
                    console.log(`Exact match found for intent "${intent}"`);
                }

                // Check keywords
                data.keywords.forEach(keyword => {
                    if (normalizedMessage.includes(normalizeText(keyword))) {
                        score += 2;
                        matched = true;
                        console.log(`Keyword match: "${keyword}" for intent "${intent}"`);
                    }
                });

                // Check variations
                data.variations.forEach(variant => {
                    if (normalizedMessage.includes(normalizeText(variant))) {
                        score += 1;
                        matched = true;
                        console.log(`Variation match: "${variant}" for intent "${intent}"`);
                    }
                });

                // Check department related keywords
                if (data.departmentRelated) {
                    data.departmentRelated.forEach(dept => {
                        if (normalizedMessage.includes(normalizeText(dept))) {
                            score += 1.5;
                            matched = true;
                            console.log(`Department match: "${dept}" for intent "${intent}"`);
                        }
                    });
                }

                // Update best match if score is higher
                if (matched) {
                    const finalScore = score * data.priority;
                    console.log(`Intent "${intent}" score: ${finalScore}`);
                    if (finalScore > maxScore) {
                        maxScore = finalScore;
                        bestMatch = {
                            intent,
                            score: finalScore,
                            data,
                            context: this.extractContext(normalizedMessage, data)
                        };
                    }
                }
            });

            console.log('Best match found:', bestMatch);
            return bestMatch;
        } catch (error) {
            console.error('Error in detectIntent:', error);
            return null;
        }
    }

    processMessage(message) {
        try {
            console.log('Processing message:', message);
            const intent = this.detectIntent(message);
            
            if (intent) {
                console.log('Intent detected:', intent);
                // Lowered threshold to 1.5 from 2
                if (intent.score >= 1.5) {
                    const response = intent.data.handler(intent.context);
                    console.log('Generated response:', response);
                    return response;
                }
            }

            console.log('No matching intent found');
            return clinicConfig.ui.errorMessages.notUnderstood;
        } catch (error) {
            console.error('Error processing message:', error);
            return clinicConfig.ui.errorMessages.general;
        }
    }

    extractContext(message, intentData) {
        if (intentData.departmentRelated) {
            for (const dept of intentData.departmentRelated) {
                if (message.includes(normalizeText(dept))) {
                    console.log('Extracted context:', dept);
                    return dept;
                }
            }
        }
        return null;
    }

    getDoctorInfo(dept) {
        try {
            let response = 'Danh sách bác sĩ';
            
            if (dept) {
                const department = clinicConfig.departments.find(d => 
                    d.name.toLowerCase().includes(dept.toLowerCase())
                );
                
                if (department) {
                    response += ` ${department.name}:\n\n`;
                    department.doctors.forEach(doctor => {
                        response += `- ${doctor.name} (${doctor.degree})\n`;
                        if (doctor.position) response += `  ${doctor.position}\n`;
                        if (doctor.hospital) response += `  ${doctor.hospital}\n`;
                    });
                }
            } else {
                response += ' theo chuyên khoa:\n\n';
                clinicConfig.departments.forEach(dept => {
                    response += `${dept.name}:\n`;
                    dept.doctors.forEach(doctor => {
                        response += `- ${doctor.name} (${doctor.degree})\n`;
                    });
                    response += '\n';
                });
            }
            return response;
        } catch (error) {
            console.error('Error getting doctor info:', error);
            return 'Xin lỗi, không thể lấy thông tin bác sĩ lúc này.';
        }
    }

    getDepartmentInfo(specialty) {
        try {
            let response = '';
            
            if (specialty) {
                const dept = clinicConfig.departments.find(d => 
                    d.name.toLowerCase().includes(specialty.toLowerCase())
                );
                
                if (dept) {
                    response = `${dept.name}:\n${dept.description}`;
                }
            } else {
                response = 'Các chuyên khoa tại phòng khám:\n\n';
                clinicConfig.departments.forEach(dept => {
                    response += `${dept.name}:\n${dept.description}\n\n`;
                });
            }
            return response;
        } catch (error) {
            console.error('Error getting department info:', error);
            return 'Xin lỗi, không thể lấy thông tin chuyên khoa lúc này.';
        }
    }

    getServiceInfo(dept) {
        try {
            let response = '';
            
            if (dept) {
                const department = clinicConfig.departments.find(d => 
                    d.name.toLowerCase().includes(dept.toLowerCase())
                );
                
                if (department) {
                    response = `Dịch vụ ${department.name}:\n\n`;
                    department.services.forEach(service => {
                        response += `- ${service}\n`;
                    });
                }
            } else {
                response = 'Các dịch vụ tại phòng khám:\n\n';
                clinicConfig.departments.forEach(dept => {
                    response += `${dept.name}:\n`;
                    dept.services.forEach(service => {
                        response += `- ${service}\n`;
                    });
                    response += '\n';
                });
            }
            return response;
        } catch (error) {
            console.error('Error getting service info:', error);
            return 'Xin lỗi, không thể lấy thông tin dịch vụ lúc này.';
        }
    }

    getBookingInfo() {
        return `Để đặt lịch khám, bạn có thể:
1. Gọi điện thoại: ${clinicConfig.info.phone}
2. Đến trực tiếp phòng khám: ${clinicConfig.info.address}
3. Đặt lịch qua website hoặc ứng dụng

Giờ làm việc:
${clinicConfig.info.workingHours.weekday}
${clinicConfig.info.workingHours.sunday}

Vui lòng chuẩn bị:
- Giấy tờ tùy thân
- Sổ khám bệnh (nếu có)
- Các xét nghiệm, kết quả khám trước đây (nếu có)`;
    }
}

// Export singleton instance
export const keywordService = new KeywordService();