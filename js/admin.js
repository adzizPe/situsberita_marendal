// Admin Portal JavaScript
document.addEventListener('DOMContentLoaded', function() {
    checkSession();
    initLogin();
    initDashboard();
});

const ADMIN = { username: 'admin', password: 'marendal2025' };

function checkSession() {
    if (sessionStorage.getItem('adminLoggedIn') === 'true') {
        showDashboard();
    }
}

function initLogin() {
    const form = document.getElementById('adminLoginForm');
    
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const user = document.getElementById('adminUsername').value;
        const pass = document.getElementById('adminPassword').value;
        
        if (user === ADMIN.username && pass === ADMIN.password) {
            sessionStorage.setItem('adminLoggedIn', 'true');
            showDashboard();
        } else {
            document.getElementById('loginError').classList.add('show');
            setTimeout(() => {
                document.getElementById('loginError').classList.remove('show');
            }, 3000);
        }
    });
}

function showDashboard() {
    document.getElementById('loginSection').style.display = 'none';
    document.getElementById('adminDashboard').classList.add('active');
    loadNews();
    updateStats();
}

function initDashboard() {
    document.getElementById('btnLogout').addEventListener('click', () => {
        sessionStorage.removeItem('adminLoggedIn');
        location.reload();
    });

    document.querySelectorAll('.adm-filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.adm-filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            filterNews(btn.dataset.filter);
        });
    });
}

function loadNews() {
    const data = JSON.parse(localStorage.getItem('newsSubmissions') || '[]');
    renderNews(data, 'pending');
}

// Get thumbnail - support both single image and array
function getThumbnail(gambar) {
    if (Array.isArray(gambar)) {
        return gambar[0] || 'https://placehold.co/100x80/eee/999?text=No+Image';
    }
    return gambar || 'https://placehold.co/100x80/eee/999?text=No+Image';
}

function renderNews(data, filter = 'pending') {
    const container = document.getElementById('adminNewsList');
    const empty = document.getElementById('emptyState');
    
    let filtered = filter === 'all' ? data : data.filter(n => n.status === filter);

    if (filtered.length === 0) {
        container.innerHTML = '';
        container.appendChild(empty);
        empty.style.display = 'block';
        return;
    }

    empty.style.display = 'none';
    
    container.innerHTML = filtered.map(news => `
        <div class="adm-news-item" data-id="${news.id}">
            <div class="adm-news-thumb">
                <img src="${getThumbnail(news.gambar)}" alt="">
                ${Array.isArray(news.gambar) && news.gambar.length > 1 ? `<span class="adm-thumb-count">${news.gambar.length} foto</span>` : ''}
            </div>
            <div class="adm-news-info">
                <span class="adm-news-status ${news.status}">${statusLabel(news.status)}</span>
                <h3 class="adm-news-title">${escapeHtml(news.judul)}</h3>
                <div class="adm-news-meta">
                    <span>👤 ${escapeHtml(news.penerbit)}</span>
                    <span>📍 ${escapeHtml(news.lokasi)}</span>
                    <span>📅 Kejadian: ${formatDate(news.tanggal)}</span>
                </div>
                <p class="adm-news-excerpt">${escapeHtml(news.deskripsi.substring(0, 100))}...</p>
                <div class="adm-news-submitted">
                    <small>📩 Dikirim: ${formatDateTime(news.submittedAt)}</small>
                </div>
            </div>
            <div class="adm-news-actions">
                <button type="button" class="adm-btn adm-btn-view" onclick="viewDetail('${news.id}')">Lihat</button>
                ${news.status === 'pending' ? `
                    <button type="button" class="adm-btn adm-btn-approve" onclick="confirmAction('${news.id}', 'approve')">✓ Setujui</button>
                    <button type="button" class="adm-btn adm-btn-reject" onclick="confirmAction('${news.id}', 'reject')">✕ Tolak</button>
                ` : ''}
                <button type="button" class="adm-btn adm-btn-delete" onclick="confirmAction('${news.id}', 'delete')">🗑 Hapus</button>
            </div>
        </div>
    `).join('');
}

function filterNews(filter) {
    const data = JSON.parse(localStorage.getItem('newsSubmissions') || '[]');
    renderNews(data, filter);
}

