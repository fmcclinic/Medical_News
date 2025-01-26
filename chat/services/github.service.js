// services/github.service.js

import { CONFIG } from '../config/clinic.config.js';
import { normalizeText, calculateStringSimilarity } from '../utils/chat.utils.js';
import { storageManager } from '../utils/storage.utils.js';

class GitHubService {
   constructor() {
       this.apiUrl = 'https://fmc-chat-api.vercel.app/api/github';
       this.owner = 'fmcclinic';
       this.repo = 'fmc-chatbot-learning';
       this.patternCache = new Map();
       this.lastSyncTime = null;
       this.syncInProgress = false;
       this.maxRetries = 3;
       this.retryDelay = 1000;
   }

   async callGitHubAPI(endpoint, method = 'GET', body = null) {
       const response = await fetch(this.apiUrl, {
           method: 'POST',
           headers: {
               'Content-Type': 'application/json'
           },
           body: JSON.stringify({
               url: endpoint,
               method,
               body
           })
       });

       if (!response.ok) {
           throw new Error(`API request failed: ${response.statusText}`);
       }

       return response.json();
   }

   async init() {
       try {
           console.log('Initializing GitHub Learning Service...');
           const hasAccess = await this.checkRepoAccess();
           if (!hasAccess) {
               throw new Error('Cannot access repository');
           }
           await this.syncPatterns();
           setInterval(() => this.syncPatterns(), CONFIG.SYNC_INTERVAL);
           console.log('GitHub Learning Service initialized successfully');
           return true;
       } catch (error) {
           console.error('Failed to initialize GitHub service:', error);
           this.loadFromLocalStorage();
           return false;
       }
   }

   async checkRepoAccess() {
       try {
           await this.callGitHubAPI(`/repos/${this.owner}/${this.repo}`);
           return true;
       } catch (error) {
           return false;
       }
   }

   async syncPatterns(retryCount = 0) {
       if (this.syncInProgress) return false;
       this.syncInProgress = true;

       try {
           const issues = await this.callGitHubAPI(
               `/repos/${this.owner}/${this.repo}/issues?state=open&labels=pattern`
           );

           this.patternCache.clear();
           for (const issue of issues) {
               try {
                   const cleanBody = this.cleanJsonString(issue.body);
                   let data = JSON.parse(cleanBody);
                   data = this.validatePattern(data);
                   
                   if (data.pattern && data.responses.length > 0) {
                       this.patternCache.set(data.pattern, {
                           issueNumber: issue.number,
                           ...data
                       });
                   }
               } catch (parseError) {
                   console.error(`Error parsing issue #${issue.number}:`, parseError);
               }
           }

           this.lastSyncTime = new Date();
           await this.backupToLocalStorage();
           return true;
       } catch (error) {
           if (retryCount < this.maxRetries) {
               await new Promise(resolve => setTimeout(resolve, this.retryDelay * Math.pow(2, retryCount)));
               return this.syncPatterns(retryCount + 1);
           }
           throw error;
       } finally {
           this.syncInProgress = false;
       }
   }

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

   async createPattern(pattern, response) {
       try {
           const normalizedPattern = normalizeText(pattern);
           const patternData = this.validatePattern({
               pattern: normalizedPattern,
               responses: [response],
               score: 1
           });

           const body = {
               title: `[Pattern] ${pattern.slice(0, 50)}...`,
               body: JSON.stringify(patternData, null, 2),
               labels: ['pattern', 'new']
           };

           const data = await this.callGitHubAPI(
               `/repos/${this.owner}/${this.repo}/issues`,
               'POST',
               body
           );

           await this.syncPatterns();
           return data;
       } catch (error) {
           console.error('Error creating pattern:', error);
           this.saveToLocalStorage(pattern, response);
           return null;
       }
   }

   async updatePattern(issueNumber, updates) {
       try {
           const existing = Array.from(this.patternCache.values())
               .find(p => p.issueNumber === issueNumber);

           if (!existing) throw new Error('Pattern not found');

           const updatedData = this.validatePattern({
               ...existing,
               ...updates,
               updatedAt: new Date().toISOString()
           });

           await this.callGitHubAPI(
               `/repos/${this.owner}/${this.repo}/issues/${issueNumber}`,
               'PATCH',
               { body: JSON.stringify(updatedData, null, 2) }
           );

           await this.syncPatterns();
           return true;
       } catch (error) {
           console.error('Error updating pattern:', error);
           return false;
       }
   }

   async markPatternForImprovement(pattern) {
       try {
           const existingPattern = Array.from(this.patternCache.values())
               .find(p => p.pattern === normalizeText(pattern));

           if (existingPattern) {
               await this.updatePattern(existingPattern.issueNumber, {
                   labels: ['pattern', 'needs-improvement'],
                   needsImprovement: true,
                   lastFeedback: new Date().toISOString()
               });
           }
       } catch (error) {
           console.error('Error marking pattern for improvement:', error);
       }
   }

   async saveAIResponse(question, response) {
       try {
           const normalizedPattern = this.normalizePattern(question);
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
               body: JSON.stringify(patternData, null, 2),
               labels: ['pattern', 'ai-generated', 'high-quality']
           };

           const data = await this.callGitHubAPI(
               `/repos/${this.owner}/${this.repo}/issues`,
               'POST',
               body
           );

           await this.syncPatterns();
           return true;
       } catch (error) {
           console.error('Error saving AI response:', error);
           return false;
       }
   }

   cleanJsonString(str) {
       if (typeof str !== 'string') return '';
       return str
           .replace(/[\u0000-\u001F\u007F-\u009F]/g, '')
           .replace(/\\["\\/bfnrtu]/g, ' ')
           .replace(/\s+/g, ' ')
           .trim();
   }

   formatResponse(response) {
       return response
           .trim()
           .replace(/\n{3,}/g, '\n\n')
           .replace(/\s+$/gm, '');
   }

   normalizePattern(pattern) {
       return pattern
           .toLowerCase()
           .trim()
           .normalize('NFD')
           .replace(/[\u0300-\u036f]/g, '')
           .replace(/[^\w\s]/g, ' ')
           .replace(/\s+/g, ' ');
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
           source: pattern.source || 'keyword',
           needsImprovement: pattern.needsImprovement || false,
           lastFeedback: pattern.lastFeedback || null
       };
   }

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

   saveToLocalStorage(pattern, response) {
       try {
           const normalizedPattern = normalizeText(pattern);
           const data = this.validatePattern({
               pattern: normalizedPattern,
               responses: [response],
               score: 1
           });
           this.patternCache.set(normalizedPattern, data);
           this.backupToLocalStorage();
           return true;
       } catch (error) {
           console.error('Error saving to local storage:', error);
           return false;
       }
   }

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
           await this.backupToLocalStorage();
           return true;
       } catch (error) {
           console.error('Error importing patterns:', error);
           return false;
       }
   }
}

export const githubService = new GitHubService();