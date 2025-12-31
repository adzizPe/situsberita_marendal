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


// ===== Comment System with localStorage =====
const commentForm = document.getElementById('commentForm');
const commentList = document.getElementById('commentList');
const commentNameInput = document.getElementById('commentName');
const commentTextInput = document.getElementById('commentText');

// Get article ID from URL path
const articleId = window.location.pathname.replace(/\//g, '-').replace(/^-|-$/g, '') || 'default';

// Load comments from localStorage
function loadComments() {
    const comments = JSON.parse(localStorage.getItem(`comments_${articleId}`)) || [];
    renderComments(comments);
}

// Save comment to localStorage
function saveComment(name, text) {
    const comments = JSON.parse(localStorage.getItem(`comments_${articleId}`)) || [];
    
    const newComment = {
        id: Date.now(),
        name: name,
        text: text,
        date: new Date().toLocaleString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    };
    
    comments.unshift(newComment); // Add to beginning
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
        html += `
            <div class="comment-item-simple">
                <div class="comment-header">
                    <span class="comment-name">${escapeHtml(comment.name)}</span>
                    <span class="comment-date">${comment.date}</span>
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

// Handle form submit
if (commentForm) {
    commentForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const name = commentNameInput.value.trim();
        const text = commentTextInput.value.trim();
        
        if (!name || !text) {
            alert('Mohon isi nama dan komentar');
            return;
        }
        
        // Save and render
        const comments = saveComment(name, text);
        renderComments(comments);
        
        // Clear form
        commentNameInput.value = '';
        commentTextInput.value = '';
        
        // Scroll to comments
        commentList.scrollIntoView({ behavior: 'smooth' });
    });
}

// Load comments on page load
document.addEventListener('DOMContentLoaded', loadComments);
