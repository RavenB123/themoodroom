let currentMood = null;

const navbarLinks = document.querySelectorAll('.navbar a');
const sections = document.querySelectorAll('section');
const homeSection = document.getElementById('home');
const flashlight = document.getElementById('flashlight');
const navbar = document.getElementById('navbar');
const wordInputs = document.querySelectorAll('.word-input');

const breathingPrompts = {
    happy: { inhale: "Breathe in Joy...", exhale: "Breathe out Sadness..." },
    sad: { inhale: "Breathe in Calm...", exhale: "Breathe out Pain..." },
    chill: { inhale: "Breathe in Peace...", exhale: "Breathe out Tension..." },
    excited: { inhale: "Breathe in Focus...", exhale: "Breathe out Distraction..." },
    mysterious: { inhale: "Breathe in Clarity...", exhale: "Breathe out Doubt..." }
};

let currentMusicPlayer = null;
let breathingInterval = null;

const moodRoomState = {};

function addWord(e) {
    if (e.key === 'Enter') {
        const wordInput = e.target;
        const mood = wordInput.closest('section').id;

        if (wordInput.value.trim() !== '' && mood !== 'home') {
            const val = wordInput.value.trim();

            playMusic(mood);

            const span = document.createElement('span');
            span.textContent = val;
            const room = document.getElementById(mood);
            span.style.color = getComputedStyle(room).color;
            span.style.fontWeight = 'bold';
            span.style.fontSize = 14 + Math.random() * 24 + 'px';
            span.style.opacity = 0.5;

            const word = {
                element: span,
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
                dx: (Math.random() - 0.5) * 1,
                dy: (Math.random() - 0.5) * 1
            };

            if (!moodRoomState[mood]) {
                moodRoomState[mood] = { words: [] };
            }
            const currentRoomState = moodRoomState[mood];
            currentRoomState.words.push(word);

            let userWordsContainer = room.querySelector('.user-words');
            if (!userWordsContainer) {
                userWordsContainer = document.createElement('div');
                userWordsContainer.classList.add('user-words');
                room.appendChild(userWordsContainer);
            }

            if (userWordsContainer) {
                userWordsContainer.appendChild(span);
            }

            wordInput.value = '';
        }
    }
}

function playMusic(mood) {
    if (currentMusicPlayer) {
        currentMusicPlayer.stop();
        currentMusicPlayer.dispose();
    }

    const masterVolume = new Tone.Volume(-20).toDestination();
    const masterReverb = new Tone.Reverb({ decay: 2, wet: 0.5 }).connect(masterVolume);

    let synth;
    let sequence;

    switch (mood) {
        case 'happy':
            synth = new Tone.PolySynth(Tone.Synth, {
                volume: -10,
                oscillator: { type: "sine" },
                envelope: { attack: 0.01, decay: 0.2, sustain: 0.1, release: 0.5 }
            }).connect(masterReverb);
            sequence = new Tone.Sequence((time, note) => {
                synth.triggerAttackRelease(note, "4n", time);
            }, ["C5", "E5", "G5", "C6", "G5", "E5"]).start(0);
            currentMusicPlayer = sequence;
            break;
        case 'sad':
            synth = new Tone.PolySynth(Tone.Synth, {
                oscillator: { type: "triangle" },
                envelope: {
                    attack: 0.02,
                    decay: 0.5,
                    sustain: 0.2,
                    release: 2
                },
                volume: -10
            }).connect(masterReverb);

            sequence = new Tone.Sequence((time, note) => {
                synth.triggerAttackRelease(note, "1n", time);
            }, [
                ["C3", "E3", "G3"],
                ["A2", "C3", "E3"],
                ["F2", "A2", "C3"],
                ["G2", "B2", "D3"]
            ], "2n").start(0);

            currentMusicPlayer = sequence;
            break;
        case 'chill':
            synth = new Tone.PolySynth(Tone.AMSynth, {
                oscillator: { type: "sine" },
                envelope: { attack: 0.5, decay: 0, sustain: 1, release: 1 }
            }).connect(masterReverb);
            sequence = new Tone.Sequence((time, note) => {
                synth.triggerAttackRelease(note, "1n", time);
            }, ["C2", "G2", "A2", "F2"]).start(0);
            currentMusicPlayer = sequence;
            break;
        case 'excited':
            synth = new Tone.PolySynth(Tone.MembraneSynth, {
                pitchDecay: 0.05,
                octaves: 8,
                oscillator: { type: "sine" },
                envelope: { attack: 0.001, decay: 0.4, sustain: 0.01, release: 0.4, attackCurve: "exponential" }
            }).connect(masterReverb);
            sequence = new Tone.Sequence((time, note) => {
                synth.triggerAttackRelease(note, "8n", time);
            }, ["C4", ["G4", "C5"], "G4", "A4", "A#4"]).start(0);
            currentMusicPlayer = sequence;
            break;
        case 'mysterious':
            synth = new Tone.PolySynth(Tone.DuoSynth, {
                volume: -15,
                vibratoAmount: 0.5,
                vibratoRate: 5,
                harmonicity: 1.5,
                voice0: {
                    oscillator: { type: "sawtooth" },
                    envelope: { attack: 2, decay: 0, sustain: 1, release: 5 }
                },
                voice1: {
                    oscillator: { type: "sine" },
                    envelope: { attack: 1, decay: 0, sustain: 1, release: 5 }
                }
            }).connect(masterReverb);

            sequence = new Tone.Sequence((time, note) => {
                synth.triggerAttackRelease(note, "2n", time);
            }, [
                ["A2", "D3", "E3"],
                ["G2", "C3", "D3"],
                ["F2", "A#2", "C3"],
                ["E2", "A2", "B2"]
            ], "2n").start(0);
            currentMusicPlayer = sequence;
            break;
    }

    Tone.Transport.start();
}

