# Festive Christmas Web Game 🎄

An interactive holiday-themed web game using Three.js for 3D rendering and MediaPipe for gesture-based controls.

**🎮 [Live Demo](https://licanhua.github.io/christmas-gesture-game/)**

## About This Project

This entire project was created by **GitHub Copilot** through an interactive AI-assisted development process:
- Started with the initial requirements in [Feature.txt](Feature.txt)
- All AI conversations and development iterations are logged in [chat.md](chat.md)
- The complete development journey showcases AI-powered coding from concept to deployment

## Features

- **3D Christmas Scene**: Loads `christmas_pack_free.glb` with a cozy yard and Christmas decorations
- **Hand Gesture Controls**:
  - 👍 **Thumbs Up**: Rotate scene right
  - 👎 **Thumbs Down**: Rotate scene left
  - ✌️ **Victory Sign**: Zoom in
  - ✊ **Closed Fist**: Zoom out
- **Snow Effect**: 2000 animated snowflakes falling in front of the camera
- **Background Music**: Toggle "We Wish You a Merry Christmas" background music
- **Dynamic Lighting**: Animated colored lights for festive atmosphere

## Setup Instructions

1. **Required Files**:
   - Place `christmas_pack_free.glb` in the same directory as index.html
   - Place your music file as `music.mp3` (e.g., "We Wish You a Merry Christmas (Swirrel remix)")

2. **Run the Game**:
   - Open `index.html` in a modern web browser (Chrome, Edge, or Firefox recommended)
   - Allow camera access when prompted
   - The game will load the 3D model and start the camera feed

3. **Controls**:
   - Show your hand to the camera in the top-right corner
   - Make gestures to control the scene
   - Click the music button to toggle background music

## Technical Details

- **Three.js**: 3D rendering engine
- **MediaPipe Hands**: Real-time hand gesture recognition
- **Particle System**: Custom snowfall effect with 2000 particles
- **Responsive Design**: Adapts to window resizing

## Browser Requirements

- Modern browser with WebGL support
- Camera access for gesture controls
- JavaScript modules support

## Troubleshooting

- If the model doesn't load, ensure `christmas_pack_free.glb` is in the correct directory
- If gestures aren't recognized, check camera permissions
- If music doesn't play, click the music button after user interaction with the page

Enjoy the festive experience! 🎅🎄❄️
