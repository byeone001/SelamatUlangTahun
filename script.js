document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialize Particles with Pink Theme
    tsParticles.load("particles-js", {
        background: { color: { value: "transparent" } },
        fpsLimit: 60,
        interactivity: {
            events: {
                onHover: { enable: true, mode: "bubble" },
                resize: true
            },
            modes: {
                bubble: { distance: 200, duration: 2, size: 6, opacity: 0.8 }
            }
        },
        particles: {
            color: { value: ["#ff1493", "#ff69b4", "#ffb6c1", "#ffffff"] },
            links: { color: "#ff69b4", distance: 150, enable: true, opacity: 0.2, width: 1 },
            collisions: { enable: true },
            move: { direction: "none", enable: true, outModes: { default: "bounce" }, random: true, speed: 1.2, straight: false },
            number: { density: { enable: true, area: 800 }, value: 70 },
            opacity: { value: 0.6, animation: { enable: true, speed: 1, minimumValue: 0.1 } },
            shape: { type: "circle" },
            size: { random: true, value: 4, animation: { enable: true, speed: 2, minimumValue: 1 } }
        },
        detectRetina: true
    });

    // Elements
    const startBtn = document.getElementById('start-btn');
    const homeBtn = document.getElementById('home-btn');
    const welcomeScreen = document.getElementById('welcome-screen');
    const gameScreen = document.getElementById('game-screen');
    const candleScreen = document.getElementById('candle-screen');
    const surpriseScreen = document.getElementById('surprise-screen');
    const heartsContainer = document.getElementById('hearts-container');
    const progressBar = document.getElementById('progress-bar');
    const progressText = document.getElementById('progress-text');
    const flame = document.getElementById('flame');
    const candle = document.getElementById('candle');
    const bgMusic = document.getElementById('bg-music');
    const popupContainer = document.getElementById('popup-container');
    const typingBox = document.getElementById('typing-box');

    // Game Variables
    let caughtHearts = 0;
    const targetHearts = 5;
    let spawnInterval;
    const heartEmojis = ['💖', '💗', '💓', '💝', '💕'];
    const popupMessages = [
        "Semangat Wafiq! ✨",
        "Sedikit lagi! 🌸",
        "Kamu pasti bisa! 💕",
        "Ihhh jago banget! 💖",
        "Yeayyy berhasill! 🎉"
    ];

    // Final Message for Typewriter Effect
    const finalMessageHTML = `
        <p>Selamat bertambah usia! Semoga panjang umur, sehat selalu, rezekinya semakin lancar, dan semua impian serta cita-citamu segera terwujud.</p>
        <p>Tetaplah menjadi pribadi yang baik, ceria, dan selalu membuat orang di sekitarmu tersenyum. Hari ini adalah hari spesialmu, semoga penuh dengan kebahagiaan!</p>
    `;

    // Screen Dimensions for scaling logic
    const isMobile = window.innerWidth <= 768;

    // Start Game Event
    startBtn.addEventListener('click', () => {
        // Play Background Music
        if(bgMusic.paused) {
            bgMusic.play().catch(e => console.log("Audio play failed:", e));
            bgMusic.volume = 0.5; // Set volume to 50%
        }

        // Hide welcome
        welcomeScreen.classList.remove('active');

        // Wait for transition, then show game
        setTimeout(() => {
            gameScreen.classList.add('active');
            startGame();
        }, 600);
    });

    // Home Button Event
    homeBtn.addEventListener('click', () => {
        // Hide surprise screen
        surpriseScreen.classList.remove('active');
        
        // Reset flame for next time
        flame.classList.remove('blown-out');

        // Reset elements and show welcome screen
        setTimeout(() => {
            caughtHearts = 0;
            updateProgressBar();
            welcomeScreen.classList.add('active');
        }, 600);
    });

    function startGame() {
        caughtHearts = 0;
        updateProgressBar();
        // Spawn hearts slightly faster on laptops since it's easier with a mouse and wider screen
        const spawnDelay = isMobile ? 900 : 700;
        spawnInterval = setInterval(spawnHeart, spawnDelay);
        // Spawn one immediately
        spawnHeart();
    }

    function spawnHeart() {
        const heart = document.createElement('div');
        // Pick random heart emoji
        heart.innerText = heartEmojis[Math.floor(Math.random() * heartEmojis.length)];
        heart.classList.add('floating-heart');

        // Ensure hearts spawn more towards the center on ultra-wide monitors
        const minLeft = window.innerWidth > 1200 ? 25 : 10;
        const widthRange = window.innerWidth > 1200 ? 50 : 80;

        const leftPos = Math.random() * widthRange + minLeft;
        heart.style.left = `${leftPos}%`;

        // Random float duration (faster on mobile since height is smaller)
        const minDuration = isMobile ? 3 : 4;
        const duration = Math.random() * 2 + minDuration;
        heart.style.animationDuration = `${duration}s`;

        // Event handler for catching
        const catchHeart = (e) => {
            e.preventDefault(); // Prevent ghost clicks on mobile

            if (heart.classList.contains('caught')) return;
            heart.classList.add('caught');

            // Interaction feedback
            const rect = heart.getBoundingClientRect();
            // Get center of the heart relative to the viewport
            const x = rect.left + (rect.width / 2);
            const y = rect.top + (rect.height / 2);

            createMiniConfetti(x, y);

            // Show popup message occasionally
            if (Math.random() > 0.4) {
                // Pass exact bounding rect to calculate popup bounds reliably
                showPopupMessage(rect);
            }

            // Game logic
            caughtHearts++;
            updateProgressBar();

            // Remove element after animation
            setTimeout(() => {
                if (heart.parentNode) heart.remove();
            }, 400);

            // Check Win Condition
            if (caughtHearts >= targetHearts) {
                endGame();
            }
        };

        // Support both mouse and touch securely
        heart.addEventListener('mousedown', catchHeart);
        heart.addEventListener('touchstart', catchHeart, { passive: false });

        heartsContainer.appendChild(heart);

        // Clean up heart if it floats off screen
        setTimeout(() => {
            if (heart.parentNode && !heart.classList.contains('caught')) {
                heart.remove();
            }
        }, duration * 1000);
    }

    function updateProgressBar() {
        progressText.innerText = `${caughtHearts} / ${targetHearts}`;
        const percentage = (caughtHearts / targetHearts) * 100;
        progressBar.style.width = `${percentage}%`;
    }

    function showPopupMessage(heartRect) {
        const popup = document.createElement('div');
        popup.className = 'popup-message';
        popup.innerText = popupMessages[Math.floor(Math.random() * popupMessages.length)];
        
        popupContainer.appendChild(popup);

        // Get actual popup dimensions after adding to DOM
        const popupRect = popup.getBoundingClientRect();
        
        // Default position: slightly right and above the heart
        let finalX = heartRect.right; 
        let finalY = heartRect.top - 20;

        const margin = 15;

        // Keep popup within screen bounds horizontally
        if (finalX + popupRect.width + margin > window.innerWidth) {
            // Shift left so it doesn't overflow
            finalX = window.innerWidth - popupRect.width - margin; 
        } else if (finalX < margin) {
            finalX = margin;
        }

        // Keep popup within screen bounds vertically
        if (finalY - popupRect.height < margin) {
            // Shift below the heart if there is no space above
            finalY = heartRect.bottom + 10;
        } else {
            // Adjust upwards by its own height to truly sit above
            finalY -= popupRect.height; 
        }

        popup.style.left = `${finalX}px`;
        popup.style.top = `${finalY}px`;
        
        // Remove after animation completes
        setTimeout(() => {
            if (popup.parentNode) popup.remove();
        }, 2500);
    }

    function createMiniConfetti(x, y) {
        confetti({
            particleCount: 20,
            spread: 50,
            origin: {
                x: x / window.innerWidth,
                y: y / window.innerHeight
            },
            colors: ['#ff1493', '#ff69b4', '#ffffff'],
            zIndex: 100,
            disableForReducedMotion: true,
            startVelocity: 20,
            ticks: 50
        });
    }

    function endGame() {
        clearInterval(spawnInterval);

        // Prevent any pending hearts from being clicked
        const remainingHearts = document.querySelectorAll('.floating-heart');
        remainingHearts.forEach(h => h.style.pointerEvents = 'none');

        // Transition screens
        setTimeout(() => {
            gameScreen.classList.remove('active');

            setTimeout(() => {
                // Show candle screen instead of surprise screen
        // Remove all hearts safely
                heartsContainer.innerHTML = '';

                // Show candle blowing screen
                candleScreen.classList.add('active');
            }, 600);
        }, 500);
    }
    
    // Candle Interaction
    candle.addEventListener('click', () => {
        if (!flame.classList.contains('blown-out')) {
            flame.classList.add('blown-out');
            
            // Wait for blow out animation, then transition
            setTimeout(() => {
                candleScreen.classList.remove('active');
                
                setTimeout(() => {
                    surpriseScreen.classList.add('active');
                    fireGrandConfetti();
                    startPhotoSlider();
                    startTypewriterEffect();
                }, 600);
            }, 800);
        }
    });

    // Photo Slider Logic
    function startPhotoSlider() {
        const images = document.querySelectorAll('.slider-img');
        if (images.length <= 1) return; // No need to slide if only 1 image

        let currentIndex = 0;
        setInterval(() => {
            images[currentIndex].classList.remove('active');
            currentIndex = (currentIndex + 1) % images.length;
            images[currentIndex].classList.add('active');
        }, 3000); // Change image every 3 seconds
    }

    // Typewriter Effect Logic
    function startTypewriterEffect() {
        typingBox.innerHTML = ''; // Clear previous content
        
        // Create an invisible div to parse the HTML string into nodes
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = finalMessageHTML;
        
        const cursor = document.createElement('span');
        cursor.className = 'typing-cursor';
        
        let nodeIndex = 0;
        let charIndex = 0;
        let currentElement = null;
        
        function typeNext() {
            if (nodeIndex >= tempDiv.childNodes.length) {
                // Finished typing all nodes, remove cursor
                cursor.remove();
                return;
            }
            
            const node = tempDiv.childNodes[nodeIndex];
            
            // If it's a text node within the root
            if (node.nodeType === Node.TEXT_NODE) {
                typingBox.appendChild(document.createTextNode(node.textContent));
                nodeIndex++;
                typeNext();
            } 
            // If it's an element node (like <p>)
            else if (node.nodeType === Node.ELEMENT_NODE) {
                if (!currentElement) {
                    currentElement = document.createElement(node.tagName);
                    typingBox.appendChild(currentElement);
                    currentElement.appendChild(cursor); // add cursor to current paragraph
                }
                
                if (charIndex < node.textContent.length) {
                    // Type one character
                    const char = document.createTextNode(node.textContent.charAt(charIndex));
                    currentElement.insertBefore(char, cursor);
                    charIndex++;
                    setTimeout(typeNext, 40); // Typing speed
                } else {
                    // Move to next element
                    nodeIndex++;
                    charIndex = 0;
                    currentElement = null;
                    setTimeout(typeNext, 200); // Pause between paragraphs
                }
            } else {
                nodeIndex++;
                typeNext();
            }
        }
        
        // Start typing
        typeNext();
    }

    // Huge Confetti Display for the Birthday Girl
    function fireGrandConfetti() {
        var duration = 8 * 1000; // 8 seconds
        var animationEnd = Date.now() + duration;
        var defaults = {
            startVelocity: 30,
            spread: 360,
            ticks: 80,
            zIndex: 100,
            colors: ['#ff1493', '#ff69b4', '#ffb6c1', '#ffffff', '#ffd700']
        };

        function randomInRange(min, max) {
            return Math.random() * (max - min) + min;
        }

        var interval = setInterval(function () {
            var timeLeft = animationEnd - Date.now();

            if (timeLeft <= 0) {
                return clearInterval(interval);
            }

            var particleCount = 50 * (timeLeft / duration);
            // Left Cannon
            confetti(Object.assign({}, defaults, {
                particleCount,
                origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
            }));
            // Right Cannon
            confetti(Object.assign({}, defaults, {
                particleCount,
                origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
            }));
        }, 250);

        // Initial big bursts
        setTimeout(() => {
            confetti({
                particleCount: 150,
                spread: 100,
                origin: { y: 0.8 },
                colors: defaults.colors,
                startVelocity: 60,
            });
        }, 100);
    }
});
