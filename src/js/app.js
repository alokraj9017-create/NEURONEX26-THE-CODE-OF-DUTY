// AuraTutor App Coordinator
// Manages the single-page application router, global state update observers, and telemetry sync.

import store from "./state.js";
import detector from "./detector.js";
import tutor from "./tutor.js";
import planner from "./planner.js";
import analytics from "./analytics.js";
import gamification from "./gamification.js";
import { SUBJECTS_DB } from "./data.js";

class AppCoordinator {
    constructor() {
        // Expose globally for HTML onclick attributes
        window.app = this;
        
        this.tutorModule = tutor;
        this.detectorModule = detector;
        this.plannerModule = planner;
        this.analyticsModule = analytics;
        this.gamificationModule = gamification;

        this.views = {
            dashboard: { title: "Dashboard", subtitle: "Welcome back! Ready to unlock your brain's potential today?" },
            tutor: { title: "Smart AI Tutor", subtitle: "Adapting content, quizzes, and explanations to your live cognitive state." },
            planner: { title: "Adaptive Study Planner", subtitle: "Targeting cognitive weak points and scheduling rest intervals." },
            analytics: { title: "Progress Analytics", subtitle: "Telemetry reports showing weekly activity, strengths, and weaknesses." },
            achievements: { title: "Achievements & Milestones", subtitle: "Gamified badges and scholarly ranks unlocked by focus." }
        };
    }

    // Initialize all sub-modules
    init() {
        // 1. Load store defaults
        store.init();

        // 2. Start biometrics monitors
        detector.start();

        // 3. Initialize components
        tutor.init();
        planner.init();
        analytics.init();
        gamification.init();

        // 4. Bind view routers
        this.bindViewNavigation();

        // 5. Subscribe to state modifications to sync UI
        store.subscribe("stateChange", this.handleUIStateSync.bind(this));
        store.subscribe("xpGain", this.handleStatsUpdate.bind(this));
        store.subscribe("telemetryLog", this.handleTelemetryLogAppend.bind(this));
        store.subscribe("subjectChanged", () => this.handleStatsUpdate());
        store.subscribe("conceptChanged", () => this.handleStatsUpdate());
        
        // Bind demo trigger buttons
        document.getElementById("btn-force-struggle").addEventListener("click", () => {
            detector.forceStruggleState();
        });
        document.getElementById("btn-force-bored").addEventListener("click", () => {
            detector.forceBoredState();
        });

        // API settings panel bindings
        const toggleBtn = document.getElementById("toggle-api-drawer");
        const drawer = document.getElementById("api-drawer-content");
        const apiKeyInput = document.getElementById("gemini-api-key");
        
        if (toggleBtn && drawer && apiKeyInput) {
            toggleBtn.addEventListener("click", () => {
                drawer.style.display = drawer.style.display === "none" ? "flex" : "none";
            });
            
            apiKeyInput.value = store.state.session.apiKey || "";
            
            apiKeyInput.addEventListener("input", (e) => {
                store.setApiKey(e.target.value.trim());
            });
        }

        // Setup ticking UI values (like active timers)
        setInterval(this.tickRealTimeTelemetry.bind(this), 1000);

        // Run first stats update
        this.handleStatsUpdate();
        this.syncTelemetryFeed();

        this.showNotification("👋 AuraTutor Cognitive Sync Online!");
    }

    // Tab Navigation SPA Router
    bindViewNavigation() {
        const navItems = document.querySelectorAll(".nav-item");
        
        navItems.forEach(item => {
            item.addEventListener("click", (e) => {
                // Determine target view
                const viewName = item.getAttribute("data-view");
                this.switchView(viewName);
            });
        });
    }

