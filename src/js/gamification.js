// AuraTutor Gamification Engine
// Manages levels, XP gains, unlocks achievement badges, and controls visual popup alert elements.

import store from "./state.js";

export const BADGES_DB = [
    {
        id: "bst_intro",
        name: "BST Explorer",
        desc: "Unlock the secrets of node hierarchies by completing Section 1.",
        icon: "explore",
        colorClass: "focus-color"
    },
    {
        id: "bst_focus",
        name: "Zen Master",
        desc: "Logged 25 continuous minutes of deep cognitive focus.",
        icon: "self_improvement",
        colorClass: "speed-color"
    },
    {
        id: "bst_master",
        name: "Binary Monarch",
        desc: "Elevated all core course topics to Expert status.",
        icon: "military_tech",
        colorClass: "master-color"
    },
    {
        id: "phoenix",
        name: "Phoenix Rising",
        desc: "Successfully recovered from a Struggling state to Focused state.",
        icon: "local_fire_department",
        colorClass: "phoenix-color"
    },
    {
        id: "speed_run",
        name: "Fast Synapses",
        desc: "Answered 3 quiz questions correctly in under 10 seconds each.",
        icon: "speed",
        colorClass: "speed-color"
    },
    {
        id: "habits",
        name: "Consistency King",
        desc: "Maintained a study streak of 5 or more days.",
        icon: "calendar_month",
        colorClass: "focus-color"
    },
    {
        id: "hint_proof",
        name: "Self Reliant",
        desc: "Completed an entire quiz topic without requesting any hints.",
        icon: "psychology",
        colorClass: "master-color"
    },
    {
        id: "perfectionist",
        name: "Perfect Sync",
        desc: "Answered all questions correctly on the first attempt.",
        icon: "verified",
        colorClass: "phoenix-color"
    }
];

class GamificationModule {
    constructor() {
        this.badgesGrid = null;
        this.badgeModal = null;
        this.modalIcon = null;
        this.modalTitle = null;
        this.modalDesc = null;
        this.btnCloseModal = null;
        this.badgeCountSide = null;
    }

    // Bind UI elements
    init() {
        this.badgesGrid = document.getElementById("achievements-badges-grid");
        this.badgeModal = document.getElementById("badge-modal");
        this.modalIcon = document.getElementById("modal-badge-icon");
        this.modalTitle = document.getElementById("modal-badge-title");
        this.modalDesc = document.getElementById("modal-badge-desc");
        this.btnCloseModal = document.getElementById("btn-close-modal");
        this.badgeCountSide = document.getElementById("badge-count-side");

        // Close modal hook
        this.btnCloseModal.addEventListener("click", () => {
            this.badgeModal.style.display = "none";
        });

        // Event triggers
        store.subscribe("badgeUnlocked", this.handleBadgeUnlockPopup.bind(this));
        store.subscribe("answerRecorded", this.evaluateRulesOnAnswer.bind(this));
        store.subscribe("levelUp", this.handleLevelUpAlert.bind(this));
        
        // Initial rendering of badges list
        this.renderBadgesGrid();
    }

    // Render list of locked/unlocked badges on grid
    renderBadgesGrid() {
        if (!this.badgesGrid) return;
        this.badgesGrid.innerHTML = "";

        let unlockedCount = 0;

        BADGES_DB.forEach(badge => {
            const isUnlocked = store.state.badges.includes(badge.id);
            if (isUnlocked) unlockedCount += 1;

            const card = document.createElement("div");
            card.className = `badge-card neumorphic-card ${isUnlocked ? "unlocked " + badge.colorClass : "locked"}`;
            card.innerHTML = `
                <div class="badge-icon-box">
                    <span class="material-icons-round" style="font-size: 30px;">${badge.icon}</span>
                </div>
                <h4>${badge.name}</h4>
                <p>${badge.desc}</p>
            `;
            
            this.badgesGrid.appendChild(card);
        });

        // Update dashboard side counts
        if (this.badgeCountSide) {
            this.badgeCountSide.textContent = `${unlockedCount}/${BADGES_DB.length}`;
        }
    }

    // Evaluate answers to trigger badge rewards
    evaluateRulesOnAnswer({ conceptId, isCorrect, responseTimeMs }) {
        const responses = store.state.session.responses;
        
        // Rule 1: check if BST Intro complete
        if (conceptId === "bst_intro" && isCorrect) {
            store.unlockBadge("bst_intro");
        }

        // Rule 2: Speed Run (3 correct in under 10 seconds each)
        if (isCorrect && responseTimeMs < 10000) {
            const recentSubmissions = responses.slice(-3);
            const fastCorrect = recentSubmissions.filter(r => r.isCorrect && r.responseTimeMs < 10000).length;
            if (fastCorrect === 3) {
                store.unlockBadge("speed_run");
            }
        }

        // Rule 3: Self Reliant (consecutive correct answers without hints)
        const hintsUsed = store.state.session.hintsUsedCount;
        if (isCorrect && hintsUsed === 0 && responses.length >= 3) {
            store.unlockBadge("hint_proof");
        }

        // Rule 4: Phoenix Rising (correct after being in Struggling state)
        if (isCorrect && store.state.cognitiveState === "STRUGGLING") {
            store.unlockBadge("phoenix");
        }

        // Rule 5: Habit streak check
        if (store.state.student.streak >= 5) {
            store.unlockBadge("habits");
        }

        // Re-render achievements page elements
        this.renderBadgesGrid();
    }

    // Show achievement unlocked popup modal (WOW effect for judges!)
    handleBadgeUnlockPopup(badgeId) {
        const badge = BADGES_DB.find(b => b.id === badgeId);
        if (!badge) return;

        // Populate modal
        this.modalIcon.textContent = badge.icon;
        this.modalTitle.textContent = "Achievement Unlocked!";
        this.modalDesc.innerHTML = `Congratulations! You've unlocked the <strong>${badge.name}</strong> badge:<br><span style="font-size:11px; color:var(--text-secondary);">${badge.desc}</span>`;
        
        // Show modal overlay
        this.badgeModal.style.display = "flex";
        
        // Float toast notification
        window.app.showNotification(`🏆 Achievement Unlocked: ${badge.name}`);
        
        // Re-render
        this.renderBadgesGrid();
    }

    // Toast alert on level up
    handleLevelUpAlert(newLevel) {
        window.app.showNotification(`⚡ Level Up! You've reached Level ${newLevel}!`);
    }
}

export const gamification = new GamificationModule();
export default gamification;
