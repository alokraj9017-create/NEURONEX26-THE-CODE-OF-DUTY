// AuraTutor Central State Management Store
// Implements a reactive Pub/Sub system for state synchronization across UI, Detector, and Tutor modules

class StateStore {
    constructor() {
        // Default initial state
        this.state = {
            // Student Profile
            student: {
                name: "Alex Miller",
                level: 1,
                xp: 0,
                streak: 5,
                focusTimeToday: 0, // in seconds
                lastActiveDate: null
            },
            
            // Learning Mastery (0 to 100 scale) for multiple subject domains
            mastery: {
                // Computer Science
                bst_intro: 0,
                bst_search: 0,
                bst_traversal: 0,
                bst_balancing: 0,
                recursion: 0,
                databases: 0,
                
                // Physics
                gravity: 0,
                quantum: 0,
                photosynthesis: 0,
                
                // Mathematics
                calculus: 0,
                algebra: 0
            },
            
            // Current Session telemetry variables
            session: {
                activeSubjectId: "computer_science",
                activeConceptId: "bst_intro",
                apiKey: "",
                queryHistory: [],
                questionStartTime: null,
                consecutiveErrors: 0,
                hintsUsedCount: 0,
                responses: [], // history of { conceptId, isCorrect, responseTimeMs }
                totalQuestionsAnswered: 0,
                totalQuestionsCorrect: 0
            },

            // Cognitive state
            cognitiveState: "FOCUSED", // FOCUSED, STRUGGLING, BORED, MASTERING
            
            // Pomodoro Focus Timer
            pomodoro: {
                minutes: 25,
                seconds: 0,
                status: "IDLE", // IDLE, RUNNING, PAUSED, BREAK
                type: "FOCUS", // FOCUS, SHORT_BREAK
                continuousFocusSeconds: 0
            },

            // Gamification
            badges: [], // IDs of unlocked badges
            
            // Telemetry Logs Feed for dashboard display (maximum 15 logs)
            telemetryLogs: [
                "[System] AuraTutor initialized. Mode: Cognitive Sync Active."
            ]
        };

        this.listeners = {};
        this.storageKey = "auratutor_student_progress";
    }

    // Subscribe to state change events
    subscribe(event, callback) {
        if (!this.listeners[event]) {
            this.listeners[event] = [];
        }
        this.listeners[event].push(callback);
    }

    // Notify subscribers
    notify(event, data) {
        if (this.listeners[event]) {
            this.listeners[event].forEach(cb => cb(data));
        }
    }

    // Initialize state (load from cache or set defaults)
    init() {
        this.loadState();
        this.state.session.questionStartTime = Date.now();
        this.notify("init", this.state);
    }

    // Change global cognitive/emotional state
    setCognitiveState(newState) {
        if (this.state.cognitiveState === newState) return;
        
        const oldState = this.state.cognitiveState;
        this.state.cognitiveState = newState;
        
        this.logTelemetry(`State shifted from ${oldState} to ${newState}`);
        this.notify("stateChange", { oldState, newState });
        this.saveState();
    }

    // Log biometrics updates to feed
    logTelemetry(message) {
        const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        const entry = `[${time}] ${message}`;
        this.state.telemetryLogs.unshift(entry);
        if (this.state.telemetryLogs.length > 15) {
            this.state.telemetryLogs.pop();
        }
        this.notify("telemetryLog", entry);
    }

    // Award XP to student
    addXP(amount) {
        this.state.student.xp += amount;
        this.logTelemetry(`Earned +${amount} XP`);
        
        // Level up formula: 500 XP per level
        const currentLevel = this.state.student.level;
        const newLevel = Math.floor(this.state.student.xp / 500) + 1;
        
        if (newLevel > currentLevel) {
            this.state.student.level = newLevel;
            this.logTelemetry(`Level Up! Promoted to Level ${newLevel}`);
            this.notify("levelUp", newLevel);
        }
        
        this.notify("xpGain", { amount, total: this.state.student.xp, level: this.state.student.level });
        this.saveState();
    }

