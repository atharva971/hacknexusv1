/* ========================================
   Smart City Planner - Main Application
   ======================================== */

import { CityModel } from './engine/CityModel.js';
import { Renderer } from './engine/Renderer.js';
import { Metrics } from './engine/Metrics.js';
import { Simulator } from './engine/Simulator.js';
import { AIGenerator } from './ai/AIGenerator.js';
import { ZONE_TYPES, CITY_SIZES, CITY_PRESETS, SCENARIOS } from './utils/constants.js';
import { formatNumber, showToast, debounce } from './utils/helpers.js';
import Chart from 'chart.js/auto';

class SmartCityApp {
    constructor() {
        // Core components
        this.city = new CityModel('medium');
        this.canvas = document.getElementById('city-canvas');
        this.renderer = new Renderer(this.canvas, this.city);
        this.metrics = new Metrics(this.city);
        this.simulator = new Simulator(this.city);
        this.aiGenerator = new AIGenerator();

        // UI State
        this.currentTool = 'select';
        this.isDrawing = false;
        this.drawStart = null;
        this.zoneChart = null;

        // Initialize
        this.initUI();
        this.initCanvas();
        this.initChart();
        this.updateDashboard();

        // Generate initial city
        this.generateInitialCity();

        // Start animation
        this.renderer.startAnimation();
    }

