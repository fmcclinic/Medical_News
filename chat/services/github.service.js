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
 
    // Rest of the methods remain the same, just update API calls to use callGitHubAPI
    // ... (findBestMatch, markPatternForImprovement, saveAIResponse, etc.)
 
    // Helper methods (cleanJsonString, formatResponse, validatePattern, etc.) stay the same
 }
 
 export const githubService = new GitHubService();