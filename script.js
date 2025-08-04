// Network Background Animation
class NetworkBackground {
    constructor() {
        this.canvas = document.getElementById('network-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.dots = [];
        this.dotCount = 80;
        this.maxDistance = 150;
        this.connectionRotation = 0;
        this.mouseX = 0;
        this.mouseY = 0;
        
        this.init();
        this.animate();
        this.setupEventListeners();
    }

    init() {
        this.resize();
        this.createDots();
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    createDots() {
        this.dots = [];
        
        for (let i = 0; i < this.dotCount; i++) {
            const x = Math.random() * this.canvas.width;
            const y = Math.random() * this.canvas.height;
            
            this.dots.push({
                x: x,
                y: y,
                originalX: x,
                originalY: y,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                radius: Math.random() * 1.5 + 1,
                opacity: Math.random() * 0.4 + 0.3,
                pulsePhase: Math.random() * Math.PI * 2,
                rotationSpeed: (Math.random() - 0.5) * 0.02 + 0.01,
                driftRadius: Math.random() * 30 + 20,
                driftSpeed: Math.random() * 0.02 + 0.01,
                driftAngle: Math.random() * Math.PI * 2
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
        const baseOpacity = Math.pow(1 - (distance / this.maxDistance), 2) * 0.4;
        
        const connectionPhase = (dot1.pulsePhase + dot2.pulsePhase) * 0.5;
        const connectionPulse = 0.7 + 0.3 * Math.sin(Date.now() * 0.002 + connectionPhase);
        const finalOpacity = baseOpacity * connectionPulse;
        
        const gradient = this.ctx.createLinearGradient(dot1.x, dot1.y, dot2.x, dot2.y);
        gradient.addColorStop(0, `rgba(147, 51, 234, ${finalOpacity * 0.3})`);
        gradient.addColorStop(0.5, `rgba(168, 85, 247, ${finalOpacity})`);
        gradient.addColorStop(1, `rgba(147, 51, 234, ${finalOpacity * 0.3})`);
        
        this.ctx.beginPath();
        this.ctx.moveTo(dot1.x, dot1.y);
        this.ctx.lineTo(dot2.x, dot2.y);
        this.ctx.strokeStyle = gradient;
        this.ctx.lineWidth = Math.max(0.5, finalOpacity * 2);
        this.ctx.stroke();
    }

    updateDot(dot) {
        dot.driftAngle += dot.driftSpeed;
        
        const targetX = dot.originalX + Math.cos(dot.driftAngle) * dot.driftRadius;
        const targetY = dot.originalY + Math.sin(dot.driftAngle) * dot.driftRadius;
        
        const dx = targetX - dot.x;
        const dy = targetY - dot.y;
        
        dot.x += dx * 0.02 + dot.vx;
        dot.y += dy * 0.02 + dot.vy;
        
        dot.vx += (Math.random() - 0.5) * 0.01;
        dot.vy += (Math.random() - 0.5) * 0.01;
        
        dot.vx *= 0.98;
        dot.vy *= 0.98;
        
        const margin = 100;
        if (dot.x < -margin) {
            dot.x = this.canvas.width + margin;
            dot.originalX = this.canvas.width;
        }
        if (dot.x > this.canvas.width + margin) {
            dot.x = -margin;
            dot.originalX = 0;
        }
        if (dot.y < -margin) {
            dot.y = this.canvas.height + margin;
            dot.originalY = this.canvas.height;
        }
        if (dot.y > this.canvas.height + margin) {
            dot.y = -margin;
            dot.originalY = 0;
        }
    }

    animate() {
        this.ctx.fillStyle = 'rgba(10, 10, 15, 0.05)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.connectionRotation += 0.005;

        this.dots.forEach(dot => {
            this.updateDot(dot);
        });

        for (let i = 0; i < this.dots.length; i++) {
            for (let j = i + 1; j < this.dots.length; j++) {
                const distance = Math.hypot(
                    this.dots[i].x - this.dots[j].x,
                    this.dots[i].y - this.dots[j].y
                );

                if (distance < this.maxDistance && distance > 10) {
                    this.drawConnection(this.dots[i], this.dots[j], distance);
                }
            }
        }

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
            autoResize(outputField);
            
            updateStatus('success', 'Cookie processed successfully');
        } catch (error) {
            outputField.value = `Error: ${error.message}`;
            autoResize(outputField);
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

function autoResize(textarea) {
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 400) + 'px';
}

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    const networkBg = new NetworkBackground();
    
    const cookieInput = document.getElementById('cookieInput');
    const outputField = document.getElementById('outputField');
    
    cookieInput.addEventListener('input', function() {
        autoResize(this);
    });
    
    const observer = new MutationObserver(function() {
        autoResize(outputField);
    });
    
    observer.observe(outputField, {
        attributes: true,
        attributeFilter: ['value']
    });
    
    const originalSetValue = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value').set;
    Object.defineProperty(outputField, 'value', {
        set: function(newValue) {
            originalSetValue.call(this, newValue);
            setTimeout(() => autoResize(this), 0);
        },
        get: function() {
            return this.getAttribute('value') || this.textContent || '';
        }
    });
    
    updateStatus('ready', 'Ready');
    
    document.addEventListener('keydown', function(e) {
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault();
            processCookie();
        }
        
        if (e.key === 'Escape') {
            if (document.activeElement === cookieInput) {
                cookieInput.value = '';
                autoResize(cookieInput);
                updateStatus('ready', 'Ready');
            }
        }
    });
    
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
    
    setTimeout(() => {
        document.querySelector('.main-card').style.opacity = '1';
        document.querySelector('.main-card').style.transform = 'translateY(0)';
    }, 100);
});

document.querySelector('.main-card').style.opacity = '0';
document.querySelector('.main-card').style.transform = 'translateY(20px)';
document.querySelector('.main-card').style.transition = 'opacity 0.6s ease, transform 0.6s ease';