    switchView(viewName) {
        if (!this.views[viewName]) return;

        // Update nav active classes
        const navItems = document.querySelectorAll(".nav-item");
        navItems.forEach(item => {
            item.classList.remove("active");
            if (item.getAttribute("data-view") === viewName) {
                item.classList.add("active");
            }
        });

        // Switch panel displays
        const panels = document.querySelectorAll(".view-panel");
        panels.forEach(panel => {
            panel.classList.remove("active");
            if (panel.id === `view-${viewName}`) {
                panel.classList.add("active");
            }
        });

        // Set Header texts
        document.getElementById("view-title").textContent = this.views[viewName].title;
        document.getElementById("view-subtitle").textContent = this.views[viewName].subtitle;

        store.logTelemetry(`Navigated to view: ${viewName.toUpperCase()}`);
    }

    // Handles layout colors and glowing badges when the state shifts (WOW factor!)
    handleUIStateSync({ oldState, newState }) {
        const body = document.body;
        const glow = document.getElementById("ambient-glow");
        const dot = document.getElementById("state-indicator-dot");
        const textVal = document.getElementById("current-state-text");
        const chip = document.getElementById("state-chip");

        // Sync Tutor view status sidebar indicators
        const tutorGlow = document.getElementById("tutor-status-glow");
        const tutorTitle = document.getElementById("tutor-telemetry-state-title");
        const tutorDesc = document.getElementById("tutor-telemetry-state-desc");

        // 1. Reset class styles
        body.className = "";
        glow.className = "";
        dot.className = "status-indicator-dot";

        // 2. Set new styles
        body.className = `state-${newState.toLowerCase()}`;
        glow.className = `glow-${newState.toLowerCase()}`;
        dot.className += ` pulse-${newState.toLowerCase()}`;

        // 3. Set display texts
        let readableText = "Focused & Balanced";
        let stateDescription = "Pacing optimal. Engaging with standard curriculum.";
        let chipText = "Cognitive Sync Active";

        switch(newState) {
            case "FOCUSED":
                readableText = "Focused & Balanced";
                stateDescription = "Pacing optimal. Engaging with standard curriculum.";
                chipText = "Cognitive Sync Active";
                break;
            case "STRUGGLING":
                readableText = "Confusion Detected";
                stateDescription = "Failure loop checked. Delivering simplified analogies.";
                chipText = "Guided Support Activated";
                this.showNotification("💡 Concept difficulty adapted. Simplifying content.");
                break;
            case "BORED":
                readableText = "Distracted / Inactive";
                stateDescription = "User idle. Requesting active challenge verification.";
                chipText = "Low Engagement Alert";
                this.showNotification("⚡ Attention spark triggered! Ready for a quick quiz?");
                break;
            case "MASTERING":
                readableText = "Mastery Zone Activated";
                stateDescription = "Accuracy streak high. Elevating module complexity.";
                chipText = "Synaptic Speed High";
                this.showNotification("🚀 Advanced challenge unlocked!");
                break;
        }

        textVal.textContent = readableText;
        if (chip) chip.textContent = chipText;

        if (tutorTitle) tutorTitle.textContent = `${newState} STATE`;
        if (tutorDesc) tutorDesc.textContent = stateDescription;
        if (tutorGlow) {
            // Apply color to tutor indicator glow
            tutorGlow.style.backgroundColor = `var(--color-${newState.toLowerCase()})`;
            tutorGlow.style.boxShadow = `0 0 10px var(--color-${newState.toLowerCase()})`;
        }

        // Sync Dashboard Hero ring display
        const ringText = document.getElementById("state-card-text");
        const ringIcon = document.getElementById("state-card-icon");
        const ringProgress = document.getElementById("cognitive-ring-progress");

        if (ringText) ringText.textContent = newState;
        if (ringIcon) {
            let iconName = "psychology";
            if (newState === "STRUGGLING") iconName = "help_outline";
            if (newState === "BORED") iconName = "sentiment_dissatisfied";
            if (newState === "MASTERING") iconName = "workspace_premium";
            ringIcon.textContent = iconName;
        }

        if (ringProgress) {
            // Adjust SVG Ring Dash Offset based on state focus score
            let score = 88;
            if (newState === "STRUGGLING") score = 42;
            if (newState === "BORED") score = 25;
            if (newState === "MASTERING") score = 98;
            
            // stroke-dasharray is 345.57. Offset = 345.57 * (1 - score/100)
            const offset = 345.57 * (1 - score/100);
            ringProgress.style.strokeDashoffset = offset;
            
            const pct = document.getElementById("focus-percentage");
            if (pct) pct.textContent = `${score}%`;
        }
    }

