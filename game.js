import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// Scene, Camera, Renderer setup
const canvas = document.getElementById('canvas3d');
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0a1628);
scene.fog = new THREE.Fog(0x0a1628, 10, 50);

const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);
camera.position.set(0, 5, 20);

const renderer = new THREE.WebGLRenderer({ 
    canvas: canvas,
    antialias: true 
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(5, 10, 7);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.width = 2048;
directionalLight.shadow.mapSize.height = 2048;
scene.add(directionalLight);

const pointLight1 = new THREE.PointLight(0xff6b6b, 1, 20);
pointLight1.position.set(-5, 3, 0);
scene.add(pointLight1);

const pointLight2 = new THREE.PointLight(0x6bff6b, 1, 20);
pointLight2.position.set(5, 3, 0);
scene.add(pointLight2);

// Load Christmas Model
let christmasModel = null;
const loader = new GLTFLoader();

// Setup DRACO loader for compressed models
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/');
loader.setDRACOLoader(dracoLoader);

loader.load(
    'christmas_pack_free.glb',
    (gltf) => {
        christmasModel = gltf.scene;
        christmasModel.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });
        scene.add(christmasModel);
        document.getElementById('loading').style.display = 'none';
        updateStatus('Scene loaded! Use gestures to control.');
    },
    (xhr) => {
        const percent = (xhr.loaded / xhr.total * 100).toFixed(0);
        document.getElementById('loading').textContent = `Loading... ${percent}%`;
    },
    (error) => {
        console.error('Error loading model:', error);
        document.getElementById('loading').textContent = 'Error loading model. Check console.';
    }
);

// Snowfall Particle System
const snowflakeCount = 2000;
const snowGeometry = new THREE.BufferGeometry();
const snowPositions = [];
const snowVelocities = [];

for (let i = 0; i < snowflakeCount; i++) {
    const x = (Math.random() - 0.5) * 50;
    const y = Math.random() * 30;
    const z = (Math.random() - 0.5) * 50;
    snowPositions.push(x, y, z);
    snowVelocities.push(
        (Math.random() - 0.5) * 0.02,
        -Math.random() * 0.05 - 0.02,
        (Math.random() - 0.5) * 0.02
    );
}

snowGeometry.setAttribute('position', new THREE.Float32BufferAttribute(snowPositions, 3));

const snowMaterial = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 0.1,
    transparent: true,
    opacity: 0.8
});

const snowParticles = new THREE.Points(snowGeometry, snowMaterial);
scene.add(snowParticles);

// Fireworks Particle System
const fireworksParticles = [];
const maxFireworks = 5;

class Firework {
    constructor(position) {
        const particleCount = 200;
        const geometry = new THREE.BufferGeometry();
        const positions = [];
        const colors = [];
        const velocities = [];
        const sizes = [];
        
        // Choose firework color type
        const colorTypes = ['red', 'gold', 'blue', 'green', 'purple', 'white', 'multi'];
        const colorType = colorTypes[Math.floor(Math.random() * colorTypes.length)];
        
        for (let i = 0; i < particleCount; i++) {
            positions.push(position.x, position.y, position.z);
            
            // Realistic firework colors
            let color = new THREE.Color();
            if (colorType === 'multi') {
                color.setHSL(Math.random(), 1, 0.6);
            } else if (colorType === 'red') {
                color.setRGB(1, Math.random() * 0.3, Math.random() * 0.1);
            } else if (colorType === 'gold') {
                color.setRGB(1, 0.8 + Math.random() * 0.2, Math.random() * 0.2);
            } else if (colorType === 'blue') {
                color.setRGB(0.2, 0.5 + Math.random() * 0.3, 1);
            } else if (colorType === 'green') {
                color.setRGB(0.2, 1, Math.random() * 0.3);
            } else if (colorType === 'purple') {
                color.setRGB(0.8, 0.2, 1);
            } else {
                color.setRGB(1, 1, 1);
            }
            
            colors.push(color.r, color.g, color.b);
            
            // Spherical explosion pattern
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);
            const speed = Math.random() * 0.15 + 0.08;
            
            velocities.push(
                Math.sin(phi) * Math.cos(theta) * speed,
                Math.sin(phi) * Math.sin(theta) * speed,
                Math.cos(phi) * speed
            );
            
            // Varying particle sizes
            sizes.push(Math.random() * 0.2 + 0.1);
        }
        
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
        geometry.setAttribute('size', new THREE.Float32BufferAttribute(sizes, 1));
        