    // Record correct/incorrect answer details
    recordAnswer(conceptId, isCorrect, responseTimeMs) {
        const session = this.state.session;
        session.totalQuestionsAnswered += 1;
        
        if (isCorrect) {
            session.totalQuestionsCorrect += 1;
            session.consecutiveErrors = 0;
            // Mastery improvement
            this.state.mastery[conceptId] = Math.min(100, this.state.mastery[conceptId] + 25);
            this.logTelemetry(`Correct Answer on concept. Mastery: ${this.state.mastery[conceptId]}%`);
        } else {
            session.consecutiveErrors += 1;
            // Mastery penalty
            this.state.mastery[conceptId] = Math.max(0, this.state.mastery[conceptId] - 10);
            this.logTelemetry(`Incorrect Answer on concept. Consecutive Errors: ${session.consecutiveErrors}`);
        }

        session.responses.push({ conceptId, isCorrect, responseTimeMs });
        this.notify("answerRecorded", { conceptId, isCorrect, responseTimeMs });
        this.saveState();
    }

    // Add badge
    unlockBadge(badgeId) {
        if (this.state.badges.includes(badgeId)) return;
        this.state.badges.push(badgeId);
        this.logTelemetry(`Achievement Unlocked: [${badgeId.toUpperCase()}]`);
        this.notify("badgeUnlocked", badgeId);
        this.saveState();
    }

    // Reset session telemetry
    resetSessionStats() {
        this.state.session.consecutiveErrors = 0;
        this.state.session.hintsUsedCount = 0;
        this.state.session.questionStartTime = Date.now();
        this.saveState();
    }

    // Update active concept node
    setActiveConcept(conceptId) {
        this.state.session.activeConceptId = conceptId;
        this.resetSessionStats();
        this.notify("conceptChanged", conceptId);
        this.saveState();
    }

    // Update active subject domain
    setSubject(subjectId) {
        if (this.state.session.activeSubjectId === subjectId) return;
        const oldSubject = this.state.session.activeSubjectId;
        this.state.session.activeSubjectId = subjectId;
        this.logTelemetry(`Subject domain shifted from ${oldSubject.toUpperCase()} to ${subjectId.toUpperCase()}`);
        this.notify("subjectChanged", { oldSubject, newSubject: subjectId });
        this.saveState();
    }

    // Save user custom queries
    recordQuery(queryText) {
        this.state.session.queryHistory.push({
            query: queryText,
            timestamp: Date.now()
        });
        this.notify("queryAdded", queryText);
    }

    // Update API Key
    setApiKey(key) {
        this.state.session.apiKey = key;
        this.saveState();
        this.logTelemetry(key ? "Live Gemini AI API Key updated." : "API Key removed. Fallback to local NLP.");
    }

    // Save state to local storage
    saveState() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify({
                student: this.state.student,
                mastery: this.state.mastery,
                badges: this.state.badges,
                apiKey: this.state.session.apiKey,
                activeSubjectId: this.state.session.activeSubjectId
            }));
        } catch (e) {
            console.error("Could not cache user state.", e);
        }
    }

    // Load state from local storage
    loadState() {
        try {
            const cached = localStorage.getItem(this.storageKey);
            if (cached) {
                const parsed = JSON.parse(cached);
                if (parsed.student) this.state.student = { ...this.state.student, ...parsed.student };
                if (parsed.mastery) this.state.mastery = { ...this.state.mastery, ...parsed.mastery };
                if (parsed.badges) this.state.badges = parsed.badges;
                if (parsed.apiKey) this.state.session.apiKey = parsed.apiKey;
                if (parsed.activeSubjectId) this.state.session.activeSubjectId = parsed.activeSubjectId;
            }
        } catch (e) {
            console.warn("No cached progress found or failed to load. Initializing clean profiles.");
        }
    }
}

export const store = new StateStore();
export default store;
