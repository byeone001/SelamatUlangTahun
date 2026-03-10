document.addEventListener('DOMContentLoaded', () => {

    // 1. Initialize Particles as Floating Bubbles
    tsParticles.load("particles-js", {
        background: { color: { value: "transparent" } },
        fpsLimit: 60,
        interactivity: {
            events: {
                onHover: { enable: true, mode: "bubble" },
                resize: true
            },
            modes: {
                bubble: { distance: 200, duration: 2, size: 10, opacity: 0.8 }
            }
        },
        particles: {
            color: { value: ["#ffffff", "#ffb6c1", "#ff69b4", "#ff1493"] },
            links: { enable: false }, // Turn off links to look like independent bubbles
            collisions: { enable: true },
            move: { direction: "top", enable: true, outModes: { default: "out" }, random: true, speed: 1.5, straight: false },
            number: { density: { enable: true, area: 800 }, value: 50 },
            opacity: { value: 0.4, animation: { enable: true, speed: 1, minimumValue: 0.1 } },
            shape: { type: "circle" },
            size: { random: true, value: 25, animation: { enable: true, speed: 2, minimumValue: 5 } }
        },
        detectRetina: true
    });

    // 2. Continuous Rain Effect
    function createRain() {
        const rainContainer = document.getElementById('rain-container');
        if (!rainContainer) return;
        
        setInterval(() => {
            const drop = document.createElement('div');
            drop.classList.add('raindrop');
            
            // Randomize horizontal position and duration
            drop.style.left = `${Math.random() * 100}vw`;
            const duration = Math.random() * 1.5 + 1.2; // Diperlama (antara 1.2s - 2.7s) agar turun perlahan tapi pasti
            drop.style.animationDuration = `${duration}s`;
            drop.style.opacity = Math.random() * 0.5 + 0.5; // Opacity minimum ditingkatkan ke 0.5 agar lebih jelas
            
            rainContainer.appendChild(drop);
            
            // Clean up the div setelah durasi fall ditambah sedikit jeda untuk aman
            setTimeout(() => {
                if (drop.parentNode) drop.remove();
            }, (duration + 0.5) * 1000); 
        }, 50); // Spawn dirapatkan (50ms) agar lebih banyak
    }
    
    createRain();

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
    let caughtStars = 0;
    const targetStars = 10;
    let spawnInterval;
    const starEmojis = ['⭐', '🌟', '✨', '💫', '🎁', '⭐', '🌟', '✨', '💫', '🎁'];
    const popupMessages = [
        "Ayo semangat! ✨",
        "Wih jago! 🌟",
        "Sedikit lagi! 🎁",
        "Keren banget! 💫",
        "Yeay berhasill! 🎉",
        "Ayo semangat! ✨",
        "Wih jago! 🌟",
        "Sedikit lagi! 🎁",
        "Keren banget! 💫",
        "Yeay berhasill! 🎉"
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
            caughtStars = 0;
            updateProgressBar();
            welcomeScreen.classList.add('active');
        }, 600);
    });

    function startGame() {
        caughtStars = 0;
        updateProgressBar();
        // Spawn stars slightly faster on laptops since it's easier with a mouse and wider screen
        const spawnDelay = isMobile ? 900 : 700;
        spawnInterval = setInterval(spawnStar, spawnDelay);
        // Spawn one immediately
        spawnStar();
    }

    function spawnStar() {
        const star = document.createElement('div');
        // Pick random star emoji
        star.innerText = starEmojis[Math.floor(Math.random() * starEmojis.length)];
        star.classList.add('floating-star');

        // Ensure hearts spawn more towards the center on ultra-wide monitors
        const minLeft = window.innerWidth > 1200 ? 25 : 10;
        const widthRange = window.innerWidth > 1200 ? 50 : 80;

        const leftPos = Math.random() * widthRange + minLeft;
        star.style.left = `${leftPos}%`;

        // Random float duration (faster on mobile since height is smaller)
        const minDuration = isMobile ? 3 : 4;
        const duration = Math.random() * 2 + minDuration;
        star.style.animationDuration = `${duration}s`;

        // Event handler for catching
        const catchStar = (e) => {
            e.preventDefault(); // Prevent ghost clicks on mobile

            if (star.classList.contains('caught')) return;
            star.classList.add('caught');

            // Get interaction coordinates (mouse or touch)
            let clientX, clientY;
            if (e.type === 'touchstart' && e.touches.length > 0) {
                clientX = e.touches[0].clientX;
                clientY = e.touches[0].clientY;
            } else {
                clientX = e.clientX;
                clientY = e.clientY;
            }

            // Fallback to bounding rect if event coordinates are missing
            if (clientX === undefined) {
                const rect = star.getBoundingClientRect();
                clientX = rect.left + (rect.width / 2);
                clientY = rect.top + (rect.height / 2);
            }

            createMiniConfetti(clientX, clientY);

            // Pass exact click/tap coordinates to show popup message every time
            showPopupMessage(clientX, clientY);

            // Game logic
            caughtStars++;
            updateProgressBar();

            // Remove element after animation
            setTimeout(() => {
                if (star.parentNode) star.remove();
            }, 400);

            // Check Win Condition
            if (caughtStars >= targetStars) {
                endGame();
            }
        };

        // Support both mouse and touch securely
        star.addEventListener('mousedown', catchStar);
        star.addEventListener('touchstart', catchStar, { passive: false });

        heartsContainer.appendChild(star);

        // Clean up star if it floats off screen
        setTimeout(() => {
            if (star.parentNode && !star.classList.contains('caught')) {
                star.remove();
            }
        }, duration * 1000);
    }

    function updateProgressBar() {
        progressText.innerText = `${caughtStars} / ${targetStars}`;
        const percentage = (caughtStars / targetStars) * 100;
        progressBar.style.width = `${percentage}%`;
    }

    function showPopupMessage(x, y) {
        const popup = document.createElement('div');
        popup.className = 'popup-message';
        popup.innerText = popupMessages[Math.floor(Math.random() * popupMessages.length)];
        
        popupContainer.appendChild(popup);

        // Get actual popup dimensions after adding to DOM
        const popupRect = popup.getBoundingClientRect();
        
        // Default position: beside and slightly above the click point
        let finalX = x + 30; // 30px to the right of the click
        let finalY = y - 40; // 40px above the click

        const margin = 15;

        // Keep popup within screen bounds horizontally
        if (finalX + popupRect.width + margin > window.innerWidth) {
            // If it goes off the right edge, move it to the left of the click
            finalX = x - popupRect.width - 30; 
            
            // If moving it left pushes it off the left edge, just glue it to the left edge
            if (finalX < margin) {
                finalX = margin;
            }
        }

        // Keep popup within screen bounds vertically
        if (finalY < margin) {
            // Shift below the click if there is no space above
            finalY = y + 30;
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

        // Prevent any pending stars from being clicked
        const remainingStars = document.querySelectorAll('.floating-star');
        remainingStars.forEach(h => h.style.pointerEvents = 'none');

        // Transition screens
        setTimeout(() => {
            gameScreen.classList.remove('active');

            setTimeout(() => {
                // Show candle screen instead of surprise screen
                // Remove all stars safely
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
                    startOpeningSequence();
                }, 600);
            }, 800);
        }
    });

    // Opening Sequence Logic
    function startOpeningSequence() {
        const openingScreen = document.getElementById('opening-screen');
        const openingText = document.getElementById('opening-text');
        
        openingScreen.classList.add('active');
        
        const sequence = ["3", "2", "1", "HAPPY", "BIRTHDAY", "TO", "ZIZIE"];
        
        function showNextWord(index) {
            if (index >= sequence.length) {
                // Finish opening sequence
                openingScreen.classList.remove('active');
                setTimeout(() => {
                    surpriseScreen.classList.add('active');
                    fireGrandConfetti();
                    startPhotoSlider();
                    startTypewriterEffect();
                }, 600);
                return;
            }
            
            // Remove class to reset animation
            openingText.classList.remove('show');
            
            setTimeout(() => {
                openingText.innerText = sequence[index];
                openingText.classList.add('show');
                
                // Keep the word on screen for a moment, then next
                // Slower for words, slightly faster for countdown numbers
                const readDuration = sequence[index].length > 1 ? 1800 : 1200;
                
                setTimeout(() => {
                    openingText.classList.remove('show'); // fade out
                    setTimeout(() => {
                        showNextWord(index + 1);
                    }, 1200); // Wait for smooth CSS fade out transition (1.2s)
                }, readDuration);
            }, 100); // Small delay to allow CSS reset
        }
        
        showNextWord(0);
    }

    // Photo Slider Logic
    function startPhotoSlider() {
        const images = document.querySelectorAll('.slider-img');
        if (images.length === 0) return;

        let currentIndex = 0;
        
        function updateCarousel() {
            images.forEach((img, i) => {
                let diff = i - currentIndex;
                
                // Adjust for wrapping seamlessly
                const total = images.length;
                if (diff < -Math.floor(total / 2)) diff += total;
                if (diff > Math.floor(total / 2)) diff -= total;
                
                // Calculate sliding and scaling
                let translateX = diff * 70; // Slide distance between photos
                let scale = 1 - Math.abs(diff) * 0.2; // Size decreases by 20% each step
                let zIndex = 10 - Math.abs(diff); // Center photo always on top
                let opacity = 1 - Math.abs(diff) * 0.3; // Fades out the further away
                
                img.style.transform = `translateX(${translateX}px) scale(${scale})`;
                img.style.zIndex = zIndex;
                img.style.opacity = opacity;
            });
        }
        
        // Initial setup
        updateCarousel();
        
        // Loop every 2.5 seconds
        setInterval(() => {
            currentIndex = (currentIndex + 1) % images.length;
            updateCarousel();
        }, 2500);
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
