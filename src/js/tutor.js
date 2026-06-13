// AuraTutor Open-Ended AI Tutor Engine
// Coordinates natural language routing, topic shifting, simulated generative states, and live Gemini API queries.

import store from "./state.js";
import { SUBJECTS_DB, KEYWORDS_MAP } from "./data.js";

class TutorEngine {
    constructor() {
        this.chatContainer = null;
        this.optionsContainer = null;
        this.hintBar = null;
        this.hintText = null;
        this.nextHintBtn = null;
        this.conceptBreadcrumb = null;
        this.conceptStepsList = null;
        
        this.chatTextInput = null;
        this.btnSendChat = null;

        this.currentSubjectId = "computer_science";
        this.currentConceptId = "bst_intro";
        this.currentStage = "explanation"; // "explanation", "quiz", "result", "chatting"
        
        this.activeQuestion = null;
        this.activeHints = [];
        this.currentHintIndex = 0;
    }

    // Initialize layout binds and listeners
    init() {
        this.chatContainer = document.getElementById("chat-messages-container");
        this.optionsContainer = document.getElementById("chat-options-container");
        this.hintBar = document.getElementById("tutor-hint-bar");
        this.hintText = document.getElementById("tutor-hint-text");
        this.nextHintBtn = document.getElementById("btn-next-hint");
        this.conceptBreadcrumb = document.getElementById("tutor-breadcrumb");
        this.conceptStepsList = document.getElementById("tutor-concept-steps-list");
        
        this.chatTextInput = document.getElementById("chat-text-input");
        this.btnSendChat = document.getElementById("btn-send-chat");

        // Event hooks
        document.getElementById("btn-request-hint").addEventListener("click", this.handleRequestHint.bind(this));
        document.getElementById("btn-skip-topic").addEventListener("click", this.handleSkipTopic.bind(this));
        this.nextHintBtn.addEventListener("click", this.showNextHint.bind(this));
        
        // Chat text submits
        this.btnSendChat.addEventListener("click", this.submitUserChat.bind(this));
        this.chatTextInput.addEventListener("keydown", (e) => {
            if (e.key === "Enter") this.submitUserChat();
        });
        
        // Listen to store triggers
        store.subscribe("stateChange", this.handleCognitiveStateAdaptation.bind(this));
        store.subscribe("subjectChanged", ({ newSubject }) => {
            this.currentSubjectId = newSubject;
            this.renderConceptSidebarList();
        });
        store.subscribe("conceptChanged", (conceptId) => {
            this.currentConceptId = conceptId;
            this.syncConceptProgressIndicators();
        });

        // Set subject/concept in state
        this.currentSubjectId = store.state.session.activeSubjectId;
        this.currentConceptId = store.state.session.activeConceptId;

        // Draw sidebar checklist
        this.renderConceptSidebarList();

        // Launch welcome session
        this.startWelcomeSession();
    }

    // Sidebar list renderer
    renderConceptSidebarList() {
        this.conceptStepsList.innerHTML = "";
        const subject = SUBJECTS_DB[this.currentSubjectId] || SUBJECTS_DB.computer_science;
        
        Object.values(subject.concepts).forEach((concept, index) => {
            const step = document.createElement("div");
            step.className = `concept-step ${this.currentConceptId === concept.id ? "active" : ""}`;
            step.id = `step-item-${concept.id}`;
            step.innerHTML = `
                <div class="step-dot"></div>
                <div class="step-title">${concept.title}</div>
            `;
            step.addEventListener("click", () => {
                this.startConceptSession(this.currentSubjectId, concept.id);
            });
            this.conceptStepsList.appendChild(step);
        });

        // Update breadcrumb
        const currentConcept = subject.concepts[this.currentConceptId];
        if (currentConcept) {
            this.conceptBreadcrumb.textContent = `${subject.title}: ${currentConcept.title}`;
        }
    }

    syncConceptProgressIndicators() {
        const subject = SUBJECTS_DB[this.currentSubjectId];
        if (!subject) return;

        const conceptKeys = Object.keys(subject.concepts);
        const activeIdx = conceptKeys.indexOf(this.currentConceptId);

        const steps = this.conceptStepsList.querySelectorAll(".concept-step");
        steps.forEach((s, idx) => {
            s.classList.remove("active", "completed");
            if (idx === activeIdx) s.classList.add("active");
            if (idx < activeIdx) s.classList.add("completed");
        });

        const currentConcept = subject.concepts[this.currentConceptId];
        if (currentConcept) {
            this.conceptBreadcrumb.textContent = `${subject.title}: ${currentConcept.title}`;
        }
    }

