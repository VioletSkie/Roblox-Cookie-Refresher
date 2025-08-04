// Network Background Animation
class NetworkBackground {
    constructor() {
        this.canvas = document.getElementById('network-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.dots = [];
        this.dotCount = this.calculateDotCount();
        this.maxDistance = 150;
        this.connectionRotation = 0;
        this.mouseX = 0;
        this.mouseY = 0;
        this.trailLength = 25; // Reduced for better performance and cleaner look
        this.frameCount = 0;
        
        this.init();
        this.animate();
        this.setupEventListeners();
    }

    calculateDotCount() {
        const screenArea = window.innerWidth * window.innerHeight;
        const baseArea = 1920 * 1080; // Base resolution
        const baseDotCount = 120; // Base number of dots
        
        // Calculate ratio and adjust dot count
        const ratio = Math.sqrt(screenArea / baseArea);
        const adjustedCount = Math.floor(baseDotCount * ratio);
        
        // Ensure minimum and maximum limits
        return Math.max(30, Math.min(200, adjustedCount));
    }

    init() {
        this.resize();
        this.createDots();
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.dotCount = this.calculateDotCount();
    }

    createDots() {
        this.dots = [];
        
        for (let i = 0; i < this.dotCount; i++) {
            const x = Math.random() * this.canvas.width;
            const y = Math.random() * this.canvas.height;
            
            // Add more variation in speeds
            const baseSpeed = Math.random() * 0.6 + 0.2; // 0.2 to 0.8
            const speedMultiplier = Math.random() * 1.5 + 0.5; // 0.5 to 2.0
            
            this.dots.push({
                x: x,
                y: y,
                vx: (Math.random() - 0.5) * baseSpeed * speedMultiplier,
                vy: (Math.random() - 0.5) * baseSpeed * speedMultiplier,
                radius: Math.random() * 1.5 + 1,
                opacity: Math.random() * 0.4 + 0.3,
                pulsePhase: Math.random() * Math.PI * 2,
                trail: [], // Store previous positions for trail
                wanderAngle: Math.random() * Math.PI * 2,
                wanderRadius: Math.random() * 2 + 1,
                wanderDistance: Math.random() * 50 + 30,
                maxSpeed: baseSpeed * speedMultiplier,
                fadeSpeed: Math.random() * 0.02 + 0.01, // Individual fade speeds
                trailFadeMultiplier: Math.random() * 0.3 + 0.7 // 0.7 to 1.0
            });
        }
    }

    setupEventListeners() {
        window.addEventListener('resize', () => {
            this.resize();
            this.createDots();
        });

        window.addEventListener('mousemove', (e) => {
            this.mouseX = e.clientX;
            this.mouseY = e.clientY;
        });
    }

    drawDot(dot) {
        const pulseIntensity = 0.7 + 0.3 * Math.sin(Date.now() * 0.003 + dot.pulsePhase);
        const finalOpacity = dot.opacity * pulseIntensity;
        
        const mouseDistance = Math.hypot(this.mouseX - dot.x, this.mouseY - dot.y);
        const mouseInfluence = Math.max(0, 1 - mouseDistance / 200);
        const attractionRadius = dot.radius + mouseInfluence * 0.5;
        
        // Draw trail with proper fading
        if (dot.trail.length > 1) {
            for (let i = 0; i < dot.trail.length - 1; i++) {
                const ageRatio = i / (dot.trail.length - 1);
                const fadeRatio = Math.pow(ageRatio, 1.5); // Exponential fade for smoother transition
                const trailOpacity = finalOpacity * fadeRatio * 0.4 * dot.trailFadeMultiplier;
                const trailRadius = attractionRadius * fadeRatio * 0.6;
                
                if (trailOpacity > 0.01) { // Only draw if visible enough
                    this.ctx.beginPath();
                    this.ctx.arc(dot.trail[i].x, dot.trail[i].y, Math.max(0.5, trailRadius), 0, Math.PI * 2);
                    this.ctx.fillStyle = `rgba(147, 51, 234, ${trailOpacity})`;
                    this.ctx.fill();
                }
            }
        }
        
        // Draw main dot
        this.ctx.beginPath();
        this.ctx.arc(dot.x, dot.y, attractionRadius, 0, Math.PI * 2);
        
        const gradient = this.ctx.createRadialGradient(
            dot.x, dot.y, 0,
            dot.x, dot.y, attractionRadius * 2
        );
        gradient.addColorStop(0, `rgba(147, 51, 234, ${finalOpacity})`);
        gradient.addColorStop(0.7, `rgba(147, 51, 234, ${finalOpacity * 0.6})`);
        gradient.addColorStop(1, `rgba(147, 51, 234, 0)`);
        
        this.ctx.fillStyle = gradient;
        this.ctx.fill();
        
        this.ctx.beginPath();
        this.ctx.arc(dot.x, dot.y, attractionRadius * 0.6, 0, Math.PI * 2);
        this.ctx.fillStyle = `rgba(168, 85, 247, ${finalOpacity * 1.2})`;
        this.ctx.fill();
    }

    drawConnection(dot1, dot2, distance) {
        const baseOpacity = Math.pow(1 - (distance / this.maxDistance), 2) * 0.3;
        
        const connectionPhase = (dot1.pulsePhase + dot2.pulsePhase) * 0.5;
        const connectionPulse = 0.7 + 0.3 * Math.sin(Date.now() * 0.002 + connectionPhase);
        const finalOpacity = baseOpacity * connectionPulse;
        
        // Add fade effect for connections too
        const fadeMultiplier = (dot1.trailFadeMultiplier + dot2.trailFadeMultiplier) * 0.5;
        const adjustedOpacity = finalOpacity * fadeMultiplier;
        
        const gradient = this.ctx.createLinearGradient(dot1.x, dot1.y, dot2.x, dot2.y);
        gradient.addColorStop(0, `rgba(147, 51, 234, ${adjustedOpacity * 0.3})`);
        gradient.addColorStop(0.5, `rgba(168, 85, 247, ${adjustedOpacity})`);
        gradient.addColorStop(1, `rgba(147, 51, 234, ${adjustedOpacity * 0.3})`);
        
        this.ctx.beginPath();
        this.ctx.moveTo(dot1.x, dot1.y);
        this.ctx.lineTo(dot2.x, dot2.y);
        this.ctx.strokeStyle = gradient;
        this.ctx.lineWidth = Math.max(0.3, adjustedOpacity * 1.5);
        this.ctx.stroke();
    }

    updateDot(dot) {
        // Store previous position for trail - only every few frames for performance
        if (this.frameCount % 2 === 0) { // Store trail every 2 frames
            dot.trail.push({ x: dot.x, y: dot.y });
            if (dot.trail.length > this.trailLength) {
                dot.trail.shift();
            }
        }
        
        // Wandering behavior with speed variation
        dot.wanderAngle += (Math.random() - 0.5) * 0.2;
        
        // Calculate desired velocity based on wander angle
        const wanderX = Math.cos(dot.wanderAngle) * dot.wanderRadius;
        const wanderY = Math.sin(dot.wanderAngle) * dot.wanderRadius;
        
        // Add some randomness with variable intensity
        const randomIntensity = 0.05 + Math.sin(Date.now() * 0.001 + dot.pulsePhase) * 0.02;
        const randomForceX = (Math.random() - 0.5) * randomIntensity;
        const randomForceY = (Math.random() - 0.5) * randomIntensity;
        
        // Update velocity
        dot.vx += wanderX * 0.008 + randomForceX;
        dot.vy += wanderY * 0.008 + randomForceY;
        
        // Limit speed
        const speed = Math.hypot(dot.vx, dot.vy);
        if (speed > dot.maxSpeed) {
            dot.vx = (dot.vx / speed) * dot.maxSpeed;
            dot.vy = (dot.vy / speed) * dot.maxSpeed;
        }
        
        // Apply velocity
        dot.x += dot.vx;
        dot.y += dot.vy;
        
        // Apply friction with slight variation
        const friction = 0.995 + (Math.random() - 0.5) * 0.001;
        dot.vx *= friction;
        dot.vy *= friction;
        
        // Wrap around screen edges with smooth transition
        const margin = 50;
        if (dot.x < -margin) {
            dot.x = this.canvas.width + margin;
            dot.trail = []; // Clear trail when wrapping
        }
        if (dot.x > this.canvas.width + margin) {
            dot.x = -margin;
            dot.trail = [];
        }
        if (dot.y < -margin) {
            dot.y = this.canvas.height + margin;
            dot.trail = [];
        }
        if (dot.y > this.canvas.height + margin) {
            dot.y = -margin;
            dot.trail = [];
        }
    }

    animate() {
        // Clear canvas with better fade effect
        this.ctx.fillStyle = 'rgba(10, 10, 15, 0.12)'; // Increased opacity for better trail fading
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.frameCount++;
        this.connectionRotation += 0.005;

        // Update all dots
        this.dots.forEach(dot => {
            this.updateDot(dot);
        });

        // Draw connections with distance-based culling for performance
        for (let i = 0; i < this.dots.length; i++) {
            for (let j = i + 1; j < this.dots.length; j++) {
                const dx = this.dots[i].x - this.dots[j].x;
                const dy = this.dots[i].y - this.dots[j].y;
                const distance = Math.hypot(dx, dy);

                if (distance < this.maxDistance && distance > 15) {
                    this.drawConnection(this.dots[i], this.dots[j], distance);
                }
            }
        }

        // Draw all dots
        this.dots.forEach(dot => {
            this.drawDot(dot);
        });

        requestAnimationFrame(() => this.animate());
    }
}

// Cookie processing functionality
function processCookie() {
    const input = document.getElementById('cookieInput').value;
    const outputField = document.getElementById('outputField');
    
    if (!input.trim()) {
        updateStatus('error', 'Please enter cookie data');
        return;
    }
    
    const button = document.querySelector('.action-button');
    const originalText = button.innerHTML;
    button.innerHTML = 'Processing...';
    button.disabled = true;
    updateStatus('processing', 'Processing cookie...');
    
    setTimeout(() => {
        try {
            const processedCookie = processCookieData(input);
            outputField.value = processedCookie;
            
            updateStatus('success', 'Cookie processed successfully');
        } catch (error) {
            outputField.value = `Error: ${error.message}`;
            updateStatus('error', 'Processing failed');
        }
        
        button.innerHTML = originalText;
        button.disabled = false;
    }, 1500);
}

function processCookieData(cookieString) {
    const timestamp = new Date().toISOString();
    const originalLength = cookieString.length;
    
    if (!cookieString.includes('=')) {
        throw new Error('Invalid cookie format - no key=value pairs found');
    }
    
    const cookiePairs = cookieString.split(';').map(pair => pair.trim());
    const validPairs = cookiePairs.filter(pair => pair.includes('='));
    
    if (validPairs.length === 0) {
        throw new Error('No valid cookie pairs found');
    }
    
    let output = `// Cookie Processing Report\n`;
    output += `// Processed at: ${timestamp}\n`;
    output += `// Original length: ${originalLength} characters\n`;
    output += `// Valid cookie pairs found: ${validPairs.length}\n`;
    output += `// \n`;
    output += `// WARNING: This is a demonstration tool.\n`;
    output += `// Do not use for actual cookie manipulation.\n`;
    output += `// Consider using official APIs instead.\n`;
    output += `\n`;
    output += `// Processed Cookie Data:\n`;
    output += `${cookieString.substring(0, 500)}${originalLength > 500 ? '\n// ... (truncated for display)' : ''}`;
    
    return output;
}

function updateStatus(type, message) {
    const statusDot = document.getElementById('statusDot');
    const statusText = document.getElementById('statusText');
    
    statusDot.className = 'status-dot';
    statusDot.classList.add(type);
    statusText.textContent = message;
}

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    const networkBg = new NetworkBackground();
    
