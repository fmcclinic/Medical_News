// Main chat.js
import { clinicConfig } from './config/clinic.config.js';
import { chatUI } from './ui/chat.ui.js';
import { feedbackUI } from './ui/feedback.ui.js';
import { keywordService } from './services/keyword.service.js';
import { githubService } from './services/github.service.js';

class ChatBot {
    constructor() {
        // Store config and initialize services as null
        this.config = clinicConfig;
        this.keywordService = null;
        this.ui = null;
        this.feedback = null;
        this.githubService = null;

        // Bind methods
        this.handleUserMessage = this.handleUserMessage.bind(this);
        this.handleFeedback = this.handleFeedback.bind(this);
        this.addEventListeners = this.addEventListeners.bind(this);
    }

    async init() {
        try {
            console.log('ChatBot initializing...');

            // Assign services
            this.keywordService = keywordService;
            this.ui = chatUI;
            this.feedback = feedbackUI;
            this.githubService = githubService;

            console.log('Services imported:', {
                keywordService: !!this.keywordService,
                ui: !!this.ui,
                feedback: !!this.feedback,
                githubService: !!this.githubService
            });

            // Initialize UI first
            const uiInitialized = await this.ui.init();
            if (!uiInitialized) {
                throw new Error('Failed to initialize UI');
            }

            // Initialize GitHub service
            await this.githubService.init();

            // Add event listeners
            this.addEventListeners();

            console.log('Chatbot initialized successfully');
            return true;
        } catch (error) {
            console.error('Error initializing chatbot:', error);
            return false;
        }
    }

    addEventListeners() {
        // Listen for user messages
        document.addEventListener('chat:message', async (event) => {
            await this.handleUserMessage(event.detail.message);
        });

        // Listen for feedback
        document.addEventListener('chat:feedback', async (event) => {
            await this.handleFeedback(event.detail);
        });
    }

    async handleUserMessage(message) {
        try {
            console.log('Processing message:', message);

            // Show typing indicator
            this.ui.showTypingIndicator();

            // First try keyword service
            const keywordResponse = this.keywordService.processMessage(message);
            console.log('Keyword service response:', keywordResponse);

            // Check for valid keyword response
            if (keywordResponse && keywordResponse !== this.config.ui.errorMessages.notUnderstood) {
                this.ui.removeTypingIndicator();
                const messageId = this.ui.addMessage(keywordResponse, 'bot');
                this.feedback.addFeedbackUI(messageId, message, keywordResponse);

                // Learn from successful keyword response
                await this.githubService.processLearning(message, keywordResponse, true);
                return;
            }

            // If no keyword match, try learned responses
            const learnedResponse = await this.githubService.findBestMatch(message);
            console.log('Learned response:', learnedResponse);

            let response;
            if (learnedResponse && learnedResponse.score >= 0.7) {
                console.log('Using learned response');
                // Randomly select from learned responses
                response = learnedResponse.responses[
                    Math.floor(Math.random() * learnedResponse.responses.length)
                ];
            } else {
                // Use default response if no match
                console.log('No matching response found');
                response = this.config.ui.errorMessages.notUnderstood;
            }

            // Remove typing indicator and show response
            this.ui.removeTypingIndicator();
            const messageId = this.ui.addMessage(response, 'bot');
            this.feedback.addFeedbackUI(messageId, message, response);

            // Learn from interaction if it's a new pattern
            if (!learnedResponse) {
                await this.githubService.processLearning(message, response, false);
            }

        } catch (error) {
            console.error('Error processing message:', error);
            this.ui.removeTypingIndicator();
            this.ui.addMessage(this.config.ui.errorMessages.general, 'bot');
        }
    }

    async handleFeedback(feedback) {
        try {
            console.log('Processing feedback:', feedback);
            await this.githubService.processLearning(
                feedback.message,
                feedback.response,
                feedback.isPositive
            );

            // Update learning score based on feedback
            if (feedback.isPositive) {
                await this.githubService.updatePatternScore(feedback.message, 1);
            } else {
                await this.githubService.updatePatternScore(feedback.message, -0.5);
            }
        } catch (error) {
            console.error('Error processing feedback:', error);
        }
    }

    async clearHistory() {
        try {
            await this.ui.clearMessages();
            await this.githubService.clearPatterns();
            console.log('Chat history cleared');
            return true;
        } catch (error) {
            console.error('Error clearing history:', error);
            return false;
        }
    }

    async exportData() {
        try {
            const data = {
                history: await this.ui.getChatHistory(),
                patterns: await this.githubService.getAllPatterns(),
                exportedAt: new Date().toISOString()
            };
            console.log('Data exported:', data);
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

            if (data.history) {
                await this.ui.importChatHistory(data.history);
            }
            
            if (data.patterns) {
                await this.githubService.importPatterns(data.patterns);
            }

            console.log('Data imported successfully');
            return true;
        } catch (error) {
            console.error('Error importing data:', error);
            return false;
        }
    }

    // Helper methods
    async reloadServices() {
        try {
            await this.githubService.init();
            await this.ui.reloadQuickReplies();
            console.log('Services reloaded successfully');
            return true;
        } catch (error) {
            console.error('Error reloading services:', error);
            return false;
        }
    }

    isInitialized() {
        return !!(this.ui && this.keywordService && this.githubService && this.feedback);
    }
}

// Create singleton instance
const chatBot = new ChatBot();

// Export for use in other scripts
export { chatBot };