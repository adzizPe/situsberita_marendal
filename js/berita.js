// ===== Berita Page - Firebase Integration =====

// Firebase config
const firebaseBeritaConfig = {
    apiKey: "AIzaSyAAjCd2CvsfiRCVWcwNSmjNt_w3N4eVSbM",
    authDomain: "login-fe9bf.firebaseapp.com",
    databaseURL: "https://login-fe9bf-default-rtdb.firebaseio.com",
    projectId: "login-fe9bf",
    storageBucket: "login-fe9bf.firebasestorage.app",
    messagingSenderId: "698680870534",
    appId: "1:698680870534:web:bc3f03d534a9659f6d7307"
};

let beritaDatabase;

// Initialize Firebase for berita page
function initFirebaseBerita() {
    return new Promise((resolve, reject) => {
        const checkFirebase = setInterval(() => {
            if (typeof firebase !== 'undefined') {
                clearInterval(checkFirebase);
                try {
                    let app;
                    try {
                        app = firebase.app('beritaApp');
                    } catch (e) {
                        app = firebase.initializeApp(firebaseBeritaConfig, 'beritaApp');
                    }
                    beritaDatabase = app.database();
                    resolve();
                } catch (err) {
                    reject(err);
                }
            }
        }, 100);
        
        setTimeout(() => {
            clearInterval(checkFirebase);
            reject(new Error('Firebase not loaded'));
        }, 10000);
    });
}

// Get approved news from Firebase
function getApprovedNews(callback) {
    const newsRef = beritaDatabase.ref('newsSubmissions');
    newsRef.on('value', (snapshot) => {
        const news = [];
        if (snapshot.exists()) {
            snapshot.forEach((child) => {
                const item = child.val();
                if (item.status === 'approved') {
                    news.push(item);
                }
            });
            // Sort by date descending
            news.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
        }
        callback(news);
    });
}

