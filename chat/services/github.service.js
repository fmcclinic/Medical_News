// services/github.service.js

import { CONFIG } from '../config/clinic.config.js';
import { normalizeText, calculateStringSimilarity } from '../utils/chat.utils.js';
import { storageManager } from '../utils/storage.utils.js';

class GitHubService {
    constructor() {
        this.token = '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';
        this.owner = 'fmcclinic';
        this.repo = 'fmc-chatbot-learning';
        this.baseUrl = 'https://api.github.com';
        this.patternCache = new Map();
        this.lastSyncTime = null;

        this.headers = {
            'Authorization': `token ${this.token}`,
            'Accept': 'application/vnd.github.v3+json',
            'Content-Type': 'application/json'
        };
    }

    async init() {
        try {
            await this.syncPatterns();
            console.log('GitHub Learning Service initialized');
            setInterval(() => this.syncPatterns(), CONFIG.SYNC_INTERVAL);
            return true;
        } catch (error) {
            console.error('Failed to initialize GitHub service:', error);
            this.loadFromLocalStorage(); // Fallback to local storage
            return false;
        }
    }

    cleanJsonString(str) {
        if (typeof str !== 'string') return '';
        return str
            .replace(/[\u0000-\u001F\u007F-\u009F]/g, '') // Remove control characters
            .replace(/\\["\\/bfnrtu]/g, ' ') // Replace JSON escape sequences
            .replace(/\s+/g, ' ') // Normalize whitespace
            .trim();
    }

    validatePattern(pattern) {
        return {
            pattern: this.normalizePattern(pattern.pattern || ''),
            responses: Array.isArray(pattern.responses) 
                ? pattern.responses.map(r => this.formatResponse(r))
                : [],
            score: Number(pattern.score) || 0,
            createdAt: pattern.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            source: pattern.source || 'keyword'
        };
    }

    async syncPatterns() {
        try {
            const response = await fetch(
                `${this.baseUrl}/repos/${this.owner}/${this.repo}/issues?state=open&labels=pattern`,
                { headers: this.headers }
            );

            if (!response.ok) {
                throw new Error(`GitHub API error: ${response.statusText}`);
            }

            const issues = await response.json();
            this.patternCache.clear();

            for (const issue of issues) {
                try {
                    const cleanBody = this.cleanJsonString(issue.body);
                    let data = JSON.parse(cleanBody);
                    
                    // Validate and clean pattern data
                    data = this.validatePattern(data);
                    
                    if (data.pattern && data.responses.length > 0) {
                        this.patternCache.set(data.pattern, {
                            issueNumber: issue.number,
                            ...data
                        });
                    }
                } catch (parseError) {
                    console.error('Error parsing issue data:', parseError);
                    console.log('Problematic issue body:', issue.body);
                }
            }

            this.lastSyncTime = new Date();
            console.log(`Synced ${this.patternCache.size} patterns successfully`);
            this.backupToLocalStorage();
            return true;
        } catch (error) {
            console.error('Pattern sync failed:', error);
            this.loadFromLocalStorage();
            return false;
        }
    }

    findBestMatch(userInput) {
        try {
            console.log('Finding best match for:', userInput);
            const normalizedInput = normalizeText(userInput);
            let bestMatch = null;
            let highestScore = 0;

            for (const [pattern, data] of this.patternCache.entries()) {
                const similarity = calculateStringSimilarity(normalizedInput, pattern);
                const weightedScore = similarity * (data.score || 1);
                console.log(`Pattern: ${pattern}, Score: ${weightedScore}`);

                if (weightedScore > highestScore && weightedScore >= CONFIG.MIN_SCORE_THRESHOLD) {
                    highestScore = weightedScore;
                    bestMatch = data;
                }
            }

            console.log('Best match found:', bestMatch);
            return bestMatch;
        } catch (error) {
            console.error('Error finding best match:', error);
            return null;
        }
    }

    async createPattern(pattern, response) {
        try {
            console.log('Creating new pattern:', pattern);
            const normalizedPattern = normalizeText(pattern);
            
            const patternData = this.validatePattern({
                pattern: normalizedPattern,
                responses: [response],
                score: 1
            });

            const body = {
                title: `[Pattern] ${pattern.slice(0, 50)}...`,
                body: JSON.stringify(patternData),
                labels: ['pattern', 'low-score']
            };

            const apiResponse = await fetch(
                `${this.baseUrl}/repos/${this.owner}/${this.repo}/issues`,
                {
                    method: 'POST',
                    headers: this.headers,
                    body: JSON.stringify(body)
                }
            );

            if (!apiResponse.ok) {
                throw new Error(`GitHub API error: ${apiResponse.statusText}`);
            }

            const data = await apiResponse.json();
            await this.syncPatterns();
            console.log('Pattern created successfully');
            return data;
        } catch (error) {
            console.error('Error creating pattern:', error);
            this.saveToLocalStorage(pattern, response);
            return null;
        }
    }

    async updatePattern(issueNumber, updates) {
        try {
            console.log('Updating pattern:', issueNumber);
            
            // Ensure updates are clean
            const cleanUpdates = {};
            if (updates.body) {
                const bodyData = JSON.parse(updates.body);
                cleanUpdates.body = JSON.stringify(this.validatePattern(bodyData));
            }
            if (updates.labels) {
                cleanUpdates.labels = updates.labels;
            }

            const response = await fetch(
                `${this.baseUrl}/repos/${this.owner}/${this.repo}/issues/${issueNumber}`,
                {
                    method: 'PATCH',
                    headers: this.headers,
                    body: JSON.stringify(cleanUpdates)
                }
            );

            if (!response.ok) {
                throw new Error(`GitHub API error: ${response.statusText}`);
            }

            const data = await response.json();
            await this.syncPatterns();
            console.log('Pattern updated successfully');
            return data;
        } catch (error) {
            console.error('Error updating pattern:', error);
            return null;
        }
    }

    async addFeedback(issueNumber, feedback, isPositive) {
        try {
            console.log('Adding feedback:', { issueNumber, isPositive });
            const cleanFeedback = this.cleanJsonString(feedback);
            
            await fetch(
                `${this.baseUrl}/repos/${this.owner}/${this.repo}/issues/${issueNumber}/comments`,
                {
                    method: 'POST',
                    headers: this.headers,
                    body: JSON.stringify({
                        body: `Feedback: ${isPositive ? '👍' : '👎'}\n${cleanFeedback}`
                    })
                }
            );

            const pattern = Array.from(this.patternCache.values())
                .find(p => p.issueNumber === issueNumber);

            if (pattern) {
                const newScore = pattern.score + (isPositive ? 1 : -0.5);
                await this.updatePattern(issueNumber, {
                    labels: ['pattern', this.getScoreLabel(newScore)]
                });
                console.log('Feedback added successfully');
            }

            return true;
        } catch (error) {
            console.error('Error adding feedback:', error);
            return false;
        }
    }

    async updatePatternScore(message, scoreDelta) {
        try {
            console.log('Updating pattern score:', { message, scoreDelta });
            const normalizedPattern = normalizeText(message);
            const patternData = Array.from(this.patternCache.values())
                .find(p => p.pattern === normalizedPattern);

            if (patternData) {
                const newScore = Math.max(0, (patternData.score || 1) + scoreDelta);
                await this.updatePattern(patternData.issueNumber, {
                    body: JSON.stringify(this.validatePattern({
                        ...patternData,
                        score: newScore
                    }))
                });
                console.log(`Pattern score updated: ${patternData.pattern} -> ${newScore}`);
            }
        } catch (error) {
            console.error('Error updating pattern score:', error);
        }
    }

    async processLearning(userMessage, botResponse, isHelpful) {
        try {
            console.log('Processing learning:', { userMessage, isHelpful });
            const existingPattern = this.findBestMatch(userMessage);

            if (existingPattern) {
                await this.addFeedback(
                    existingPattern.issueNumber,
                    userMessage,
                    isHelpful
                );
            } else {
                await this.createPattern(userMessage, botResponse);
            }
            console.log('Learning processed successfully');
        } catch (error) {
            console.error('Error processing learning:', error);
        }
    }

    getScoreLabel(score) {
        if (score > 5) return 'high-score';
        if (score > 2) return 'medium-score';
        return 'low-score';
    }

    backupToLocalStorage() {
        try {
            const patterns = Array.from(this.patternCache.entries());
            storageManager.savePatterns(patterns);
        } catch (error) {
            console.error('Error backing up patterns:', error);
        }
    }

    loadFromLocalStorage() {
        try {
            const patterns = storageManager.getPatterns();
            this.patternCache.clear();
            patterns.forEach(([pattern, data]) => {
                this.patternCache.set(pattern, data);
            });
        } catch (error) {
            console.error('Error loading patterns from backup:', error);
        }
    }

    saveToLocalStorage(pattern, response) {
        const normalizedPattern = normalizeText(pattern);
        const data = this.validatePattern({
            pattern: normalizedPattern,
            responses: [response],
            score: 1
        });
        this.patternCache.set(normalizedPattern, data);
        this.backupToLocalStorage();
    }

    // Clean up methods
    async clearPatterns() {
        try {
            this.patternCache.clear();
            await storageManager.savePatterns([]);
            return true;
        } catch (error) {
            console.error('Error clearing patterns:', error);
            return false;
        }
    }

    async getAllPatterns() {
        return Array.from(this.patternCache.entries());
    }

    async importPatterns(patterns) {
        try {
            patterns.forEach(([pattern, data]) => {
                const cleanData = this.validatePattern(data);
                this.patternCache.set(pattern, cleanData);
            });
            this.backupToLocalStorage();
            return true;
        } catch (error) {
            console.error('Error importing patterns:', error);
            return false;
        }
    }

        // Thêm methods mới
        async markPatternForImprovement(pattern) {
            try {
                const existingPattern = Array.from(this.patternCache.values())
                    .find(p => p.pattern === pattern);
    
                if (existingPattern) {
                    await this.updatePattern(existingPattern.issueNumber, {
                        labels: ['pattern', 'needs-improvement'],
                        body: JSON.stringify({
                            ...existingPattern,
                            needsImprovement: true,
                            lastFeedback: new Date().toISOString()
                        })
                    });
                }
            } catch (error) {
                console.error('Error marking pattern:', error);
            }
        }
    
        // Trong github.service.js

async saveAIResponse(question, response) {
    try {
        // Chuẩn hóa pattern
        const normalizedPattern = this.normalizePattern(question);
 
        // Format response - chỉ format basic mà không thêm prefix
        const formattedResponse = this.formatResponse(response);
 
        const patternData = this.validatePattern({
            pattern: normalizedPattern,
            responses: [formattedResponse],
            score: 2,
            source: 'ai',
            createdAt: new Date().toISOString()
        });
 
        const body = {
            title: `[AI Pattern] ${normalizedPattern.slice(0, 50)}...`,
            body: JSON.stringify(patternData, null, 2), // Pretty print JSON
            labels: ['pattern', 'ai-generated', 'high-quality']
        };
 
        const apiResponse = await fetch(
            `${this.baseUrl}/repos/${this.owner}/${this.repo}/issues`,
            {
                method: 'POST',
                headers: this.headers,
                body: JSON.stringify(body)
            }
        );
 
        if (!apiResponse.ok) {
            throw new Error('Failed to save AI response');
        }
 
        await this.syncPatterns();
        return true;
    } catch (error) {
        console.error('Error saving AI response:', error);
        return false;
    }
 }
 
 // Chỉ format basic cho response, không thêm prefix
 formatResponse(response) {
    return response
        .trim()                          // Bỏ spaces đầu/cuối
        .replace(/\n{3,}/g, '\n\n')      // Giảm nhiều dòng trống thành 2 dòng
        .replace(/\s+$/gm, '');          // Bỏ spaces cuối mỗi dòng
 }
 
 validatePattern(pattern) {
    return {
        pattern: this.normalizePattern(pattern.pattern || ''),
        responses: Array.isArray(pattern.responses) 
            ? pattern.responses.map(r => this.formatResponse(r))
            : [],
        score: Number(pattern.score) || 0,
        createdAt: pattern.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        source: pattern.source || 'keyword'
    };
 }
 
 normalizePattern(pattern) {
    return pattern
        .toLowerCase()
        .trim()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Bỏ dấu
        .replace(/[^\w\s]/g, ' ')        // Thay ký tự đặc biệt bằng space
        .replace(/\s+/g, ' ');           // Giảm nhiều space thành 1 space
 }
    }
export const githubService = new GitHubService();