    const cookieInput = document.getElementById('cookieInput');
    const outputField = document.getElementById('outputField');
    
    updateStatus('ready', 'Ready');
    
    // Keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault();
            processCookie();
        }
        
        if (e.key === 'Escape') {
            if (document.activeElement === cookieInput) {
                cookieInput.value = '';
                updateStatus('ready', 'Ready');
            }
        }
    });
    
    // Double-click to copy output
    outputField.addEventListener('dblclick', function() {
        if (this.value.trim()) {
            navigator.clipboard.writeText(this.value).then(() => {
                const originalStatus = document.getElementById('statusText').textContent;
                updateStatus('success', 'Copied to clipboard!');
                
                setTimeout(() => {
                    updateStatus('ready', originalStatus);
                }, 2000);
            }).catch(() => {
                updateStatus('error', 'Failed to copy');
            });
        }
    });
    
    // Smooth scroll to output after processing
    const originalUpdateStatus = window.updateStatus;
    window.updateStatus = function(type, message) {
        originalUpdateStatus(type, message);
        
        if (type === 'success' || type === 'error') {
            setTimeout(() => {
                outputField.scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'center' 
                });
            }, 100);
        }
    };
    
    // Initial animation
    setTimeout(() => {
        document.querySelector('.main-card').style.opacity = '1';
        document.querySelector('.main-card').style.transform = 'translateY(0)';
    }, 100);
});

// Set initial card state for animation
document.querySelector('.main-card').style.opacity = '0';
document.querySelector('.main-card').style.transform = 'translateY(20px)';
document.querySelector('.main-card').style.transition = 'opacity 0.6s ease, transform 0.6s ease';
