"use strict";

const app = document.querySelector("#app");

const ANSWERS = ["Person A", "Person B", "Both", "Not sure"];
const SCENE_COUNT = 6;

function createInitialState() {
  return {
    currentScene: 1,
    currentPerspective: "b",
    pendingInitialAnswer: null,
    initialAnswer: null,
    finalAnswer: null,
    unlockedInformation: {
      bPhone: false,
      bTicket: false,
      aPhone: false,
      freeSwitching: false,
    },
    revealedDrafts: {
      b: false,
      a1: false,
      a2: false,
    },
  };
}

let state = createInitialState();

function seatsIllustration() {
  return `
    <div class="seats" aria-label="Two adjacent empty cinema seats">
      <svg viewBox="0 0 620 330" role="img" aria-labelledby="seat-title seat-description">
        <title id="seat-title">Two empty cinema seats</title>
        <desc id="seat-description">Two adjacent seats wait in a dark, quiet theater.</desc>
        <ellipse class="seat-shadow" cx="310" cy="304" rx="260" ry="21" />
        <g class="seat-a">
          <rect class="cinema-seat" x="66" y="48" width="216" height="175" rx="42" />
          <path class="cinema-seat" d="M52 174h244v72c0 29-23 52-52 52H104c-29 0-52-23-52-52v-72Z" />
          <rect class="cinema-seat" x="27" y="160" width="48" height="112" rx="22" />
        </g>
        <g class="seat-b">
          <rect class="cinema-seat" x="338" y="48" width="216" height="175" rx="42" />
          <path class="cinema-seat" d="M324 174h244v72c0 29-23 52-52 52H376c-29 0-52-23-52-52v-72Z" />
          <rect class="cinema-seat" x="545" y="160" width="48" height="112" rx="22" />
        </g>
        <rect class="cinema-seat" x="285" y="160" width="50" height="112" rx="22" />
      </svg>
    </div>`;
}

function sceneShell(content, footer = "", className = "") {
  const number = String(state.currentScene).padStart(2, "0");

  return `
    <section class="scene ${className}" aria-labelledby="scene-title">
      <header class="scene-header">
        <p class="wordmark">The Empty Seat</p>
        <div class="progress" aria-label="Scene ${state.currentScene} of ${SCENE_COUNT}">
          <span class="progress-current">${number}</span><span aria-hidden="true">/</span><span>06</span>
        </div>
      </header>
      <div class="scene-content">${content}</div>
      <footer class="scene-footer">${footer}</footer>
    </section>`;
}

function renderOpening() {
  return sceneShell(
    `<div class="opening-copy">
      <p class="eyebrow">An interactive story</p>
      <h1 id="scene-title">THE EMPTY SEAT</h1>
      <p class="subtitle">An Interactive Exploration of Perspective and Misunderstanding</p>
      <p class="tagline">Two friends. Two phones. One unfinished conversation.</p>
      <p class="opening-line">“They used to sit here together.”</p>
      ${seatsIllustration()}
    </div>`,
    `<span></span><button class="primary-button" type="button" data-action="next">Begin</button>`,
    "opening"
  );
}

function message(person, text) {
  return `<div class="message-row person-${person.toLowerCase()}">
    <p class="message"><span class="speaker">${person}</span>${text}</p>
  </div>`;
}

function renderMessages() {
  const content = `
    <div class="chat-shell">
      <p class="eyebrow">The conversation they shared</p>
      <h2 id="scene-title">Shared Messages</h2>
      <div class="chat-window" tabindex="0" aria-label="Shared messages between Person A and Person B">
        <div class="date-separator"><span>Three months ago</span></div>
        ${message("A", "Same seats next time?")}
        ${message("B", "Obviously.")}
        ${message("B", "You always take the aisle seat anyway.")}
        ${message("A", "Because you steal all the popcorn.")}

        <div class="date-separator"><span>Two weeks ago</span></div>
        ${message("A", "Are you free this weekend?")}
        ${message("B", "Not sure yet, sorry.")}
        ${message("A", "No worries.")}

        <div class="date-separator"><span>One week ago</span></div>
        ${message("A", "They're showing that movie again next Friday.")}
        ${message("B", "Oh really?")}
        ${message("A", "Yeah. Thought you'd want to know.")}
        ${message("B", "Thanks :)")}
      </div>
    </div>`;

  return sceneShell(content, navigationFooter("Next"));
}