        const material = new THREE.PointsMaterial({
            size: 0.25,
            vertexColors: true,
            transparent: true,
            opacity: 1,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });
        
        this.particles = new THREE.Points(geometry, material);
        this.velocities = velocities;
        this.life = 1.0;
        this.gravity = -0.008;
        this.fadeSpeed = 0.015;
        
        scene.add(this.particles);
    }
    
    update() {
        const positions = this.particles.geometry.attributes.position.array;
        const sizes = this.particles.geometry.attributes.size.array;
        
        for (let i = 0; i < positions.length / 3; i++) {
            const i3 = i * 3;
            positions[i3] += this.velocities[i3];
            positions[i3 + 1] += this.velocities[i3 + 1];
            positions[i3 + 2] += this.velocities[i3 + 2];
            
            // Apply gravity and air resistance
            this.velocities[i3 + 1] += this.gravity;
            this.velocities[i3] *= 0.98;
            this.velocities[i3 + 2] *= 0.98;
            
            // Shrink particles over time
            sizes[i] *= 0.97;
        }
        
        this.particles.geometry.attributes.position.needsUpdate = true;
        this.particles.geometry.attributes.size.needsUpdate = true;
        
        // Faster fade at the end
        this.life -= this.fadeSpeed;
        if (this.life < 0.3) {
            this.particles.material.opacity = this.life / 0.3;
        }
        
        return this.life > 0;
    }
    
    dispose() {
        scene.remove(this.particles);
        this.particles.geometry.dispose();
        this.particles.material.dispose();
    }
}

function createFirework() {
    if (fireworksParticles.length < maxFireworks) {
        // Position fireworks in front of camera as overlay effect
        // Use camera's forward direction to place fireworks in view
        const offsetX = (Math.random() - 0.5) * 6;
        const offsetY = (Math.random() - 0.5) * 4 + 2;
        const distanceFromCamera = 8; // Fixed distance in front of camera
        
        const position = new THREE.Vector3(
            camera.position.x + offsetX,
            camera.position.y + offsetY,
            camera.position.z - distanceFromCamera
        );
        
        const firework = new Firework(position);
        fireworksParticles.push(firework);
        
        // Play firework sound
        playFireworkSound();
    }
}

function updateFireworks() {
    for (let i = fireworksParticles.length - 1; i >= 0; i--) {
        if (!fireworksParticles[i].update()) {
            fireworksParticles[i].dispose();
            fireworksParticles.splice(i, 1);
        }
    }
}

// Update snowflakes
function updateSnowflakes() {
    const positions = snowGeometry.attributes.position.array;
    for (let i = 0; i < snowflakeCount; i++) {
        const i3 = i * 3;
        positions[i3] += snowVelocities[i3];
        positions[i3 + 1] += snowVelocities[i3 + 1];
        positions[i3 + 2] += snowVelocities[i3 + 2];

        // Reset snowflake if it falls below ground
        if (positions[i3 + 1] < -2) {
            positions[i3 + 1] = 30;
            positions[i3] = (Math.random() - 0.5) * 50;
            positions[i3 + 2] = (Math.random() - 0.5) * 50;
        }
    }
    snowGeometry.attributes.position.needsUpdate = true;
}

// Background Music
const audio = new Audio('music.mp3');
audio.loop = true;
audio.volume = 0.3;

let musicAttempted = false;

function tryPlayMusic() {
    if (!musicAttempted) {
        audio.play()
            .then(() => {
                musicAttempted = true;
                console.log('Music started playing');
            })
            .catch(e => {
                console.log('Music autoplay blocked - user interaction needed:', e);
                musicAttempted = true;
            });
    }
}

