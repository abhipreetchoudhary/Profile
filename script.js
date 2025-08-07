// Smooth scrolling for navigation links with enhanced easing
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            // Add a slight delay for ultra-smooth feel
            setTimeout(() => {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }, 100);
        }
    });
});

// Mobile navigation toggle
const navToggle = document.querySelector('.nav-toggle');
const navMenu = document.querySelector('.nav-menu');

navToggle.addEventListener('click', () => {
    navMenu.classList.toggle('active');
    navToggle.classList.toggle('active');
});

// Header background on scroll with smooth transitions
let lastScrollY = 0;
let ticking = false;

const updateHeader = () => {
    const header = document.querySelector('.header');
    const scrollY = window.scrollY;
    
    if (scrollY > 100) {
        header.style.background = 'rgba(18, 18, 18, 0.98)';
        header.style.backdropFilter = 'blur(20px)';
        header.style.borderBottom = '1px solid rgba(29, 185, 84, 0.3)';
    } else {
        header.style.background = 'rgba(18, 18, 18, 0.95)';
        header.style.backdropFilter = 'blur(10px)';
        header.style.borderBottom = '1px solid rgba(29, 185, 84, 0.1)';
    }
    
    lastScrollY = scrollY;
    ticking = false;
};

window.addEventListener('scroll', () => {
    if (!ticking) {
        requestAnimationFrame(updateHeader);
        ticking = true;
    }
});

// Intersection Observer for animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting && !isShowcasing) { // Only animate when NOT in showcase mode
            entry.target.classList.add('fade-in-up');
        }
    });
}, observerOptions);

// Observe elements for animation
document.querySelectorAll('.timeline-item, .project-card, .skill-category, .highlight, .cert-card').forEach(el => {
    observer.observe(el);
});

// Play button animation and auto showcase
const playButton = document.querySelector('#showcase-play');
const showcaseCircle = document.querySelector('.showcase-circle');
let isShowcasing = false;
let showcaseInterval;
let userScrollTimeout;
let lastAutoScrollTime = 0;
let isUserScrolling = false;
let scrollEndTimeout;

if (playButton) {
    playButton.addEventListener('click', () => {
        if (!isShowcasing) {
            startAutoShowcase();
        } else {
            stopAutoShowcase();
        }
    });
}

// Detect manual scrolling during showcase and pause
window.addEventListener('scroll', () => {
    if (isShowcasing) {
        const currentTime = Date.now();
        
        // Check if this scroll was triggered by auto-showcase (within 2 seconds of auto scroll)
        const isAutoScroll = currentTime - lastAutoScrollTime < 2000;
        
        if (!isAutoScroll) {
            // User is manually scrolling
            isUserScrolling = true;
            
            // Clear any existing timeout
            clearTimeout(scrollEndTimeout);
            
            // Show notification only once when user starts scrolling
            if (!document.querySelector('.user-scroll-notification')) {
                const notification = showNotification('🛑 Auto-showcase paused - Manual scrolling detected', 'info');
                notification.classList.add('user-scroll-notification');
            }
            
            // Pause the auto-showcase interval but don't stop completely
            if (showcaseInterval) {
                clearInterval(showcaseInterval);
                showcaseInterval = null;
            }
            
            // Set timeout to resume auto-scroll after user stops scrolling for 3 seconds
            scrollEndTimeout = setTimeout(() => {
                if (isShowcasing && isUserScrolling) {
                    isUserScrolling = false;
                    showNotification('▶️ Auto-showcase resumed', 'success');
                    resumeAutoShowcase();
                }
            }, 3000);
        }
    }
});

