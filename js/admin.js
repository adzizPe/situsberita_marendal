// Admin Portal JavaScript - Firebase Version
document.addEventListener('DOMContentLoaded', function() {
    checkSession();
    initLogin();
    initDashboard();
});

const ADMIN = { username: 'adminsiapaaja', password: 'adminsiapaaja' };

let allNewsData = []; // Store all news from Firebase

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
    loadUsers();
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

// Section switching
function showSection(section) {
    document.querySelectorAll('.adm-nav-item').forEach(item => {
        item.classList.remove('active');
        if (item.dataset.section === section) {
            item.classList.add('active');
        }
    });
    
    const topbarTitle = document.querySelector('.adm-topbar h2');
    
    if (section === 'news') {
        document.querySelector('.adm-content:not(.adm-section)').style.display = 'block';
        document.getElementById('usersSection').style.display = 'none';
        if (topbarTitle) topbarTitle.textContent = 'Berita Masuk';
    } else if (section === 'users') {
        document.querySelector('.adm-content:not(.adm-section)').style.display = 'none';
        document.getElementById('usersSection').style.display = 'block';
        if (topbarTitle) topbarTitle.textContent = 'Users Login';
    }
}

window.showSection = showSection;

// Load users from Firebase
function loadUsers() {
    const usersList = document.getElementById('usersList');
    const totalUsers = document.getElementById('totalUsers');
    
    const checkFirebase = () => {
        if (window.firebaseUsers) {
            window.firebaseUsers.getAll((users) => {
                if (totalUsers) totalUsers.textContent = users.length;
                
                if (users.length === 0) {
                    usersList.innerHTML = '<p class="adm-empty-users">Belum ada user yang login</p>';
                    return;
                }
                
                usersList.innerHTML = users.map(user => `
                    <div class="adm-user-card">
                        <img src="${user.picture || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(user.name)}" alt="${user.name}" class="adm-user-avatar">
                        <div class="adm-user-info">
                            <strong>${escapeHtml(user.name)}</strong>
                            <small>${escapeHtml(user.email)}</small>
                        </div>
                        <div class="adm-user-stats">
                            <span title="Login count">🔑 ${user.loginCount || 1}x</span>
                            <span title="Last login">🕐 ${formatDateTime(user.lastLogin)}</span>
                        </div>
                    </div>
                `).join('');
            });
        } else {
            setTimeout(checkFirebase, 500);
        }
    };
    
    checkFirebase();
}

// Load news from Firebase
function loadNews() {
    const container = document.getElementById('adminNewsList');
    container.innerHTML = '<p style="text-align:center;padding:40px;color:#888;">Memuat data...</p>';
    
    const checkFirebase = () => {
        if (window.firebaseNews) {
            window.firebaseNews.init().then(() => {
                console.log('Firebase ready, loading news...');
                window.firebaseNews.getAll((news) => {
                    console.log('News loaded:', news.length);
                    allNewsData = news;
                    updateStats();
                    const activeFilter = document.querySelector('.adm-filter-btn.active');
                    renderNews(news, activeFilter ? activeFilter.dataset.filter : 'pending');
                });
            }).catch(err => {
                console.error('Firebase init error:', err);
                container.innerHTML = '<p style="text-align:center;padding:40px;color:#c00;">Gagal memuat. Error: ' + err.message + '</p>';
            });
        } else {
            console.log('Waiting for firebaseNews...');
            setTimeout(checkFirebase, 300);
        }
    };
    
    checkFirebase();
}

function getThumbnail(gambar) {
    if (Array.isArray(gambar)) {
        return gambar[0] || 'https://placehold.co/100x80/eee/999?text=No+Image';
    }
    return gambar || 'https://placehold.co/100x80/eee/999?text=No+Image';
}

