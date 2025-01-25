// services/claude.service.js
import { clinicConfig, CONFIG } from '../config/clinic.config.js';
import { storageManager } from '../utils/storage.utils.js';
import { githubService } from './github.service.js';

class ClaudeService {
    constructor() {
        // API Configuration
        this.API_KEY = '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'; // Thay thế key mới
        this.API_URL = 'http://localhost:3000/api/claude';
        this.MODEL = 'claude-3-opus-20240229';
        
        // Cache and Memory Settings
        this.responseCache = new Map();
        this.CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours
        this.MAX_CACHE_SIZE = 1000;
        this.contextMemory = [];
        this.MAX_CONTEXT_LENGTH = 10;
     
        // Rate Limiting
        this.requestCount = 0;
        this.requestTimestamp = Date.now();
        this.MAX_REQUESTS_PER_MINUTE = 50;
     
        // Initialize
        this.systemPrompts = this.initializePrompts();
        this.questionPatterns = this.initializePatterns();
        this.restoreFromBackup();
        
        // Debug Mode
        this.DEBUG = true;
     }

    initializePrompts() {
        return {
            basicInfo: `
                Thông tin cơ bản về phòng khám:
                - Tên: ${clinicConfig.info.name}
                - Địa chỉ: ${clinicConfig.info.address}
                - Điện thoại: ${clinicConfig.info.phone}
                - Giờ làm việc: 
                  ${clinicConfig.info.workingHours.weekday}
                  ${clinicConfig.info.workingHours.sunday}
            `,
            departments: clinicConfig.departments.map(dept => `
                ${dept.name}:
                - Mô tả: ${dept.description}
                - Bác sĩ: ${dept.doctors.map(doc => 
                    `${doc.name} (${doc.degree}${doc.position ? `, ${doc.position}` : ''})`
                ).join(', ')}
                - Dịch vụ: ${dept.services.join(', ')}
            `).join('\n'),
            services: clinicConfig.departments.map(dept => `
                Dịch vụ ${dept.name}:
                ${dept.services.join('\n')}
            `).join('\n')
        };
    }

    initializePatterns() {
        return {
            basicInfo: {
                keywords: [
                    'phòng khám', 'địa chỉ', 'điện thoại', 'liên hệ', 
                    'giờ làm việc', 'thời gian', 'mở cửa', 'đóng cửa'
                ],
                topics: ['contact', 'schedule'],
                weight: 1.0
            },
            departments: {
                keywords: [
                    'khoa', 'chuyên khoa', 'bác sĩ', 'bác sỹ', 
                    'chuyên gia', 'chuyên môn', 'trình độ', 'kinh nghiệm'
                ],
                departments: clinicConfig.departments.map(dept => 
                    dept.name.toLowerCase()
                ),
                topics: ['departments', 'doctors'],
                weight: 1.2
            },
            services: {
                keywords: [
                    'dịch vụ', 'khám bệnh', 'điều trị', 'tư vấn',
                    'chi phí', 'giá', 'bảo hiểm'
                ],
                topics: ['services', 'pricing'],
                weight: 1.1
            }
        };
    }

    async processMessage(message, conversationId = null) {
        try {
            this.logDebug('Processing message:', { message, conversationId });

            // Check cache first
            const cachedResponse = this.getCachedResponse(message);
            if (cachedResponse) {
                this.logDebug('Cache hit:', cachedResponse);
                return cachedResponse;
            }

            // Rate limiting check
            if (!this.checkRateLimit()) {
                throw new Error('Rate limit exceeded');
            }

            // Analyze question and prepare context
            const analysis = this.analyzeQuestion(message);
            const context = this.manageContext(message, conversationId);
            const systemPrompt = this.generateSystemPrompt(analysis, context);

            // Call API with retry mechanism
            const response = await this.callClaudeAPI(message, systemPrompt, context);
            
            // Cache and process response
            if (response && response.text) {
                this.cacheResponse(message, response);
                if (response.isClinicQuestion) {
                    await this.processLearning(message, response);
                }
            }

            this.logDebug('Processed response:', response);
            return response;

        } catch (error) {
            this.logDebug('Error processing message:', error);
            await this.handleAPIError(error, message);
            return null;
        }
    }

