// Kirim Berita JavaScript - Support Multiple Images & Videos
document.addEventListener('DOMContentLoaded', function() {
    initKirimBerita();
});

let uploadedImages = [];

// Check if user is logged in
function isUserLoggedIn() {
    return localStorage.getItem('googleUser') !== null;
}

// Compress image to reduce size - more aggressive compression
function compressImage(file, maxWidth = 800, quality = 0.6) {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;
                
                // Resize if too large
                if (width > maxWidth) {
                    height = (height * maxWidth) / width;
                    width = maxWidth;
                }
                
                canvas.width = width;
                canvas.height = height;
                
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                
                // Convert to compressed JPEG
                const compressedData = canvas.toDataURL('image/jpeg', quality);
                console.log('Compressed image size:', Math.round(compressedData.length / 1024), 'KB');
                resolve(compressedData);
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    });
}

// Process video - warn about size
function processVideo(file) {
    return new Promise((resolve, reject) => {
        const sizeInMB = file.size / (1024 * 1024);
        
        // Reject video larger than 2MB for localStorage
        if (sizeInMB > 2) {
            reject(new Error(`Video terlalu besar (${sizeInMB.toFixed(1)}MB). Maksimal 2MB untuk video. Silakan compress video terlebih dahulu.`));
            return;
        }
        
        const reader = new FileReader();
        reader.onload = (e) => {
            resolve(e.target.result);
        };
        reader.onerror = () => reject(new Error('Gagal membaca video'));
        reader.readAsDataURL(file);
    });
}

// Calculate approximate localStorage usage
function getLocalStorageSize() {
    let total = 0;
    for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
            total += localStorage[key].length * 2; // UTF-16 = 2 bytes per char
        }
    }
    return total;
}

// Check if data can fit in localStorage
function canFitInLocalStorage(dataString) {
    const currentSize = getLocalStorageSize();
    const newDataSize = dataString.length * 2;
    const maxSize = 5 * 1024 * 1024; // 5MB limit
    
    return (currentSize + newDataSize) < maxSize;
}

// Show login notification
function showLoginNotification() {
    // Remove existing notification if any
    const existing = document.getElementById('loginNotification');
    if (existing) existing.remove();
    
    const notification = document.createElement('div');
    notification.id = 'loginNotification';
    notification.className = 'login-notification';
    notification.innerHTML = `
        <div class="login-notif-content">
            <span class="login-notif-icon">🔐</span>
            <div class="login-notif-text">
                <strong>Login Diperlukan</strong>
                <p>Silakan login dengan Google untuk mengirim berita</p>
            </div>
            <button type="button" class="login-notif-btn" onclick="showLoginModal(); closeLoginNotification();">
                Login Sekarang
            </button>
            <button type="button" class="login-notif-close" onclick="closeLoginNotification()">×</button>
        </div>
    `;
    document.body.appendChild(notification);
    
    // Show with animation
    setTimeout(() => notification.classList.add('active'), 10);
    
    // Auto hide after 5 seconds
    setTimeout(() => closeLoginNotification(), 5000);
}

function closeLoginNotification() {
    const notification = document.getElementById('loginNotification');
    if (notification) {
        notification.classList.remove('active');
        setTimeout(() => notification.remove(), 300);
    }
}