// Firework Sound Effect
const fireworkSound = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBgoOEhYaHiImKi4yNjo+QkZKTlJWWl5iZmpucnZ6foKGio6SlpqeoqaqrrK2ur7CxsrO0tba3uLm6u7y9vr/AwcLDxMXGx8jJysvMzc7P0NHS09TV1tfY2drb3N3e3+Dh4uPk5ebn6Onq6+zt7u/w8fLz9PX29/j5+vv8/f7/AAECAwQFBgcICQoLDA0ODxAREhMUFRYXGBkaGxwdHh8gISIjJCUmJygpKissLS4vMDEyMzQ1Njc4OTo7PD0+P0BBQkNERUZHSElKS0xNTk9QUVJTVFVWV1hZWltcXV5fYGFiY2RlZmdoaWprbG1ub3BxcnN0dXZ3eHl6e3x9fn+AgYKDhIWGh4iJiouMjY6PkJGSk5SVlpeYmZqbnJ2en6ChoqOkpaanqKmqq6ytrq+wsbKztLW2t7i5uru8vb6/wMHCw8TFxsfIycrLzM3Oz9DR0tPU1dbX2Nna29zd3t/g4eLj5OXm5+jp6uvs7e7v8PHy8/T19vf4+fr7/P3+/w==');
fireworkSound.volume = 0.5;

function playFireworkSound() {
    // Create a new audio instance each time so multiple sounds can play
    const sound = fireworkSound.cloneNode();
    sound.volume = 0.4;
    sound.play().catch(e => console.log('Firework sound failed:', e));
}

// Camera Controls
let rotationSpeed = 0;
let zoomSpeed = 0;
const maxRotationSpeed = 0.02;
const maxZoomSpeed = 0.1;

// MediaPipe Hands Setup
const videoElement = document.getElementById('videoElement');
const statusElement = document.getElementById('status');

function updateStatus(message) {
    statusElement.textContent = message;
}

let hands = null;
let cameraVideo = null;

// Initialize MediaPipe after scripts load
function initMediaPipe() {
    if (typeof Hands === 'undefined' || typeof Camera === 'undefined') {
        setTimeout(initMediaPipe, 100);
        return;
    }

    hands = new Hands({
        locateFile: (file) => {
            return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
        }
    });

    hands.setOptions({
        maxNumHands: 1,
        modelComplexity: 1,
        minDetectionConfidence: 0.7,
        minTrackingConfidence: 0.7
    });

    hands.onResults(onHandsResults);

    // Start camera
    cameraVideo = new Camera(videoElement, {
        onFrame: async () => {
            await hands.send({ image: videoElement });
        },
        width: 640,
        height: 480
    });

    cameraVideo.start();
    console.log('MediaPipe initialized successfully');
}

// Gesture Recognition
function recognizeGesture(landmarks) {
    if (!landmarks || landmarks.length === 0) return { type: 'none', x: 0.5 };

    const wrist = landmarks[0];
    const thumb = landmarks[4];
    const index = landmarks[8];
    const middle = landmarks[12];
    const ring = landmarks[16];
    const pinky = landmarks[20];

    // Calculate finger states (extended or not)
    const thumbExtended = thumb.y < landmarks[3].y;
    const indexExtended = index.y < landmarks[6].y;
    const middleExtended = middle.y < landmarks[10].y;
    const ringExtended = ring.y < landmarks[14].y;
    const pinkyExtended = pinky.y < landmarks[18].y;

    // Victory Sign: Index and middle extended, ring and pinky closed
    // More lenient check - just check if index and middle are clearly up
    if (indexExtended && middleExtended && !ringExtended && !pinkyExtended) {
        return { type: 'victory', x: wrist.x };
    }

    // Closed Fist: All fingers closed (including thumb)
    if (!indexExtended && !middleExtended && !ringExtended && !pinkyExtended) {
        return { type: 'fist', x: wrist.x };
    }

    // Return hand position (x coordinate for left/right)
    return { type: 'open', x: wrist.x };
}