    analyzeQuestion(message) {
        const normalizedMessage = message.toLowerCase().trim();
        const result = {
            isClinicQuestion: false,
            topics: new Set(),
            relevantDepartments: new Set(),
            score: 0
        };

        Object.entries(this.questionPatterns).forEach(([category, data]) => {
            let categoryScore = 0;

            data.keywords.forEach(keyword => {
                if (normalizedMessage.includes(keyword.toLowerCase())) {
                    categoryScore += 1;
                    result.isClinicQuestion = true;
                    data.topics.forEach(topic => result.topics.add(topic));
                }
            });

            if (data.departments) {
                data.departments.forEach(dept => {
                    if (normalizedMessage.includes(dept.toLowerCase())) {
                        categoryScore += 2;
                        result.relevantDepartments.add(dept);
                    }
                });
            }

            result.score += categoryScore * (data.weight || 1.0);
        });

        this.logDebug('Question analysis:', {
            message: normalizedMessage,
            result: {
                isClinicQuestion: result.isClinicQuestion,
                topics: Array.from(result.topics),
                relevantDepartments: Array.from(result.relevantDepartments),
                score: result.score
            }
        });

        return result;
    }

    generateSystemPrompt(analysis, context = null) {
        if (!analysis.isClinicQuestion) {
            return null;
        }

        let rolePrompt = "Bạn là trợ lý ảo của phòng khám FMC - Friend Medical Clinic. ";
        let stylePrompt = "Hãy trả lời ngắn gọn, chuyên nghiệp và chính xác. ";
        let contextPrompt = "";

        if (analysis.relevantDepartments.size > 0) {
            const deptInfo = Array.from(analysis.relevantDepartments)
                .map(deptName => {
                    const dept = clinicConfig.departments.find(d => 
                        d.name.toLowerCase() === deptName.toLowerCase()
                    );
                    return dept ? this.systemPrompts.departments : '';
                })
                .join('\n');
            contextPrompt += `Thông tin chuyên khoa:\n${deptInfo}\n`;
        }

        if (analysis.topics.has('contact') || analysis.topics.has('schedule')) {
            contextPrompt += this.systemPrompts.basicInfo;
        }

        if (context && context.length > 0) {
            contextPrompt += "\nContext từ cuộc hội thoại:\n" + 
                context.map(c => `Q: ${c.message}\nA: ${c.response}`).join('\n');
        }

        if (analysis.topics.has('pricing')) {
            contextPrompt += "Với câu hỏi về chi phí, hãy đề xuất liên hệ trực tiếp phòng khám để có thông tin chính xác nhất. ";
        }

        return `${rolePrompt}${stylePrompt}${contextPrompt}`.trim();
    }

    async callClaudeAPI(message, systemPrompt, context = null, retryCount = 0) {
        try {
            const messages = [];
            
            // Add system prompt if available
            if (systemPrompt) {
                messages.push({
                    role: "system", 
                    content: systemPrompt
                });
            }
 
            // Add context messages if available 
            if (context && Array.isArray(context)) {
                context.forEach(c => {
                    messages.push({
                        role: c.role || "assistant",
                        content: c.message
                    });
                });
            }
 
            // Add user message
            messages.push({
                role: "user",
                content: message
            });
 
            const response = await fetch(this.API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': this.API_KEY,
                    'anthropic-version': '2023-06-01'
                },
                body: JSON.stringify({
                    model: this.MODEL,
                    max_tokens: 1024,
                    messages: messages
                })
            });
 
            if (!response.ok) {
                throw new Error(`API request failed: ${response.statusText}`);
            }
 
            const data = await response.json();
            