function initKirimBerita() {
    const form = document.getElementById('submitNewsForm');
    if (!form) return;
    
    const uploadArea = document.getElementById('imageUploadArea');
    const fileInput = document.getElementById('gambarBerita');
    const uploadInner = document.getElementById('uploadPlaceholder');
    const previewContainer = document.getElementById('imagePreviewContainer');
    const textarea = document.getElementById('deskripsiBerita');
    const charCount = document.getElementById('charCount');
    const contactRadios = document.querySelectorAll('input[name="contactType"]');
    const kontakInput = document.getElementById('kontakValue');
    const tanggalInput = document.getElementById('tanggalBerita');
    const waktuInput = document.getElementById('waktuBerita');
    
    // Auto-fill name from Google account if logged in
    const savedUser = localStorage.getItem('googleUser');
    if (savedUser) {
        const user = JSON.parse(savedUser);
        const namaPenerbit = document.getElementById('namaPenerbit');
        if (namaPenerbit && !namaPenerbit.value) {
            namaPenerbit.value = user.name;
        }
    }

    // Set tanggal dan waktu hari ini
    const now = new Date();
    if (tanggalInput) tanggalInput.value = now.toISOString().split('T')[0];
    if (waktuInput) waktuInput.value = now.toTimeString().slice(0, 5);

    // Upload area click - check login first
    uploadArea.addEventListener('click', (e) => {
        if (!e.target.closest('.kb-preview-item') && !e.target.closest('.kb-preview-add')) {
            if (!isUserLoggedIn()) {
                showLoginNotification();
                return;
            }
            fileInput.click();
        }
    });
    
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        if (!isUserLoggedIn()) {
            showLoginNotification();
            return;
        }
        uploadArea.classList.add('dragover');
    });

    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('dragover');
    });

    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        
        if (!isUserLoggedIn()) {
            showLoginNotification();
            return;
        }
        handleFiles(e.dataTransfer.files);
    });

    fileInput.addEventListener('change', (e) => {
        if (!isUserLoggedIn()) {
            showLoginNotification();
            fileInput.value = '';
            return;
        }
        handleFiles(e.target.files);
        fileInput.value = '';
    });

    async function handleFiles(files) {
        for (const file of Array.from(files)) {
            if (uploadedImages.length >= 5) {
                alert('Maksimal 5 file.');
                return;
            }
            
            // Accept images and videos
            const validImageTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
            const validVideoTypes = ['video/mp4', 'video/quicktime', 'video/webm', 'video/x-msvideo'];
            const isImage = validImageTypes.includes(file.type);
            const isVideo = validVideoTypes.includes(file.type);
            
            if (!isImage && !isVideo) {
                alert('Format file tidak didukung. Gunakan JPG, PNG, WebP, GIF, MP4, atau MOV.');
                continue;
            }

            try {
                let mediaData;
                
                if (isImage) {
                    // Compress image
                    const compressedData = await compressImage(file);
                    mediaData = {
                        data: compressedData,
                        type: 'image',
                        name: file.name
                    };
                } else {
                    // Process video - with size check
                    const videoData = await processVideo(file);
                    mediaData = {
                        data: videoData,
                        type: 'video',
                        name: file.name
                    };
                }
                
                uploadedImages.push(mediaData);
                renderPreviews();
            } catch (err) {
                console.error('Error processing file:', err);
                alert(err.message || 'Gagal memproses file: ' + file.name);
            }
        }
    }

    function renderPreviews() {
        if (uploadedImages.length > 0) {
            uploadInner.style.display = 'none';
            previewContainer.innerHTML = uploadedImages.map((media, idx) => {
                const isVideo = media.type === 'video';
                const src = typeof media === 'string' ? media : media.data;
                
                return `
                    <div class="kb-preview-item ${isVideo ? 'kb-preview-video' : ''}">
                        ${isVideo ? 
                            `<video src="${src}" muted></video><span class="kb-video-badge">▶ Video</span>` : 
                            `<img src="${src}" alt="Preview ${idx + 1}">`
                        }
                        <button type="button" class="kb-preview-remove" onclick="removeImage(${idx})">×</button>
                        ${idx === 0 ? '<span class="kb-preview-main">Utama</span>' : ''}
                    </div>
                `;
            }).join('') + `
                ${uploadedImages.length < 5 ? `
                    <div class="kb-preview-add" onclick="triggerFileInput()">
                        <span>+</span>
                        <small>Tambah</small>
                    </div>
                ` : ''}
            `;
            previewContainer.classList.add('active');
        } else {
            uploadInner.style.display = 'block';
            previewContainer.innerHTML = '';
            previewContainer.classList.remove('active');
        }
    }

    // Global function untuk trigger file input dengan login check
    window.triggerFileInput = function() {
        if (!isUserLoggedIn()) {
            showLoginNotification();
            return;
        }
        document.getElementById('gambarBerita').click();
    };

    // Global function untuk remove image
    window.removeImage = function(idx) {
        uploadedImages.splice(idx, 1);
        renderPreviews();
    };

    // Character count
    if (textarea) {
        textarea.addEventListener('input', () => {
            charCount.textContent = textarea.value.length;
        });
    }

    // Contact type
    contactRadios.forEach(radio => {
        radio.addEventListener('change', () => {
            if (radio.value === 'whatsapp') {
                kontakInput.placeholder = '08xxxxxxxxxx';
                kontakInput.type = 'tel';
            } else {
                kontakInput.placeholder = 'email@contoh.com';
                kontakInput.type = 'email';
            }
        });
    });

    // Submit form - check login
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        console.log('Form submitted');
        
        // Check login first
        if (!isUserLoggedIn()) {
            console.log('User not logged in');
            showLoginNotification();
            return;
        }
        
        const user = JSON.parse(localStorage.getItem('googleUser'));
        console.log('User:', user);
        
        if (uploadedImages.length === 0) {
            alert('Silakan upload minimal 1 foto/video berita.');
            return;
        }

        const noHoax = document.getElementById('noHoax');
        if (!noHoax.checked) {
            alert('Anda harus menyetujui pernyataan bukan hoax.');
            return;
        }

        // Validate required fields
        const judul = document.getElementById('judulBerita').value.trim();
        const penerbit = document.getElementById('namaPenerbit').value.trim();
        const deskripsi = document.getElementById('deskripsiBerita').value.trim();
        const lokasi = document.getElementById('lokasiKejadian').value.trim();
        const kategori = document.getElementById('kategoriBerita').value;
        const kontakValue = document.getElementById('kontakValue').value.trim();
        
        if (!judul || !penerbit || !deskripsi || !lokasi || !kategori || !kontakValue) {
            alert('Mohon lengkapi semua field yang wajib diisi.');
            return;
        }

        const data = {
            id: 'news_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
            judul: judul,
            penerbit: penerbit,
            gambar: uploadedImages.map(m => typeof m === 'string' ? m : m.data),
            mediaTypes: uploadedImages.map(m => typeof m === 'string' ? 'image' : m.type),
            deskripsi: deskripsi,
            tanggal: document.getElementById('tanggalBerita').value,
            waktu: document.getElementById('waktuBerita').value,
            lokasi: lokasi,
            kategori: kategori,
            kontakType: document.querySelector('input[name="contactType"]:checked').value,
            kontakValue: kontakValue,
            status: 'pending',
            submittedAt: new Date().toISOString(),
            submittedBy: {
                id: user.id,
                name: user.name,
                email: user.email,
                picture: user.picture
            }
        };

        console.log('Data to save:', data);

        // Simpan ke localStorage dengan pengecekan ukuran
        try {
            let submissions = JSON.parse(localStorage.getItem('newsSubmissions') || '[]');
            submissions.unshift(data);
            
            const dataString = JSON.stringify(submissions);
            
            // Check if data can fit
            if (!canFitInLocalStorage(dataString)) {
                alert('Penyimpanan penuh! Silakan gunakan gambar yang lebih kecil atau hapus beberapa berita lama di admin.');
                return;
            }
            
            localStorage.setItem('newsSubmissions', dataString);
            console.log('Data saved successfully');
            
            // Verify data was saved
            const saved = JSON.parse(localStorage.getItem('newsSubmissions') || '[]');
            if (!saved.find(n => n.id === data.id)) {
                throw new Error('Data tidak tersimpan dengan benar');
            }
            
        } catch (err) {
            console.error('Error saving data:', err);
            
            if (err.name === 'QuotaExceededError' || err.message.includes('quota')) {
                alert('Penyimpanan penuh! Gambar/video terlalu besar. Coba:\n1. Gunakan gambar yang lebih kecil\n2. Jangan upload video\n3. Hapus berita lama di admin');
            } else {
                alert('Gagal menyimpan berita: ' + err.message);
            }
            return;
        }

        // Tampilkan modal sukses
        document.getElementById('successModal').classList.add('active');

        // Reset form
        form.reset();
        uploadedImages = [];
        renderPreviews();
        if (charCount) charCount.textContent = '0';
        if (tanggalInput) tanggalInput.value = new Date().toISOString().split('T')[0];
        if (waktuInput) waktuInput.value = new Date().toTimeString().slice(0, 5);
        
        // Re-fill name
        if (user) {
            const namaPenerbit = document.getElementById('namaPenerbit');
            if (namaPenerbit) namaPenerbit.value = user.name;
        }
    });
}

function closeModal() {
    document.getElementById('successModal').classList.remove('active');
}

document.addEventListener('click', (e) => {
    const modal = document.getElementById('successModal');
    if (e.target === modal) {
        closeModal();
    }
});
