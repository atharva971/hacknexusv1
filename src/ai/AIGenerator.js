/* ========================================
   Smart City Planner - AI City Generator
   ======================================== */

import { CITY_PRESETS, ZONE_TYPES } from '../utils/constants.js';
import { sleep } from '../utils/helpers.js';

export class AIGenerator {
    constructor(apiKey = null) {
        this.apiKey = apiKey;
        this.isGenerating = false;
    }

    /**
     * Set API key for Gemini
     * @param {string} key 
     */
    setApiKey(key) {
        this.apiKey = key;
    }

    /**
     * Generate city layout based on prompt
     * For demo purposes, this uses preset-based generation
     * In production, this would call Gemini API
     * @param {string} prompt 
     * @param {Object} params 
     * @returns {Promise<Object>}
     */
    async generate(prompt, params = {}) {
        this.isGenerating = true;

        try {
            // Simulate API call delay for demo
            await sleep(1500);

            // Analyze prompt to determine city type
            const cityType = this.analyzePrompt(prompt);

            // Get preset ratios
            const preset = CITY_PRESETS[cityType] || CITY_PRESETS.mixed;

            // Merge with custom params
            let layoutParams = {
                residentialRatio: preset.residentialRatio || 0.35,
                commercialRatio: preset.commercialRatio || 0.15,
                industrialRatio: preset.industrialRatio || 0.1,
                greenRatio: preset.greenRatio || 0.25,
                transitRatio: preset.transitRatio || 0.1,
                roadRatio: 0.05,
                ...params
            };

            // Adjust based on prompt keywords
            layoutParams = this.adjustFromPrompt(prompt, layoutParams);

            this.isGenerating = false;

            return {
                success: true,
                params: layoutParams,
                analysis: this.generateAnalysis(prompt, cityType, layoutParams),
                suggestions: this.generateSuggestions(cityType)
            };
        } catch (error) {
            this.isGenerating = false;
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Analyze prompt to determine city type
     * @param {string} prompt 
     * @returns {string}
     */
    analyzePrompt(prompt) {
        const lower = prompt.toLowerCase();

        if (lower.includes('eco') || lower.includes('sustainable') || lower.includes('green')) {
            return 'eco';
        }
        if (lower.includes('tech') || lower.includes('innovation') || lower.includes('smart')) {
            return 'tech';
        }
        if (lower.includes('transit') || lower.includes('metro') || lower.includes('public transport')) {
            return 'transit';
        }
        if (lower.includes('mixed') || lower.includes('balanced') || lower.includes('walkable')) {
            return 'mixed';
        }

        return 'mixed';
    }

    /**
     * Adjust layout params based on prompt keywords
     * @param {string} prompt 
     * @param {Object} params 
     * @returns {Object}
     */
    adjustFromPrompt(prompt, params) {
        const lower = prompt.toLowerCase();
        const adjusted = { ...params };

        // Green space adjustments
        if (lower.includes('park') || lower.includes('garden')) {
            adjusted.greenRatio = Math.min(0.5, adjusted.greenRatio + 0.1);
        }
        if (lower.includes('urban farm') || lower.includes('agriculture')) {
            adjusted.greenRatio = Math.min(0.5, adjusted.greenRatio + 0.15);
        }

        // Transit adjustments
        if (lower.includes('car-free') || lower.includes('pedestrian')) {
            adjusted.transitRatio = Math.min(0.25, adjusted.transitRatio + 0.1);
            adjusted.roadRatio = Math.max(0.02, adjusted.roadRatio - 0.02);
        }
        if (lower.includes('metro') || lower.includes('subway')) {
            adjusted.transitRatio = Math.min(0.25, adjusted.transitRatio + 0.05);
        }

        // Industrial adjustments
        if (lower.includes('clean') || lower.includes('no pollution')) {
            adjusted.industrialRatio = Math.max(0, adjusted.industrialRatio - 0.05);
            adjusted.greenRatio = Math.min(0.5, adjusted.greenRatio + 0.05);
        }
        if (lower.includes('manufacturing') || lower.includes('industry')) {
            adjusted.industrialRatio = Math.min(0.2, adjusted.industrialRatio + 0.05);
        }

        // Commercial adjustments
        if (lower.includes('business') || lower.includes('downtown')) {
            adjusted.commercialRatio = Math.min(0.3, adjusted.commercialRatio + 0.1);
        }

        // Population-based adjustments
        const popMatch = lower.match(/(\d+),?(\d*)\s*(million|k|thousand)?/);
        if (popMatch) {
            let pop = parseInt(popMatch[1] + (popMatch[2] || ''));
            if (popMatch[3] === 'million') pop *= 1000000;
            if (popMatch[3] === 'k' || popMatch[3] === 'thousand') pop *= 1000;

            // Higher population = more residential and transit
            if (pop > 1000000) {
                adjusted.residentialRatio = Math.min(0.45, adjusted.residentialRatio + 0.1);
                adjusted.transitRatio = Math.min(0.2, adjusted.transitRatio + 0.05);
            }
        }

        // Normalize ratios to sum to ~1
        const total = adjusted.residentialRatio + adjusted.commercialRatio +
            adjusted.industrialRatio + adjusted.greenRatio +
            adjusted.transitRatio + adjusted.roadRatio;

        if (total > 0.95) {
            const factor = 0.95 / total;
            adjusted.residentialRatio *= factor;
            adjusted.commercialRatio *= factor;
            adjusted.industrialRatio *= factor;
            adjusted.greenRatio *= factor;
            adjusted.transitRatio *= factor;
            adjusted.roadRatio *= factor;
        }

        return adjusted;
    }

    /**
     * Generate analysis text for the city
     * @param {string} prompt 
     * @param {string} cityType 
     * @param {Object} params 
     * @returns {string}
     */
    generateAnalysis(prompt, cityType, params) {
        const typeNames = {
            eco: 'Eco-Friendly City',
            tech: 'Smart Tech Hub',
            transit: 'Transit-Oriented City',
            mixed: 'Mixed-Use Urban Center'
        };

        const greenPct = Math.round(params.greenRatio * 100);
        const transitPct = Math.round(params.transitRatio * 100);
        const resPct = Math.round(params.residentialRatio * 100);

        return `Generated a ${typeNames[cityType]} with ${greenPct}% green spaces, ${transitPct}% transit infrastructure, and ${resPct}% residential areas. The layout optimizes for sustainability while meeting urban development needs.`;
    }

    /**
     * Generate suggestions for the city type
     * @param {string} cityType 
     * @returns {Array<string>}
     */
    generateSuggestions(cityType) {
        const suggestions = {
            eco: [
                'Add solar panel installations to commercial districts',
                'Create wildlife corridors between green spaces',
                'Implement rainwater harvesting systems'
            ],
            tech: [
                'Deploy smart traffic management systems',
                'Install IoT sensors for city monitoring',
                'Create innovation zones near universities'
            ],
            transit: [
                'Add bike-sharing stations at transit hubs',
                'Create park-and-ride facilities at city edge',
                'Implement congestion pricing in the core'
            ],
            mixed: [
                'Develop neighborhood centers with local services',
                'Create connected pedestrian pathways',
                'Add community gardens in residential areas'
            ]
        };

        return suggestions[cityType] || suggestions.mixed;
    }

    /**
     * Generate from a preset
     * @param {string} presetId 
     * @returns {Promise<Object>}
     */
    async generateFromPreset(presetId) {
        const preset = CITY_PRESETS[presetId];
        if (!preset) {
            return { success: false, error: 'Unknown preset' };
        }

        return this.generate(preset.prompt, preset);
    }
}
