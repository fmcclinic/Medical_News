// utils/chat.utils.js

/**
 * Tạo ID duy nhất cho tin nhắn
 * @returns {string} Message ID
 */
export const generateMessageId = () => {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Format timestamp thành định dạng dễ đọc
 * @param {Date|string|number} timestamp 
 * @returns {string} Formatted time string
 */
export const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
        return `Hôm nay ${date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}`;
    } else if (date.toDateString() === yesterday.toDateString()) {
        return `Hôm qua ${date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}`;
    } else {
        return date.toLocaleString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit',
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    }
};

/**
 * Tính độ tương đồng giữa hai chuỗi
 * @param {string} str1 
 * @param {string} str2 
 * @returns {number} Similarity score (0-1)
 */
export const calculateStringSimilarity = (str1, str2) => {
    const s1 = str1.toLowerCase().trim();
    const s2 = str2.toLowerCase().trim();

    // Exact match
    if (s1 === s2) return 1;

    // Convert to arrays of words
    const words1 = s1.split(/\s+/);
    const words2 = s2.split(/\s+/);

    // Find common words
    const commonWords = words1.filter(word => words2.includes(word));
    
    // Calculate similarity score
    return commonWords.length / Math.max(words1.length, words2.length);
};

/**
 * Chuẩn hóa text input
 * @param {string} text 
 * @returns {string} Normalized text
 */
export const normalizeText = (text) => {
    return text
        .toLowerCase()
        .trim()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
        .replace(/[^\w\s]/g, ' ')        // Replace special chars with space
        .replace(/\s+/g, ' ');           // Remove extra spaces
};

/**
 * Validate và làm sạch input từ user
 * @param {string} input 
 * @returns {string} Cleaned input
 */
export const sanitizeInput = (input) => {
    if (!input) return '';
    
    return input
        .trim()
        .replace(/<[^>]*>/g, '')         // Remove HTML tags
        .replace(/[<>]/g, '')            // Remove < >
        .replace(/javascript:/gi, '')     // Remove javascript:
        .substring(0, 500);              // Limit length
};

/**
 * Format error message cho user
 * @param {Error} error 
 * @returns {string} User-friendly error message
 */
export const formatErrorMessage = (error) => {
    // Log error for debugging
    console.error('Chat error:', error);

    // Return user-friendly message
    if (error.name === 'NetworkError') {
        return 'Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng và thử lại.';
    }
    
    if (error.name === 'TimeoutError') {
        return 'Yêu cầu mất quá nhiều thời gian. Vui lòng thử lại.';
    }

    return 'Có lỗi xảy ra. Vui lòng thử lại sau.';
};

/**
 * Detect mobile device
 * @returns {boolean}
 */
export const isMobileDevice = () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

/**
 * Play message sound
 * @param {string} type - 'message' | 'notification'
 */
// Trong chat.utils.js, sửa hàm playSound:
export const playSound = (type = 'message') => {
    try {
        // Chỉ play sound khi user đã tương tác
        if (document.querySelector('.chat-container').classList.contains('user-interacted')) {
            const audio = new Audio({
                message: 'data:audio/mp3;base64,...', 
                notification: 'data:audio/mp3;base64,...' 
            }[type]);
            audio.play().catch(error => {
                console.log('Audio playback failed:', error);
            });
        }
    } catch (error) {
        console.error('Error playing sound:', error);
    }
};