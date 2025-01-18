// utils/storage.utils.js

import { CONFIG } from '../config/clinic.config.js';

class StorageManager {
    constructor() {
        // Storage Keys
        this.CHAT_HISTORY_KEY = 'fmc_chat_history';
        this.PATTERNS_KEY = 'fmc_learned_patterns';
        this.SETTINGS_KEY = 'fmc_chat_settings';
        this.CLAUDE_DATA_KEY = 'fmc_claude_data';
        this.FAILED_REQUESTS_KEY = 'fmc_failed_requests';
        this.FEEDBACK_KEY = 'fmc_feedback_data';
        this.ANALYTICS_KEY = 'fmc_analytics_data';
    }

    // Chat History Management
    async saveChatHistory(message) {
        try {
            let history = this.getChatHistory();
            history.push({
                ...message,
                timestamp: Date.now()
            });

            // Limit history size
            if (history.length > CONFIG.MAX_CHAT_HISTORY) {
                history = history.slice(-CONFIG.MAX_CHAT_HISTORY);
            }

            localStorage.setItem(this.CHAT_HISTORY_KEY, JSON.stringify(history));
            return true;
        } catch (error) {
            console.error('Error saving chat history:', error);
            return false;
        }
    }

    getChatHistory(conversationId = null) {
        try {
            const history = localStorage.getItem(this.CHAT_HISTORY_KEY);
            const parsedHistory = history ? JSON.parse(history) : [];
            
            // Filter by conversation if ID provided
            if (conversationId) {
                return parsedHistory.filter(item => item.conversationId === conversationId);
            }
            
            return parsedHistory;
        } catch (error) {
            console.error('Error getting chat history:', error);
            return [];
        }
    }

    clearChatHistory() {
        try {
            localStorage.removeItem(this.CHAT_HISTORY_KEY);
            return true;
        } catch (error) {
            console.error('Error clearing chat history:', error);
            return false;
        }
    }

    // Patterns Management
    savePatterns(patterns) {
        try {
            localStorage.setItem(this.PATTERNS_KEY, JSON.stringify(patterns));
            return true;
        } catch (error) {
            console.error('Error saving patterns:', error);
            return false;
        }
    }

    getPatterns() {
        try {
            const patterns = localStorage.getItem(this.PATTERNS_KEY);
            return patterns ? JSON.parse(patterns) : [];
        } catch (error) {
            console.error('Error getting patterns:', error);
            return [];
        }
    }

    clearPatterns() {
        try {
            localStorage.removeItem(this.PATTERNS_KEY);
            return true;
        } catch (error) {
            console.error('Error clearing patterns:', error);
            return false;
        }
    }

    // Claude Data Management
    saveClaudeData(data) {
        try {
            const existingData = this.getClaudeData() || {};
            const updatedData = {
                ...existingData,
                ...data,
                lastUpdated: Date.now()
            };
            localStorage.setItem(this.CLAUDE_DATA_KEY, JSON.stringify(updatedData));
            return true;
        } catch (error) {
            console.error('Error saving Claude data:', error);
            return false;
        }
    }

    getClaudeData() {
        try {
            const data = localStorage.getItem(this.CLAUDE_DATA_KEY);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('Error getting Claude data:', error);
            return null;
        }
    }

    clearClaudeData() {
        try {
            localStorage.removeItem(this.CLAUDE_DATA_KEY);
            return true;
        } catch (error) {
            console.error('Error clearing Claude data:', error);
            return false;
        }
    }

    // Failed Requests Management
    async saveFailedRequest(request) {
        try {
            let failedRequests = await this.getFailedRequests();
            failedRequests.push({
                ...request,
                retryCount: 0,
                lastRetry: null
            });

            // Limit number of stored failed requests
            if (failedRequests.length > 100) {
                failedRequests = failedRequests.slice(-100);
            }

            localStorage.setItem(this.FAILED_REQUESTS_KEY, JSON.stringify(failedRequests));
            return true;
        } catch (error) {
            console.error('Error saving failed request:', error);
            return false;
        }
    }

