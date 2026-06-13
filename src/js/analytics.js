// AuraTutor Analytics and Progress Module
// Renders mastery levels, custom weekly activity graphs, and maps weaknesses to immediate study cues.

import store from "./state.js";
import { SUBJECTS_DB } from "./data.js";

class AnalyticsModule {
    constructor() {
        this.masteryGrid = null;
        this.chartContainer = null;
        this.weakTopicsList = null;

        // Mock data for historical days
        this.mockWeeklyXP = {
            Mon: 150,
            Tue: 320,
            Wed: 450,
            Thu: 210,
            Fri: 580,
            Sat: 340
        };
    }

    // Bind DOM endpoints
    init() {
        this.masteryGrid = document.getElementById("analytics-mastery-grid");
        this.chartContainer = document.getElementById("activity-chart-container");
        this.weakTopicsList = document.getElementById("analytics-weak-topics-list");

        // Set up subscription updates
        store.subscribe("answerRecorded", this.renderAll.bind(this));
        store.subscribe("xpGain", this.renderAll.bind(this));
        store.subscribe("subjectChanged", this.renderAll.bind(this));
        store.subscribe("conceptChanged", this.renderAll.bind(this));

        // Render initial view
        this.renderAll();
    }

    // Refresh all sub-components
    renderAll() {
        this.renderTopicMastery();
        this.renderWeeklyChart();
        this.renderWeakTopics();
    }

    // Render topic mastery bars across all subjects
    renderTopicMastery() {
        if (!this.masteryGrid) return;
        this.masteryGrid.innerHTML = "";

        for (const [subId, subject] of Object.entries(SUBJECTS_DB)) {
            Object.values(subject.concepts).forEach(concept => {
                const score = store.state.mastery[concept.id] || 0;
                
                // Calculate ranks
                let rank = "Novice";
                let badgeClass = "low";
                let colorClass = "orange";
                if (score > 85) {
                    rank = "Expert";
                    badgeClass = "high";
                    colorClass = "green";
                } else if (score >= 60) {
                    rank = "Proficient";
                    badgeClass = "high";
                    colorClass = "blue";
                } else if (score > 25) {
                    rank = "Apprentice";
                    badgeClass = "mid";
                    colorClass = "orange";
                }

                const card = document.createElement("div");
                card.className = "mastery-bar-card";
                card.innerHTML = `
                    <div class="mastery-meta" style="flex-direction: column; align-items: flex-start; gap: 4px;">
                        <span style="font-size: 8px; color: var(--text-tertiary); text-transform: uppercase; font-weight: bold; letter-spacing: 0.5px;">${subject.title}</span>
                        <span style="font-weight: 700;">${concept.title}</span>
                        <span class="mastery-badge ${badgeClass}" style="margin-top: 4px;">${rank} (${score}%)</span>
                    </div>
                    <div class="mastery-progress-bar" style="margin-top: 6px;">
                        <div class="mastery-progress-fill ${colorClass}" style="width: ${score}%;"></div>
                    </div>
                `;
                this.masteryGrid.appendChild(card);
            });
        }
    }

    // Render Weekly Neumorphic Bar Graph
    renderWeeklyChart() {
        if (!this.chartContainer) return;
        this.chartContainer.innerHTML = "";

        const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
        const todayIdx = new Date().getDay(); // 0 = Sun, 1 = Mon, etc.
        const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        const todayLabel = dayNames[todayIdx];

        const todayXP = Math.min(650, store.state.student.xp % 600 + 50);
        const maxXPVal = 700; // base height ratio

        days.forEach(day => {
            let xp = this.mockWeeklyXP[day] || 0;
            if (day === todayLabel) {
                xp = todayXP;
            }

            const heightPct = Math.max(10, Math.min(95, (xp / maxXPVal) * 100));

            const col = document.createElement("div");
            col.className = "bar-column";
            
            const isToday = (day === todayLabel);
            const activeClass = isToday ? "active" : "";

            col.innerHTML = `
                <div class="bar-shape-track neumorphic-inset" style="height: 100%; width: 14px; position: relative; border-radius: 7px; overflow: hidden;">
                    <div class="bar-shape ${activeClass}" style="height: ${heightPct}%; width: 100%; position: absolute; bottom: 0; border-radius: 7px; transition: height 0.5s ease;"></div>
                </div>
                <span class="bar-label" ${isToday ? 'style="color: var(--accent-color); font-weight: 800;"' : ''}>${day}</span>
            `;
            
            col.className += " tooltip";
            col.setAttribute("data-tooltip", `${xp} XP earned`);

            this.chartContainer.appendChild(col);
        });
    }

    // Render Weak Topics list dynamically
    renderWeakTopics() {
        if (!this.weakTopicsList) return;
        this.weakTopicsList.innerHTML = "";

        const weakNodes = [];
        
        for (const [nodeId, score] of Object.entries(store.state.mastery)) {
            if (score < 70) {
                // Find subject and concept details
                let conceptDetails = null;
                let subjectId = null;
                
                for (const [subId, sub] of Object.entries(SUBJECTS_DB)) {
                    if (sub.concepts[nodeId]) {
                        conceptDetails = sub.concepts[nodeId];
                        subjectId = subId;
                        break;
                    }
                }
                
                if (conceptDetails) {
                    weakNodes.push({ id: nodeId, score, conceptDetails, subjectId });
                }
            }
        }

        if (weakNodes.length === 0) {
            this.weakTopicsList.innerHTML = `
                <div class="learning-insights neumorphic-inset" style="text-align: center; color: var(--color-green);">
                    <span class="material-icons-round" style="font-size: 36px; margin-bottom: 6px;">check_circle</span>
                    <p><strong>Perfect Cognitive Balance!</strong> All topic mastery levels are above 70%. Your semantic tree structure is balanced.</p>
                </div>
            `;
            return;
        }

        weakNodes.forEach(node => {
            const item = document.createElement("div");
            item.className = "weak-topic-item";
            item.innerHTML = `
                <div class="weak-topic-left" style="display:flex; flex-direction:column; gap:2px;">
                    <span style="font-size: 8px; color: var(--text-tertiary); text-transform: uppercase; font-weight: bold;">${SUBJECTS_DB[node.subjectId].title}</span>
                    <h4 style="font-size:12px; font-weight: 700;">${node.conceptDetails.title}</h4>
                    <p style="font-size:9px; color:var(--text-secondary);">Current Mastery: ${node.score}% • Target: 75%</p>
                </div>
                <button class="btn btn-secondary btn-small btn-danger" style="box-shadow: var(--shadow-flat-sm)">
                    Study
                </button>
            `;
            
            item.querySelector("button").addEventListener("click", () => {
                window.app.tutorModule.startConceptSession(node.subjectId, node.id);
                window.app.switchView("tutor");
            });

            this.weakTopicsList.appendChild(item);
        });
    }
}

export const analytics = new AnalyticsModule();
export default analytics;
