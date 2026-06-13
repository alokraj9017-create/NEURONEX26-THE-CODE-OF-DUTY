# AuraTutor - Emotion-Aware Adaptive Learning Assistant

A modern, open-ended educational companion built for the **Neuromorphism-in-Education Hackathon**. AuraTutor adapts lessons, quizzes, and study schedules in real-time by analyzing student interaction biometrics (pacing, error patterns, inactivity, and hints) to emulate human-like tutoring empathy.

---

## 🌟 Core Features

1. **Natural Language Tutoring**: Open-ended conversational interface capable of discussing Computer Science, Physics, and Mathematics.
2. **Dynamic Topic Routing**: Automatically detects shifts in user interest mid-session, seamlessly updating the dashboard, navigation headers, and checklist curriculum.
3. **Cognitive State Detection (Offline NLP / Live AI)**:
   * Emulates cognitive load metrics to categorize student states as **Focused**, **Struggling/Confused**, **Bored/Inactive**, or **Mastering**.
   * Adapts explanations on-the-fly: Standard (Balanced), Simplified (Analogy-driven), or Advanced (First-principles details).
4. **Bio-Telemetry Logs Feed**: Real-time logging of user activity, speed parameters, error sequences, and attention drifts.
5. **Adaptive Study Planner**: Spaced repetition schedule that prioritizes weak concepts alongside a Pomodoro Timer with an attention fatigue guard.
6. **Gamification Milestones**: XP tracking, level upgrades, and 8 unlockable Neumorphic achievement badges.
7. **Optional Gemini Live AI Integration**: Hidden Neumorphic settings panel to paste a Gemini API Key, routing conversations to a live LLM while filtering responses through the simulated biometric states.
8. **Premium Neumorphic UI**: Soft shadows, tactual rounded buttons, fluid transitions, and a state-based glowing backdrop (`#ambient-glow`).

---

## 🧠 Application of Neuromorphic Principles

AuraTutor bridges **Neuromorphic UX Design** and **Cognitive Neuroscience Logic**:

### Visual Neuromorphism (Sensory Calming)
* **Tactual Depths**: Soft Neumorphic shadows (`box-shadow: 8px 8px 16px #cfd7e3, -8px -8px 16px #ffffff`) mimic physical cards to reduce optical strain.
* **Biometric Chromatherapy**: Background ambient glow (`#ambient-glow`) shifts colors dynamically (Teal = Focus, Peach = Struggling, Amber = Inactive, Gold = Mastery) as a sensory bio-feedback indicator.

### Cognitive Neuromorphism (Neural Placity Engine)
* **Synaptic Plasticity Rules**: Mastery scores simulate synaptic weights. Active correct paths reinforce nodes (+25%), whereas mistakes and skips decay node strengths (-10%).
* **Neuromodulator Emulation**:
  * **Dopamine**: Unlocking badges and leveling XP rewards student habits.
  * **Norepinephrine & Arousal**: High idle times trigger a Quick-Fire Quiz to spark attention.
  * **Cortisol & Frustration**: High mistakes trigger immediate difficulty dampening and simplified visual analogies.
  * **Adenosine & Fatigue**: The Pomodoro timer tracks continuous learning and warns the student when cognitive stamina declines.

