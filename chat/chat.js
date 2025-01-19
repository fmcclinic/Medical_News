// chat.js
import { clinicConfig, CONFIG } from './config/clinic.config.js';
import { chatUI } from './ui/chat.ui.js';
import { feedbackUI } from './ui/feedback.ui.js';
import { keywordService } from './services/keyword.service.js';
import { githubService } from './services/github.service.js';
import { claudeService } from './services/claude.service.js';
import { storageManager } from './utils/storage.utils.js';

class ChatBot {
    constructor() {
        // Initialize configurations and state
        this.config = clinicConfig;
        this.systemConfig = CONFIG;
        this.keywordService = null;
        this.ui = null;
        this.feedback = null;
        this.githubService = null;
        this.claudeService = null;

        // Conversation state
        this.currentConversationId = null;
        this.conversationStartTime = null;
        this.messagePending = false;
        this.messageQueue = [];

        // Debug mode
        this.DEBUG = true;

        // Bind methods
        this.handleUserMessage = this.handleUserMessage.bind(this);
        this.handleFeedback = this.handleFeedback.bind(this);
        this.addEventListeners = this.addEventListeners.bind(this);
    }

    async init() {
        try {
            this.logDebug('ChatBot initializing...');

            // Initialize services
            this.keywordService = keywordService;
            this.ui = chatUI;
            this.feedback = feedbackUI;
            this.githubService = githubService;
            this.claudeService = claudeService;

            this.logDebug('Services imported:', {
                keywordService: !!this.keywordService,
                ui: !!this.ui,
                feedback: !!this.feedback,
                githubService: !!this.githubService,
                claudeService: !!this.claudeService
            });

            // Start new conversation
            this.startNewConversation();

            // Initialize UI
            const uiInitialized = await this.ui.init();
            if (!uiInitialized) {
                throw new Error('Failed to initialize UI');
            }

            // Initialize services
            await Promise.all([
                this.githubService.init(),
                this.restoreState()
            ]);

            // Add event listeners
            this.addEventListeners();

            // Start cleanup interval
            setInterval(() => this.cleanup(), 30 * 60 * 1000); // Every 30 minutes

            this.logDebug('Chatbot initialized successfully');
            return true;
        } catch (error) {
            console.error('Error initializing chatbot:', error);
            return false;
        }
    }

    startNewConversation() {
        this.currentConversationId = `conv_${Date.now()}_${Math.random().toString(36).substring(7)}`;
        this.conversationStartTime = Date.now();
        this.logDebug('Started new conversation:', this.currentConversationId);
    }

    async handleUserMessage(message) {
        if (this.messagePending) {
            this.messageQueue.push(message);
            return;
        }

        try {
            this.messagePending = true;
            this.logDebug('Processing message:', message);
            this.ui.showTypingIndicator();

            // Check conversation timeout (30 minutes)
            if (Date.now() - this.conversationStartTime > 30 * 60 * 1000) {
                this.startNewConversation();
            }

            // Try keyword service first
            const keywordResponse = await this.processKeywordResponse(message);
            if (keywordResponse) return;

            // Try learned responses
            const learnedResponse = await this.processLearnedResponse(message);
            if (learnedResponse) return;

            // Use Claude API as last resort
            await this.processClaudeResponse(message);

        } catch (error) {
            console.error('Error processing message:', error);
            this.ui.removeTypingIndicator();
            await this.handleError(error);
        } finally {
            this.messagePending = false;
            if (this.messageQueue.length > 0) {
                const nextMessage = this.messageQueue.shift();
                await this.handleUserMessage(nextMessage);
            }
        }
    }

    async processKeywordResponse(message) {
        const keywordResponse = this.keywordService.processMessage(message);
        this.logDebug('Keyword service response:', keywordResponse);

        if (keywordResponse && keywordResponse !== this.config.ui.errorMessages.notUnderstood) {
            this.ui.removeTypingIndicator();
            const messageId = this.ui.addMessage(keywordResponse, 'bot');
            this.feedback.addFeedbackUI(messageId, message, keywordResponse);

            await Promise.all([
                this.githubService.processLearning(message, keywordResponse, true),
                this.saveChatHistory({
                    conversationId: this.currentConversationId,
                    type: 'keyword',
                    message,
                    response: keywordResponse
                })
            ]);

            return true;
        }

        return false;
    }