    getFailedRequests() {
        try {
            const requests = localStorage.getItem(this.FAILED_REQUESTS_KEY);
            return requests ? JSON.parse(requests) : [];
        } catch (error) {
            console.error('Error getting failed requests:', error);
            return [];
        }
    }

    updateFailedRequest(requestId, updates) {
        try {
            const requests = this.getFailedRequests();
            const updatedRequests = requests.map(req => 
                req.id === requestId ? { ...req, ...updates } : req
            );
            localStorage.setItem(this.FAILED_REQUESTS_KEY, JSON.stringify(updatedRequests));
            return true;
        } catch (error) {
            console.error('Error updating failed request:', error);
            return false;
        }
    }

    // Feedback Management
    async saveFeedback(feedback) {
        try {
            let feedbackData = await this.getFeedback();
            feedbackData.push({
                ...feedback,
                timestamp: Date.now()
            });

            // Limit feedback history
            if (feedbackData.length > 1000) {
                feedbackData = feedbackData.slice(-1000);
            }

            localStorage.setItem(this.FEEDBACK_KEY, JSON.stringify(feedbackData));
            
            // Update analytics
            await this.updateAnalytics('feedback', feedback);
            
            return true;
        } catch (error) {
            console.error('Error saving feedback:', error);
            return false;
        }
    }

    getFeedback(conversationId = null) {
        try {
            const feedback = localStorage.getItem(this.FEEDBACK_KEY);
            const parsedFeedback = feedback ? JSON.parse(feedback) : [];

            if (conversationId) {
                return parsedFeedback.filter(f => f.conversationId === conversationId);
            }

            return parsedFeedback;
        } catch (error) {
            console.error('Error getting feedback:', error);
            return [];
        }
    }

    // Settings Management
    saveSettings(settings) {
        try {
            const currentSettings = this.getSettings();
            const updatedSettings = {
                ...currentSettings,
                ...settings,
                updatedAt: new Date().toISOString()
            };

            localStorage.setItem(this.SETTINGS_KEY, JSON.stringify(updatedSettings));
            return true;
        } catch (error) {
            console.error('Error saving settings:', error);
            return false;
        }
    }

    getSettings() {
        try {
            const settings = localStorage.getItem(this.SETTINGS_KEY);
            return settings ? JSON.parse(settings) : this.getDefaultSettings();
        } catch (error) {
            console.error('Error getting settings:', error);
            return this.getDefaultSettings();
        }
    }

