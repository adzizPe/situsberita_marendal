// ===== Image Gallery =====
function changeMainImage(thumb, src) {
    const mainImage = document.getElementById('mainImage');
    if (mainImage) {
        mainImage.src = src;
    }
    
    // Update active state
    document.querySelectorAll('.gallery-thumb').forEach(t => {
        t.classList.remove('active');
    });
    thumb.classList.add('active');
}

// ===== Image Slider =====
let currentSlide = 0;
const slides = document.querySelectorAll('.slide');
const dots = document.querySelectorAll('.dot');

function showSlide(index) {
    if (!slides.length) return;
    
    if (index >= slides.length) currentSlide = 0;
    if (index < 0) currentSlide = slides.length - 1;
    
    slides.forEach((slide, i) => {
        slide.classList.remove('active');
        if (dots[i]) dots[i].classList.remove('active');
    });
    
    slides[currentSlide].classList.add('active');
    if (dots[currentSlide]) dots[currentSlide].classList.add('active');
}

function changeSlide(direction) {
    currentSlide += direction;
    showSlide(currentSlide);
}

function goToSlide(index) {
    currentSlide = index;
    showSlide(currentSlide);
}

// Auto slide every 5 seconds
if (slides.length > 0) {
    setInterval(() => {
        changeSlide(1);
    }, 5000);
}

// Touch/Swipe support
let touchStartX = 0;
let touchEndX = 0;

const sliderContainer = document.querySelector('.slider-container');
if (sliderContainer) {
    sliderContainer.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    });

    sliderContainer.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        const diff = touchStartX - touchEndX;
        if (Math.abs(diff) > 50) {
            changeSlide(diff > 0 ? 1 : -1);
        }
    });
}


// ===== Comment System with Login =====
const commentList = document.getElementById('commentList');
const commentFormContainer = document.getElementById('commentFormContainer');

// Get article ID from URL path
const articleId = window.location.pathname.replace(/\//g, '-').replace(/^-|-$/g, '') || 'default';

// Initialize comment form based on login state
function initCommentForm() {
    if (!commentFormContainer) return;
    
    const savedUser = localStorage.getItem('googleUser');
    
    if (savedUser) {
        const user = JSON.parse(savedUser);
        commentFormContainer.innerHTML = `
            <div class="comment-user-info">
                <img src="${user.picture}" alt="${user.name}" class="comment-user-avatar">
                <span>Berkomentar sebagai <strong>${user.name}</strong></span>
            </div>
            <form class="comment-form-simple" id="commentForm">
                <textarea id="commentText" placeholder="Tulis komentar..." required></textarea>
                <button type="submit">Kirim Komentar</button>
            </form>
        `;
        
        // Attach form handler
        const form = document.getElementById('commentForm');
        if (form) {
            form.addEventListener('submit', handleCommentSubmit);
        }
    } else {
        commentFormContainer.innerHTML = `
            <div class="comment-login-prompt">
                <p>🔐 Silakan login untuk berkomentar</p>
                <button type="button" class="btn-comment-login" onclick="showLoginModal()">
                    Login dengan Google
                </button>
            </div>
        `;
    }
}

// Handle comment submit
function handleCommentSubmit(e) {
    e.preventDefault();
    
    const savedUser = localStorage.getItem('googleUser');
    if (!savedUser) {
        showLoginModal();
        return;
    }
    
    const user = JSON.parse(savedUser);
    const textInput = document.getElementById('commentText');
    const text = textInput.value.trim();
    
    if (!text) {
        alert('Mohon isi komentar');
        return;
    }
    
    // Save and render
    const comments = saveComment(user.name, user.picture, text);
    renderComments(comments);
    
    // Clear form
    textInput.value = '';
    
    // Scroll to comments
    commentList.scrollIntoView({ behavior: 'smooth' });
}

// Load comments from localStorage
function loadComments() {
    const comments = JSON.parse(localStorage.getItem(`comments_${articleId}`)) || [];
    renderComments(comments);
}

// Save comment to localStorage
function saveComment(name, picture, text) {
    const comments = JSON.parse(localStorage.getItem(`comments_${articleId}`)) || [];
    
    const newComment = {
        id: Date.now(),
        name: name,
        picture: picture,
        text: text,
        date: new Date().toLocaleString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    };
    
    comments.unshift(newComment);
    localStorage.setItem(`comments_${articleId}`, JSON.stringify(comments));
    
    return comments;
}

// Render comments to DOM
function renderComments(comments) {
    if (!commentList) return;
    
    if (comments.length === 0) {
        commentList.innerHTML = '<p class="no-comments">Belum ada komentar. Jadilah yang pertama!</p>';
        return;
    }
    
    let html = '';
    comments.forEach(comment => {
        const avatar = comment.picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(comment.name)}&background=2d8a4e&color=fff`;
        html += `
            <div class="comment-item-simple">
                <div class="comment-header">
                    <img src="${avatar}" alt="${escapeHtml(comment.name)}" class="comment-avatar">
                    <div class="comment-meta">
                        <span class="comment-name">${escapeHtml(comment.name)}</span>
                        <span class="comment-date">${comment.date}</span>
                    </div>
                </div>
                <p class="comment-text">${escapeHtml(comment.text)}</p>
            </div>
        `;
    });
    
    commentList.innerHTML = html;
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Load comments and init form on page load
document.addEventListener('DOMContentLoaded', () => {
    initCommentForm();
    loadComments();
});
