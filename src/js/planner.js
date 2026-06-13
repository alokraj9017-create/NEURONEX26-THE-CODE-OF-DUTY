// AuraTutor Adaptive Planner & Pomodoro focus timer
// Schedules spaced repetition reviews for weak nodes and runs Pomodoro fatigue safeguards.

import store from "./state.js";
import { SUBJECTS_DB } from "./data.js";

class PlannerModule {
    constructor() {
        this.dashboardAgendaList = null;
        this.plannerChecklist = null;
        this.pomoMinutes = null;
        this.pomoSeconds = null;
        this.btnPomoStart = null;
        this.btnPomoReset = null;
        this.pomoStateLabel = null;
        this.pomoGlowState = null;

        // Pomodoro State variables
        this.timerInterval = null;
        this.totalSeconds = 25 * 60;
        this.secondsRemaining = 25 * 60;
        this.isRunning = false;
        this.isBreakMode = false;
        
        // Fatigue stats
        this.continuousStudySeconds = 0;
    }

    // Initialize HTML binding
    init() {
        this.dashboardAgendaList = document.getElementById("dashboard-agenda-list");
        this.plannerChecklist = document.getElementById("planner-schedule-checklist");
        
        this.pomoMinutes = document.getElementById("pomo-minutes");
        this.pomoSeconds = document.getElementById("pomo-seconds");
        this.btnPomoStart = document.getElementById("btn-pomo-start");
        this.btnPomoReset = document.getElementById("btn-pomo-reset");
        this.pomoStateLabel = document.getElementById("pomo-state-label");
        this.pomoGlowState = document.getElementById("pomo-glow-state");

        // Set up event listeners
        this.btnPomoStart.addEventListener("click", this.toggleTimer.bind(this));
        this.btnPomoReset.addEventListener("click", this.resetTimer.bind(this));
        document.getElementById("btn-regenerate-planner").addEventListener("click", () => {
            this.generateAgendaPlan();
            store.logTelemetry("Adaptive study schedule regenerated.");
        });

        // Run initial agenda build
        this.generateAgendaPlan();

        // Start background second tracker for fatigue stats
        setInterval(this.updateFatigueStats.bind(this), 1000);
        
        // Regenerate agenda when mastery updates
        store.subscribe("answerRecorded", () => this.generateAgendaPlan());
        store.subscribe("subjectChanged", () => this.generateAgendaPlan());
    }

    // Generate Agenda checklist
    generateAgendaPlan() {
        const agendaItems = [];
        const activeSubId = store.state.session.activeSubjectId;
        const activeSubject = SUBJECTS_DB[activeSubId] || SUBJECTS_DB.computer_science;
        const conceptsList = Object.values(activeSubject.concepts);
        
        const activeConcept = conceptsList.find(c => c.id === store.state.session.activeConceptId) || conceptsList[0];

        // 1. Core Focus Concept (Incomplete or Current)
        agendaItems.push({
            id: "agenda_core",
            title: `Learn: ${activeConcept.title}`,
            desc: `Active ${activeSubject.title} module. Review definitions and core formulas.`,
            type: "concept",
            completed: store.state.mastery[activeConcept.id] >= 50,
            metaText: `${store.state.mastery[activeConcept.id]}% Complete`
        });

        // 2. Weakness Reinforcement (check if any node is under 60%)
        let weakestNode = null;
        let lowestScore = 100;
        
        // Scan active subject's concepts first for weakness
        Object.keys(activeSubject.concepts).forEach(nodeId => {
            const score = store.state.mastery[nodeId] || 0;
            if (score < lowestScore) {
                lowestScore = score;
                weakestNode = nodeId;
            }
        });

        if (weakestNode && lowestScore < 60 && lowestScore > 0) {
            const conceptDetails = activeSubject.concepts[weakestNode];
            if (conceptDetails) {
                agendaItems.push({
                    id: "agenda_weakness",
                    title: `Review: ${conceptDetails.title}`,
                    desc: "Cognitive block detected. Reinforce core analogies.",
                    type: "revision",
                    completed: store.state.mastery[weakestNode] >= 75,
                    metaText: "NEURAL WEAKNESS",
                    isUrgent: true
                });
            }
        } else {
            // Default revision topic
            agendaItems.push({
                id: "agenda_revision",
                title: `Active recall: ${activeSubject.title} Key Terms`,
                desc: "Strengthen neural memory consolidation.",
                type: "revision",
                completed: false,
                metaText: "Scheduled Review"
            });
        }

        // 3. Brain Booster Quick Quiz
        agendaItems.push({
            id: "agenda_quiz",
            title: "Quick-Fire Attention Challenge",
            desc: "Short evaluation to test search time bounds.",
            type: "concept",
            completed: store.state.session.totalQuestionsAnswered > 0,
            metaText: "100 XP"
        });

        // 4. Planned Cognitive Break
        agendaItems.push({
            id: "agenda_break",
            title: "Mindfulness Break & Synapse Cooloff",
            desc: "Recommended 5-minute break to restore alpha brain waves.",
            type: "break",
            completed: this.isBreakMode && this.isRunning,
            metaText: "REST CYCLE"
        });

        this.renderAgendaChecklist(agendaItems);
    }