    getDefaultSettings() {
        return {
            sound: true,
            notifications: true,
            theme: 'light',
            fontSize: 'medium',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
    }

    // Analytics Management
    async updateAnalytics(type, data) {
        try {
            let analytics = await this.getAnalytics();
            const timestamp = Date.now();

            // Initialize if not exists
            if (!analytics[type]) {
                analytics[type] = {
                    total: 0,
                    daily: {},
                    details: []
                };
            }

            // Update totals
            analytics[type].total++;

            // Update daily stats
            const today = new Date().toISOString().split('T')[0];
            analytics[type].daily[today] = (analytics[type].daily[today] || 0) + 1;

            // Add detail record
            analytics[type].details.push({
                ...data,
                timestamp
            });

            // Limit detail records
            if (analytics[type].details.length > 1000) {
                analytics[type].details = analytics[type].details.slice(-1000);
            }

            // Clean up old daily stats (keep last 30 days)
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            const cutoffDate = thirtyDaysAgo.toISOString().split('T')[0];

            analytics[type].daily = Object.fromEntries(
                Object.entries(analytics[type].daily)
                    .filter(([date]) => date >= cutoffDate)
            );

            localStorage.setItem(this.ANALYTICS_KEY, JSON.stringify(analytics));
            return true;
        } catch (error) {
            console.error('Error updating analytics:', error);
            return false;
        }
    }

    getAnalytics(type = null) {
        try {
            const analytics = localStorage.getItem(this.ANALYTICS_KEY);
            const parsedAnalytics = analytics ? JSON.parse(analytics) : {};

            if (type) {
                return parsedAnalytics[type] || null;
            }

            return parsedAnalytics;
        } catch (error) {
            console.error('Error getting analytics:', error);
            return {};
        }
    }

    // Storage Stats
    getStorageStats() {
        try {
            const stats = {
                chatHistory: localStorage.getItem(this.CHAT_HISTORY_KEY)?.length || 0,
                patterns: localStorage.getItem(this.PATTERNS_KEY)?.length || 0,
                claudeData: localStorage.getItem(this.CLAUDE_DATA_KEY)?.length || 0,
                failedRequests: localStorage.getItem(this.FAILED_REQUESTS_KEY)?.length || 0,
                feedback: localStorage.getItem(this.FEEDBACK_KEY)?.length || 0,
                analytics: localStorage.getItem(this.ANALYTICS_KEY)?.length || 0,
                settings: localStorage.getItem(this.SETTINGS_KEY)?.length || 0
            };

            const totalSize = Object.values(stats).reduce((a, b) => a + b, 0);
            const limit = 5 * 1024 * 1024; // 5MB browser limit

            return {
                ...stats,
                totalSize,
                limit,
                usage: (totalSize / limit) * 100
            };
        } catch (error) {
            console.error('Error calculating storage stats:', error);
            return null;
        }
    }

    // Cleanup old data
    async cleanup() {
        try {
            const stats = this.getStorageStats();
            if (stats && stats.usage > 80) {
                // Clean up chat history
                const history = this.getChatHistory();
                const reducedHistory = history.slice(-50);
                localStorage.setItem(this.CHAT_HISTORY_KEY, JSON.stringify(reducedHistory));

                // Clean up patterns
                const patterns = this.getPatterns();
                const goodPatterns = patterns.filter(p => p[1].score >= 0.5);
                localStorage.setItem(this.PATTERNS_KEY, JSON.stringify(goodPatterns));

                // Clean up Claude data
                const claudeData = this.getClaudeData();
                if (claudeData && claudeData.cache) {
                    const oldestAllowed = Date.now() - (7 * 24 * 60 * 60 * 1000); // 7 days
                    claudeData.cache = claudeData.cache.filter(item => 
                        item.timestamp > oldestAllowed
                    );
                    this.saveClaudeData(claudeData);
                }

                // Clean up failed requests older than 24 hours
                const failedRequests = this.getFailedRequests();
                const dayOldRequests = failedRequests.filter(req => 
                    Date.now() - req.timestamp < 24 * 60 * 60 * 1000
                );
                localStorage.setItem(this.FAILED_REQUESTS_KEY, JSON.stringify(dayOldRequests));

                return true;
            }
            return false;
        } catch (error) {
            console.error('Error during cleanup:', error);
            return false;
        }
    }

    // Export/Import data
    exportData() {
        try {
            return {
                chatHistory: this.getChatHistory(),
                patterns: this.getPatterns(),
                claudeData: this.getClaudeData(),
                settings: this.getSettings(),
                feedback: this.getFeedback(),
                analytics: this.getAnalytics(),
                exportedAt: new Date().toISOString()
            };
        } catch (error) {
            console.error('Error exporting data:', error);
            return null;
        }
    }

    importData(data) {
        try {
            if (!data) {
                throw new Error('No data provided for import');
            }

            if (data.chatHistory) {
                localStorage.setItem(this.CHAT_HISTORY_KEY, JSON.stringify(data.chatHistory));
            }
            if (data.patterns) {
                localStorage.setItem(this.PATTERNS_KEY, JSON.stringify(data.patterns));
            }
            if (data.claudeData) {
                localStorage.setItem(this.CLAUDE_DATA_KEY, JSON.stringify(data.claudeData));
            }
            if (data.settings) {
                localStorage.setItem(this.SETTINGS_KEY, JSON.stringify(data.settings));
            }
            if (data.feedback) {
                localStorage.setItem(this.FEEDBACK_KEY, JSON.stringify(data.feedback));
            }
            if (data.analytics) {
                localStorage.setItem(this.ANALYTICS_KEY, JSON.stringify(data.analytics));
            }
            return true;
        } catch (error) {
            console.error('Error importing data:', error);
            return false;
        }
    }
}

// Export singleton instance
export const storageManager = new StorageManager();