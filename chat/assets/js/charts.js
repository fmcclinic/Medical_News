// assets/js/charts.js

export class ChartManager {
    constructor() {
        // Verify dependencies
        if (typeof React === 'undefined') {
            throw new Error('React is not loaded');
        }
        if (typeof ReactDOM === 'undefined') {
            throw new Error('ReactDOM is not loaded');
        }
        if (typeof Recharts === 'undefined') {
            throw new Error('Recharts is not loaded');
        }

        // Destructure Recharts components
        const { 
            ResponsiveContainer, BarChart, Bar, LineChart, Line,
            XAxis, YAxis, CartesianGrid, Tooltip, Legend 
        } = Recharts;

        // Store components references
        this.components = {
            ResponsiveContainer, BarChart, Bar, LineChart, Line,
            XAxis, YAxis, CartesianGrid, Tooltip, Legend
        };

        // Chart references
        this.charts = {
            score: null,
            feedback: null
        };

        // Theme configuration
        this.theme = {
            colors: {
                high: '#059669',    // Green
                medium: '#D97706',  // Yellow
                low: '#DC2626',     // Red
                background: '#F9FAFB',
                grid: '#E5E7EB',
                text: '#374151'
            },
            fonts: {
                size: {
                    small: 12,
                    medium: 14,
                    large: 16
                }
            }
        };

        // Bind methods
        this.handleResize = this.debounce(this.handleResize.bind(this), 250);
        
        // Initialize charts
        this.initializeCharts();
        
        // Add event listeners
        window.addEventListener('resize', this.handleResize);
    }

    initializeCharts() {
        try {
            this.renderScoreChart();
            this.renderFeedbackChart();
            console.log('Charts initialized successfully');
        } catch (error) {
            console.error('Failed to initialize charts:', error);
            throw error;
        }
    }

    renderScoreChart(data = []) {
        const container = document.getElementById('scoreChart');
        if (!container) {
            console.error('Score chart container not found');
            return;
        }

        const { 
            ResponsiveContainer, BarChart, Bar, XAxis, YAxis,
            CartesianGrid, Tooltip, Legend 
        } = this.components;

        try {
            const chart = React.createElement(ResponsiveContainer, 
                { width: '100%', height: 300 },
                React.createElement(BarChart, 
                    { 
                        data: data.length ? data : this.getInitialScoreData(),
                        margin: { top: 20, right: 30, left: 20, bottom: 30 }
                    },
                    React.createElement(CartesianGrid, { 
                        strokeDasharray: '3 3',
                        stroke: this.theme.colors.grid 
                    }),
                    React.createElement(XAxis, { 
                        dataKey: 'name',
                        tick: { 
                            fill: this.theme.colors.text, 
                            fontSize: this.theme.fonts.size.small 
                        }
                    }),
                    React.createElement(YAxis, {
                        tick: { 
                            fill: this.theme.colors.text, 
                            fontSize: this.theme.fonts.size.small 
                        }
                    }),
                    React.createElement(Tooltip),
                    React.createElement(Legend),
                    React.createElement(Bar, {
                        dataKey: 'value',
                        name: 'Patterns',
                        fill: this.theme.colors.medium,
                        radius: [4, 4, 0, 0]
                    })
                )
            );

            ReactDOM.render(chart, container);
            this.charts.score = container;

        } catch (error) {
            console.error('Error rendering score chart:', error);
            this.handleChartError(container);
        }
    }