function renderNews(data, filter = 'pending') {
    const container = document.getElementById('adminNewsList');
    const empty = document.getElementById('emptyState');
    
    if (!container) return;
    
    let filtered = filter === 'all' ? data : data.filter(n => n.status === filter);

    if (filtered.length === 0) {
        container.innerHTML = '<div class="adm-empty-state"><p>Tidak ada berita</p></div>';
        if (empty) empty.style.display = 'block';
        return;
    }

    if (empty) empty.style.display = 'none';
    
    container.innerHTML = filtered.map(news => `
        <div class="adm-news-item" data-id="${news.id}">
            <div class="adm-news-thumb">
                <img src="${getThumbnail(news.gambar)}" alt="" onerror="this.src='https://placehold.co/100x80/eee/999?text=Error'">
                ${Array.isArray(news.gambar) && news.gambar.length > 1 ? `<span class="adm-thumb-count">${news.gambar.length} file</span>` : ''}
            </div>
            <div class="adm-news-info">
                <span class="adm-news-status ${news.status}">${statusLabel(news.status)}</span>
                <h3 class="adm-news-title">${escapeHtml(news.judul || '')}</h3>
                <div class="adm-news-meta">
                    <span>👤 ${escapeHtml(news.penerbit || '')}</span>
                    <span>📍 ${escapeHtml(news.lokasi || '')}</span>
                    <span>📅 ${formatDate(news.tanggal)}</span>
                </div>
                <p class="adm-news-excerpt">${escapeHtml((news.deskripsi || '').substring(0, 100))}...</p>
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
    renderNews(allNewsData, filter);
}

function updateStats() {
    document.getElementById('pendingCount').textContent = allNewsData.filter(n => n.status === 'pending').length;
    document.getElementById('approvedCount').textContent = allNewsData.filter(n => n.status === 'approved').length;
    document.getElementById('rejectedCount').textContent = allNewsData.filter(n => n.status === 'rejected').length;
}

function viewDetail(id) {
    const news = allNewsData.find(n => n.id === id);
    if (!news) return;
    
    const media = Array.isArray(news.gambar) ? news.gambar : [news.gambar];
    const mediaTypes = news.mediaTypes || media.map(() => 'image');
    const submitter = news.submittedBy || {};
    
    document.getElementById('modalBody').innerHTML = `
        <div class="adm-detail-header">
            <span class="adm-news-status ${news.status}">${statusLabel(news.status)}</span>
            <h2 class="adm-detail-title">${escapeHtml(news.judul)}</h2>
        </div>
        
        <div class="adm-detail-gallery">
            <div class="adm-gallery-main">
                ${mediaTypes[0] === 'video' ? 
                    `<video src="${media[0]}" controls id="detailMainMedia"></video>` :
                    `<img src="${media[0]}" alt="" id="detailMainMedia" onerror="this.src='https://placehold.co/400x300/eee/999?text=Error'">`
                }
            </div>
            ${media.length > 1 ? `
                <div class="adm-gallery-thumbs">
                    ${media.map((m, idx) => `
                        <div class="adm-gallery-thumb ${idx === 0 ? 'active' : ''}" onclick="changeDetailMedia('${m}', '${mediaTypes[idx]}', this)">
                            ${mediaTypes[idx] === 'video' ? 
                                `<video src="${m}" muted></video><span class="adm-video-badge">▶</span>` :
                                `<img src="${m}" alt="Media ${idx + 1}">`
                            }
                        </div>
                    `).join('')}
                </div>
            ` : ''}
        </div>
        
        ${submitter.id ? `
        <div class="adm-detail-user">
            <div class="adm-detail-user-header">
                <span>👤 Akun Google Pengirim</span>
            </div>
            <div class="adm-detail-user-info">
                <img src="${submitter.picture || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(submitter.name || 'User')}" alt="">
                <div>
                    <strong>${escapeHtml(submitter.name || '-')}</strong>
                    <small>${escapeHtml(submitter.email || '-')}</small>
                </div>
            </div>
        </div>
        ` : ''}
        
        <div class="adm-detail-info">
            <div class="adm-detail-row">
                <span class="adm-detail-label">Nama Penerbit</span>
                <span class="adm-detail-value">${escapeHtml(news.penerbit)}</span>
            </div>
            <div class="adm-detail-row">
                <span class="adm-detail-label">Kategori</span>
                <span class="adm-detail-value">${capitalize(news.kategori)}</span>
            </div>
            <div class="adm-detail-row">
                <span class="adm-detail-label">Waktu Kejadian</span>
                <span class="adm-detail-value">${formatDate(news.tanggal)} ${news.waktu || ''}</span>
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
            <p>${escapeHtml(news.deskripsi || '').replace(/\n/g, '<br>')}</p>
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

window.changeDetailMedia = function(src, type, thumb) {
    const container = document.querySelector('.adm-gallery-main');
    if (type === 'video') {
        container.innerHTML = `<video src="${src}" controls id="detailMainMedia"></video>`;
    } else {
        container.innerHTML = `<img src="${src}" alt="" id="detailMainMedia">`;
    }
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

async function executeAction() {
    if (!pendingAction) return;
    
    const { id, action } = pendingAction;
    
    try {
        if (action === 'delete') {
            await window.firebaseNews.delete(id);
        } else if (action === 'approve') {
            await window.firebaseNews.updateStatus(id, 'approved');
        } else if (action === 'reject') {
            await window.firebaseNews.updateStatus(id, 'rejected');
        }
    } catch (err) {
        console.error('Action error:', err);
        alert('Gagal melakukan aksi: ' + err.message);
    }
    
    closeConfirmModal();
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

document.addEventListener('click', (e) => {
    if (e.target.classList.contains('adm-modal-overlay')) {
        e.target.classList.remove('active');
    }
});

window.viewDetail = viewDetail;
window.closeDetailModal = closeDetailModal;
window.confirmAction = confirmAction;
window.closeConfirmModal = closeConfirmModal;