let lastFistTime = 0;
let lastVictoryTime = 0;

function showMerryChristmas() {
    const textElement = document.getElementById('merryChristmas');
    textElement.classList.remove('show');
    // Trigger reflow to restart animation
    void textElement.offsetWidth;
    textElement.classList.add('show');
    
    // Create multiple fireworks
    for (let i = 0; i < 3; i++) {
        setTimeout(() => createFirework(), i * 300);
    }
}

function onHandsResults(results) {
    if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
        // Try to start music on first hand detection
        tryPlayMusic();
        
        const landmarks = results.multiHandLandmarks[0];
        const gesture = recognizeGesture(landmarks);

        if (gesture.type === 'victory') {
            // Trigger Merry Christmas animation (throttle to once every 4 seconds)
            const now = Date.now();
            if (now - lastVictoryTime > 4000) {
                showMerryChristmas();
                lastVictoryTime = now;
                updateStatus('✌️ Victory - Merry Christmas! 🎄');
            }
            // Slow down other movements
            rotationSpeed *= 0.9;
            zoomSpeed *= 0.9;
        } else if (gesture.type === 'fist') {
            // Trigger fireworks (throttle to once per second)
            const now = Date.now();
            if (now - lastFistTime > 1000) {
                createFirework();
                lastFistTime = now;
                updateStatus('✊ Fist - Fireworks! 🎆');
            }
            // Slow down other movements
            rotationSpeed *= 0.9;
            zoomSpeed *= 0.9;
        } else if (gesture.type === 'open') {
            // Hand position controls zoom
            // x ranges from 0 (right side of camera) to 1 (left side of camera)
            // Flip it because camera is mirrored
            const handX = 1 - gesture.x;
            
            if (handX < 0.35) {
                // Hand on left side - zoom in
                zoomSpeed = -maxZoomSpeed * 1.5;
                updateStatus('� Hand on Left - Zooming In');
            } else if (handX > 0.65) {
                // Hand on right side - zoom out
                zoomSpeed = maxZoomSpeed * 1.5;
                updateStatus('👉 Hand on Right - Zooming Out');
            } else {
                // Hand in center - gradually stop
                zoomSpeed *= 0.8;
                updateStatus('Hand in center - Move left/right or make fist!');
            }
            
            // Auto-rotate slowly
            rotationSpeed = maxRotationSpeed * 0.3;
        } else {
            rotationSpeed *= 0.9;
            zoomSpeed *= 0.9;
            updateStatus('Hand detected - Open hand or make fist!');
        }
        
        if (Math.abs(rotationSpeed) < 0.001) rotationSpeed = 0;
        if (Math.abs(zoomSpeed) < 0.001) zoomSpeed = 0;
    } else {
        rotationSpeed *= 0.9;
        zoomSpeed *= 0.9;
        updateStatus('No hand detected');
    }
}

// Animation Loop
function animate() {
    requestAnimationFrame(animate);

    // Apply rotation
    if (christmasModel) {
        christmasModel.rotation.y += rotationSpeed;
    }

    // Apply zoom
    camera.position.z += zoomSpeed;
    camera.position.z = Math.max(10, Math.min(camera.position.z, 40));

    // Update snowflakes
    updateSnowflakes();
    
    // Update fireworks
    updateFireworks();

    // Animate lights
    const time = Date.now() * 0.001;
    pointLight1.intensity = 0.5 + Math.sin(time * 2) * 0.5;
    pointLight2.intensity = 0.5 + Math.cos(time * 2) * 0.5;

    renderer.render(scene, camera);
}

// Handle window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Start animation
animate();

// Load MediaPipe library
const script1 = document.createElement('script');
script1.src = 'https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js';
script1.crossOrigin = 'anonymous';
document.head.appendChild(script1);

const script2 = document.createElement('script');
script2.src = 'https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js';
script2.crossOrigin = 'anonymous';
script2.onload = () => {
    console.log('MediaPipe scripts loaded');
    initMediaPipe();
};
document.head.appendChild(script2);