function updateStats() {
    const data = JSON.parse(localStorage.getItem('newsSubmissions') || '[]');
    document.getElementById('pendingCount').textContent = data.filter(n => n.status === 'pending').length;
    document.getElementById('approvedCount').textContent = data.filter(n => n.status === 'approved').length;
    document.getElementById('rejectedCount').textContent = data.filter(n => n.status === 'rejected').length;
}

function viewDetail(id) {
    const data = JSON.parse(localStorage.getItem('newsSubmissions') || '[]');
    const news = data.find(n => n.id === id);
    if (!news) return;
    
    // Handle images - support both single and array
    const images = Array.isArray(news.gambar) ? news.gambar : [news.gambar];
    
    document.getElementById('modalBody').innerHTML = `
        <div class="adm-detail-header">
            <span class="adm-news-status ${news.status}">${statusLabel(news.status)}</span>
            <h2 class="adm-detail-title">${escapeHtml(news.judul)}</h2>
        </div>
        
        <div class="adm-detail-gallery">
            <div class="adm-gallery-main">
                <img src="${images[0]}" alt="" id="detailMainImg">
            </div>
            ${images.length > 1 ? `
                <div class="adm-gallery-thumbs">
                    ${images.map((img, idx) => `
                        <div class="adm-gallery-thumb ${idx === 0 ? 'active' : ''}" onclick="changeDetailImage('${img}', this)">
                            <img src="${img}" alt="Foto ${idx + 1}">
                        </div>
                    `).join('')}
                </div>
            ` : ''}
        </div>
        
        <div class="adm-detail-info">
            <div class="adm-detail-row">
                <span class="adm-detail-label">Pengirim</span>
                <span class="adm-detail-value">${escapeHtml(news.penerbit)}</span>
            </div>
            <div class="adm-detail-row">
                <span class="adm-detail-label">Kategori</span>
                <span class="adm-detail-value">${capitalize(news.kategori)}</span>
            </div>
            <div class="adm-detail-row">
                <span class="adm-detail-label">Waktu Kejadian</span>
                <span class="adm-detail-value">${formatDate(news.tanggal)} ${news.waktu}</span>
            </div>
            <div class="adm-detail-row">
                <span class="adm-detail-label">Waktu Dikirim</span>
                <span class="adm-detail-value">${formatDateTime(news.submittedAt)}</span>
            </div>
            <div class="adm-detail-row">
                <span class="adm-detail-label">Lokasi</span>
                <span class="adm-detail-value">${escapeHtml(news.lokasi)}</span>
            </div>
            <div class="adm-detail-row">
                <span class="adm-detail-label">Kontak</span>
                <span class="adm-detail-value">${news.kontakType === 'whatsapp' ? 'WA: ' : 'Email: '}${escapeHtml(news.kontakValue)}</span>
            </div>
        </div>
        
        <div class="adm-detail-content">
            <h4>Isi Berita:</h4>
            <p>${escapeHtml(news.deskripsi).replace(/\n/g, '<br>')}</p>
        </div>
        
        <div class="adm-detail-actions">
            ${news.status === 'pending' ? `
                <button type="button" class="adm-btn adm-btn-approve" onclick="confirmAction('${news.id}', 'approve'); closeDetailModal();">✓ Setujui</button>
                <button type="button" class="adm-btn adm-btn-reject" onclick="confirmAction('${news.id}', 'reject'); closeDetailModal();">✕ Tolak</button>
            ` : ''}
            <button type="button" class="adm-btn adm-btn-delete" onclick="confirmAction('${news.id}', 'delete'); closeDetailModal();">🗑 Hapus</button>
        </div>
    `;
    
    document.getElementById('detailModal').classList.add('active');
}

// Change image in detail modal
window.changeDetailImage = function(src, thumb) {
    document.getElementById('detailMainImg').src = src;
    document.querySelectorAll('.adm-gallery-thumb').forEach(t => t.classList.remove('active'));
    thumb.classList.add('active');
};

function closeDetailModal() {
    document.getElementById('detailModal').classList.remove('active');
}

let pendingAction = null;