    // Refresh general user stats counters in layout
    handleStatsUpdate() {
        const student = store.state.student;
        
        // 1. Top bar updates
        const topStreak = document.getElementById("streak-counter-top");
        const topXP = document.getElementById("xp-counter-top");
        if (topStreak) topStreak.textContent = `${student.streak} Days`;
        if (topXP) topXP.textContent = `${student.xp} XP`;

        // 2. Profile block
        const levelBadge = document.getElementById("user-level-badge");
        if (levelBadge) levelBadge.textContent = `Level ${student.level} Scholar`;

        // 3. XP Progress displays
        const currentXP = document.getElementById("current-xp");
        const currentXPLarge = document.getElementById("current-xp-large");
        const levelTitleLarge = document.getElementById("level-title-large");
        const xpProgress = document.getElementById("xp-progress-bar");
        const xpProgressLarge = document.getElementById("xp-progress-bar-large");
        
        const xpInCurrentLevel = student.xp % 500;
        const progressPct = (xpInCurrentLevel / 500) * 100;

        if (currentXP) currentXP.textContent = student.xp;
        if (currentXPLarge) currentXPLarge.textContent = student.xp;
        if (levelTitleLarge) levelTitleLarge.textContent = student.level;
        if (xpProgress) xpProgress.style.width = `${progressPct}%`;
        if (xpProgressLarge) xpProgressLarge.style.width = `${progressPct}%`;

        // 4. Focus Time Metric
        const minutesFocus = Math.round(student.focusTimeToday / 60);
        const focusMetric = document.getElementById("focus-time-metric");
        const focusBar = document.getElementById("focus-time-bar");
        if (focusMetric) focusMetric.textContent = `${minutesFocus}m / 45m`;
        if (focusBar) {
            const focusBarPct = Math.min(100, (minutesFocus / 45) * 100);
            focusBar.style.width = `${focusBarPct}%`;
        }

        // 5. Accuracy Rate Metric
        const session = store.state.session;
        const accuracyRate = session.totalQuestionsAnswered > 0 
            ? Math.round((session.totalQuestionsCorrect / session.totalQuestionsAnswered) * 100)
            : 100;
        
        const accuracyMetric = document.getElementById("accuracy-metric");
        const accuracyBar = document.getElementById("accuracy-bar");
        if (accuracyMetric) accuracyMetric.textContent = `${accuracyRate}%`;
        if (accuracyBar) accuracyBar.style.width = `${accuracyRate}%`;

        // 6. Session XP Metric
        const sessionXPMetric = document.getElementById("session-xp-metric");
        const sessionXPBar = document.getElementById("session-xp-bar");
        
        const sessionXP = session.totalQuestionsCorrect * 50 + (store.state.badges.length * 100);
        if (sessionXPMetric) sessionXPMetric.textContent = `+${sessionXP} XP`;
        if (sessionXPBar) {
            const sXPPct = Math.min(100, (sessionXP / 500) * 100);
            sessionXPBar.style.width = `${sXPPct}%`;
        }

        // 7. Overall Course Completion based on active subject
        const activeSubId = store.state.session.activeSubjectId;
        const activeSubject = SUBJECTS_DB[activeSubId];
        
        if (activeSubject) {
            const activeCourseTitle = document.getElementById("active-course-title");
            const activeCourseSubtitle = document.getElementById("active-course-subtitle");
            
            if (activeCourseTitle) activeCourseTitle.textContent = activeSubject.title;
            if (activeCourseSubtitle) {
                const activeConcept = activeSubject.concepts[store.state.session.activeConceptId];
                activeCourseSubtitle.textContent = activeConcept ? activeConcept.title : "Active Study";
            }

            const conceptKeys = Object.keys(activeSubject.concepts);
            const completedModules = conceptKeys.filter(cid => store.state.mastery[cid] >= 75).length;
            const totalModules = conceptKeys.length;
            const completionRate = Math.round((completedModules / totalModules) * 100);

            const coursePctText = document.getElementById("course-percentage-text");
            const courseBar = document.getElementById("course-progress-bar");
            if (coursePctText) coursePctText.textContent = `${completionRate}%`;
            if (courseBar) courseBar.style.width = `${completionRate}%`;
        }
    }