    // Start welcome chat dialogue
    startWelcomeSession() {
        this.chatContainer.innerHTML = "";
        this.hintBar.style.display = "none";
        
        this.appendMessage("tutor", `👋 Hello! I am **Aura**, your emotion-aware learning companion. 
        
I adapt my explanations and quizzes to your focus and stress levels in real-time. Feel free to ask me any questions in natural language, or explore these topics:
* **Computer Science** (Binary Search Trees, Recursion, Databases)
* **Physics** (Spacetime Gravity, Quantum Superposition, Photosynthesis)
* **Mathematics** (Calculus Derivatives, Algebra Equations)`);
        
        this.currentStage = "chatting";
        this.renderSuggestionChips();
    }

    // Render quick-selection helper suggestion chips
    renderSuggestionChips() {
        this.optionsContainer.innerHTML = "";
        
        const suggestions = [
            "Teach me Binary Search Trees 🌳",
            "What is Quantum Physics? ⚛️",
            "Explain Recursion simply 🔁",
            "What is a Derivative in Calculus? 📉",
            "Let's test my knowledge with a Quiz! ✍️",
            "I'm feeling stuck / confused 🧠"
        ];

        suggestions.forEach(sug => {
            this.addOptionButton(sug, () => {
                this.chatTextInput.value = sug.replace(/[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF]/g, "").trim();
                this.submitUserChat();
            });
        });
    }

    // Start session on a specific subject and concept
    startConceptSession(subjectId, conceptId) {
        store.setSubject(subjectId);
        store.setActiveConcept(conceptId);
        
        this.chatContainer.innerHTML = "";
        this.hintBar.style.display = "none";
        
        const concept = SUBJECTS_DB[subjectId].concepts[conceptId];
        this.appendMessage("tutor", `🚀 Transitioning to **${concept.title}**! Let's build your neural pathways.`);
        
        this.currentStage = "explanation";
        this.renderAdaptiveExplanation(concept);
    }

    // Adjust chat rendering depending on state updates
    handleCognitiveStateAdaptation({ oldState, newState }) {
        const currentActiveView = document.querySelector(".view-panel.active").id;
        if (currentActiveView !== "view-tutor") return;

        const concept = SUBJECTS_DB[this.currentSubjectId].concepts[this.currentConceptId];

        if (newState === "STRUGGLING" && oldState !== "STRUGGLING") {
            this.appendMessage("tutor", `🤖 *Aura Note:* I notice your focus is dropping or errors are increasing. No stress! Let's look at this concept with a **simplified analogy**...`, "simplified-style");
            this.appendMessage("tutor", concept.explanations.simplified, "simplified-style");
            this.offerExplanationNextOptions();
        } 
        else if (newState === "BORED" && oldState !== "BORED") {
            this.appendMessage("tutor", `⚡ *Attention Spark:* Let's jumpstart your engagement! How about a quick active challenge question?`, "bored-style");
            this.offerBoredActiveQuizOption();
        }
        else if (newState === "MASTERING" && oldState !== "MASTERING") {
            this.appendMessage("tutor", `🔥 *Cognitive Synergy:* Excellent speed and accuracy! Check out the **advanced mathematical/algorithmic** logic for this topic:`);
            this.appendMessage("tutor", concept.explanations.advanced);
            this.offerExplanationNextOptions();
        }
    }

    // Render adaptive explanations
    renderAdaptiveExplanation(concept) {
        let text = concept.explanations.standard;
        let styleClass = "";

        if (store.state.cognitiveState === "STRUGGLING") {
            text = concept.explanations.simplified;
            styleClass = "simplified-style";
        } else if (store.state.cognitiveState === "MASTERING") {
            text = concept.explanations.advanced;
        }

        setTimeout(() => {
            this.appendMessage("tutor", text, styleClass);
            this.offerExplanationNextOptions();
        }, 500);
    }