    renderFeedbackChart(data = []) {
        const container = document.getElementById('feedbackChart');
        if (!container) {
            console.error('Feedback chart container not found');
            return;
        }

        const { 
            ResponsiveContainer, LineChart, Line, XAxis, YAxis,
            CartesianGrid, Tooltip, Legend 
        } = this.components;

        try {
            const chart = React.createElement(ResponsiveContainer,
                { width: '100%', height: 300 },
                React.createElement(LineChart,
                    { 
                        data: data.length ? data : this.getInitialFeedbackData(),
                        margin: { top: 20, right: 30, left: 20, bottom: 30 }
                    },
                    React.createElement(CartesianGrid, { 
                        strokeDasharray: '3 3',
                        stroke: this.theme.colors.grid 
                    }),
                    React.createElement(XAxis, { 
                        dataKey: 'date',
                        tick: { 
                            fill: this.theme.colors.text, 
                            fontSize: this.theme.fonts.size.small 
                        }
                    }),
                    React.createElement(YAxis, {
                        tick: { 
                            fill: this.theme.colors.text, 
                            fontSize: this.theme.fonts.size.small 
                        }
                    }),
                    React.createElement(Tooltip),
                    React.createElement(Legend),
                    React.createElement(Line, {
                        type: 'monotone',
                        dataKey: 'positive',
                        stroke: this.theme.colors.high,
                        strokeWidth: 2,
                        dot: { fill: 'white', strokeWidth: 2 },
                        name: 'Positive Feedback'
                    }),
                    React.createElement(Line, {
                        type: 'monotone',
                        dataKey: 'negative',
                        stroke: this.theme.colors.low,
                        strokeWidth: 2,
                        dot: { fill: 'white', strokeWidth: 2 },
                        name: 'Negative Feedback'
                    })
                )
            );

            ReactDOM.render(chart, container);
            this.charts.feedback = container;

        } catch (error) {
            console.error('Error rendering feedback chart:', error);
            this.handleChartError(container);
        }
    }

    updateCharts(data) {
        if (!data) {
            console.error('No data provided for chart update');
            return;
        }

        try {
            if (data.scores) {
                this.renderScoreChart([
                    { name: 'High Score', value: data.scores.high || 0, fill: this.theme.colors.high },
                    { name: 'Medium Score', value: data.scores.medium || 0, fill: this.theme.colors.medium },
                    { name: 'Low Score', value: data.scores.low || 0, fill: this.theme.colors.low }
                ]);
            }

            if (data.feedback) {
                this.renderFeedbackChart(data.feedback.map(item => ({
                    date: new Date(item.date).toLocaleDateString('vi-VN'),
                    positive: item.positive || 0,
                    negative: item.negative || 0
                })));
            }
        } catch (error) {
            console.error('Error updating charts:', error);
            throw error;
        }
    }

    getInitialScoreData() {
        return [
            { name: 'High Score', value: 0, fill: this.theme.colors.high },
            { name: 'Medium Score', value: 0, fill: this.theme.colors.medium },
            { name: 'Low Score', value: 0, fill: this.theme.colors.low }
        ];
    }

    getInitialFeedbackData() {
        const data = [];
        const now = new Date();
        
        for (let i = 6; i >= 0; i--) {
            const date = new Date(now);
            date.setDate(date.getDate() - i);
            data.push({
                date: date.toLocaleDateString('vi-VN'),
                positive: 0,
                negative: 0
            });
        }
        
        return data;
    }

    handleChartError(container) {
        if (!container) return;

        const errorMessage = document.createElement('div');
        errorMessage.className = 'p-4 text-center text-red-500';
        errorMessage.innerHTML = `
            <i class="lucide-alert-triangle text-xl mb-2"></i>
            <p>Failed to load chart. Please try refreshing the page.</p>
        `;
        
        container.innerHTML = '';
        container.appendChild(errorMessage);
    }

    generateFeedbackData(patterns) {
        try {
            const data = [];
            const now = new Date();

            for (let i = 6; i >= 0; i--) {
                const date = new Date(now);
                date.setDate(date.getDate() - i);
                
                const dayData = {
                    date: date.toISOString().split('T')[0],
                    positive: 0,
                    negative: 0
                };

                patterns.forEach(pattern => {
                    if (pattern.feedback) {
                        pattern.feedback.forEach(f => {
                            if (new Date(f.date).toISOString().split('T')[0] === dayData.date) {
                                f.isPositive ? dayData.positive++ : dayData.negative++;
                            }
                        });
                    }
                });

                data.push(dayData);
            }

            return data;
        } catch (error) {
            console.error('Error generating feedback data:', error);
            return this.getInitialFeedbackData();
        }
    }

    handleResize() {
        this.charts.score && this.renderScoreChart();
        this.charts.feedback && this.renderFeedbackChart();
    }

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    destroy() {
        try {
            // Remove event listeners
            window.removeEventListener('resize', this.handleResize);

            // Cleanup charts
            Object.entries(this.charts).forEach(([key, container]) => {
                if (container) {
                    ReactDOM.unmountComponentAtNode(container);
                    this.charts[key] = null;
                }
            });

            console.log('Charts cleaned up successfully');
        } catch (error) {
            console.error('Error destroying charts:', error);
        }
    }
}