// services/github.service.js

import { CONFIG } from '../config/clinic.config.js';
import { normalizeText, calculateStringSimilarity } from '../utils/chat.utils.js';
import { storageManager } from '../utils/storage.utils.js';

class GitHubService {
    constructor() {
        // Sử dụng Dashboard endpoint
        this.apiUrl = 'https://claude-api-test.vercel.app/api/github';
        this.patternCache = new Map();
        this.lastSyncTime = null;
        this.syncInProgress = false;
        this.maxRetries = 3;
        this.retryDelay = 1000;
    }

    // Đơn giản hóa API call
    async callGitHubAPI() {
        const response = await fetch(this.apiUrl);
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'GitHub API call failed');
        }

        return response.json();
    }

    async init() {
        try {
            console.log('Initializing GitHub Learning Service...');
            await this.syncPatterns();
            setInterval(() => this.syncPatterns(), CONFIG.SYNC_INTERVAL);
            console.log('GitHub Learning Service initialized');
            return true;
        } catch (error) {
            console.error('Failed to initialize GitHub service:', error);
            this.loadFromLocalStorage();
            return false;
        }
    }

    async syncPatterns(retryCount = 0) {
        if (this.syncInProgress) return false;
        this.syncInProgress = true;

        try {
            const data = await this.callGitHubAPI();
            
            // Xử lý response từ Dashboard
            if (data && data.response) {
                this.patternCache.clear();
                
                // Lưu thông tin repository
                const repoInfo = {
                    name: data.response.repoName,
                    visibility: data.response.visibility,
                    url: data.response.url
                };
                await storageManager.saveSettings({ repoInfo });

                this.lastSyncTime = new Date();
                await this.backupToLocalStorage();
                return true;
            }
            return false;

        } catch (error) {
            console.error('Pattern sync failed:', error);
            if (retryCount < this.maxRetries) {
                await new Promise(resolve => setTimeout(resolve, this.retryDelay * Math.pow(2, retryCount)));
                return this.syncPatterns(retryCount + 1);
            }
            throw error;
        } finally {
            this.syncInProgress = false;
        }
    }

    // Các method xử lý patterns
    async findBestMatch(userInput) {
        try {
            console.log('Finding best match for:', userInput);
            const normalizedInput = normalizeText(userInput);
            let bestMatch = null;
            let highestScore = 0;

            for (const [pattern, data] of this.patternCache.entries()) {
                const similarity = calculateStringSimilarity(normalizedInput, pattern);
                const weightedScore = similarity * (data.score || 1);

                if (weightedScore > highestScore && weightedScore >= CONFIG.MIN_SCORE_THRESHOLD) {
                    highestScore = weightedScore;
                    bestMatch = {
                        ...data,
                        score: weightedScore
                    };
                }
            }

            return bestMatch;
        } catch (error) {
            console.error('Error finding best match:', error);
            return null;
        }
    }

    // Local Storage Management
    async backupToLocalStorage() {
        try {
            const patterns = Array.from(this.patternCache.entries());
            await storageManager.savePatterns(patterns);
            return true;
        } catch (error) {
            console.error('Error backing up patterns:', error);
            return false;
        }
    }

    loadFromLocalStorage() {
        try {
            const patterns = storageManager.getPatterns();
            this.patternCache.clear();
            patterns.forEach(([pattern, data]) => {
                this.patternCache.set(pattern, data);
            });
            return true;
        } catch (error) {
            console.error('Error loading patterns from backup:', error);
            return false;
        }
    }

    // Utility Methods
    async getStats() {
        return {
            patternCount: this.patternCache.size,
            lastSync: this.lastSyncTime,
            syncInProgress: this.syncInProgress
        };
    }

    async cleanup() {
        try {
            const oldPatterns = Array.from(this.patternCache.values())
                .filter(p => p.score < CONFIG.PATTERN_CLEANUP_THRESHOLD);
            
            for (const pattern of oldPatterns) {
                this.patternCache.delete(pattern.pattern);
            }

            await this.backupToLocalStorage();
            return oldPatterns.length;
        } catch (error) {
            console.error('Error during cleanup:', error);
            return 0;
        }
    }
}

// Create and export singleton instance
export const githubService = new GitHubService();