function judgmentChoices(answerKey, locked) {
  return ANSWERS.map((answer) => {
    const selectedAnswer = answerKey === "initialAnswer" && !locked
      ? state.pendingInitialAnswer
      : state[answerKey];
    const checked = selectedAnswer === answer ? "checked" : "";
    const disabled = locked ? "disabled" : "";
    return `<label class="choice">
      <input type="radio" name="${answerKey}" value="${answer}" ${checked} ${disabled}>
      <span>${answer}</span>
    </label>`;
  }).join("");
}

function renderJudgment(answerKey) {
  const isInitial = answerKey === "initialAnswer";
  const locked = isInitial && state.initialAnswer !== null;
  const canContinue = isInitial
    ? state.pendingInitialAnswer !== null || locked
    : state.finalAnswer !== null;
  const content = `
    <div class="question-panel">
      <p class="eyebrow">${isInitial ? "Your first impression" : "After seeing both perspectives"}</p>
      <h2 id="scene-title">Who do you think wants to keep this friendship more?</h2>
      <fieldset class="choices" aria-label="Choose one answer">
        <legend class="sr-only">Who wants to keep this friendship more?</legend>
        ${judgmentChoices(answerKey, locked)}
      </fieldset>
    </div>`;
  const continueLabel = isInitial && locked ? "Continue" : "Submit & Continue";
  const action = isInitial ? "submit-initial" : "submit-final";
  const footer = `<button class="text-button" type="button" data-action="back">Back</button>
    <button class="primary-button" type="button" data-action="${action}" ${canContinue ? "" : "disabled"}>${continueLabel}</button>`;

  return sceneShell(content, footer);
}

function revealedDraft(text, note) {
  return `<div class="phone-card revealed-item">
    <p class="draft-text">“${text}”</p>
    <p class="unsent-label">${note}</p>
  </div>`;
}

function renderBPhone() {
  const bDraft = state.revealedDrafts.b
    ? revealedDraft("I got us tickets. Are you free?", "Never sent")
    : `<button class="reveal-button" type="button" data-action="reveal-b">Unsent invitation</button>`;
  const unlockA = state.revealedDrafts.b && !state.unlockedInformation.aPhone
    ? `<div class="unlock-action"><button class="secondary-button" type="button" data-action="unlock-a">View Person A's Phone</button></div>`
    : "";

  return `<div class="phone phone-b">
    <div class="phone-screen">
      <div class="phone-status" aria-hidden="true"></div>
      <div class="phone-heading"><h3>Wallet & Drafts</h3><span class="phone-owner">Person B</span></div>
      <div class="phone-list">
        <article class="phone-card" aria-label="Purchased cinema ticket record">
          <p class="phone-card-label">Purchased ticket</p>
          <p class="ticket-title">Cinema — Friday, 7:30 PM</p>
          <p class="ticket-detail">2 tickets purchased</p>
          <p class="ticket-detail">Seats F7 &amp; F8</p>
        </article>
        ${bDraft}
      </div>
      ${unlockA}
    </div>
  </div>`;
}

function renderAPhone() {
  const draftOne = state.revealedDrafts.a1
    ? revealedDraft("Do you even want to hang out anymore?", "Draft 1 · Never sent")
    : `<button class="reveal-button" type="button" data-action="reveal-a1">Draft 1</button>`;
  const draftTwo = state.revealedDrafts.a2
    ? revealedDraft("I miss our movie nights.", "Draft 2 · Never sent")
    : `<button class="reveal-button" type="button" data-action="reveal-a2">Draft 2</button>`;

  return `<div class="phone phone-a">
    <div class="phone-screen">
      <div class="phone-status" aria-hidden="true"></div>
      <div class="phone-heading"><h3>Drafts</h3><span class="phone-owner">Person A</span></div>
      <div class="phone-list">${draftOne}${draftTwo}</div>
    </div>
  </div>`;
}

function renderPerspective() {
  const canSwitch = state.unlockedInformation.freeSwitching;
  let stageText = "First, look through Person B’s phone.";
  if (state.unlockedInformation.aPhone && !canSwitch) {
    stageText = "Now, look through Person A’s phone.";
  } else if (canSwitch) {
    stageText = "Both perspectives are available. You can move between them.";
  }

  const switcher = canSwitch
    ? `<div class="phone-switcher" role="group" aria-label="Choose a phone perspective">
        <button class="phone-tab person-a-tab" type="button" data-action="switch-a" aria-pressed="${state.currentPerspective === "a"}">A's Phone</button>
        <button class="phone-tab person-b-tab" type="button" data-action="switch-b" aria-pressed="${state.currentPerspective === "b"}">B's Phone</button>
      </div>`
    : "";

  const phone = state.currentPerspective === "a" ? renderAPhone() : renderBPhone();
  const content = `<div class="phone-stage">
    <div class="perspective-intro">
      <p class="eyebrow">Perspective Shift</p>
      <h2 id="scene-title">What was never shared</h2>
      <p class="stage-note">${stageText}</p>
    </div>
    ${switcher}
    ${phone}
  </div>`;
  const footer = `<button class="text-button" type="button" data-action="back">Back</button>
    <button class="primary-button" type="button" data-action="next" ${canSwitch ? "" : "disabled"}>Continue</button>`;

  return sceneShell(content, footer);
}