function startAutoShowcase() {
    isShowcasing = true;
    
    // Disconnect observer to prevent interference
    observer.disconnect();
    
    // Update button to show it's playing
    playButton.querySelector('i').className = 'fas fa-pause';
    playButton.classList.add('playing');
    showcaseCircle.classList.add('playing');
    
    // Add showcase mode to body
    document.body.classList.add('showcase-mode');
    
    // Create music indicator
    const musicIndicator = document.createElement('div');
    musicIndicator.className = 'music-playing';
    musicIndicator.innerHTML = `
        <div class="music-visualizer">
            <div class="music-bar"></div>
            <div class="music-bar"></div>
            <div class="music-bar"></div>
            <div class="music-bar"></div>
        </div>
        <span>♪ Praise The Lord (Da Shine) - A$AP Rocky ft. Skepta</span>
    `;
    document.body.appendChild(musicIndicator);
    
    // Create a simple, reliable audio player
    const audio = new Audio();
    
    // Use your local MP3 file
    const audioUrl = './A$AP Rocky - Praise The Lord (Da Shine) (Official Video) ft. Skepta.mp3';
    
    audio.src = audioUrl;
    audio.loop = false; // We'll handle custom looping
    audio.volume = 0.3;
    
    // Set start time to 23 seconds and handle custom looping
    audio.currentTime = 23;
    
    // Custom loop from 23 seconds
    audio.addEventListener('loadedmetadata', () => {
        audio.currentTime = 23;
    });
    
    audio.addEventListener('ended', () => {
        if (isShowcasing) {
            audio.currentTime = 23;
            audio.play();
        }
    });
    
    // Also handle timeupdate to ensure we stay in the loop range if needed
    audio.addEventListener('timeupdate', () => {
        if (isShowcasing && audio.currentTime < 23) {
            audio.currentTime = 23;
        }
    });
    
    // Modern browsers require user interaction before playing audio
    // This click event provides that interaction
    const playAudio = async () => {
        try {
            // Ensure we start from 23 seconds
            audio.currentTime = 23;
            await audio.play();
            console.log('🎵 Audio is now playing from 0:23!');
            showNotification('🎵 Now playing: "Praise The Lord (Da Shine)" by A$AP Rocky ft. Skepta!', 'success');
        } catch (error) {
            console.log('Audio blocked by browser:', error);
            showNotification('🎵 Visual showcase mode - Click to enable audio', 'info');
            
            // Add click listener to enable audio on next user interaction
            const enableAudio = async () => {
                try {
                    audio.currentTime = 23;
                    await audio.play();
                    document.removeEventListener('click', enableAudio);
                    showNotification('🎵 Audio enabled!', 'success');
                } catch (e) {
                    console.log('Still cannot play audio');
                }
            };
            document.addEventListener('click', enableAudio, { once: true });
        }
    };
    
    // Try to play immediately
    playAudio();
    
    // Alternative: Create a simple tone if external audio fails
    const createBackupAudio = () => {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            // Create a pleasant chord progression
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(440, audioContext.currentTime); // A note
            gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
            
            oscillator.start();
            
            // Store for stopping later
            playButton.backupAudio = { oscillator, audioContext, gainNode };
            
            console.log('🎵 Backup audio tone created');
            showNotification('🎵 Audio tone playing - "Praise The Lord" vibe!', 'success');
            
            return true;
        } catch (error) {
            console.log('Could not create backup audio:', error);
            return false;
        }
    };
    
    // If main audio fails after a timeout, try backup
    setTimeout(() => {
        if (!audio.played.length) {
            console.log('Main audio not playing, trying backup...');
            createBackupAudio();
        }
    }, 2000);
    
    // Store audio reference
    playButton.audioElement = audio;
    playButton.musicIndicator = musicIndicator;
    
    // Show notification
    showNotification('🎵 Starting auto showcase with "Praise The Lord (Da Shine)" by A$AP Rocky ft. Skepta!', 'success');
    
    // Auto scroll through sections
    const sections = ['#about', '#experience', '#skills', '#certifications', '#projects', '#contact'];
    let currentSection = 0;
    
    // Function to highlight current section
    const highlightSection = (sectionId) => {
        // Remove active class from all sections immediately
        document.querySelectorAll('.section').forEach(s => {
            s.classList.remove('active');
        });
        
        // Add active class to current section after scroll completes
        setTimeout(() => {
            const currentSectionElement = document.querySelector(sectionId);
            if (currentSectionElement) {
                currentSectionElement.classList.add('active');
            }
        }, 800); // Wait for scroll to complete before highlighting
    };

    // Store sections and current index globally for resume functionality
    playButton.sections = sections;
    playButton.currentSection = currentSection;
    
    // Start auto-scrolling
    startAutoScrolling();
    
    // Update showcase text
    document.querySelector('.showcase-text span').textContent = 'Showcasing...';
}