    /**
     * Initialize UI event listeners
     */
    initUI() {
        // Tab navigation
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', () => this.switchTab(btn.dataset.tab));
        });

        // Tool buttons
        document.querySelectorAll('.tool-btn[data-tool]').forEach(btn => {
            btn.addEventListener('click', () => this.selectTool(btn.dataset.tool));
        });

        // Zoom controls
        document.getElementById('btn-zoom-in').addEventListener('click', () => {
            this.renderer.zoomIn();
            this.updateZoomDisplay();
        });

        document.getElementById('btn-zoom-out').addEventListener('click', () => {
            this.renderer.zoomOut();
            this.updateZoomDisplay();
        });

        document.getElementById('btn-reset-view').addEventListener('click', () => {
            this.renderer.resetView();
            this.updateZoomDisplay();
        });

        // AI Generation
        document.getElementById('btn-generate').addEventListener('click', () => this.generateCity());

        // Presets
        document.querySelectorAll('.preset-btn').forEach(btn => {
            btn.addEventListener('click', () => this.applyPreset(btn.dataset.preset));
        });

        // Sliders
        document.getElementById('population-slider').addEventListener('input', (e) => {
            document.getElementById('pop-value').textContent = formatNumber(e.target.value);
        });

        document.getElementById('size-slider').addEventListener('input', (e) => {
            const sizes = ['Small', 'Medium', 'Large'];
            document.getElementById('size-value').textContent = sizes[e.target.value - 1];
        });

        document.getElementById('green-slider').addEventListener('input', (e) => {
            document.getElementById('green-value').textContent = e.target.value + '%';
        });

        // Scenarios
        document.querySelectorAll('.scenario-btn').forEach(btn => {
            btn.addEventListener('click', () => this.applyScenario(btn.dataset.scenario));
        });

        // Time simulation
        document.getElementById('time-slider').addEventListener('input', (e) => {
            document.getElementById('sim-year').textContent = e.target.value;
            this.simulator.setTargetYear(parseInt(e.target.value));
        });

        document.getElementById('btn-play-sim').addEventListener('click', () => this.playSimulation());
        document.getElementById('btn-reset-sim').addEventListener('click', () => this.resetSimulation());

        // Layers
        document.querySelectorAll('.layer-toggle input').forEach(input => {
            input.addEventListener('change', (e) => {
                this.renderer.setLayer(e.target.dataset.layer, e.target.checked);
            });
        });

        // Export
        document.getElementById('btn-export').addEventListener('click', () => this.exportCity());

        // Help
        document.getElementById('btn-help').addEventListener('click', () => this.showHelp());

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));
    }

    /**
     * Initialize canvas interactions
     */
    initCanvas() {
        const container = document.getElementById('canvas-container');

        // Mouse move for hover
        this.canvas.addEventListener('mousemove', debounce((e) => {
            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const grid = this.renderer.screenToGrid(x, y);

            this.renderer.setHover(grid.x, grid.y);
            this.updateCursorPosition(grid.x, grid.y);

            if (this.isDrawing && this.currentTool !== 'select') {
                this.city.setZone(grid.x, grid.y, this.currentTool);
                this.updateDashboard();
            }
        }, 16));

        // Mouse down to start drawing
        this.canvas.addEventListener('mousedown', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const grid = this.renderer.screenToGrid(x, y);

            if (this.currentTool !== 'select') {
                this.isDrawing = true;
                this.drawStart = grid;
                this.city.setZone(grid.x, grid.y, this.currentTool);
                this.updateDashboard();
            }
        });

        // Mouse up to stop drawing
        this.canvas.addEventListener('mouseup', () => {
            if (this.isDrawing) {
                this.isDrawing = false;
                this.city.saveState();
            }
        });

        // Mouse leave
        this.canvas.addEventListener('mouseleave', () => {
            this.renderer.setHover(-1, -1);
            this.isDrawing = false;
        });

        // Mouse wheel for zoom
        this.canvas.addEventListener('wheel', (e) => {
            e.preventDefault();
            if (e.deltaY < 0) {
                this.renderer.zoomIn();
            } else {
                this.renderer.zoomOut();
            }
            this.updateZoomDisplay();
        });
    }

    /**
     * Initialize the zone distribution chart
     */
    initChart() {
        const ctx = document.getElementById('zone-chart');
        if (!ctx) return;

        this.zoneChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: [],
                datasets: [{
                    data: [],
                    backgroundColor: [],
                    borderWidth: 0,
                    hoverOffset: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: '#9ca3af',
                            font: { size: 11 },
                            padding: 8,
                            usePointStyle: true
                        }
                    }
                },
                cutout: '60%'
            }
        });
    }

    /**
     * Switch tab panel
     * @param {string} tabId 
     */
    switchTab(tabId) {
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tabId);
        });

        document.querySelectorAll('.tab-panel').forEach(panel => {
            panel.classList.toggle('active', panel.dataset.panel === tabId);
        });
    }

    /**
     * Select drawing tool
     * @param {string} tool 
     */
    selectTool(tool) {
        this.currentTool = tool;

        document.querySelectorAll('.tool-btn[data-tool]').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tool === tool);
        });

        // Update cursor
        this.canvas.style.cursor = tool === 'select' ? 'default' : 'crosshair';
    }

    /**
     * Generate city from AI prompt
     */
    async generateCity() {
        const prompt = document.getElementById('ai-prompt').value.trim();
        if (!prompt) {
            showToast('Please enter a description for your city', 'warning');
            return;
        }

        this.showLoading(true);

        try {
            // Get parameters
            const params = {
                greenRatio: parseInt(document.getElementById('green-slider').value) / 100
            };

            // Get city size
            const sizeValue = parseInt(document.getElementById('size-slider').value);
            const sizes = ['small', 'medium', 'large'];
            const newSize = sizes[sizeValue - 1];

            // Generate AI layout
            const result = await this.aiGenerator.generate(prompt, params);

            if (result.success) {
                // Create new city with the size
                if (newSize !== this.city.size) {
                    this.city = new CityModel(newSize);
                    this.renderer.setCity(this.city);
                    this.metrics = new Metrics(this.city);
                    this.simulator = new Simulator(this.city);
                }

                // Generate layout
                this.city.generateLayout(result.params);

                // Update UI
                this.updateDashboard();
                this.updateGridInfo();

                showToast('City generated successfully!', 'success');

                // Show analysis
                console.log('AI Analysis:', result.analysis);
                console.log('Suggestions:', result.suggestions);
            } else {
                showToast('Failed to generate city: ' + result.error, 'error');
            }
        } catch (error) {
            console.error('Generation error:', error);
            showToast('An error occurred during generation', 'error');
        }

        this.showLoading(false);
    }

    /**
     * Apply preset city type
     * @param {string} presetId 
     */
    async applyPreset(presetId) {
        const preset = CITY_PRESETS[presetId];
        if (!preset) return;

        document.getElementById('ai-prompt').value = preset.prompt;
        await this.generateCity();
    }

    /**
     * Apply a simulation scenario
     * @param {string} scenarioId 
     */
    applyScenario(scenarioId) {
        const result = this.simulator.applyScenario(scenarioId);

        if (result) {
            this.updateDashboard();

            const scenario = SCENARIOS[scenarioId];
            showToast(`Applied scenario: ${scenario.name}`, 'success');
        }
    }

    /**
     * Play time simulation
     */
    async playSimulation() {
        const targetYear = parseInt(document.getElementById('time-slider').value);

        await this.simulator.simulateTo(targetYear, (year, stats) => {
            document.getElementById('sim-year').textContent = year;
            this.updateDashboard();
        });
    }

    /**
     * Reset simulation to baseline
     */
    resetSimulation() {
        this.simulator.reset();
        document.getElementById('time-slider').value = 2025;
        document.getElementById('sim-year').textContent = '2025';
        this.updateDashboard();
        showToast('Simulation reset to baseline', 'info');
    }

    /**
     * Update dashboard metrics
     */
    updateDashboard() {
        const metrics = this.metrics.getAll();

        // Update sustainability score
        document.getElementById('sustainability-score').textContent = metrics.sustainabilityScore;

        // Update score ring
        const scoreRing = document.getElementById('score-ring');
        if (scoreRing) {
            const circumference = 2 * Math.PI * 45;
            const offset = circumference - (metrics.sustainabilityScore / 100) * circumference;
            scoreRing.style.strokeDashoffset = offset;

            // Update color based on score
            if (metrics.sustainabilityScore >= 75) {
                scoreRing.style.stroke = '#22c55e';
            } else if (metrics.sustainabilityScore >= 50) {
                scoreRing.style.stroke = '#f59e0b';
            } else {
                scoreRing.style.stroke = '#ef4444';
            }
        }

        // Update metric cards
        document.getElementById('carbon-footprint').textContent = metrics.carbonFootprint.label;
        document.getElementById('energy-efficiency').textContent = metrics.energyEfficiency.label;
        document.getElementById('green-coverage').textContent = metrics.greenCoverage.label;
        document.getElementById('transit-score').textContent = metrics.transitScore.label;
        document.getElementById('walkability').textContent = metrics.walkability.label;
        document.getElementById('air-quality').textContent = metrics.airQuality.label;

        // Update chart
        if (this.zoneChart) {
            const dist = metrics.zoneDistribution;
            this.zoneChart.data.labels = dist.labels;
            this.zoneChart.data.datasets[0].data = dist.data;
            this.zoneChart.data.datasets[0].backgroundColor = dist.colors;
            this.zoneChart.update('none');
        }
    }

    /**
     * Update cursor position display
     */
    updateCursorPosition(x, y) {
        const posElement = document.getElementById('cursor-pos');
        if (x >= 0 && x < this.city.gridSize && y >= 0 && y < this.city.gridSize) {
            const zone = this.city.getZone(x, y);
            const zoneName = ZONE_TYPES[zone.type]?.name || 'Empty';
            posElement.textContent = `(${x}, ${y}) - ${zoneName}`;
        } else {
            posElement.textContent = '-';
        }
    }

    /**
     * Update zoom level display
     */
    updateZoomDisplay() {
        document.getElementById('zoom-level').textContent = Math.round(this.renderer.scale * 100) + '%';
    }

    /**
     * Update grid info display
     */
    updateGridInfo() {
        document.getElementById('grid-size').textContent = `${this.city.gridSize} × ${this.city.gridSize}`;
    }

    /**
     * Generate initial demo city
     */
    generateInitialCity() {
        this.city.generateLayout({
            residentialRatio: 0.3,
            commercialRatio: 0.15,
            industrialRatio: 0.08,
            greenRatio: 0.28,
            transitRatio: 0.1,
            roadRatio: 0.09
        });

        this.updateDashboard();
        this.updateGridInfo();
    }

    /**
     * Export city data
     */
    exportCity() {
        const data = this.city.export();
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = `smart-city-${this.city.id}.json`;
        a.click();

        URL.revokeObjectURL(url);
        showToast('City exported successfully!', 'success');
    }

    /**
     * Show/hide loading overlay
     * @param {boolean} show 
     */
    showLoading(show) {
        document.getElementById('loading-overlay').classList.toggle('active', show);
    }

    /**
     * Show help dialog
     */
    showHelp() {
        showToast('Keyboard shortcuts: Z=Undo, Y=Redo, 1-7=Zone tools, Esc=Select', 'info', 5000);
    }

    /**
     * Handle keyboard shortcuts
     * @param {KeyboardEvent} e 
     */
    handleKeyboard(e) {
        // Don't handle if typing in input
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

        switch (e.key.toLowerCase()) {
            case 'z':
                if (e.ctrlKey || e.metaKey) {
                    e.preventDefault();
                    this.city.undo();
                    this.updateDashboard();
                }
                break;
            case 'y':
                if (e.ctrlKey || e.metaKey) {
                    e.preventDefault();
                    this.city.redo();
                    this.updateDashboard();
                }
                break;
            case 'escape':
                this.selectTool('select');
                break;
            case '1':
                this.selectTool('select');
                break;
            case '2':
                this.selectTool('residential');
                break;
            case '3':
                this.selectTool('commercial');
                break;
            case '4':
                this.selectTool('industrial');
                break;
            case '5':
                this.selectTool('green');
                break;
            case '6':
                this.selectTool('transit');
                break;
            case '7':
                this.selectTool('road');
                break;
        }
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.app = new SmartCityApp();
});
