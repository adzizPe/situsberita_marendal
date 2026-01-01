// ===== Date Display =====
function updateDate() {
    const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    };
    const now = new Date();
    const dateStr = now.toLocaleDateString('id-ID', options);
    const dateElement = document.getElementById('current-date');
    if (dateElement) {
        dateElement.textContent = dateStr;
    }
    
    // Also update mobile weather date
    const mobileDateEl = document.getElementById('weatherDateMobile');
    if (mobileDateEl) {
        const shortDate = now.toLocaleDateString('id-ID', { 
            weekday: 'short', 
            day: 'numeric', 
            month: 'short',
            year: 'numeric'
        });
        mobileDateEl.textContent = '📅 ' + shortDate;
    }
}

// ===== Mobile Nav Scroll =====
function initNavScroll() {
    const navMenu = document.getElementById('navMenu');
    if (!navMenu) return;
    
    let isDown = false;
    let startX;
    let scrollLeft;

    navMenu.addEventListener('mousedown', (e) => {
        isDown = true;
        navMenu.style.cursor = 'grabbing';
        startX = e.pageX - navMenu.offsetLeft;
        scrollLeft = navMenu.scrollLeft;
    });

    navMenu.addEventListener('mouseleave', () => {
        isDown = false;
        navMenu.style.cursor = 'grab';
    });

    navMenu.addEventListener('mouseup', () => {
        isDown = false;
        navMenu.style.cursor = 'grab';
    });

    navMenu.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - navMenu.offsetLeft;
        const walk = (x - startX) * 2;
        navMenu.scrollLeft = scrollLeft - walk;
    });

    // Touch events for mobile
    navMenu.addEventListener('touchstart', (e) => {
        startX = e.touches[0].pageX - navMenu.offsetLeft;
        scrollLeft = navMenu.scrollLeft;
    }, { passive: true });

    navMenu.addEventListener('touchmove', (e) => {
        const x = e.touches[0].pageX - navMenu.offsetLeft;
        const walk = (x - startX) * 2;
        navMenu.scrollLeft = scrollLeft - walk;
    }, { passive: true });
}

// ===== Submenu Toggle for Mobile =====
function initSubmenu() {
    const hasSubmenu = document.querySelectorAll('.has-submenu');
    
    hasSubmenu.forEach(item => {
        const link = item.querySelector('a');
        
        link.addEventListener('click', (e) => {
            if (window.innerWidth <= 768) {
                e.preventDefault();
                item.classList.toggle('active');
                
                // Close other submenus
                hasSubmenu.forEach(other => {
                    if (other !== item) {
                        other.classList.remove('active');
                    }
                });
            }
        });
    });

    // Close submenu when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.has-submenu')) {
            hasSubmenu.forEach(item => {
                item.classList.remove('active');
            });
        }
    });
}

// ===== Ticker Animation Reset =====
function initTicker() {
    const ticker = document.querySelector('.ticker-content');
    if (!ticker) return;
    
    // Clone ticker items for seamless loop
    const items = ticker.innerHTML;
    ticker.innerHTML = items + items;
}

// ===== Search Box =====
function initSearch() {
    const searchBox = document.querySelector('.search-box');
    if (!searchBox) return;
    
    const input = searchBox.querySelector('input');
    const button = searchBox.querySelector('button');
    
    button.addEventListener('click', () => {
        const query = input.value.trim();
        if (query) {
            // Redirect to search page (implement as needed)
            console.log('Searching for:', query);
            // window.location.href = `search.html?q=${encodeURIComponent(query)}`;
        }
    });
    
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            button.click();
        }
    });
}

// ===== Smooth Scroll =====
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href === '#') return;
            
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });
}

// ===== Dark Mode Toggle =====
function initThemeToggle() {
    const themeToggle = document.getElementById('themeToggle');
    
    // Check for saved theme preference or default to light
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    
    // Apply rain effect if dark mode
    if (savedTheme === 'dark') {
        createRainEffect();
    }
    
    if (!themeToggle) return;
    
    themeToggle.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        
        // Toggle rain effect
        if (newTheme === 'dark') {
            createRainEffect();
        } else {
            removeRainEffect();
        }
    });
}

