// AuraTutor Behavioral Biometrics Detector Engine
// Analyzes click paths, question pacing, consecutive errors, and active pauses to infer student state.

import store from "./state.js";

class BiometricsDetector {
    constructor() {
        this.lastActivityTime = Date.now();
        this.inactivityThresholdMs = 30000; // 30 seconds for demo convenience (usually 60s)
        this.checkInterval = null;
        this.preInactivityState = "FOCUSED";
        this.isActive = false;
        
        // Average expected response time bounds (in ms)
        this.targetSpeedBounds = {
            easy: { min: 3000, max: 20000 },
            medium: { min: 5000, max: 35000 },
            hard: { min: 8000, max: 50000 }
        };
    }

    // Start background activity listeners and checks
    start() {
        if (this.isActive) return;
        this.isActive = true;
        this.resetActivity();

        // Bind global activity monitors
        window.addEventListener("mousemove", this.handleActivity.bind(this));
        window.addEventListener("keydown", this.handleActivity.bind(this));
        window.addEventListener("click", this.handleActivity.bind(this));
        window.addEventListener("scroll", this.handleActivity.bind(this));

        // Start checking for inactivity every second
        this.checkInterval = setInterval(this.checkInactivity.bind(this), 1000);
        
        // Listen to store events for accuracy and error triggers
        store.subscribe("answerRecorded", this.evaluatePaceAndErrors.bind(this));
    }

    // Reset activity timestamps
    handleActivity() {
        if (!this.isActive) return;
        
        const now = Date.now();
        // If they were previously BORED/INACTIVE and now click/type, restore state
        if (store.state.cognitiveState === "BORED") {
            store.logTelemetry("User interaction resumed. Re-syncing state.");
            store.setCognitiveState(this.preInactivityState || "FOCUSED");
        }
        
        this.lastActivityTime = now;
    }

    resetActivity() {
        this.lastActivityTime = Date.now();
    }

    // Interval callback to check if user has gone idle
    checkInactivity() {
        if (!this.isActive) return;

        const idleDuration = Date.now() - this.lastActivityTime;
        
        if (idleDuration >= this.inactivityThresholdMs) {
            if (store.state.cognitiveState !== "BORED") {
                // Save current state to return to it when they wake up
                this.preInactivityState = store.state.cognitiveState;
                store.logTelemetry(`Inactivity detected (>= ${Math.round(idleDuration/1000)}s idle).`);
                store.setCognitiveState("BORED");
            }
        }
    }

    // Evaluates speed of answer submissions and consecutive mistakes to assess struggling vs. flow
    evaluatePaceAndErrors({ conceptId, isCorrect, responseTimeMs }) {
        const errors = store.state.session.consecutiveErrors;
        const hints = store.state.session.hintsUsedCount;
        
        // Gather recent accuracy to check for mastery
        const recentResponses = store.state.session.responses.slice(-3); // Last 3 answers
        const correctStreak = recentResponses.filter(r => r.isCorrect).length;
        const totalRecent = recentResponses.length;

        let estimatedState = store.state.cognitiveState;

        // Rule 1: Struggling Loop
        // Triggered by multiple consecutive errors or excessive hint dependency
        if (errors >= 2 || hints >= 2) {
            estimatedState = "STRUGGLING";
            store.logTelemetry(`State evaluation: Student struggling. Errors: ${errors}, Hints: ${hints}.`);
        }
        // Rule 2: Mastering / High Flow
        // Triggered by 3 consecutive correct answers with standard/fast response pace
        else if (totalRecent >= 3 && correctStreak === 3) {
            // Check average response pace of last 3 items
            const averageTime = recentResponses.reduce((acc, r) => acc + r.responseTimeMs, 0) / 3;
            
            if (averageTime < 18000) { // average pace under 18 seconds
                estimatedState = "MASTERING";
                store.logTelemetry(`State evaluation: High mastery. 3/3 correct. Avg speed: ${Math.round(averageTime/1000)}s.`);
            } else {
                estimatedState = "FOCUSED";
            }
        }
        // Rule 3: Balanced/Focused
        // Return to focus if they answered correctly but don't qualify for mastering
        else if (isCorrect && errors === 0) {
            estimatedState = "FOCUSED";
        }

        store.setCognitiveState(estimatedState);
    }

    // Direct interface to simulate confusion state (for hackathon demo)
    forceStruggleState() {
        store.state.session.consecutiveErrors = 2;
        store.state.session.hintsUsedCount = 2;
        store.setCognitiveState("STRUGGLING");
        store.logTelemetry("[DEMO TRIGGER] Forced Struggle & Confusion state.");
    }

    // Direct interface to simulate boredom state (for hackathon demo)
    forceBoredState() {
        // Mock idle time
        this.lastActivityTime = Date.now() - this.inactivityThresholdMs - 1000;
        this.preInactivityState = store.state.cognitiveState;
        store.setCognitiveState("BORED");
        store.logTelemetry("[DEMO TRIGGER] Forced Bored & Inactive state.");
    }

    // Stop listeners (e.g. session end)
    stop() {
        this.isActive = false;
        if (this.checkInterval) clearInterval(this.checkInterval);
        
        window.removeEventListener("mousemove", this.handleActivity);
        window.removeEventListener("keydown", this.handleActivity);
        window.removeEventListener("click", this.handleActivity);
        window.removeEventListener("scroll", this.handleActivity);
    }

    // Retrieve display-friendly pace metrics
    getCurrentPaceText() {
        const timePassedSec = Math.round((Date.now() - store.state.session.questionStartTime) / 1000);
        
        if (store.state.cognitiveState === "BORED") {
            return `Idle (${Math.round((Date.now() - this.lastActivityTime)/1000)}s)`;
        }
        
        if (timePassedSec > 35) {
            return `Slow (${timePassedSec}s)`;
        }
        if (timePassedSec < 5) {
            return `Rushing (${timePassedSec}s)`;
        }
        return `Optimal (${timePassedSec}s)`;
    }
}

export const detector = new BiometricsDetector();
export default detector;