function confirmAction(id, action) {
    pendingAction = { id, action };
    
    const title = document.getElementById('confirmTitle');
    const msg = document.getElementById('confirmMessage');
    const btn = document.getElementById('btnConfirmAction');
    
    if (action === 'approve') {
        title.textContent = 'Setujui Berita?';
        msg.textContent = 'Berita akan dipublikasikan ke halaman berita.';
        btn.className = 'adm-btn-confirm';
        btn.textContent = 'Ya, Setujui';
    } else if (action === 'reject') {
        title.textContent = 'Tolak Berita?';
        msg.textContent = 'Berita tidak akan dipublikasikan.';
        btn.className = 'adm-btn-confirm danger';
        btn.textContent = 'Ya, Tolak';
    } else if (action === 'delete') {
        title.textContent = 'Hapus Berita?';
        msg.textContent = 'Berita akan dihapus permanen dan tidak bisa dikembalikan.';
        btn.className = 'adm-btn-confirm danger';
        btn.textContent = 'Ya, Hapus';
    }
    
    btn.onclick = executeAction;
    document.getElementById('confirmModal').classList.add('active');
}

function closeConfirmModal() {
    document.getElementById('confirmModal').classList.remove('active');
    pendingAction = null;
}

function executeAction() {
    if (!pendingAction) return;
    
    let data = JSON.parse(localStorage.getItem('newsSubmissions') || '[]');
    const idx = data.findIndex(n => n.id === pendingAction.id);
    
    if (idx !== -1) {
        if (pendingAction.action === 'delete') {
            // Hapus dari submissions
            const newsId = data[idx].id;
            data.splice(idx, 1);
            localStorage.setItem('newsSubmissions', JSON.stringify(data));
            
            // Hapus juga dari published jika ada
            let published = JSON.parse(localStorage.getItem('publishedNews') || '[]');
            published = published.filter(n => n.id !== newsId);
            localStorage.setItem('publishedNews', JSON.stringify(published));
            
        } else if (pendingAction.action === 'approve') {
            data[idx].status = 'approved';
            data[idx].reviewedAt = new Date().toISOString();
            localStorage.setItem('newsSubmissions', JSON.stringify(data));
            publishNews(data[idx]);
            
        } else if (pendingAction.action === 'reject') {
            data[idx].status = 'rejected';
            data[idx].reviewedAt = new Date().toISOString();
            localStorage.setItem('newsSubmissions', JSON.stringify(data));
            
            // Hapus dari published jika sebelumnya sudah dipublish
            let published = JSON.parse(localStorage.getItem('publishedNews') || '[]');
            published = published.filter(n => n.id !== data[idx].id);
            localStorage.setItem('publishedNews', JSON.stringify(published));
        }
    }
    
    closeConfirmModal();
    
    const activeFilter = document.querySelector('.adm-filter-btn.active');
    filterNews(activeFilter.dataset.filter);
    updateStats();
}

// Publish news to public list
function publishNews(news) {
    let published = JSON.parse(localStorage.getItem('publishedNews') || '[]');
    
    // Cek apakah sudah ada, jika ada update saja
    const existingIdx = published.findIndex(n => n.id === news.id);
    
    const publishedNews = {
        id: news.id,
        judul: news.judul,
        penerbit: news.penerbit,
        gambar: news.gambar,
        deskripsi: news.deskripsi,
        tanggal: news.tanggal,
        waktu: news.waktu,
        lokasi: news.lokasi,
        kategori: news.kategori,
        publishedAt: new Date().toISOString()
    };
    
    if (existingIdx !== -1) {
        published[existingIdx] = publishedNews;
    } else {
        published.unshift(publishedNews);
    }
    
    localStorage.setItem('publishedNews', JSON.stringify(published));
}

// Helpers
function statusLabel(status) {
    return { pending: 'Menunggu', approved: 'Disetujui', rejected: 'Ditolak' }[status] || status;
}

function formatDate(str) {
    if (!str) return '-';
    return new Date(str).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}

function formatDateTime(str) {
    if (!str) return '-';
    const date = new Date(str);
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) + 
           ' ' + date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
}

function capitalize(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Close modal on overlay click
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('adm-modal-overlay')) {
        e.target.classList.remove('active');
    }
});

// Make functions global
window.viewDetail = viewDetail;
window.closeDetailModal = closeDetailModal;
window.confirmAction = confirmAction;
window.closeConfirmModal = closeConfirmModal;