    offerExplanationNextOptions() {
        this.optionsContainer.innerHTML = "";
        
        this.addOptionButton("🧠 Test My Understanding (Quiz)", () => {
            this.startQuizStage();
        });
        this.addOptionButton("❓ Ask a Custom Question", () => {
            this.chatTextInput.focus();
            this.showNotification("Type your question in the text input box below!");
        });
        this.addOptionButton("🏠 Return to main menu", () => {
            this.startWelcomeSession();
        });
    }

    // Start quiz question
    startQuizStage() {
        this.currentStage = "quiz";
        this.hintBar.style.display = "none";
        this.optionsContainer.innerHTML = "";

        const concept = SUBJECTS_DB[this.currentSubjectId].concepts[this.currentConceptId];
        let q = concept.question;

        // Choose question level
        if (store.state.cognitiveState === "STRUGGLING" && q.simplifiedVariant) {
            q = q.simplifiedVariant;
            this.appendMessage("tutor", "Let's work through a guided helper question first:");
        } else if (store.state.cognitiveState === "MASTERING" && q.advancedVariant) {
            q = q.advancedVariant;
            this.appendMessage("tutor", "🚀 Bumping up difficulty. Challenge yourself with this advanced problem:");
        } else {
            this.appendMessage("tutor", "Evaluate your understanding:");
        }

        this.activeQuestion = q;
        this.activeHints = q.hints || [];
        this.currentHintIndex = 0;
        store.state.session.questionStartTime = Date.now();

        setTimeout(() => {
            this.appendMessage("tutor", `**Question:**\n${q.text}`);
            this.renderQuizChoices(q);
        }, 500);
    }

    renderQuizChoices(question) {
        this.optionsContainer.innerHTML = "";
        question.options.forEach((opt, idx) => {
            this.addOptionButton(opt, () => {
                this.handleAnswerSubmission(idx);
            });
        });
    }

    handleAnswerSubmission(selectedIdx) {
        const responseTimeMs = Date.now() - store.state.session.questionStartTime;
        const question = this.activeQuestion;
        const isCorrect = (selectedIdx === question.correctAnswer);
        const concept = SUBJECTS_DB[this.currentSubjectId].concepts[this.currentConceptId];

        this.appendMessage("user", question.options[selectedIdx]);
        store.recordAnswer(concept.id, isCorrect, responseTimeMs);

        setTimeout(() => {
            if (isCorrect) {
                this.appendMessage("tutor", `🎉 **Correct!** Excellent processing. Time: **${Math.round(responseTimeMs/1000)}s**.`);
                
                let xp = 50;
                if (store.state.cognitiveState === "MASTERING") xp = 80;
                if (responseTimeMs < 8000) xp += 10;
                store.addXP(xp);

                this.currentStage = "result";
                this.offerQuizResultOptions();
            } else {
                this.appendMessage("tutor", `❌ **Incorrect Answer.** Let's analyze this.`);
                
                const errors = store.state.session.consecutiveErrors;
                if (errors >= 2) {
                    this.appendMessage("tutor", `📚 You've hit a conceptual block. I'm updating your dashboard and adapting this lesson to a simplified, visual format.`);
                    setTimeout(() => {
                        this.startConceptSession(this.currentSubjectId, this.currentConceptId);
                    }, 1200);
                } else {
                    this.appendMessage("tutor", `💡 *Hint:* Here is a helpful tip to guide you:`);
                    this.handleRequestHint();
                    this.renderQuizChoices(question);
                }
            }
        }, 600);
    }

    offerQuizResultOptions() {
        this.optionsContainer.innerHTML = "";
        const conceptKeys = Object.keys(SUBJECTS_DB[this.currentSubjectId].concepts);
        const currentIdx = conceptKeys.indexOf(this.currentConceptId);
        
        const isLast = (currentIdx === conceptKeys.length - 1);

        if (!isLast) {
            this.addOptionButton("Next Concept Module ➡️", () => {
                this.startConceptSession(this.currentSubjectId, conceptKeys[currentIdx + 1]);
            });
        } else {
            this.addOptionButton("🎓 Finish Course & View Analytics", () => {
                store.unlockBadge("bst_master");
                window.app.switchView("analytics");
            });
        }
        
        this.addOptionButton("🔄 Re-study this concept", () => {
            this.startConceptSession(this.currentSubjectId, this.currentConceptId);
        });

        this.addOptionButton("🏠 Return to Main Menu", () => {
            this.startWelcomeSession();
        });
    }

