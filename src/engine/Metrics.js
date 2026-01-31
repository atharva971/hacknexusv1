/* ========================================
   Smart City Planner - Metrics Calculator
   ======================================== */

import { ZONE_TYPES, METRIC_THRESHOLDS } from '../utils/constants.js';
import { clamp, mapRange } from '../utils/helpers.js';

export class Metrics {
    constructor(cityModel) {
        this.city = cityModel;
    }

    /**
     * Get all metrics as an object
     * @returns {Object}
     */
    getAll() {
        return {
            sustainabilityScore: this.getSustainabilityScore(),
            carbonFootprint: this.getCarbonFootprint(),
            energyEfficiency: this.getEnergyEfficiency(),
            greenCoverage: this.getGreenCoverage(),
            transitScore: this.getTransitScore(),
            walkability: this.getWalkability(),
            airQuality: this.getAirQuality(),
            population: this.getPopulation(),
            zoneDistribution: this.getZoneDistribution()
        };
    }

    /**
     * Calculate overall sustainability score (0-100)
     */
    getSustainabilityScore() {
        return this.city.stats.sustainabilityScore;
    }

    /**
     * Get sustainability rating
     * @returns {'poor' | 'fair' | 'good' | 'excellent'}
     */
    getSustainabilityRating() {
        const score = this.getSustainabilityScore();
        const { poor, fair, good, excellent } = METRIC_THRESHOLDS.sustainability;

        if (score >= excellent) return 'excellent';
        if (score >= good) return 'good';
        if (score >= fair) return 'fair';
        return 'poor';
    }

    /**
     * Get carbon footprint (negative = carbon negative, positive = carbon positive)
     */
    getCarbonFootprint() {
        const footprint = this.city.stats.carbonFootprint;
        if (footprint <= -20) return { value: footprint, label: `${footprint}%`, status: 'excellent' };
        if (footprint <= 0) return { value: footprint, label: `${footprint}%`, status: 'good' };
        if (footprint <= 20) return { value: footprint, label: `+${footprint}%`, status: 'fair' };
        return { value: footprint, label: `+${footprint}%`, status: 'poor' };
    }

    /**
     * Get energy efficiency percentage
     */
    getEnergyEfficiency() {
        return {
            value: this.city.stats.energyEfficiency,
            label: `${this.city.stats.energyEfficiency}%`
        };
    }

    /**
     * Get green coverage percentage
     */
    getGreenCoverage() {
        return {
            value: this.city.stats.greenCoverage,
            label: `${this.city.stats.greenCoverage}%`
        };
    }

    /**
     * Get transit score (0-100)
     */
    getTransitScore() {
        return {
            value: this.city.stats.transitScore,
            label: this.city.stats.transitScore.toString()
        };
    }

    /**
     * Get walkability score (0-100)
     */
    getWalkability() {
        return {
            value: this.city.stats.walkability,
            label: this.city.stats.walkability.toString()
        };
    }

    /**
     * Get air quality index
     */
    getAirQuality() {
        const aq = this.city.stats.airQuality;
        let label, status;

        if (aq >= 80) {
            label = 'Excellent';
            status = 'excellent';
        } else if (aq >= 60) {
            label = 'Good';
            status = 'good';
        } else if (aq >= 40) {
            label = 'Moderate';
            status = 'fair';
        } else {
            label = 'Poor';
            status = 'poor';
        }

        return { value: aq, label, status };
    }

    /**
     * Get total population
     */
    getPopulation() {
        return this.city.stats.population;
    }

    /**
     * Get zone distribution for charts
     */
    getZoneDistribution() {
        const total = Object.values(this.city.distribution).reduce((a, b) => a + b, 0) - this.city.distribution.empty;

        if (total === 0) {
            return {
                labels: [],
                data: [],
                colors: []
            };
        }

        const zones = ['residential', 'commercial', 'industrial', 'green', 'transit', 'road'];
        const labels = [];
        const data = [];
        const colors = [];

        zones.forEach(zone => {
            const count = this.city.distribution[zone];
            if (count > 0) {
                labels.push(ZONE_TYPES[zone].name);
                data.push(Math.round((count / total) * 100));
                colors.push(ZONE_TYPES[zone].color);
            }
        });

        return { labels, data, colors };
    }

    /**
     * Compare metrics between two city states
     * @param {Object} before 
     * @param {Object} after 
     * @returns {Object}
     */
    static compare(before, after) {
        return {
            sustainabilityChange: after.sustainabilityScore - before.sustainabilityScore,
            carbonChange: after.carbonFootprint - before.carbonFootprint,
            greenChange: after.greenCoverage - before.greenCoverage,
            transitChange: after.transitScore - before.transitScore,
            walkabilityChange: after.walkability - before.walkability,
            populationChange: after.population - before.population
        };
    }

    /**
     * Get recommendations based on current metrics
     * @returns {Array<{title: string, description: string, impact: string}>}
     */
    getRecommendations() {
        const recommendations = [];

        if (this.city.stats.greenCoverage < 25) {
            recommendations.push({
                title: 'Increase Green Spaces',
                description: 'Add more parks and green areas to improve air quality and sustainability.',
                impact: '+10 Sustainability, +15 Air Quality'
            });
        }

        if (this.city.stats.transitScore < 60) {
            recommendations.push({
                title: 'Expand Public Transit',
                description: 'Add transit hubs and metro lines to reduce car dependency.',
                impact: '+12 Transit Score, -8% Carbon'
            });
        }

        if (this.city.stats.walkability < 50) {
            recommendations.push({
                title: 'Improve Walkability',
                description: 'Create pedestrian zones and mixed-use neighborhoods.',
                impact: '+15 Walkability, +8 Sustainability'
            });
        }

        if (this.city.distribution.industrial > this.city.distribution.green) {
            recommendations.push({
                title: 'Balance Industry & Nature',
                description: 'Convert some industrial zones to green spaces.',
                impact: '-15% Carbon, +12 Air Quality'
            });
        }

        return recommendations;
    }
}