    async processLearnedResponse(message) {
        const learnedResponse = await this.githubService.findBestMatch(message);
        this.logDebug('Learned response:', learnedResponse);

        if (learnedResponse && learnedResponse.score >= this.systemConfig.MIN_SCORE_THRESHOLD) {
            const response = learnedResponse.responses[
                Math.floor(Math.random() * learnedResponse.responses.length)
            ];

            this.ui.removeTypingIndicator();
            const messageId = this.ui.addMessage(response, 'bot');
            this.feedback.addFeedbackUI(messageId, message, response);

            await this.saveChatHistory({
                conversationId: this.currentConversationId,
                type: 'learned',
                message,
                response,
                score: learnedResponse.score
            });

            return true;
        }

        return false;
    }

    async processClaudeResponse(message) {
        const claudeResponse = await this.claudeService.processMessage(
            message,
            this.currentConversationId
        );

        if (claudeResponse) {
            this.ui.removeTypingIndicator();
            const messageId = this.ui.addMessage(claudeResponse.text, 'bot');
            this.feedback.addFeedbackUI(messageId, message, claudeResponse.text);

            await Promise.all([
                this.saveChatHistory({
                    conversationId: this.currentConversationId,
                    type: 'claude',
                    message,
                    response: claudeResponse.text,
                    analysis: claudeResponse.analysis
                }),
                claudeResponse.isClinicQuestion && 
                    this.githubService.processLearning(message, claudeResponse.text, true)
            ]);
        } else {
            this.ui.removeTypingIndicator();
            const defaultResponse = this.config.ui.errorMessages.general;
            const messageId = this.ui.addMessage(defaultResponse, 'bot');
            this.feedback.addFeedbackUI(messageId, message, defaultResponse);

            await this.saveChatHistory({
                conversationId: this.currentConversationId,
                type: 'error',
                message,
                response: defaultResponse
            });
        }
    }

// Trong class ChatBot, thêm/sửa method handleFeedback:

async handleFeedback(feedback) {
    try {
        this.logDebug('Processing feedback:', feedback);
 
        if (!feedback.isPositive && feedback.useAI) {
            // Mark old pattern for improvement
            await this.githubService.markPatternForImprovement(feedback.message);
 
            // Get new response từ Claude
            const aiResponse = await this.claudeService.processMessage(
                feedback.message,
                this.currentConversationId
            );
 
            // Remove processing indicator
            this.feedback.removeProcessingIndicator(feedback.messageId);
 
            if (aiResponse) {
                // Use new enhanced UI for AI response
                const newMessageId = this.ui.addAIResponse(
                    feedback.messageId,
                    aiResponse.text
                );
 
                // Save AI response with higher quality marking 
                await this.githubService.saveAIResponse(
                    feedback.message,
                    aiResponse.text
                );
 
                // Add feedback UI for new response
                this.feedback.addFeedbackUI(
                    newMessageId,
                    feedback.message, 
                    aiResponse.text
                );
 
                // Save to chat history
                await this.saveChatHistory({
                    conversationId: this.currentConversationId,
                    type: 'claude',
                    message: feedback.message,
                    response: aiResponse.text,
                    isAIRetry: true,
                    previousMessageId: feedback.messageId
                });
 
            } else {
                // Show error message if AI fails
                this.ui.addMessage(
                    'Xin lỗi, tôi không thể xử lý câu hỏi của bạn lúc này.',
                    'bot'
                );
            }
 
            return;
        }
 
        // Process positive feedback
        await this.githubService.processLearning(
            feedback.message,
            feedback.response,
            feedback.isPositive
        );
 
        // Update pattern score
        await this.githubService.updatePatternScore(
            feedback.message,
            feedback.isPositive ? 0.5 : -0.5
        );
 
        // Store feedback
        await storageManager.saveFeedback({
            conversationId: this.currentConversationId,
            messageId: feedback.messageId,
            type: feedback.type || 'unknown',
            isPositive: feedback.isPositive,
            message: feedback.message,
            response: feedback.response,
            timestamp: Date.now()
        });
 
    } catch (error) {
        console.error('Error processing feedback:', error);
        // Remove indicator if error occurs
        if (feedback.messageId) {
            this.feedback.removeProcessingIndicator(feedback.messageId);
        }
        // Log error
        await this.handleError(error);
        // Show error message to user
        this.ui.addMessage(
            'Xin lỗi, có lỗi xảy ra khi xử lý phản hồi của bạn.',
            'bot'
        );
    }
 }