    offerBoredActiveQuizOption() {
        this.optionsContainer.innerHTML = "";
        this.addOptionButton("⚡ Jump Straight to Quick Quiz!", () => {
            this.appendMessage("user", "Start the quick quiz!");
            this.startQuizStage();
        });
        this.addOptionButton("📖 Continue normal study flow", () => {
            this.appendMessage("user", "Continue studying.");
            this.renderAdaptiveExplanation(SUBJECTS_DB[this.currentSubjectId].concepts[this.currentConceptId]);
        });
    }

    // Submit user natural language query
    async submitUserChat() {
        const text = this.chatTextInput.value.trim();
        if (!text) return;

        this.chatTextInput.value = "";
        
        // Print message
        this.appendMessage("user", text);
        store.recordQuery(text);
        
        this.currentStage = "chatting";
        
        // Show loader/thinking bubble
        const thinkingBubble = document.createElement("div");
        thinkingBubble.className = "chat-bubble tutor";
        thinkingBubble.id = "aura-thinking-bubble";
        thinkingBubble.innerHTML = `
            <div class="bubble-meta">Aura AI Tutor</div>
            <div class="bubble-text" style="display:flex; gap: 4px; align-items:center;">
                <span class="material-icons-round text-blue" style="animation: spin 1s infinite linear;">sync</span> <span>Analyzing query and cognitive states...</span>
            </div>
        `;
        this.chatContainer.appendChild(thinkingBubble);
        this.chatContainer.scrollTop = this.chatContainer.scrollHeight;

        const apiKey = store.state.session.apiKey;

        try {
            if (apiKey) {
                // Query real Gemini API!
                await this.fetchGeminiResponse(text, apiKey);
            } else {
                // Offline Local Router & Simulator
                setTimeout(() => {
                    this.removeThinkingBubble();
                    this.routeQueryOffline(text);
                }, 1000);
            }
        } catch (err) {
            console.error("Gemini query failed. Falling back to offline matcher.", err);
            this.removeThinkingBubble();
            this.appendMessage("tutor", `⚠️ *System Alert:* Live AI request failed. Falling back to local offline processor.`);
            this.routeQueryOffline(text);
        }
    }

    removeThinkingBubble() {
        const bubble = document.getElementById("aura-thinking-bubble");
        if (bubble) bubble.remove();
    }

