/* ========================================
   Smart City Planner - Constants
   ======================================== */

// Zone types with their properties
export const ZONE_TYPES = {
    empty: {
        name: 'Empty',
        color: '#1f2937',
        population: 0,
        energy: 0,
        sustainability: 0
    },
    residential: {
        name: 'Residential',
        color: '#3b82f6',
        lightColor: 'rgba(59, 130, 246, 0.3)',
        population: 1000,
        energy: 50,
        sustainability: 60
    },
    commercial: {
        name: 'Commercial',
        color: '#f59e0b',
        lightColor: 'rgba(245, 158, 11, 0.3)',
        population: 200,
        energy: 150,
        sustainability: 40
    },
    industrial: {
        name: 'Industrial',
        color: '#6b7280',
        lightColor: 'rgba(107, 114, 128, 0.3)',
        population: 100,
        energy: 300,
        sustainability: 20
    },
    green: {
        name: 'Green Space',
        color: '#22c55e',
        lightColor: 'rgba(34, 197, 94, 0.3)',
        population: 0,
        energy: -20,
        sustainability: 100
    },
    transit: {
        name: 'Transit Hub',
        color: '#ec4899',
        lightColor: 'rgba(236, 72, 153, 0.3)',
        population: 50,
        energy: 80,
        sustainability: 80
    },
    road: {
        name: 'Road',
        color: '#374151',
        lightColor: 'rgba(55, 65, 81, 0.3)',
        population: 0,
        energy: 10,
        sustainability: 30
    }
};

// City size presets
export const CITY_SIZES = {
    small: { grid: 50, name: 'Small', population: 100000 },
    medium: { grid: 80, name: 'Medium', population: 500000 },
    large: { grid: 120, name: 'Large', population: 2000000 }
};

// City presets for quick generation
export const CITY_PRESETS = {
    eco: {
        name: 'Eco City',
        prompt: 'Create a sustainable eco-city with 40% green spaces, solar-powered districts, urban farms, and extensive cycling infrastructure.',
        greenRatio: 0.4,
        transitRatio: 0.1,
        industrialRatio: 0.05
    },
    tech: {
        name: 'Tech Hub',
        prompt: 'Design a modern tech hub city with innovation districts, smart infrastructure, mixed-use development, and efficient public transit.',
        commercialRatio: 0.35,
        transitRatio: 0.15,
        greenRatio: 0.2
    },
    transit: {
        name: 'Transit-First',
        prompt: 'Create a transit-oriented city with metro stations at the core, high-density residential near transit, and pedestrian-friendly zones.',
        transitRatio: 0.2,
        residentialRatio: 0.4,
        greenRatio: 0.25
    },
    mixed: {
        name: 'Mixed-Use',
        prompt: 'Design a balanced mixed-use city with integrated residential, commercial, and recreational areas in walkable neighborhoods.',
        residentialRatio: 0.35,
        commercialRatio: 0.2,
        greenRatio: 0.25
    }
};

// Simulation scenarios
export const SCENARIOS = {
    'population-growth': {
        name: 'Population +50%',
        description: 'Simulate rapid population growth',
        modifier: (city) => {
            city.population *= 1.5;
            city.trafficDensity *= 1.6;
            city.energyDemand *= 1.4;
            return city;
        }
    },
    'add-transit': {
        name: 'Add Transit Line',
        description: 'New metro line across city',
        modifier: (city) => {
            city.transitScore += 15;
            city.trafficDensity *= 0.85;
            city.carbonFootprint *= 0.9;
            return city;
        }
    },
    'green-expansion': {
        name: 'Green Expansion',
        description: 'Convert 10% industrial to parks',
        modifier: (city) => {
            city.greenCoverage += 10;
            city.airQuality += 12;
            city.sustainabilityScore += 8;
            return city;
        }
    },
    'renewable-energy': {
        name: '100% Renewable',
        description: 'Switch to renewable energy',
        modifier: (city) => {
            city.carbonFootprint *= 0.3;
            city.energyEfficiency += 20;
            city.sustainabilityScore += 15;
            return city;
        }
    }
};

// Metric thresholds for scoring
export const METRIC_THRESHOLDS = {
    sustainability: { poor: 40, fair: 60, good: 75, excellent: 90 },
    greenCoverage: { poor: 10, fair: 20, good: 30, excellent: 40 },
    transitScore: { poor: 30, fair: 50, good: 70, excellent: 85 },
    walkability: { poor: 30, fair: 50, good: 70, excellent: 85 },
    energyEfficiency: { poor: 40, fair: 60, good: 75, excellent: 90 }
};

// Colors for visualization layers
export const LAYER_COLORS = {
    traffic: {
        low: '#22c55e',
        medium: '#fbbf24',
        high: '#ef4444'
    },
    population: {
        low: '#22d3ee',
        medium: '#fbbf24',
        high: '#ef4444'
    },
    energy: {
        primary: '#7c3aed',
        secondary: '#a855f7',
        node: '#c084fc'
    }
};

// Animation settings
export const ANIMATION = {
    trafficParticleSpeed: 2,
    trafficParticleCount: 100,
    pulseSpeed: 0.02,
    transitionDuration: 300
};