// Function to start the auto-scrolling mechanism
function startAutoScrolling() {
    const sections = playButton.sections;
    let currentSection = playButton.currentSection || 0;
    
    // Function to highlight current section
    const highlightSection = (sectionId) => {
        // Remove ALL animations and classes from EVERYTHING
        document.querySelectorAll('*').forEach(element => {
            element.classList.remove('active', 'fade-in-up');
            // Reset any transform or opacity that might be applied
            if (element.style.transform !== undefined) element.style.transform = '';
            if (element.style.opacity !== undefined) element.style.opacity = '';
        });
        
        // Add active class to current section after scroll completes
        setTimeout(() => {
            const currentSectionElement = document.querySelector(sectionId);
            if (currentSectionElement && isShowcasing && !isUserScrolling) {
                currentSectionElement.classList.add('active');
                
                // Only highlight specific child elements within the section
                const skillCategories = currentSectionElement.querySelectorAll('.skill-category');
                const projectCards = currentSectionElement.querySelectorAll('.project-card');
                const timelineItems = currentSectionElement.querySelectorAll('.timeline-item');
                const certCards = currentSectionElement.querySelectorAll('.cert-card');
                
                [...skillCategories, ...projectCards, ...timelineItems, ...certCards].forEach((child, index) => {
                    setTimeout(() => {
                        if (isShowcasing && !isUserScrolling) {
                            child.classList.add('active');
                        }
                    }, index * 150); // Faster stagger
                });
            }
        }, 1500); // Even longer wait for scroll completion
    };
    
    // Scroll to first section after a delay
    setTimeout(() => {
        if (isShowcasing && !isUserScrolling) {
            lastAutoScrollTime = Date.now();
            const firstSection = document.querySelector(sections[currentSection]);
            if (firstSection) {
                firstSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center'
                });
                // Highlight after scroll animation completes
                setTimeout(() => {
                    if (isShowcasing && !isUserScrolling) {
                        highlightSection(sections[currentSection]);
                    }
                }, 1000);
            }
        }
    }, 1500);
    
    // Set up interval for auto-scrolling
    showcaseInterval = setInterval(() => {
        if (!isUserScrolling && isShowcasing) {
            // Clear ALL highlights and animations first - be more aggressive
            document.querySelectorAll('.section, .skill-category, .project-card, .timeline-item, .cert-card, .highlight').forEach(s => {
                s.classList.remove('active', 'fade-in-up');
                s.style.transform = '';
                s.style.opacity = '';
            });
            
            // Wait a moment for cleanup, then proceed
            setTimeout(() => {
                if (!isUserScrolling && isShowcasing) {
                    currentSection = (currentSection + 1) % sections.length;
                    playButton.currentSection = currentSection;
                    lastAutoScrollTime = Date.now();
                    
                    if (currentSection === 0) {
                        // Return to top after completing a cycle
                        setTimeout(() => {
                            if (!isUserScrolling && isShowcasing) {
                                lastAutoScrollTime = Date.now();
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                                showNotification('🎯 Showcase cycle completed! Starting new cycle...', 'info');
                            }
                        }, 500);
                    } else {
                        const sectionElement = document.querySelector(sections[currentSection]);
                        if (sectionElement) {
                            sectionElement.scrollIntoView({
                                behavior: 'smooth',
                                block: 'center'
                            });
                            
                            // Highlight after scroll completes
                            setTimeout(() => {
                                if (isShowcasing && !isUserScrolling) {
                                    highlightSection(sections[currentSection]);
                                }
                            }, 1200);
                        }
                    }
                }
            }, 300); // Small delay for cleanup
        }
    }, 8000); // Increased to 8 seconds for even cleaner transitions
}

