// ui/chat.ui.js

import { clinicConfig } from '../config/clinic.config.js';
import { 
    generateMessageId, 
    formatTimestamp, 
    sanitizeInput, 
    isMobileDevice,
    playSound 
} from '../utils/chat.utils.js';

class ChatUI {
    constructor() {
        // DOM Elements
        this.chatContainer = null;
        this.chatMessages = null;
        this.chatInput = null;
        this.sendButton = null;
        this.minimizeBtn = null;
        this.quickRepliesContainer = null;

        // State
        this.isMinimized = false;
        this.isTyping = false;
    }

    /**
     * Chờ element tồn tại trong DOM
     */
    async waitForElement(selector, timeout = 5000) {
        const startTime = Date.now();
        
        while (Date.now() - startTime < timeout) {
            const element = document.querySelector(selector);
            if (element) return element;
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        throw new Error(`Element ${selector} not found after ${timeout}ms`);
    }

    async init() {
        try {
            console.log('Initializing Chat UI...');

            // Chờ các elements chính
            this.chatContainer = await this.waitForElement('.chat-container');
            this.chatMessages = await this.waitForElement('#chatMessages');
            this.chatInput = await this.waitForElement('#chatInput');
            this.sendButton = await this.waitForElement('.send-btn');
            this.minimizeBtn = await this.waitForElement('.minimize-btn');
            this.quickRepliesContainer = await this.waitForElement('.quick-replies');

            console.log('All chat elements found');

            // Add event listeners
            this.addEventListeners();

            // Initialize quick replies
            this.initializeQuickReplies();

            // Adjust for mobile if needed
            if (isMobileDevice()) {
                this.adjustForMobile();
            }

            // Add welcome messages
            this.addWelcomeMessages();

            console.log('Chat UI initialized successfully');
            return true;
        } catch (error) {
            console.error('Error initializing chat UI:', error);
            return false;
        }
    }

    addEventListeners() {
        this.sendButton.addEventListener('click', this.handleSendMessage.bind(this));

        this.chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.handleSendMessage();
            }
        });

        this.minimizeBtn.addEventListener('click', this.toggleChat.bind(this));
        this.chatInput.addEventListener('input', this.handleInputChange.bind(this));
        window.addEventListener('resize', this.handleResize.bind(this));
    }

    initializeQuickReplies() {
        this.quickRepliesContainer.innerHTML = '';
        const replies = clinicConfig.quickReplies || [
            "Giờ làm việc",
            "Đặt lịch khám",
            "Tìm bác sĩ",
            "Xem chuyên khoa"
        ];

        replies.forEach(reply => {
            const button = document.createElement('button');
            button.className = 'quick-reply-btn';
            button.textContent = reply;
            button.addEventListener('click', () => this.handleQuickReply(reply));
            this.quickRepliesContainer.appendChild(button);
        });
    }

    addWelcomeMessages() {
        const messages = clinicConfig.ui.welcomeMessages || [
            "Xin chào! Tôi là trợ lý ảo của phòng khám FMC. Tôi có thể giúp bạn:",
            "- Xem thông tin giờ làm việc và địa chỉ\n- Tìm hiểu về các chuyên khoa\n- Tra cứu thông tin bác sĩ\n- Xem các dịch vụ khám và điều trị"
        ];

        messages.forEach(msg => this.addMessage(msg, 'bot'));
    }

    addMessage(message, type) {
        const messageId = generateMessageId();
        
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}-message`;
        messageDiv.dataset.messageId = messageId;
        
        // Style cho message
        messageDiv.style.whiteSpace = 'pre-wrap';
        messageDiv.style.wordWrap = 'break-word';
        messageDiv.style.maxWidth = '80%';
        messageDiv.style.padding = '12px';
        messageDiv.style.margin = '8px';
        messageDiv.style.borderRadius = '8px';
        messageDiv.style.lineHeight = '1.5';
     
        if (type === 'bot') {
            // Styles cho bot messages
            messageDiv.style.backgroundColor = '#f5f5f5';
            messageDiv.style.marginRight = 'auto';
            messageDiv.style.fontSize = '14px';
            
            // Thêm container cho message và feedback
            const contentDiv = document.createElement('div');
            contentDiv.className = 'message-content';
            contentDiv.textContent = message;
            messageDiv.appendChild(contentDiv);
     
        } else {
            // Styles cho user messages 
            messageDiv.style.backgroundColor = '#e3f2fd';
            messageDiv.style.marginLeft = 'auto';
            messageDiv.textContent = message;
        }
     
        // Thêm timestamp
        const timestampDiv = document.createElement('div');
        timestampDiv.className = 'message-timestamp';
        timestampDiv.style.fontSize = '10px';
        timestampDiv.style.marginTop = '4px';
        timestampDiv.style.opacity = '0.7';
        timestampDiv.textContent = formatTimestamp(new Date());
        messageDiv.appendChild(timestampDiv);
     
        // Add to chat và scroll
        if (this.chatMessages) {
            this.chatMessages.appendChild(messageDiv);
            this.scrollToBottom();
        }
     
        // Play sound nếu là bot message
        if (type === 'bot') {
            playSound('message');
        }
     
        return messageId;
     }

    showTypingIndicator() {
        if (!this.isTyping && this.chatMessages) {
            this.isTyping = true;
            const typingDiv = document.createElement('div');
            typingDiv.className = 'message bot-message typing-indicator';
            typingDiv.innerHTML = '<div class="dots"><span></span><span></span><span></span></div>';
            this.chatMessages.appendChild(typingDiv);
            this.scrollToBottom();
        }
    }

    removeTypingIndicator() {
        if (this.isTyping && this.chatMessages) {
            const typingIndicator = this.chatMessages.querySelector('.typing-indicator');
            if (typingIndicator) {
                typingIndicator.remove();
            }
            this.isTyping = false;
        }
    }

    handleSendMessage() {
        if (!this.chatInput) return;

        const message = this.chatInput.value.trim();
        if (message) {
            this.chatInput.value = '';
            this.addMessage(message, 'user');

            const event = new CustomEvent('chat:message', { 
                detail: { message, timestamp: new Date().toISOString() }
            });
            document.dispatchEvent(event);
        }
    }

    handleQuickReply(message) {
        if (this.chatInput) {
            this.chatInput.value = message;
            this.handleSendMessage();
        }
    }

    toggleChat() {
        this.isMinimized = !this.isMinimized;
        
        if (this.chatContainer) {
            if (this.isMinimized) {
                this.chatContainer.classList.add('minimized');
                if (this.minimizeBtn) {
                    this.minimizeBtn.innerHTML = '<i class="fas fa-expand"></i>';
                }
            } else {
                this.chatContainer.classList.remove('minimized');
                if (this.minimizeBtn) {
                    this.minimizeBtn.innerHTML = '<i class="fas fa-minus"></i>';
                }
                this.scrollToBottom();
            }
        }
    }

    adjustForMobile() {
        if (this.chatContainer) {
            this.chatContainer.classList.add('mobile');
            if (window.innerWidth <= 480) {
                Object.assign(this.chatContainer.style, {
                    width: '100%',
                    height: '100vh',
                    bottom: '0',
                    right: '0',
                    borderRadius: '0'
                });
            }
        }
    }

    handleResize() {
        if (isMobileDevice()) {
            this.adjustForMobile();
        } else if (this.chatContainer) {
            this.chatContainer.classList.remove('mobile');
            Object.assign(this.chatContainer.style, {
                width: '350px',
                height: '500px'
            });
        }
    }

    handleInputChange() {
        // Handle typing events if needed
    }

    scrollToBottom() {
        if (this.chatMessages) {
            this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
        }
    }

    clearMessages() {
        if (this.chatMessages) {
            this.chatMessages.innerHTML = '';
            this.addWelcomeMessages();
        }
    }

    // Thêm method mới vào class ChatUI
addAIResponse(messageId, response) {
    const messageDiv = document.querySelector(`[data-message-id="${messageId}"]`);
    if (!messageDiv) return;

    // Create new response container
    const aiResponseDiv = document.createElement('div');
    aiResponseDiv.className = 'ai-enhanced-response';
    aiResponseDiv.innerHTML = `
        <div class="ai-badge">
            <i class="fas fa-robot"></i>
            Câu trả lời được cải thiện bởi AI
        </div>
        <div class="response-content">
            ${response}
        </div>
    `;

    // Add slide-in animation
    aiResponseDiv.style.opacity = '0';
    aiResponseDiv.style.transform = 'translateY(-10px)';

    // Replace old response
    messageDiv.querySelector('.response-content')?.remove();
    messageDiv.appendChild(aiResponseDiv);

    // Trigger animation
    setTimeout(() => {
        aiResponseDiv.style.opacity = '1';
        aiResponseDiv.style.transform = 'translateY(0)';
    }, 100);

    return messageId;
}
}

// Export singleton instance
export const chatUI = new ChatUI();