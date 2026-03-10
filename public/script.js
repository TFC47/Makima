document.addEventListener('DOMContentLoaded', () => {
    // === DOM Elements ===
    const lockScreen = document.getElementById('bunny-lock-screen');
    const lockInput = document.getElementById('lock-input');
    const unlockBtn = document.getElementById('unlock-btn');
    const lockMsg = document.getElementById('lock-msg');

    const introScreen = document.getElementById('intro-screen');
    const enterBtn = document.getElementById('enter-btn');

    const chatBox = document.getElementById('chat-box');
    const userInput = document.getElementById('user-input');
    const sendBtn = document.getElementById('send-btn');

// === Particle Animation Logic ===
const canvas = document.getElementById('particle-canvas');
const ctx = canvas.getContext('2d');

let particlesArray = [];
const colors = ['#8B0000', '#FF8C00', '#D35400']; // Crimson, Amber, Burnt Orange

// Resize canvas
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

class Particle {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 3 + 1; // Size between 1px and 4px
        this.speedX = Math.random() * 1 - 0.5;
        this.speedY = Math.random() * -1 - 0.5; // Float upwards
        this.color = colors[Math.floor(Math.random() * colors.length)];
        this.opacity = Math.random() * 0.5 + 0.2;
    }
    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        
        // Wrap around screen
        if (this.y < 0) this.y = canvas.height;
        if (this.x < 0) this.x = canvas.width;
        if (this.x > canvas.width) this.x = 0;
    }
    draw() {
        ctx.globalAlpha = this.opacity;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1.0; // Reset opacity
    }
}

function initParticles() {
    particlesArray = [];
    const numberOfParticles = (canvas.width * canvas.height) / 9000; // Adjust density here
    for (let i = 0; i < numberOfParticles; i++) {
        particlesArray.push(new Particle());
    }
}

function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < particlesArray.length; i++) {
        particlesArray[i].update();
        particlesArray[i].draw();
    }
    requestAnimationFrame(animateParticles);
}

initParticles();
animateParticles();

    // === Bunny Lock Logic ===
    const PASSKEY = "bark"; // Change your secret passkey here

    unlockBtn.addEventListener('click', () => {
        if (lockInput.value.toLowerCase() === PASSKEY) {
            lockScreen.style.display = 'none';
        } else {
            lockMsg.textContent = "ACCESS DENIED. GOOD DOGS BARK.";
            lockMsg.style.color = "var(--crimson)";
            lockInput.value = "";
            lockInput.focus();
        }
    });

    lockInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') unlockBtn.click();
    });

    // === Intro Screen Logic ===
    enterBtn.addEventListener('click', () => {
        introScreen.classList.remove('active');
        document.body.classList.remove('locked');
    });

    // === Chat Logic ===
    async function sendMessage() {
        const text = userInput.value.trim();
        if (!text) return;

        // Append user message
        appendMessage(text, 'user-message');
        userInput.value = '';

        try {
            // Hit the Flask/Vercel backend
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: text })
            });

            const data = await response.json();
            
            // Append Makima's response
            if (data.reply) {
                appendMessage(data.reply, 'bot-message');
            } else if (data.error) {
                console.error("Backend Error:", data.error);
                appendMessage("System error. The Control Devil is displeased.", 'bot-message');
            }
        } catch (error) {
            console.error("Fetch Error:", error);
            appendMessage("Network disconnected. Makima cannot hear you.", 'bot-message');
        }
    }

    function appendMessage(text, className) {
        const msgDiv = document.createElement('div');
        msgDiv.className = `message ${className}`;
        
        const p = document.createElement('p');
        p.textContent = text;
        msgDiv.appendChild(p);
        
        chatBox.appendChild(msgDiv);
        
        // Auto-scroll to the bottom
        chatBox.scrollTop = chatBox.scrollHeight;
    }

    // Event Listeners for Chat
    sendBtn.addEventListener('click', sendMessage);
    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage();
    });
});