function formatDate(dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function capitalize(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
}

// Render news grid
function renderNewsGrid(publishedNews = []) {
    const container = document.getElementById('newsGrid');
    if (!container) return;
    
    // Start with static news (banjir pesantren)
    let html = `
        <article class="news-card-full" data-kategori="bencana" data-title="banjir seret banyak gelondongan kayu pesantren darul mukhlisin karang baru aceh tamiang">
            <a href="./banjir-pesantren-aceh-tamiang/" class="news-card-image">
                <span class="region-badge">ACEH</span>
                <img src="../assets/2.png" alt="Banjir Pesantren Aceh Tamiang">
            </a>
            <div class="news-card-content">
                <span class="news-card-category">Bencana</span>
                <h3 class="news-card-title"><a href="./banjir-pesantren-aceh-tamiang/">Banjir Seret Banyak Gelondongan Kayu, Pesantren Darul Mukhlisin di Karang Baru Aceh Tamiang Terdampak</a></h3>
                <p class="news-card-excerpt">Banjir menerjang kawasan Pesantren Darul Mukhlisin yang berada di Kecamatan Karang Baru, Kabupaten Aceh Tamiang. Arus banjir membawa banyak gelondongan kayu dari arah hulu...</p>
                <span class="news-card-meta">📅 20 Des 2025 • 📍 Karang Baru, Aceh Tamiang</span>
            </div>
        </article>
    `;
    
    // Add approved news from Firebase
    publishedNews.forEach(news => {
        const images = Array.isArray(news.gambar) ? news.gambar : [news.gambar];
        const mediaTypes = news.mediaTypes || images.map(() => 'image');
        const isVideo = mediaTypes[0] === 'video';
        const searchTitle = (news.judul + ' ' + news.lokasi + ' ' + news.deskripsi).toLowerCase();
        const slug = news.slug || news.id; // fallback ke id kalau belum ada slug
        
        html += `
            <article class="news-card-full" data-kategori="${news.kategori}" data-title="${escapeHtml(searchTitle)}">
                <a href="./detail/?slug=${slug}" class="news-card-image">
                    <span class="news-badge-user">Kiriman Warga</span>
                    ${isVideo ? 
                        `<video src="${images[0]}" autoplay muted loop playsinline></video>` :
                        `<img src="${images[0]}" alt="${escapeHtml(news.judul)}" onerror="this.src='https://placehold.co/400x200/eee/999?text=Gambar'">`
                    }
                </a>
                <div class="news-card-content">
                    <span class="news-card-category">${capitalize(news.kategori)}</span>
                    <h3 class="news-card-title"><a href="./detail/?slug=${slug}">${escapeHtml(news.judul)}</a></h3>
                    <p class="news-card-excerpt">${escapeHtml((news.deskripsi || '').substring(0, 150))}...</p>
                    <span class="news-card-meta">📅 ${formatDate(news.tanggal)} • 📍 ${escapeHtml(news.lokasi)}</span>
                </div>
            </article>
        `;
    });
    
    container.innerHTML = html;
    
    // Apply current filter
    filterNews();
}

// Filter & Search
let currentKategori = 'semua';
let searchQuery = '';

function filterNews() {
    const newsCards = document.querySelectorAll('.news-card-full');
    let visibleCount = 0;
    
    newsCards.forEach(card => {
        const cardKategori = card.dataset.kategori;
        const cardTitle = card.dataset.title || '';
        const cardText = card.querySelector('.news-card-title').textContent.toLowerCase();
        const cardExcerpt = card.querySelector('.news-card-excerpt')?.textContent.toLowerCase() || '';
        
        const matchKategori = currentKategori === 'semua' || cardKategori === currentKategori;
        const searchLower = searchQuery.toLowerCase();
        const matchSearch = searchQuery === '' || 
            cardTitle.includes(searchLower) || 
            cardText.includes(searchLower) || 
            cardExcerpt.includes(searchLower);
        
        if (matchKategori && matchSearch) {
            card.style.display = 'flex';
            visibleCount++;
        } else {
            card.style.display = 'none';
        }
    });
    
    updatePageTitle();
    updateNoResults(visibleCount);
}

function updatePageTitle() {
    const pageTitle = document.getElementById('pageTitle');
    if (!pageTitle) return;
    
    const names = {
        'semua': 'Semua Berita',
        'bencana': 'Berita Bencana',
        'politik': 'Berita Politik',
        'olahraga': 'Berita Olahraga',
        'kuliner': 'Berita Kuliner',
        'ekonomi': 'Berita Ekonomi',
        'kesehatan': 'Berita Kesehatan',
        'pendidikan': 'Berita Pendidikan',
        'wisata': 'Berita Wisata',
        'lainnya': 'Berita Lainnya'
    };
    
    let title = names[currentKategori] || 'Semua Berita';
    if (searchQuery) {
        title += ` - "${searchQuery}"`;
    }
    pageTitle.textContent = title;
}

function updateNoResults(count) {
    const container = document.getElementById('newsGrid');
    let noResults = document.getElementById('noResults');
    
    if (count === 0) {
        if (!noResults) {
            noResults = document.createElement('div');
            noResults.id = 'noResults';
            noResults.className = 'no-results';
            noResults.innerHTML = `
                <p>😕 Tidak ada berita yang ditemukan</p>
                <button onclick="resetSearch()">Reset Pencarian</button>
            `;
            container.appendChild(noResults);
        }
        noResults.style.display = 'block';
    } else if (noResults) {
        noResults.style.display = 'none';
    }
}

function resetSearch() {
    searchQuery = '';
    currentKategori = 'semua';
    
    const searchInput = document.getElementById('searchBerita');
    if (searchInput) searchInput.value = '';
    
    document.querySelectorAll('.category-tab').forEach(tab => {
        tab.classList.remove('active');
        if (tab.dataset.kategori === 'semua') {
            tab.classList.add('active');
        }
    });
    
    filterNews();
    
    const url = new URL(window.location);
    url.searchParams.delete('kategori');
    url.searchParams.delete('q');
    window.history.pushState({}, '', url);
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Show loading
    const container = document.getElementById('newsGrid');
    if (container) {
        container.innerHTML = '<p style="text-align:center;padding:40px;color:#888;">Memuat berita...</p>';
    }
    
    // Init Firebase and load news
    initFirebaseBerita().then(() => {
        getApprovedNews((news) => {
            renderNewsGrid(news);
            
            // Apply URL params after render
            const urlParams = new URLSearchParams(window.location.search);
            const kategoriParam = urlParams.get('kategori');
            const searchParam = urlParams.get('q');
            
            if (kategoriParam) {
                currentKategori = kategoriParam;
                document.querySelectorAll('.category-tab').forEach(tab => {
                    tab.classList.remove('active');
                    if (tab.dataset.kategori === kategoriParam) {
                        tab.classList.add('active');
                    }
                });
            }
            
            if (searchParam) {
                searchQuery = searchParam;
                const searchInput = document.getElementById('searchBerita');
                if (searchInput) searchInput.value = searchParam;
            }
            
            if (kategoriParam || searchParam) {
                filterNews();
            }
        });
    }).catch(err => {
        console.error('Firebase error:', err);
        // Fallback - render without Firebase data
        renderNewsGrid([]);
    });
    
    // Category tabs
    document.querySelectorAll('.category-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.category-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            currentKategori = tab.dataset.kategori;
            filterNews();
            
            const url = new URL(window.location);
            if (currentKategori === 'semua') {
                url.searchParams.delete('kategori');
            } else {
                url.searchParams.set('kategori', currentKategori);
            }
            window.history.pushState({}, '', url);
        });
    });
    
    // Search
    const searchInput = document.getElementById('searchBerita');
    const searchBtn = document.getElementById('btnSearchBerita');
    
    if (searchInput) {
        if (searchBtn) {
            searchBtn.addEventListener('click', () => {
                searchQuery = searchInput.value.trim();
                filterNews();
                updateSearchUrl();
            });
        }
        
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                searchQuery = searchInput.value.trim();
                filterNews();
                updateSearchUrl();
            }
        });
        
        searchInput.addEventListener('input', () => {
            if (searchInput.value === '') {
                searchQuery = '';
                filterNews();
                updateSearchUrl();
            }
        });
    }
});

function updateSearchUrl() {
    const url = new URL(window.location);
    if (searchQuery) {
        url.searchParams.set('q', searchQuery);
    } else {
        url.searchParams.delete('q');
    }
    window.history.pushState({}, '', url);
}

window.resetSearch = resetSearch;