    addEventListeners() {
        document.addEventListener('chat:message', async (event) => {
            await this.handleUserMessage(event.detail.message);
        });

        document.addEventListener('chat:feedback', async (event) => {
            await this.handleFeedback(event.detail);
        });

        // Handle window events
        window.addEventListener('beforeunload', () => {
            this.saveState();
        });

        // Handle visibility change for mobile
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.saveState();
            }
        });
    }

    async saveState() {
        try {
            const state = {
                conversationId: this.currentConversationId,
                conversationStartTime: this.conversationStartTime,
                messageQueue: this.messageQueue
            };
            await storageManager.saveSettings({ chatState: state });
        } catch (error) {
            console.error('Error saving state:', error);
        }
    }

    async restoreState() {
        try {
            const settings = await storageManager.getSettings();
            if (settings.chatState) {
                const { conversationId, conversationStartTime, messageQueue } = settings.chatState;

                // Only restore if conversation is less than 30 minutes old
                if (Date.now() - conversationStartTime < 30 * 60 * 1000) {
                    this.currentConversationId = conversationId;
                    this.conversationStartTime = conversationStartTime;
                    this.messageQueue = messageQueue || [];
                }
            }
        } catch (error) {
            console.error('Error restoring state:', error);
        }
    }

    async saveChatHistory(data) {
        try {
            await storageManager.saveChatHistory(data);
        } catch (error) {
            console.error('Error saving chat history:', error);
        }
    }

    async cleanup() {
        try {
            await Promise.all([
                storageManager.cleanup(),
                this.claudeService.cleanup(),
                this.githubService.cleanup()
            ]);
        } catch (error) {
            console.error('Error during cleanup:', error);
        }
    }

    async handleError(error) {
        const errorMessage = this.config.ui.errorMessages.general;
        this.ui.addMessage(errorMessage, 'bot');

        await this.saveChatHistory({
            conversationId: this.currentConversationId,
            type: 'error',
            error: error.message,
            response: errorMessage,
            timestamp: Date.now()
        });
    }

    // Utility methods
    async clearHistory() {
        try {
            await Promise.all([
                this.ui.clearMessages(),
                this.githubService.clearPatterns(),
                this.claudeService.clearCache(),
                storageManager.clearChatHistory(),
                storageManager.clearClaudeData()
            ]);

            this.startNewConversation();
            this.logDebug('Chat history cleared');
            return true;
        } catch (error) {
            console.error('Error clearing history:', error);
            return false;
        }
    }

    async exportData() {
        try {
            const data = {
                history: await storageManager.getChatHistory(),
                patterns: await this.githubService.getAllPatterns(),
                claudeData: await this.claudeService.exportData(),
                feedback: await storageManager.getFeedback(),
                analytics: await storageManager.getAnalytics(),
                conversationId: this.currentConversationId,
                exportedAt: new Date().toISOString()
            };
            this.logDebug('Data exported:', data);
            return data;
        } catch (error) {
            console.error('Error exporting data:', error);
            return null;
        }
    }

    async importData(data) {
        try {
            if (!data) {
                throw new Error('No data provided for import');
            }

            await Promise.all([
                this.ui.importChatHistory(data.history),
                this.githubService.importPatterns(data.patterns),
                this.claudeService.importData(data.claudeData),
                storageManager.importData(data)
            ]);

            this.startNewConversation();
            this.logDebug('Data imported successfully');
            return true;
        } catch (error) {
            console.error('Error importing data:', error);
            return false;
        }
    }

    async reloadServices() {
        try {
            await Promise.all([
                this.githubService.init(),
                this.claudeService.init(),
                this.ui.reloadQuickReplies()
            ]);
            this.logDebug('Services reloaded successfully');
            return true;
        } catch (error) {
            console.error('Error reloading services:', error);
            return false;
        }
    }

    isInitialized() {
        return !!(
            this.ui && 
            this.keywordService && 
            this.githubService && 
            this.feedback &&
            this.claudeService
        );
    }

    logDebug(message, data = null) {
        if (this.DEBUG) {
            console.log(`[ChatBot] ${message}`, data || '');
        }
    }

    // Debug utilities
    async getDebugInfo() {
        return {
            version: '1.0.0',
            conversationId: this.currentConversationId,
            conversationAge: Date.now() - this.conversationStartTime,
            pendingMessages: this.messageQueue.length,
            messagePending: this.messagePending,
            servicesStatus: {
                ui: !!this.ui,
                keywordService: !!this.keywordService,
                githubService: !!this.githubService,
                claudeService: !!this.claudeService,
                feedback: !!this.feedback
            },
            claudeStats: await this.claudeService.getStats(),
            githubStats: await this.githubService.getStats(),
            storageStats: await storageManager.getStorageStats()
        };
    }
}

// Create singleton instance
const chatBot = new ChatBot();

// Export for use in other scripts
export { chatBot };