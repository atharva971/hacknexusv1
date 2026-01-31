/* ========================================
   Smart City Planner - Simulation Engine
   ======================================== */

import { SCENARIOS } from '../utils/constants.js';
import { deepClone, sleep } from '../utils/helpers.js';

export class Simulator {
    constructor(cityModel) {
        this.city = cityModel;
        this.isRunning = false;
        this.currentYear = 2025;
        this.baseYear = 2025;
        this.targetYear = 2025;
        this.speed = 1; // Years per second
        this.scenarios = [];
        this.baselineStats = null;

        // Store baseline for comparison
        this.saveBaseline();
    }

    /**
     * Save current city state as baseline
     */
    saveBaseline() {
        this.baselineStats = deepClone(this.city.stats);
        this.baselineDistribution = deepClone(this.city.distribution);
    }

    /**
     * Reset to baseline
     */
    reset() {
        this.currentYear = this.baseYear;
        this.city.stats = deepClone(this.baselineStats);
        this.city.distribution = deepClone(this.baselineDistribution);
        this.scenarios = [];
        this.isRunning = false;
    }

    /**
     * Apply a scenario
     * @param {string} scenarioId 
     */
    applyScenario(scenarioId) {
        const scenario = SCENARIOS[scenarioId];
        if (!scenario) return null;

        // Clone current stats
        const beforeStats = deepClone(this.city.stats);

        // Apply modifier
        const modifiedStats = scenario.modifier({
            population: this.city.stats.population,
            sustainabilityScore: this.city.stats.sustainabilityScore,
            carbonFootprint: this.city.stats.carbonFootprint,
            energyEfficiency: this.city.stats.energyEfficiency,
            greenCoverage: this.city.stats.greenCoverage,
            transitScore: this.city.stats.transitScore,
            walkability: this.city.stats.walkability,
            airQuality: this.city.stats.airQuality,
            trafficDensity: 50,
            energyDemand: this.city.stats.energyConsumption
        });

        // Update city stats
        Object.assign(this.city.stats, {
            population: Math.round(modifiedStats.population || this.city.stats.population),
            sustainabilityScore: Math.round(Math.min(100, Math.max(0, modifiedStats.sustainabilityScore || this.city.stats.sustainabilityScore))),
            carbonFootprint: Math.round(modifiedStats.carbonFootprint || this.city.stats.carbonFootprint),
            energyEfficiency: Math.round(Math.min(100, Math.max(0, modifiedStats.energyEfficiency || this.city.stats.energyEfficiency))),
            transitScore: Math.round(Math.min(100, Math.max(0, modifiedStats.transitScore || this.city.stats.transitScore))),
            walkability: Math.round(Math.min(100, Math.max(0, modifiedStats.walkability || this.city.stats.walkability))),
            airQuality: Math.round(Math.min(100, Math.max(0, modifiedStats.airQuality || this.city.stats.airQuality)))
        });

        // Track applied scenario
        this.scenarios.push({
            id: scenarioId,
            name: scenario.name,
            appliedAt: this.currentYear
        });

        return {
            before: beforeStats,
            after: deepClone(this.city.stats),
            scenario: scenario
        };
    }

    /**
     * Set target year for simulation
     * @param {number} year 
     */
    setTargetYear(year) {
        this.targetYear = year;
    }

    /**
     * Simulate to a specific year
     * @param {number} targetYear 
     * @param {Function} onUpdate - Callback for each year
     */
    async simulateTo(targetYear, onUpdate) {
        if (this.isRunning) return;

        this.isRunning = true;
        const direction = targetYear > this.currentYear ? 1 : -1;

        while (this.currentYear !== targetYear && this.isRunning) {
            this.currentYear += direction;

            // Apply yearly changes
            if (direction > 0) {
                this.applyYearlyChanges();
            } else {
                this.revertYearlyChanges();
            }

            if (onUpdate) {
                onUpdate(this.currentYear, deepClone(this.city.stats));
            }

            await sleep(1000 / this.speed);
        }

        this.isRunning = false;
    }

    /**
     * Apply natural yearly changes (population growth, etc.)
     */
    applyYearlyChanges() {
        const yearsSinceBase = this.currentYear - this.baseYear;
        const growthRate = 0.015; // 1.5% annual growth

        // Population growth
        this.city.stats.population = Math.round(
            this.baselineStats.population * Math.pow(1 + growthRate, yearsSinceBase)
        );

        // Slight degradation of metrics without intervention
        const degradationRate = 0.005;

        this.city.stats.airQuality = Math.max(30, Math.round(
            this.baselineStats.airQuality * (1 - degradationRate * yearsSinceBase * 0.5)
        ));

        // Traffic gets worse with population
        this.city.stats.walkability = Math.max(20, Math.round(
            this.baselineStats.walkability * (1 - degradationRate * yearsSinceBase * 0.3)
        ));

        // Carbon footprint increases slightly
        this.city.stats.carbonFootprint = Math.round(
            this.baselineStats.carbonFootprint + yearsSinceBase * 0.5
        );
    }

    /**
     * Revert yearly changes when going backwards
     */
    revertYearlyChanges() {
        const yearsSinceBase = this.currentYear - this.baseYear;

        if (yearsSinceBase <= 0) {
            Object.assign(this.city.stats, deepClone(this.baselineStats));
        } else {
            this.applyYearlyChanges();
        }
    }

    /**
     * Stop the simulation
     */
    stop() {
        this.isRunning = false;
    }

    /**
     * Get projection for a specific year
     * @param {number} targetYear 
     * @returns {Object}
     */
    getProjection(targetYear) {
        const yearsSinceBase = targetYear - this.baseYear;
        const growthRate = 0.015;

        return {
            year: targetYear,
            population: Math.round(this.baselineStats.population * Math.pow(1 + growthRate, yearsSinceBase)),
            sustainabilityScore: Math.max(0, this.baselineStats.sustainabilityScore - yearsSinceBase * 0.5),
            carbonFootprint: this.baselineStats.carbonFootprint + yearsSinceBase * 0.5
        };
    }

    /**
     * Get timeline of events
     * @returns {Array}
     */
    getTimeline() {
        return [
            { year: this.baseYear, event: 'Baseline', type: 'start' },
            ...this.scenarios.map(s => ({
                year: s.appliedAt,
                event: s.name,
                type: 'scenario'
            })),
            { year: this.currentYear, event: 'Current', type: 'current' }
        ].sort((a, b) => a.year - b.year);
    }
}