function stopMusic() {
    if (currentMusicPlayer) {
        currentMusicPlayer.stop();
        currentMusicPlayer.dispose();
        currentMusicPlayer = null;
        Tone.Transport.stop();
    }
}

function showSection(id) {
    if (currentMood && moodRoomState[currentMood]) {
        cancelAnimationFrame(moodRoomState[currentMood].wordAnimationFrameId);
        moodRoomState[currentMood].words = [];
        const userWordsContainer = document.querySelector(`#${currentMood} .user-words`);
        if (userWordsContainer) {
            userWordsContainer.innerHTML = '';
        }
    }

    sections.forEach(sec => {
        sec.classList.add('hidden');
    });

    const targetSection = document.getElementById(id);
    targetSection.classList.remove('hidden');

    currentMood = id;

    if (id === 'home') {
        flashlight.style.opacity = 1;
        navbar.style.opacity = 1;
        navbar.style.pointerEvents = 'auto';
        stopMusic();
        stopBreathingGuide();
    } else {
        flashlight.style.opacity = 0;
        navbar.style.opacity = 0;
        navbar.style.pointerEvents = 'none';
        Tone.start();
        initializeMoodRoom(id);
    }
}

function initializeMoodRoom(mood) {
    moodRoomState[mood] = {
        words: []
    };

    const room = document.getElementById(mood);
    const leaveBtn = room.querySelector('.leave-room');
    const breatheBtn = room.querySelector('.breathe-button');
    const breathingGuide = room.querySelector('.breathing-guide');
    const closeGuideBtn = breathingGuide.querySelector('.close-guide');
    const canvas = document.getElementById(`${mood}-canvas`);

    let userWordsContainer = room.querySelector('.user-words');
    if (!userWordsContainer) {
        userWordsContainer = document.createElement('div');
        userWordsContainer.classList.add('user-words');
        room.appendChild(userWordsContainer);
    } else {
        userWordsContainer.innerHTML = '';
    }

    if (window.activeCanvasAnimation) {
        cancelAnimationFrame(window.activeCanvasAnimation);
    }

    const resizeCanvas = () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    switch (mood) {
        case 'happy': startHappyEffect(canvas); break;
        case 'sad': startSadEffect(canvas); break;
        case 'chill': startChillEffect(canvas); break;
        case 'excited': startExcitedEffect(canvas); break;
        case 'mysterious':
            startMysteriousEffect(canvas);
            break;
    }

    leaveBtn.onclick = () => {
        window.removeEventListener('resize', resizeCanvas);
        showSection('home');
    };
    breatheBtn.onclick = () => startBreathingGuide(mood);
    closeGuideBtn.onclick = stopBreathingGuide;


    function animateWords() {
        if (currentMood && moodRoomState[currentMood]) {
            moodRoomState[currentMood].words.forEach(word => {
                word.x += word.dx;
                word.y += word.dy;
                if (word.x <= 0 || word.x >= window.innerWidth) word.dx *= -1;
                if (word.y <= 0 || word.y >= window.innerHeight) word.dy *= -1;
                word.element.style.left = `${word.x}px`;
                word.element.style.top = `${word.y}px`;
            });
        }
        if (moodRoomState[currentMood]) {
            moodRoomState[currentMood].wordAnimationFrameId = requestAnimationFrame(animateWords);
        }
    }
    animateWords();
}

