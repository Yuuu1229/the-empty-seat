# The Empty Seat

**An Interactive Exploration of Perspective and Misunderstanding**

The Empty Seat is a short, fictional interactive experience about two friends, the messages they share, and the feelings they leave unsent. The audience makes the same judgment before and after privately held information is revealed. There is no correct answer and the story's outcome does not change.

## Development

This project uses plain HTML, CSS, and JavaScript with no dependencies or build step.

1. Clone the repository and switch to `main`.
2. Open `index.html` in a browser, or serve the directory with a local static server:

   ```sh
   python3 -m http.server 8000
   ```

3. Visit `http://localhost:8000`.

## Computational thinking concept

The experience decomposes the story into visible communication, private information, perspective, interpretation, and information updates. Its algorithm is:

1. Show the shared messages.
2. Record an initial judgment.
3. Reveal Person B's private perspective.
4. Reveal Person A's private perspective.
5. Allow free switching between perspectives.
6. Record a second judgment and display the two choices.

The model is intentionally abstract: the facts and character actions never change; only the information available to the audience changes. This fictional scenario does not claim to prove a general psychological pattern.

## Project structure

```text
.
├── index.html    # Accessible application shell
├── styles.css    # Cinematic layout, responsive styling, and motion preferences
└── script.js     # Six scenes, state, navigation, and reveal interactions
```

## Accessibility

All interactions use keyboard-accessible native controls. The layout adapts to small screens, and animations are effectively disabled when the user prefers reduced motion.