// Function to resume auto-showcase after user stops scrolling
function resumeAutoShowcase() {
    if (isShowcasing && !showcaseInterval) {
        // Find the closest section to current scroll position
        const sections = playButton.sections;
        const scrollTop = window.pageYOffset;
        let closestSection = 0;
        let minDistance = Infinity;
        
        sections.forEach((sectionId, index) => {
            const element = document.querySelector(sectionId);
            if (element) {
                const elementTop = element.offsetTop;
                const distance = Math.abs(scrollTop - elementTop);
                if (distance < minDistance) {
                    minDistance = distance;
                    closestSection = index;
                }
            }
        });
        
        // Update current section to closest one
        playButton.currentSection = closestSection;
        
        // Resume auto-scrolling
        startAutoScrolling();
    }
}

function stopAutoShowcase() {
    isShowcasing = false;
    isUserScrolling = false;
    
    // Re-enable observer for normal scrolling
    document.querySelectorAll('.timeline-item, .project-card, .skill-category, .highlight, .cert-card').forEach(el => {
        observer.observe(el);
    });
    
    // Clear timeouts and intervals
    clearTimeout(scrollEndTimeout);
    clearTimeout(userScrollTimeout);
    
    // Update button back to play state
    playButton.querySelector('i').className = 'fas fa-play';
    playButton.classList.remove('playing');
    showcaseCircle.classList.remove('playing');
    
    // Remove showcase mode
    document.body.classList.remove('showcase-mode');
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    
    // Remove music indicator
    if (playButton.musicIndicator) {
        playButton.musicIndicator.remove();
    }
    
    // Stop background music
    if (playButton.audioElement) {
        playButton.audioElement.pause();
        playButton.audioElement.currentTime = 0;
        console.log('🎵 Audio stopped');
    }
    
    // Stop backup audio if it exists
    if (playButton.backupAudio) {
        try {
            playButton.backupAudio.oscillator.stop();
            playButton.backupAudio.audioContext.close();
            playButton.backupAudio = null;
            console.log('🎵 Backup audio stopped');
        } catch (error) {
            console.log('Error stopping backup audio:', error);
        }
    }
    
    // Clear the interval
    if (showcaseInterval) {
        clearInterval(showcaseInterval);
        showcaseInterval = null;
    }
    
    // Reset section tracking
    playButton.currentSection = 0;
    
    // Show notification
    showNotification('⏹️ Auto showcase stopped', 'info');
    
    // Update showcase text
    document.querySelector('.showcase-text span').textContent = 'Auto Showcase';
    
    // Scroll back to top
    setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 500);
}

// Contact form handling
const contactForm = document.querySelector('.contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Get form data
        const formData = new FormData(contactForm);
        const name = contactForm.querySelector('input[type="text"]').value;
        const email = contactForm.querySelector('input[type="email"]').value;
        const message = contactForm.querySelector('textarea').value;
        
        // Simple validation
        if (name && email && message) {
            // Show success message
            showNotification('Thank you! Your message has been sent successfully.', 'success');
            contactForm.reset();
        } else {
            showNotification('Please fill in all fields.', 'error');
        }
    });
}