    // Append log strings to UI telemetry screens
    handleTelemetryLogAppend(message) {
        const feed = document.getElementById("telemetry-logs-feed");
        if (!feed) return;
        
        const log = document.createElement("div");
        log.className = "log-entry";
        log.textContent = message;
        
        feed.insertBefore(log, feed.firstChild);
        if (feed.children.length > 10) {
            feed.removeChild(feed.lastChild);
        }
    }

    // Refresh entire telemetry logs list
    syncTelemetryFeed() {
        const feed = document.getElementById("telemetry-logs-feed");
        if (!feed) return;
        
        feed.innerHTML = "";
        store.state.telemetryLogs.forEach(logText => {
            const log = document.createElement("div");
            log.className = "log-entry";
            log.textContent = logText;
            feed.appendChild(log);
        });
    }

    // Update ticking bio-telemetry values dynamically
    tickRealTimeTelemetry() {
        const paceVal = document.getElementById("telemetry-pace");
        const idleVal = document.getElementById("telemetry-idle");
        const errorsVal = document.getElementById("telemetry-errors");
        const hintsVal = document.getElementById("telemetry-hints");

        if (!paceVal) return;

        // 1. Fetch live text from detector
        paceVal.textContent = detector.getCurrentPaceText();
        
        // Color highlights
        if (store.state.cognitiveState === "BORED") {
            paceVal.className = "telemetry-value text-red";
        } else {
            const durationSec = Math.round((Date.now() - store.state.session.questionStartTime) / 1000);
            paceVal.className = `telemetry-value ${durationSec > 35 ? 'text-red' : durationSec < 5 ? 'text-yellow' : 'text-green'}`;
        }

        // 2. Idle timer
        const idleTime = Math.round((Date.now() - detector.lastActivityTime) / 1000);
        idleVal.textContent = `${idleTime}s idle`;
        idleVal.className = `telemetry-value ${idleTime >= 30 ? 'text-red' : idleTime > 15 ? 'text-yellow' : 'text-blue'}`;

        // 3. Consecutive errors count
        const errs = store.state.session.consecutiveErrors;
        errorsVal.textContent = `${errs} Errors`;
        errorsVal.className = `telemetry-value ${errs >= 2 ? 'text-red' : errs > 0 ? 'text-yellow' : 'text-green'}`;

        // 4. Hints used
        const hnts = store.state.session.hintsUsedCount;
        hintsVal.textContent = `${hnts} Hints`;
        hintsVal.className = `telemetry-value ${hnts >= 2 ? 'text-red' : hnts > 0 ? 'text-yellow' : 'text-green'}`;
    }

    // Global Notification manager
    showNotification(message) {
        const container = document.getElementById("toast-container");
        if (!container) return;

        const toast = document.createElement("div");
        toast.className = "toast";
        toast.innerHTML = `
            <span class="material-icons-round" style="color:var(--color-green)">notifications_active</span>
            <span>${message}</span>
        `;
        
        container.appendChild(toast);
        
        // Auto remove from DOM after CSS fade animation triggers (5 seconds total)
        setTimeout(() => {
            if (toast.parentNode) toast.parentNode.removeChild(toast);
        }, 5000);
    }
}

// Instantiate on startup
document.addEventListener("DOMContentLoaded", () => {
    const coordinator = new AppCoordinator();
    coordinator.init();
});