    // Render lists in UI
    renderAgendaChecklist(items) {
        // Main view checklist
        this.plannerChecklist.innerHTML = "";
        items.forEach(item => {
            const row = document.createElement("div");
            row.className = `planner-chk-item ${item.completed ? "checked" : ""}`;
            
            const badgeClass = item.type === "concept" ? "concept-pill" : item.type === "revision" ? "revision-pill" : "break-pill";
            
            row.innerHTML = `
                <div class="planner-chk-left">
                    <span class="material-icons-round chk-box">
                        ${item.completed ? "check_box" : "check_box_outline_blank"}
                    </span>
                    <div class="planner-item-details">
                        <span class="planner-item-title">${item.title}</span>
                        <span class="planner-item-desc">${item.desc}</span>
                    </div>
                </div>
                <div class="planner-pills">
                    ${item.isUrgent ? '<span class="planner-pill revision-pill" style="background-color: #ffe3e3; color: #ff5a5f;">URGENT</span>' : ''}
                    <span class="planner-pill ${badgeClass}">${item.metaText}</span>
                </div>
            `;
            
            row.addEventListener("click", () => {
                if (item.id === "agenda_core") {
                    window.app.switchView("tutor");
                } else if (item.id === "agenda_weakness") {
                    const activeSubId = store.state.session.activeSubjectId;
                    const activeSubject = SUBJECTS_DB[activeSubId] || SUBJECTS_DB.computer_science;
                    let weakest = null;
                    let lowest = 100;
                    Object.keys(activeSubject.concepts).forEach(nodeId => {
                        const score = store.state.mastery[nodeId] || 0;
                        if (score < lowest) {
                            lowest = score;
                            weakest = nodeId;
                        }
                    });
                    if (weakest) {
                        window.app.tutorModule.startConceptSession(activeSubId, weakest);
                    }
                    window.app.switchView("tutor");
                } else if (item.id === "agenda_break") {
                    this.triggerBreakMode();
                    window.app.switchView("planner");
                }
            });

            this.plannerChecklist.appendChild(row);
        });

        // Dashboard quick checklist
        this.dashboardAgendaList.innerHTML = "";
        items.slice(0, 3).forEach(item => {
            const row = document.createElement("div");
            row.className = `agenda-item ${item.completed ? "completed" : ""}`;
            
            row.innerHTML = `
                <div class="agenda-left">
                    <span class="material-icons-round chk-circle">
                        ${item.completed ? "check_circle" : "radio_button_unchecked"}
                    </span>
                    <span class="agenda-title">${item.title}</span>
                </div>
                <div class="agenda-meta ${item.isUrgent ? "urgent" : item.type === "revision" ? "review" : ""}">
                    ${item.metaText}
                </div>
            `;
            
            row.addEventListener("click", () => {
                window.app.switchView("tutor");
            });
            this.dashboardAgendaList.appendChild(row);
        });
    }

    // Pomodoro Timer controls
    toggleTimer() {
        if (this.isRunning) {
            this.pauseTimer();
        } else {
            this.startTimer();
        }
    }