function startBreathingGuide(mood) {
    const activeSection = document.getElementById(mood);
    const breathingGuide = activeSection.querySelector('.breathing-guide');
    const breathingCircle = breathingGuide.querySelector('.breathing-circle');
    const textElement = breathingGuide.querySelector('.text');

    breathingGuide.classList.add('active');

    let state = 'in';
    const prompts = breathingPrompts[mood];

    function animateBreathing() {
        if (state === 'in') {
            textElement.textContent = prompts.inhale;
            breathingCircle.classList.remove('breathe-out');
            breathingCircle.classList.add('breathe-in');
            state = 'out';
        } else {
            textElement.textContent = prompts.exhale;
            breathingCircle.classList.remove('breathe-in');
            breathingCircle.classList.add('breathe-out');
            state = 'in';
        }
    }

    animateBreathing();
    breathingInterval = setInterval(animateBreathing, 4000);
}

function stopBreathingGuide() {
    clearInterval(breathingInterval);
    const activeSection = document.querySelector('section:not(.hidden)');
    if (activeSection) {
        const breathingGuide = activeSection.querySelector('.breathing-guide');
        if (breathingGuide) {
            breathingGuide.classList.remove('active');
            breathingGuide.querySelector('.breathing-circle').classList.remove('breathe-in', 'breathe-out');
        }
    }
}

function startHappyEffect(canvas) {
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const particles = [];

    const colors = ['#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5', '#2196f3', '#03a9f4', '#00bcd4', '#009688', '#4caf50', '#8bc34a', '#cddc39', '#ffeb3b', '#ffc107', '#ff9800', '#ff5722', '#795548'];

    class Confetti {
        constructor() {
            this.x = canvas.width / 2;
            this.y = canvas.height / 2;
            this.size = Math.random() * 8 + 4;
            this.color = colors[Math.floor(Math.random() * colors.length)];
            this.rotation = Math.random() * 360;
            this.speedX = (Math.random() - 0.5) * 10;
            this.speedY = (Math.random() - 0.5) * 10;
            this.gravity = 0.2;
        }

        update() {
            this.x += this.speedX;
            this.y += this.speedY;
            this.speedY += this.gravity;
            this.size -= 0.1;
            this.rotation += 5;
        }

        draw() {
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate(this.rotation * Math.PI / 180);
            ctx.fillStyle = this.color;
            ctx.shadowColor = this.color;
            ctx.shadowBlur = 10;
            ctx.fillRect(0, 0, this.size, this.size);
            ctx.restore();
        }
    }

    function createConfettiBurst(count) {
        for (let i = 0; i < count; i++) {
            particles.push(new Confetti());
        }
    }
    createConfettiBurst(50);

    setInterval(() => createConfettiBurst(20), 1000);

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (let i = particles.length - 1; i >= 0; i--) {
            particles[i].update();
            particles[i].draw();
            if (particles[i].size <= 0.5) {
                particles.splice(i, 1);
            }
        }
        window.activeCanvasAnimation = requestAnimationFrame(animate);
    }
    animate();
}

function startSadEffect(canvas) {
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const raindrops = [];

    for (let i = 0; i < 200; i++) {
        raindrops.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            length: Math.random() * 15 + 10,
            speed: Math.random() * 2 + 1,
            opacity: Math.random() * 0.4 + 0.2,
            thickness: Math.random() * 1 + 0.5
        });
    }

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        raindrops.forEach(drop => {
            drop.y += drop.speed;
            if (drop.y > canvas.height) {
                drop.y = Math.random() * -50;
                drop.x = Math.random() * canvas.width;
            }

            ctx.beginPath();
            ctx.moveTo(drop.x, drop.y);
            ctx.lineTo(drop.x, drop.y + drop.length);
            ctx.strokeStyle = `rgba(163, 196, 243, ${drop.opacity})`;
            ctx.lineWidth = drop.thickness;
            ctx.stroke();
        });
        window.activeCanvasAnimation = requestAnimationFrame(animate);
    }
    animate();
}

