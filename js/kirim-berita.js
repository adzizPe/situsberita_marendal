// Kirim Berita JavaScript - Support Multiple Images
document.addEventListener('DOMContentLoaded', function() {
    checkLoginForKirimBerita();
    initKirimBerita();
});

let uploadedImages = [];

// Check if user is logged in
function checkLoginForKirimBerita() {
    const savedUser = localStorage.getItem('googleUser');
    const formContainer = document.querySelector('.kb-form-container');
    
    if (!savedUser) {
        // Show login required message
        if (formContainer) {
            formContainer.innerHTML = `
                <div class="kb-login-required">
                    <div class="kb-login-icon">🔐</div>
                    <h2>Login Diperlukan</h2>
                    <p>Untuk mengirim berita, silakan login terlebih dahulu dengan akun Google Anda.</p>
                    <button type="button" class="kb-btn-login" onclick="showLoginModal()">
                        Login dengan Google
                    </button>
                </div>
            `;
        }
        return false;
    }
    return true;
}

function initKirimBerita() {
    const form = document.getElementById('submitNewsForm');
    if (!form) return; // Form not available (user not logged in)
    
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
    
    // Auto-fill name from Google account
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
    tanggalInput.value = now.toISOString().split('T')[0];
    waktuInput.value = now.toTimeString().slice(0, 5);

    // Upload gambar - support multiple
    uploadArea.addEventListener('click', (e) => {
        if (!e.target.closest('.kb-preview-item')) {
            fileInput.click();
        }
    });
    
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('dragover');
    });

    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('dragover');
    });

    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        handleFiles(e.dataTransfer.files);
    });

    fileInput.addEventListener('change', (e) => {
        handleFiles(e.target.files);
        fileInput.value = ''; // Reset untuk bisa upload file yang sama
    });

    function handleFiles(files) {
        Array.from(files).forEach(file => {
            if (uploadedImages.length >= 5) {
                alert('Maksimal 5 foto.');
                return;
            }
            
            const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
            if (!validTypes.includes(file.type)) {
                alert('Format file tidak didukung. Gunakan JPG, PNG, atau WebP.');
                return;
            }
            if (file.size > 5 * 1024 * 1024) {
                alert('Ukuran file terlalu besar. Maksimal 5MB per foto.');
                return;
            }

            const reader = new FileReader();
            reader.onload = (e) => {
                const imageData = e.target.result;
                uploadedImages.push(imageData);
                renderPreviews();
            };
            reader.readAsDataURL(file);
        });
    }

    function renderPreviews() {
        if (uploadedImages.length > 0) {
            uploadInner.style.display = 'none';
            previewContainer.innerHTML = uploadedImages.map((img, idx) => `
                <div class="kb-preview-item">
                    <img src="${img}" alt="Preview ${idx + 1}">
                    <button type="button" class="kb-preview-remove" onclick="removeImage(${idx})">×</button>
                    ${idx === 0 ? '<span class="kb-preview-main">Utama</span>' : ''}
                </div>
            `).join('') + `
                ${uploadedImages.length < 5 ? `
                    <div class="kb-preview-add" onclick="document.getElementById('gambarBerita').click()">
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

    // Global function untuk remove image
    window.removeImage = function(idx) {
        uploadedImages.splice(idx, 1);
        renderPreviews();
    };

    // Character count
    textarea.addEventListener('input', () => {
        charCount.textContent = textarea.value.length;
    });

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

    // Submit form
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        if (uploadedImages.length === 0) {
            alert('Silakan upload minimal 1 foto berita.');
            return;
        }

        const noHoax = document.getElementById('noHoax');
        if (!noHoax.checked) {
            alert('Anda harus menyetujui pernyataan bukan hoax.');
            return;
        }

        const data = {
            id: 'news_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
            judul: document.getElementById('judulBerita').value.trim(),
            penerbit: document.getElementById('namaPenerbit').value.trim(),
            gambar: uploadedImages, // Array of images
            deskripsi: document.getElementById('deskripsiBerita').value.trim(),
            tanggal: document.getElementById('tanggalBerita').value,
            waktu: document.getElementById('waktuBerita').value,
            lokasi: document.getElementById('lokasiKejadian').value.trim(),
            kategori: document.getElementById('kategoriBerita').value,
            kontakType: document.querySelector('input[name="contactType"]:checked').value,
            kontakValue: document.getElementById('kontakValue').value.trim(),
            status: 'pending',
            submittedAt: new Date().toISOString()
        };

        // Simpan ke localStorage
        let submissions = JSON.parse(localStorage.getItem('newsSubmissions') || '[]');
        submissions.unshift(data);
        localStorage.setItem('newsSubmissions', JSON.stringify(submissions));

        // Tampilkan modal sukses
        document.getElementById('successModal').classList.add('active');

        // Reset form
        form.reset();
        uploadedImages = [];
        renderPreviews();
        charCount.textContent = '0';
        tanggalInput.value = new Date().toISOString().split('T')[0];
        waktuInput.value = new Date().toTimeString().slice(0, 5);
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