    // Fetch live response from Google Gemini API
    async fetchGeminiResponse(userQuery, key) {
        const systemPrompt = `You are AuraTutor, a highly supportive, empathetic, and expert Neumorphic AI learning companion.
The student is currently in a state of: ${store.state.cognitiveState} (Focused, Struggling, Bored, or Mastering).
The active subject is: ${SUBJECTS_DB[this.currentSubjectId].title}. The active concept is: ${this.currentConceptId}.

ADAPTATION INSTRUCTIONS:
- If state is STRUGGLING: Your tone should be extremely warm and supportive. Simplify your language immediately. Use standard real-world analogies (e.g. Russian dolls, scale balances). Break down complex concepts into micro-steps.
- If state is BORED: Keep your response punchy, high-energy, and brief. Wrap up by challenging them to a quiz or asking them a direct question to get them thinking.
- If state is MASTERING: Provide advanced first-principles mathematical logic, pseudocode syntax, or optimization parameters. Accelerate the pace.
- If state is FOCUSED: Give a clear, clean educational explanation.

Formatting: Use markdown (e.g., bolding **, bullet lists *, code blocks). Limit responses to 150 words max. Speak directly to the student. Do not reference these meta-rules in your response.`;

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                contents: [
                    {
                        role: "user",
                        parts: [{ text: `${systemPrompt}\n\nStudent Query: "${userQuery}"` }]
                    }
                ]
            })
        });

        const data = await response.json();
        this.removeThinkingBubble();

        if (data.candidates && data.candidates[0] && data.candidates[0].content) {
            const reply = data.candidates[0].content.parts[0].text;
            this.appendMessage("tutor", reply);
            this.optionsContainer.innerHTML = "";
            this.addOptionButton("✍️ Start a Topic Quiz", () => this.startQuizStage());
            this.addOptionButton("🏠 Main Menu", () => this.startWelcomeSession());
        } else {
            throw new Error("Invalid API response format");
        }
    }

    // Offline keyword router and generative responder
    routeQueryOffline(query) {
        const lowerQuery = query.toLowerCase();
        
        // 1. Check if the user is asking for a quiz
        if (lowerQuery.includes("quiz") || lowerQuery.includes("test") || lowerQuery.includes("exam")) {
            this.startQuizStage();
            return;
        }

        // 2. Check for hints/stuck cues
        if (lowerQuery.includes("hint") || lowerQuery.includes("stuck") || lowerQuery.includes("confused")) {
            store.setCognitiveState("STRUGGLING");
            this.startQuizStage();
            return;
        }

        // 3. Scan for topic shifts in our keyword maps
        let matchedKeyword = null;
        for (const key of Object.keys(KEYWORDS_MAP)) {
            if (lowerQuery.includes(key)) {
                matchedKeyword = KEYWORDS_MAP[key];
                break;
            }
        }

        if (matchedKeyword) {
            const { subjectId, conceptId } = matchedKeyword;
            
            // Check if it's a smooth shift or a standard progression
            if (subjectId !== this.currentSubjectId || conceptId !== this.currentConceptId) {
                store.logTelemetry(`Smooth topic shift detected to ${conceptId.toUpperCase()}.`);
                this.startConceptSession(subjectId, conceptId);
            } else {
                this.renderAdaptiveExplanation(SUBJECTS_DB[subjectId].concepts[conceptId]);
            }
            return;
        }

        // 4. Fallback Generative NLP Simulator
        this.generateOfflineResponse(query);
    }

    // Generates a dynamic offline reply based on query verbs and nouns
    generateOfflineResponse(userQuery) {
        const queryWords = userQuery.toLowerCase().replace(/[^a-zA-Z ]/g, "").split(" ");
        
        // Extract a key noun/subject of interest
        const stopWords = ["what", "is", "explain", "how", "why", "the", "a", "an", "does", "do", "you", "tell", "me", "about", "your", "name", "who", "are"];
        const nouns = queryWords.filter(w => w.length > 3 && !stopWords.includes(w));
        const focusNoun = nouns[0] || "that concept";

        const state = store.state.cognitiveState;
        let reply = "";

        if (userQuery.toLowerCase().includes("joke")) {
            reply = this.nerdyJoke();
        } 
        else if (userQuery.toLowerCase().includes("name") || userQuery.toLowerCase().includes("who are you")) {
            reply = "I am **Aura**, your emotion-aware learning companion. I scan your response patterns and adapt topics, quizzes, and hints to optimize your learning flow!";
        }
        else if (state === "STRUGGLING") {
            reply = `That is a really interesting question about **${focusNoun}**! 
            
Let's visualize it simply: Imagine it's like a bucket filling up with water. If you pour too fast, it overflows. 
To study this:
1. Break it down into small items.
2. Ask for simple analogies.
3. Take a quick break.

Would you like to try a structured quiz on **${SUBJECTS_DB[this.currentSubjectId].concepts[this.currentConceptId].title}** to solidify the basics?`;
        } 
        else if (state === "MASTERING") {
            reply = `Fascinating investigation regarding **${focusNoun}**. 
            
Analyzing this from first-principles:
* **Algorithmic boundaries**: Usually bounded by logarithmic curves $O(\\log n)$.
* **Complexity matrices**: Represents structural partitions of information in memory.
* **Geodesic properties**: Maps nodes to a coordinate space optimizing search intervals.

Would you like to take an **Advanced Challenge Quiz** on our current topic to test your limits?`;
        } 
        else if (state === "BORED") {
            reply = `Ah, **${focusNoun}** is a cool subject! 
            
Let's spark your synapse circuits! Instead of reading a paragraph, let's jump directly into a quick trivia question on our active syllabus: **${SUBJECTS_DB[this.currentSubjectId].concepts[this.currentConceptId].title}**. Ready?`;
        } 
        else {
            reply = `I'd love to discuss **${focusNoun}** with you! 
            
In our active curriculum of **${SUBJECTS_DB[this.currentSubjectId].title}**, we study how structured parameters interact. 
* To see how this applies, we can check out the lesson details.
* Or we can run a quick diagnostic test to measure your understanding.

What is your preferred next path?`;
        }

        this.appendMessage("tutor", reply);
        
        // Show options
        this.optionsContainer.innerHTML = "";
        this.addOptionButton("✍️ Take Active Quiz", () => this.startQuizStage());
        this.addOptionButton("📖 Re-Explain Active Topic", () => {
            this.renderAdaptiveExplanation(SUBJECTS_DB[this.currentSubjectId].concepts[this.currentConceptId]);
        });
        this.addOptionButton("🏠 Main Menu", () => this.startWelcomeSession());
    }

    nerdyJoke() {
        const jokes = [
            "Why do programmers prefer dark mode? Because light attracts bugs! 🐜",
            "Why did the binary tree go to the dentist? It needed a root canal! 🦷",
            "There are 10 types of people in the world: those who understand binary, and those who don't. 🔢",
            "Why can't subatomic particles ever get along? Because they have too much spin! ⚛️",
            "What is a derivative's favorite ride at the amusement park? The tangent line! 🎢"
        ];
        const idx = Math.floor(Math.random() * jokes.length);
        return jokes[idx];
    }

    // Request hint
    handleRequestHint() {
        if (this.currentStage !== "quiz") {
            this.showNotification("Hints are only active during quiz questions!");
            return;
        }

        store.state.session.hintsUsedCount += 1;
        this.activeHints = this.activeQuestion.hints || [];

        if (this.activeHints.length === 0) {
            this.hintBar.style.display = "none";
            return;
        }

        this.currentHintIndex = 0;
        this.displayHint(this.activeHints[0]);
    }

    displayHint(text) {
        this.hintText.textContent = text;
        this.hintBar.style.display = "flex";
        
        if (this.currentHintIndex < this.activeHints.length - 1) {
            this.nextHintBtn.style.display = "block";
            this.nextHintBtn.textContent = "More Help";
        } else {
            this.nextHintBtn.style.display = "none";
        }
    }

    showNextHint() {
        this.currentHintIndex += 1;
        if (this.currentHintIndex < this.activeHints.length) {
            this.displayHint(this.activeHints[this.currentHintIndex]);
        }
    }

    handleSkipTopic() {
        const conceptKeys = Object.keys(SUBJECTS_DB[this.currentSubjectId].concepts);
        const currentIdx = conceptKeys.indexOf(this.currentConceptId);
        
        if (currentIdx === conceptKeys.length - 1) {
            this.appendMessage("tutor", "You are at the final concept module for this subject. Try answering the quiz!");
            return;
        }

        this.appendMessage("user", "Skip this topic.");
        store.logTelemetry(`Topic ${this.currentConceptId} skipped by student.`);
        this.startConceptSession(this.currentSubjectId, conceptKeys[currentIdx + 1]);
    }

    addOptionButton(text, callback) {
        const btn = document.createElement("button");
        btn.className = "btn option-btn";
        btn.textContent = text;
        btn.addEventListener("click", callback);
        this.optionsContainer.appendChild(btn);
    }

    appendMessage(sender, text, styleClass = "") {
        const bubble = document.createElement("div");
        bubble.className = `chat-bubble ${sender} ${styleClass}`;
        
        const senderName = sender === "tutor" ? "Aura AI Tutor" : "You";
        const htmlText = this.parseSimpleMarkdown(text);

        bubble.innerHTML = `
            <div class="bubble-meta">${senderName}</div>
            <div class="bubble-text">${htmlText}</div>
        `;
        
        this.chatContainer.appendChild(bubble);
        this.chatContainer.scrollTop = this.chatContainer.scrollHeight;
    }

    parseSimpleMarkdown(text) {
        let html = text;
        html = html.replace(/</g, "&lt;").replace(/>/g, "&gt;");
        html = html.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
        html = html.replace(/\n\*\s(.*?)/g, "<br>• $1");
        html = html.replace(/`(.*?)`/g, "<code>$1</code>");
        html = html.replace(/\n/g, "<br>");
        return html;
    }

    showNotification(msg) {
        window.app.showNotification(msg);
    }
}

export const tutor = new TutorEngine();
export default tutor;