// Notification system
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
            <span>${message}</span>
        </div>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${type === 'success' ? '#1DB954' : type === 'error' ? '#E22134' : '#1DB954'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        z-index: 10000;
        transform: translateX(400px);
        transition: transform 0.3s ease;
    `;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Remove after 4 seconds
    setTimeout(() => {
        notification.style.transform = 'translateX(400px)';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 4000);
    
    return notification;
}

// Download CV functionality
const downloadBtn = document.querySelector('.btn-primary');
if (downloadBtn && downloadBtn.textContent.includes('Download')) {
    downloadBtn.addEventListener('click', (e) => {
        e.preventDefault();
        
        try {
            // Create a temporary link element for download
            const link = document.createElement('a');
            link.href = './Abhipreet_Choudhary_Resume.pdf';
            link.download = 'Abhipreet_Choudhary_Resume.pdf';
            link.target = '_blank';
            
            // Append to body, click, and remove
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            showNotification('📄 CV download started!', 'success');
            console.log('CV download initiated');
        } catch (error) {
            console.error('Download failed:', error);
            showNotification('❌ Download failed. Please try again.', 'error');
        }
    });
}

// Typing animation for hero title
function typeWriter(element, text, speed = 100) {
    let i = 0;
    element.textContent = '';
    
    function type() {
        if (i < text.length) {
            element.textContent += text.charAt(i);
            i++;
            setTimeout(type, speed);
        }
    }
    
    type();
}

// Initialize typing animation when page loads
window.addEventListener('load', () => {
    const heroTitle = document.querySelector('.hero-title');
    const originalText = heroTitle.textContent;
    
    // Start typing animation after a short delay
    setTimeout(() => {
        typeWriter(heroTitle, originalText, 100);
    }, 500);
});

// Spotify-style progress bar (for fun)
function createProgressBar() {
    const progressBar = document.createElement('div');
    progressBar.className = 'spotify-progress';
    progressBar.innerHTML = `
        <div class="progress-track">
            <div class="progress-fill"></div>
            <div class="progress-handle"></div>
        </div>
    `;
    
    progressBar.style.cssText = `
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        height: 4px;
        background: rgba(255, 255, 255, 0.1);
        z-index: 1000;
    `;
    
    const progressFill = progressBar.querySelector('.progress-fill');
    progressFill.style.cssText = `
        height: 100%;
        background: #1DB954;
        width: 0%;
        transition: width 0.1s ease;
    `;
    
    document.body.appendChild(progressBar);
    
    // Update progress based on scroll
    window.addEventListener('scroll', () => {
        const scrollPercent = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
        progressFill.style.width = `${Math.min(scrollPercent, 100)}%`;
    });
}

// Initialize progress bar
createProgressBar();

// Add some fun easter eggs
let konami = [];
const konamiCode = [38, 38, 40, 40, 37, 39, 37, 39, 66, 65]; // Up, Up, Down, Down, Left, Right, Left, Right, B, A

document.addEventListener('keydown', (e) => {
    konami.push(e.keyCode);
    if (konami.length > konamiCode.length) {
        konami.shift();
    }
    
    if (konami.join(',') === konamiCode.join(',')) {
        // Easter egg activated!
        showNotification('🎉 Konami Code activated! You found the secret!', 'success');
        
        // Add some fun effects
        document.body.style.animation = 'rainbow 2s infinite';
        
        setTimeout(() => {
            document.body.style.animation = '';
        }, 5000);
        
        konami = [];
    }
});

// Add rainbow animation for easter egg
const style = document.createElement('style');
style.textContent = `
    @keyframes rainbow {
        0% { filter: hue-rotate(0deg); }
        25% { filter: hue-rotate(90deg); }
        50% { filter: hue-rotate(180deg); }
        75% { filter: hue-rotate(270deg); }
        100% { filter: hue-rotate(360deg); }
    }
    
    .notification-content {
        display: flex;
        align-items: center;
        gap: 10px;
    }
`;
document.head.appendChild(style);

// Parallax effect for hero section
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const hero = document.querySelector('.hero');
    if (hero) {
        hero.style.transform = `translateY(${scrolled * 0.5}px)`;
    }
});

// Add loading animation
window.addEventListener('load', () => {
    // Hide any loading spinner if you add one
    const loader = document.querySelector('.loader');
    if (loader) {
        loader.style.opacity = '0';
        setTimeout(() => {
            loader.remove();
        }, 300);
    }
    
    // Fade in the main content
    document.body.style.opacity = '1';
});

// Set initial opacity for smooth loading
document.body.style.opacity = '0';
document.body.style.transition = 'opacity 0.3s ease';

console.log('🎵 Spotify Resume Website loaded successfully!');
console.log('💡 Try the Konami Code for a surprise: ↑↑↓↓←→←→BA');