// ===== Rain Effect for Dark Mode =====
function createRainEffect() {
    // Remove existing rain container if any
    removeRainEffect();
    
    // Create rain container
    const rainContainer = document.createElement('div');
    rainContainer.className = 'rain-container';
    rainContainer.id = 'rainEffect';
    
    // Create rain drops
    const dropCount = 100;
    for (let i = 0; i < dropCount; i++) {
        const drop = document.createElement('div');
        drop.className = 'rain-drop';
        
        // Random position and animation
        drop.style.left = Math.random() * 100 + '%';
        drop.style.animationDuration = (Math.random() * 0.5 + 0.5) + 's';
        drop.style.animationDelay = Math.random() * 2 + 's';
        drop.style.opacity = Math.random() * 0.3 + 0.1;
        
        rainContainer.appendChild(drop);
    }
    
    document.body.appendChild(rainContainer);
}

function removeRainEffect() {
    const existing = document.getElementById('rainEffect');
    if (existing) {
        existing.remove();
    }
}

// Apply theme immediately to prevent flash
(function() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
})();

// ===== Sorotan Slider =====
function initSorotanSlider() {
    const track = document.getElementById('sorotanTrack');
    const prevBtn = document.getElementById('sorotanPrev');
    const nextBtn = document.getElementById('sorotanNext');
    
    if (!track || !prevBtn || !nextBtn) return;
    
    const scrollAmount = 300;
    
    prevBtn.addEventListener('click', () => {
        track.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    });
    
    nextBtn.addEventListener('click', () => {
        track.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    });
    
    // Auto scroll every 5 seconds
    let autoScroll = setInterval(() => {
        if (track.scrollLeft + track.clientWidth >= track.scrollWidth - 10) {
            track.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
            track.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
    }, 5000);
    
    // Pause auto scroll on hover
    track.addEventListener('mouseenter', () => clearInterval(autoScroll));
    track.addEventListener('mouseleave', () => {
        autoScroll = setInterval(() => {
            if (track.scrollLeft + track.clientWidth >= track.scrollWidth - 10) {
                track.scrollTo({ left: 0, behavior: 'smooth' });
            } else {
                track.scrollBy({ left: scrollAmount, behavior: 'smooth' });
            }
        }, 5000);
    });
}

// ===== Copy Link Function =====
function copyLink() {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
        const btn = document.querySelector('.share-btn.copy-link');
        if (btn) {
            btn.classList.add('copied');
            setTimeout(() => btn.classList.remove('copied'), 2000);
        }
        alert('Link berhasil disalin!');
    }).catch(err => {
        console.error('Gagal menyalin link:', err);
    });
}

// ===== Scroll Reveal Animation =====
function initScrollReveal() {
    const revealElements = document.querySelectorAll('.reveal');
    
    if (revealElements.length === 0) return;
    
    const revealOnScroll = () => {
        revealElements.forEach(el => {
            const elementTop = el.getBoundingClientRect().top;
            const elementBottom = el.getBoundingClientRect().bottom;
            const windowHeight = window.innerHeight;
            
            // Element masuk viewport
            if (elementTop < windowHeight - 80 && elementBottom > 80) {
                el.classList.add('active');
            } else {
                // Element keluar viewport - reset untuk efek berulang
                el.classList.remove('active');
            }
        });
    };
    
    // Initial check
    revealOnScroll();
    
    // On scroll
    window.addEventListener('scroll', revealOnScroll, { passive: true });
}

// ===== Page Loader =====
function hidePageLoader() {
    const loader = document.getElementById('pageLoader');
    if (loader) {
        loader.classList.add('hidden');
        // Remove from DOM after animation
        setTimeout(() => {
            loader.remove();
        }, 400);
    }
}

// ===== Initialize =====
document.addEventListener('DOMContentLoaded', () => {
    updateDate();
    initNavScroll();
    initSubmenu();
    initTicker();
    initSearch();
    initSmoothScroll();
    initThemeToggle();
    initSorotanSlider();
    initScrollReveal();
});

// Hide loader when page fully loaded
window.addEventListener('load', () => {
    hidePageLoader();
});