    startTimer() {
        this.isRunning = true;
        this.btnPomoStart.innerHTML = `<span class="material-icons-round">pause</span> Pause Focus`;
        this.btnPomoStart.className = "btn btn-secondary";
        
        // Update glow colors
        this.pomoGlowState.style.backgroundColor = this.isBreakMode ? "var(--color-green)" : "var(--accent-color)";
        
        store.logTelemetry(`Pomodoro focus session started. Timer: ${Math.floor(this.secondsRemaining / 60)}m.`);

        this.timerInterval = setInterval(() => {
            this.secondsRemaining -= 1;
            
            // Increment active study counters if studying
            if (!this.isBreakMode) {
                this.continuousStudySeconds += 1;
                // Add Focus Time to profile every 60s
                if (this.continuousStudySeconds % 60 === 0) {
                    store.state.student.focusTimeToday += 60;
                    store.notify("xpGain", { amount: 0, total: store.state.student.xp, level: store.state.student.level });
                }
            }

            this.updateTimerDisplay();

            if (this.secondsRemaining <= 0) {
                this.handleTimerCompletion();
            }
        }, 1000);
    }

    pauseTimer() {
        this.isRunning = false;
        clearInterval(this.timerInterval);
        this.btnPomoStart.innerHTML = `<span class="material-icons-round">play_arrow</span> Resume Session`;
        this.btnPomoStart.className = "btn btn-primary";
        store.logTelemetry("Pomodoro session paused.");
    }

    resetTimer() {
        this.pauseTimer();
        this.secondsRemaining = this.isBreakMode ? 5 * 60 : 25 * 60;
        this.updateTimerDisplay();
        this.btnPomoStart.innerHTML = `<span class="material-icons-round">play_arrow</span> Start Session`;
        this.btnPomoStart.className = "btn btn-primary";
    }

    triggerBreakMode() {
        this.isBreakMode = true;
        this.secondsRemaining = 5 * 60;
        this.pomoStateLabel.textContent = "COGNITIVE BREAK";
        this.pomoGlowState.style.backgroundColor = "var(--color-green)";
        this.resetTimer();
    }

    handleTimerCompletion() {
        this.pauseTimer();
        if (!this.isBreakMode) {
            // Finished Study
            store.logTelemetry("Focus session completed! 25 minutes of deep learning logged.");
            store.addXP(150); // XP Reward
            store.unlockBadge("bst_focus");
            window.app.showNotification("🎯 Focus session completed! +150 XP rewarded.");
            
            // Automatically switch to break mode
            this.triggerBreakMode();
        } else {
            // Finished Break
            store.logTelemetry("Break session completed. Ready to re-engage.");
            window.app.showNotification("⚡ Break completed! Brain waves recharged. Ready to focus.");
            this.isBreakMode = false;
            this.secondsRemaining = 25 * 60;
            this.pomoStateLabel.textContent = "FOCUS SESSION";
            this.pomoGlowState.style.backgroundColor = "var(--accent-color)";
            this.resetTimer();
        }
    }

    updateTimerDisplay() {
        const mins = Math.floor(this.secondsRemaining / 60);
        const secs = this.secondsRemaining % 60;
        this.pomoMinutes.textContent = mins.toString().padStart(2, '0');
        this.pomoSeconds.textContent = secs.toString().padStart(2, '0');
    }

    // Fatigue Analysis Engine ticks
    updateFatigueStats() {
        const pomoStatContinuous = document.getElementById("pomo-stat-continuous");
        const pomoStatDegrade = document.getElementById("pomo-stat-degrade");
        const pomoStatRecommend = document.getElementById("pomo-stat-recommend");
        
        if (!pomoStatContinuous) return;

        // Render continuous study stats
        const minVal = Math.floor(this.continuousStudySeconds / 60);
        const secVal = this.continuousStudySeconds % 60;
        pomoStatContinuous.textContent = `${minVal}m ${secVal}s`;

        // Check for fatigue levels based on learner state
        const state = store.state.cognitiveState;
        
        if (state === "STRUGGLING") {
            pomoStatDegrade.textContent = "ATTENTION DROP DETECTED";
            pomoStatDegrade.className = "text-red";
            pomoStatRecommend.textContent = "Pause and seek guided hints";
            pomoStatRecommend.className = "text-yellow";
        } else if (this.continuousStudySeconds >= 600) { // 10 mins study
            pomoStatDegrade.textContent = "FATIGUE ACCUMULATING";
            pomoStatDegrade.className = "text-yellow";
            pomoStatRecommend.textContent = "Recommended break in next agenda";
            pomoStatRecommend.className = "text-yellow";
        } else {
            pomoStatDegrade.textContent = "NONE DETECTED";
            pomoStatDegrade.className = "text-green";
            pomoStatRecommend.textContent = "Maintain current momentum";
            pomoStatRecommend.className = "text-green";
        }
    }
}

export const planner = new PlannerModule();
export default planner;