            // Process and return response
            return {
                text: data.content[0].text,
                isClinicQuestion: true,
                score: 1.0, 
                analysis: data.analysis || null,
                raw: data // Store raw response for debugging
            };
 
        } catch (error) {
            // Implement exponential backoff for retries
            if (retryCount < 3) {
                const delay = Math.pow(2, retryCount) * 1000; // 1s, 2s, 4s
                this.logDebug(`Retrying API call (${retryCount + 1}/3) after ${delay}ms`);
                await new Promise(resolve => setTimeout(resolve, delay));
                return this.callClaudeAPI(message, systemPrompt, context, retryCount + 1);
            }
            throw error;
        }
    }

    // Cache Management
    cacheResponse(message, response) {
        const key = message.toLowerCase().trim();
        const cacheEntry = {
            response,
            timestamp: Date.now()
        };

        if (this.responseCache.size >= this.MAX_CACHE_SIZE) {
            const oldestKey = Array.from(this.responseCache.keys())[0];
            this.responseCache.delete(oldestKey);
        }

        this.responseCache.set(key, cacheEntry);
        this.backupToLocal();
    }

    getCachedResponse(message) {
        const key = message.toLowerCase().trim();
        const entry = this.responseCache.get(key);
        
        if (entry && (Date.now() - entry.timestamp) < this.CACHE_TTL) {
            return entry.response;
        }
        
        if (entry) {
            this.responseCache.delete(key);
        }
        
        return null;
    }

    manageContext(message, conversationId) {
        if (!conversationId) return null;

        const context = this.contextMemory
            .filter(item => item.conversationId === conversationId)
            .slice(-this.MAX_CONTEXT_LENGTH);

        context.push({
            conversationId,
            message,
            timestamp: Date.now()
        });

        this.contextMemory = this.contextMemory
            .filter(item => 
                item.conversationId === conversationId || 
                (Date.now() - item.timestamp) < this.CACHE_TTL
            )
            .slice(-this.MAX_CONTEXT_LENGTH * 10);

        return context;
    }

    checkRateLimit() {
        const now = Date.now();
        const timeWindow = 60 * 1000;

        if (now - this.requestTimestamp > timeWindow) {
            this.requestCount = 0;
            this.requestTimestamp = now;
        }

        if (this.requestCount >= this.MAX_REQUESTS_PER_MINUTE) {
            return false;
        }

        this.requestCount++;
        return true;
    }

    async processLearning(message, response) {
        try {
            if (response.score >= CONFIG.MIN_SCORE_THRESHOLD) {
                await githubService.processLearning(message, response.text, true);
                this.logDebug('Processed learning:', { message, success: true });
            }
        } catch (error) {
            this.logDebug('Error processing learning:', error);
        }
    }

    async handleAPIError(error, message) {
        this.logDebug('API Error:', error);

        const failedRequest = {
            message,
            timestamp: Date.now(),
            error: error.message
        };

        try {
            await storageManager.saveFailedRequest(failedRequest);
        } catch (storageError) {
            this.logDebug('Error saving failed request:', storageError);
        }
    }

    backupToLocal() {
        try {
            const data = {
                cache: Array.from(this.responseCache.entries()),
                context: this.contextMemory,
                timestamp: Date.now()
            };
            storageManager.saveClaudeData(data);
        } catch (error) {
            this.logDebug('Error backing up data:', error);
        }
    }

    restoreFromBackup() {
        try {
            const data = storageManager.getClaudeData();
            if (data && data.timestamp) {
                if (Date.now() - data.timestamp < this.CACHE_TTL) {
                    this.responseCache = new Map(data.cache);
                    this.contextMemory = data.context || [];
                }
            }
        } catch (error) {
            this.logDebug('Error restoring from backup:', error);
        }
    }

    logDebug(message, data = null) {
        if (this.DEBUG) {
            console.log(`[ClaudeService] ${message}`, data || '');
        }
    }
}

export const claudeService = new ClaudeService();