function startChillEffect(canvas) {
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    let time = 0;

    function drawWaves() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.lineWidth = 2;
        for (let i = 0; i < 5; i++) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(176, 241, 240, ${0.1 + i * 0.05})`;
            for (let x = 0; x < canvas.width; x++) {
                const y = canvas.height / 2 + Math.sin(x * 0.01 + time + i) * 50;
                if (x === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            }
            ctx.stroke();
        }
        time += 0.005;
    }

    function animate() {
        drawWaves();
        window.activeCanvasAnimation = requestAnimationFrame(animate);
    }
    animate();
}

function startExcitedEffect(canvas) {
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const rings = [];

    setInterval(() => {
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        rings.push({
            radius: 10,
            opacity: 1,
            speed: 2,
            x: centerX,
            y: centerY
        });
    }, 150);

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (let i = rings.length - 1; i >= 0; i--) {
            rings[i].radius += rings[i].speed;
            rings[i].opacity -= 0.01;

            if (rings[i].opacity <= 0) {
                rings.splice(i, 1);
            } else {
                ctx.beginPath();
                ctx.arc(rings[i].x, rings[i].y, rings[i].radius, 0, Math.PI * 2);
                ctx.strokeStyle = `rgba(255, 140, 66, ${rings[i].opacity})`;
                ctx.lineWidth = 3;
                ctx.shadowColor = `rgba(255, 140, 66, ${rings[i].opacity * 2})`;
                ctx.shadowBlur = 15;
                ctx.stroke();
            }
        }
        window.activeCanvasAnimation = requestAnimationFrame(animate);
    }
    animate();
}

function startMysteriousEffect(canvas) {
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const particles = [];
    const maxParticles = 300;
    let hue = 270;

    for (let i = 0; i < maxParticles; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: Math.random() * 3 + 1,
            speedX: (Math.random() - 0.5) * 1,
            speedY: (Math.random() - 0.5) * 1
        });
    }

    function animate() {
        ctx.fillStyle = 'rgba(18, 18, 18, 0.1)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        hue = (hue + 0.5) % 360;

        for (let i = 0; i < particles.length; i++) {
            particles[i].x += particles[i].speedX;
            particles[i].y += particles[i].speedY;
            particles[i].size -= 0.01;

            if (particles[i].size <= 0) {
                particles[i] = {
                    x: canvas.width / 2,
                    y: canvas.height / 2,
                    size: Math.random() * 3 + 1,
                    speedX: (Math.random() - 0.5) * 1,
                    speedY: (Math.random() - 0.5) * 1
                };
            }

            ctx.fillStyle = `hsl(${hue}, 100%, 50%)`;
            ctx.shadowColor = `hsl(${hue}, 100%, 50%)`;
            ctx.shadowBlur = 10;
            ctx.beginPath();
            ctx.arc(particles[i].x, particles[i].y, particles[i].size, 0, Math.PI * 2);
            ctx.fill();
        }
        window.activeCanvasAnimation = requestAnimationFrame(animate);
    }
    animate();
}

navbarLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const moodId = link.dataset.mood;
        showSection(moodId);
    });
});

function updateFlashlight(e) {
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    const gradientSize = 18;
    const shadowOpacity = 0.95;

    flashlight.style.background = `radial-gradient(circle ${gradientSize}vmax at ${clientX}px ${clientY}px, rgba(255, 255, 255, 0.15) 0%, rgba(0, 0, 0, ${shadowOpacity}) ${gradientSize}vmax)`;
}

homeSection.addEventListener('mousemove', updateFlashlight);
homeSection.addEventListener('touchmove', updateFlashlight);
homeSection.addEventListener('touchstart', updateFlashlight);

showSection('home');

wordInputs.forEach(input => {
    input.addEventListener('keydown', addWord);
});