function renderEnding() {
  const content = `<div class="opening-copy">
    <h2 id="scene-title" class="sr-only">Your choices</h2>
    <div class="ending-grid" aria-label="Your two answers">
      <div class="answer-card"><p class="answer-label">BEFORE</p><p class="answer-value">${state.initialAnswer}</p></div>
      <span class="ending-line" aria-hidden="true"></span>
      <div class="answer-card"><p class="answer-label">AFTER</p><p class="answer-value">${state.finalAnswer}</p></div>
    </div>
    ${seatsIllustration()}
  </div>`;
  const footer = `<button class="text-button" type="button" data-action="back">Back</button>
    <button class="secondary-button" type="button" data-action="restart">Restart</button>`;

  return sceneShell(content, footer, "ending");
}

function navigationFooter(nextLabel) {
  return `<button class="text-button" type="button" data-action="back">Back</button>
    <button class="primary-button" type="button" data-action="next">${nextLabel}</button>`;
}

function render() {
  const scenes = {
    1: renderOpening,
    2: renderMessages,
    3: () => renderJudgment("initialAnswer"),
    4: renderPerspective,
    5: () => renderJudgment("finalAnswer"),
    6: renderEnding,
  };

  app.innerHTML = scenes[state.currentScene]();
  document.title = `${String(state.currentScene).padStart(2, "0")} / 06 — The Empty Seat`;
  app.focus({ preventScroll: true });
  window.scrollTo({ top: 0, behavior: "auto" });
}

function goToScene(sceneNumber) {
  state.currentScene = Math.min(Math.max(sceneNumber, 1), SCENE_COUNT);

  // Entering the perspective scene always begins with B unless both phones are already unlocked.
  if (state.currentScene === 4 && !state.unlockedInformation.freeSwitching) {
    state.currentPerspective = state.unlockedInformation.aPhone ? "a" : "b";
    state.unlockedInformation.bPhone = true;
    state.unlockedInformation.bTicket = true;
  }

  render();
}

function updateFreeSwitching() {
  if (state.revealedDrafts.a1 && state.revealedDrafts.a2) {
    state.unlockedInformation.freeSwitching = true;
  }
}

app.addEventListener("change", (event) => {
  const input = event.target;
  if (!(input instanceof HTMLInputElement) || input.type !== "radio") return;

  if (input.name === "initialAnswer" && state.initialAnswer === null) {
    state.pendingInitialAnswer = input.value;
  }
  if (input.name === "finalAnswer") {
    state.finalAnswer = input.value;
  }

  const submitButton = app.querySelector("button[data-action^='submit-']");
  if (submitButton) submitButton.disabled = false;
});

app.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-action]");
  if (!button || button.disabled) return;

  const action = button.dataset.action;
  const actions = {
    next: () => goToScene(state.currentScene + 1),
    back: () => goToScene(state.currentScene - 1),
    "submit-initial": () => {
      if (state.initialAnswer === null && state.pendingInitialAnswer) {
        state.initialAnswer = state.pendingInitialAnswer;
      }
      if (state.initialAnswer) goToScene(4);
    },
    "submit-final": () => {
      if (state.finalAnswer) goToScene(6);
    },
    "reveal-b": () => {
      state.revealedDrafts.b = true;
      render();
    },
    "unlock-a": () => {
      state.unlockedInformation.aPhone = true;
      state.currentPerspective = "a";
      render();
    },
    "reveal-a1": () => {
      state.revealedDrafts.a1 = true;
      updateFreeSwitching();
      render();
    },
    "reveal-a2": () => {
      state.revealedDrafts.a2 = true;
      updateFreeSwitching();
      render();
    },
    "switch-a": () => {
      if (state.unlockedInformation.freeSwitching) state.currentPerspective = "a";
      render();
    },
    "switch-b": () => {
      if (state.unlockedInformation.freeSwitching) state.currentPerspective = "b";
      render();
    },
    restart: () => {
      state = createInitialState();
      goToScene(1);
    },
  };

  actions[action]?.();
});

render();
