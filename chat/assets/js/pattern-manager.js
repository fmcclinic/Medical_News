// assets/js/pattern-manager.js

import { githubService } from '../../services/github.service.js';
import { ChartManager } from './charts.js';

class PatternManager {
    constructor() {
        // Initialize properties
        this.patterns = new Map();
        this.currentPattern = null;
        this.chartManager = new ChartManager();
        this.debounceTimeout = null;

        // Bind methods to preserve this context
        this.handleSearch = this.handleSearch.bind(this);
        this.handleScoreFilter = this.handleScoreFilter.bind(this);
        this.handleNavigation = this.handleNavigation.bind(this);
        this.handlePatternSubmit = this.handlePatternSubmit.bind(this);
        this.handleDelete = this.handleDelete.bind(this);

        // Initialize the manager
        this.init();
    }

    async init() {
        try {
            // Add event listeners
            this.addEventListeners();
            
            // Initialize services
            await githubService.init();
            
            // Load initial data
            await this.loadPatterns();
            
            // Show initial view
            this.showSection('dashboard');
            
            // Update sync status
            this.updateSyncStatus();
            
            console.log('Pattern Manager initialized successfully');
        } catch (error) {
            console.error('Error initializing Pattern Manager:', error);
            this.showNotification('Error initializing application', 'error');
        }
    }

    addEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', this.handleNavigation);
        });

        // Search and filters
        document.getElementById('searchPattern').addEventListener('input', this.handleSearch);
        document.getElementById('scoreFilter').addEventListener('change', this.handleScoreFilter);
        
        // Pattern management
        document.getElementById('addPattern').addEventListener('click', () => this.showPatternModal());
        document.getElementById('patternForm').addEventListener('submit', this.handlePatternSubmit);
        document.getElementById('syncButton').addEventListener('click', () => this.syncPatterns());
        
        // Modals
        document.getElementById('cancelPattern').addEventListener('click', () => this.hidePatternModal());
        document.getElementById('cancelDelete').addEventListener('click', () => this.hideDeleteModal());
        document.getElementById('confirmDelete').addEventListener('click', this.handleDelete);
    }

    async loadPatterns() {
        try {
            const patterns = await githubService.getAllPatterns();
            this.patterns = new Map(patterns);
            this.updatePatternsTable();
            this.updateStats();
            this.updateCharts();
        } catch (error) {
            console.error('Error loading patterns:', error);
            this.showNotification('Error loading patterns', 'error');
        }
    }

    updatePatternsTable(filteredPatterns = this.patterns) {
        const tbody = document.getElementById('patternsTable');
        tbody.innerHTML = '';

        filteredPatterns.forEach((data, pattern) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td class="td-cell">
                    <div class="text-sm text-gray-900">${pattern}</div>
                </td>
                <td class="td-cell">
                    <span class="score-badge ${this.getScoreClass(data.score)}">
                        ${data.score.toFixed(1)}
                    </span>
                </td>
                <td class="td-cell">
                    <div class="text-sm text-gray-900">${data.responses.length}</div>
                </td>
                <td class="td-cell">
                    <div class="text-sm text-gray-500">
                        ${new Date(data.updatedAt).toLocaleString('vi-VN')}
                    </div>
                </td>
                <td class="td-cell">
                    <div class="flex items-center gap-2">
                        <button class="btn btn-icon" onclick="patternManager.editPattern('${pattern}')">
                            <span class="lucide-edit h-4 w-4"></span>
                        </button>
                        <button class="btn btn-icon text-red-600" onclick="patternManager.showDeleteModal('${pattern}')">
                            <span class="lucide-trash h-4 w-4"></span>
                        </button>
                    </div>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    updateStats() {
        let totalPatterns = 0;
        let highScore = 0;
        let mediumScore = 0;
        let lowScore = 0;

        this.patterns.forEach(data => {
            totalPatterns++;
            if (data.score > 5) highScore++;
            else if (data.score > 2) mediumScore++;
            else lowScore++;
        });

        const statsOverview = document.getElementById('statsOverview');
        statsOverview.innerHTML = `
            <div class="flex justify-between items-center">
                <span class="text-sm text-gray-500">Total Patterns</span>
                <span class="text-sm font-medium text-gray-900">${totalPatterns}</span>
            </div>
            <div class="flex justify-between items-center">
                <span class="text-sm text-gray-500">High Score</span>
                <span class="text-sm font-medium text-green-600">${highScore}</span>
            </div>
            <div class="flex justify-between items-center">
                <span class="text-sm text-gray-500">Medium Score</span>
                <span class="text-sm font-medium text-yellow-600">${mediumScore}</span>
            </div>
            <div class="flex justify-between items-center">
                <span class="text-sm text-gray-500">Low Score</span>
                <span class="text-sm font-medium text-red-600">${lowScore}</span>
            </div>
        `;
    }

    updateCharts() {
        // Score distribution data
        const scoreData = [
            { name: 'High Score', value: 0 },
            { name: 'Medium Score', value: 0 },
            { name: 'Low Score', value: 0 }
        ];

        this.patterns.forEach(data => {
            if (data.score > 5) scoreData[0].value++;
            else if (data.score > 2) scoreData[1].value++;
            else scoreData[2].value++;
        });

        this.chartManager.updateScoreChart(scoreData);

        // Generate feedback trends data
        const feedbackData = this.chartManager.generateFeedbackData(this.patterns);
        this.chartManager.updateFeedbackChart(feedbackData);
    }

    async syncPatterns() {
        try {
            const syncButton = document.getElementById('syncButton');
            syncButton.disabled = true;
            syncButton.innerHTML = '<span class="lucide-loader animate-spin h-4 w-4"></span> Syncing...';

            await githubService.syncPatterns();
            await this.loadPatterns();

            this.showNotification('Patterns synced successfully');
            this.updateSyncStatus();
        } catch (error) {
            console.error('Error syncing patterns:', error);
            this.showNotification('Error syncing patterns', 'error');
        } finally {
            const syncButton = document.getElementById('syncButton');
            syncButton.disabled = false;
            syncButton.innerHTML = '<span class="lucide-refresh-cw h-4 w-4"></span> Sync Now';
        }
    }

    handleSearch(event) {
        clearTimeout(this.debounceTimeout);
        this.debounceTimeout = setTimeout(() => {
            const searchTerm = event.target.value.toLowerCase();
            const scoreFilter = document.getElementById('scoreFilter').value;
            this.filterPatterns(searchTerm, scoreFilter);
        }, 300);
    }

    handleScoreFilter(event) {
        const searchTerm = document.getElementById('searchPattern').value.toLowerCase();
        this.filterPatterns(searchTerm, event.target.value);
    }

    filterPatterns(searchTerm = '', scoreFilter = '') {
        const filteredPatterns = new Map();

        this.patterns.forEach((data, pattern) => {
            const matchesSearch = pattern.toLowerCase().includes(searchTerm);
            const matchesScore = !scoreFilter ||
                (scoreFilter === 'high' && data.score > 5) ||
                (scoreFilter === 'medium' && data.score > 2 && data.score <= 5) ||
                (scoreFilter === 'low' && data.score <= 2);

            if (matchesSearch && matchesScore) {
                filteredPatterns.set(pattern, data);
            }
        });

        this.updatePatternsTable(filteredPatterns);
    }

    showPatternModal(pattern = null) {
        this.currentPattern = pattern;
        const modal = document.getElementById('patternModal');
        const title = document.getElementById('modalTitle');
        const patternInput = document.getElementById('patternInput');
        const responsesInput = document.getElementById('responsesInput');

        title.textContent = pattern ? 'Edit Pattern' : 'Add Pattern';

        if (pattern) {
            const data = this.patterns.get(pattern);
            patternInput.value = pattern;
            responsesInput.value = data.responses.join('\n');
        } else {
            patternInput.value = '';
            responsesInput.value = '';
        }

        modal.classList.remove('hidden');
    }

    hidePatternModal() {
        document.getElementById('patternModal').classList.add('hidden');
        this.currentPattern = null;
    }

    async handlePatternSubmit(event) {
        event.preventDefault();
        const pattern = document.getElementById('patternInput').value;
        const responses = document.getElementById('responsesInput').value
            .split('\n')
            .filter(r => r.trim());

        try {
            if (this.currentPattern) {
                await githubService.updatePattern(this.currentPattern, {
                    pattern,
                    responses
                });
                this.showNotification('Pattern updated successfully');
            } else {
                await githubService.createPattern(pattern, responses[0]);
                if (responses.length > 1) {
                    for (let i = 1; i < responses.length; i++) {
                        await githubService.addResponse(pattern, responses[i]);
                    }
                }
                this.showNotification('Pattern created successfully');
            }

            this.hidePatternModal();
            await this.loadPatterns();
        } catch (error) {
            console.error('Error saving pattern:', error);
            this.showNotification('Error saving pattern', 'error');
        }
    }

    showDeleteModal(pattern) {
        this.currentPattern = pattern;
        document.getElementById('deleteModal').classList.remove('hidden');
    }

    hideDeleteModal() {
        document.getElementById('deleteModal').classList.add('hidden');
        this.currentPattern = null;
    }

    async handleDelete() {
        if (!this.currentPattern) return;

        try {
            await githubService.deletePattern(this.currentPattern);
            this.hideDeleteModal();
            await this.loadPatterns();
            this.showNotification('Pattern deleted successfully');
        } catch (error) {
            console.error('Error deleting pattern:', error);
            this.showNotification('Error deleting pattern', 'error');
        }
    }

    getScoreClass(score) {
        if (score > 5) return 'score-high';
        if (score > 2) return 'score-medium';
        return 'score-low';
    }

    updateSyncStatus() {
        const status = document.getElementById('syncStatus');
        const lastSync = githubService.lastSyncTime;
        status.textContent = lastSync
            ? `Last synced: ${new Date(lastSync).toLocaleString('vi-VN')}`
            : 'Not synced';
    }

    showNotification(message, type = 'success') {
        const notification = document.getElementById('notification');
        const messageEl = document.getElementById('notificationMessage');
        
        notification.className = `toast ${type}`;
        messageEl.textContent = message;
        notification.classList.remove('hidden');

        setTimeout(() => {
            notification.classList.add('hidden');
        }, 3000);
    }

    handleNavigation(event) {
        event.preventDefault();
        const section = event.target.dataset.section;
        this.showSection(section);
    }

    showSection(section) {
        // Update active navigation item
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.toggle('active', item.dataset.section === section);
        });

        // Show/hide relevant content sections
        const sections = {
            dashboard: ['statsOverview', 'charts'],
            patterns: ['patternsTable'],
            statistics: ['charts'],
            settings: ['settingsPanel']
        };

        Object.entries(sections).forEach(([key, elements]) => {
            elements.forEach(id => {
                const element = document.getElementById(id);
                if (element) {
                    element.classList.toggle('hidden', key !== section);
                }
            });
        });
    }
}

// Create and export singleton instance
window.patternManager = new PatternManager();