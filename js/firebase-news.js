// Firebase News Storage - Realtime Database + Storage
const firebaseNewsConfig = {
    apiKey: "AIzaSyAAjCd2CvsfiRCVWcwNSmjNt_w3N4eVSbM",
    authDomain: "login-fe9bf.firebaseapp.com",
    databaseURL: "https://login-fe9bf-default-rtdb.firebaseio.com",
    projectId: "login-fe9bf",
    storageBucket: "login-fe9bf.firebasestorage.app",
    messagingSenderId: "698680870534",
    appId: "1:698680870534:web:bc3f03d534a9659f6d7307"
};

// Initialize Firebase for news (separate instance)
let firebaseNewsApp;
let newsDatabase;
let newsStorage;

// Check if Firebase is loaded
function initFirebaseNews() {
    return new Promise((resolve, reject) => {
        const checkFirebase = setInterval(() => {
            if (typeof firebase !== 'undefined') {
                clearInterval(checkFirebase);
                try {
                    // Check if app already exists
                    try {
                        firebaseNewsApp = firebase.app('newsApp');
                    } catch (e) {
                        firebaseNewsApp = firebase.initializeApp(firebaseNewsConfig, 'newsApp');
                    }
                    newsDatabase = firebaseNewsApp.database();
                    newsStorage = firebaseNewsApp.storage();
                    console.log('Firebase News initialized');
                    resolve();
                } catch (err) {
                    console.error('Firebase News init error:', err);
                    reject(err);
                }
            }
        }, 100);
        
        // Timeout after 10 seconds
        setTimeout(() => {
            clearInterval(checkFirebase);
            reject(new Error('Firebase not loaded'));
        }, 10000);
    });
}

// Upload file to Firebase Storage
async function uploadToStorage(file, newsId, index) {
    return new Promise((resolve, reject) => {
        const fileExtension = file.name.split('.').pop();
        const fileName = `news/${newsId}/${index}.${fileExtension}`;
        const storageRef = newsStorage.ref(fileName);
        
        const uploadTask = storageRef.put(file);
        
        uploadTask.on('state_changed',
            (snapshot) => {
                // Progress
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                console.log('Upload progress:', progress.toFixed(0) + '%');
                
                // Update progress UI if exists
                const progressEl = document.getElementById('uploadProgress');
                if (progressEl) {
                    progressEl.style.width = progress + '%';
                    progressEl.textContent = progress.toFixed(0) + '%';
                }
            },
            (error) => {
                console.error('Upload error:', error);
                reject(error);
            },
            async () => {
                // Complete - get download URL
                const downloadURL = await uploadTask.snapshot.ref.getDownloadURL();
                resolve(downloadURL);
            }
        );
    });
}

// Save news to Firebase Database
async function saveNewsToFirebase(newsData) {
    const newsRef = newsDatabase.ref('newsSubmissions/' + newsData.id);
    await newsRef.set(newsData);
    return newsData.id;
}

// Get all news from Firebase
function getAllNews(callback) {
    const newsRef = newsDatabase.ref('newsSubmissions');
    newsRef.orderByChild('submittedAt').on('value', (snapshot) => {
        const news = [];
        snapshot.forEach((child) => {
            news.unshift(child.val()); // Newest first
        });
        callback(news);
    });
}

// Get news by ID
function getNewsById(id, callback) {
    const newsRef = newsDatabase.ref('newsSubmissions/' + id);
    newsRef.once('value', (snapshot) => {
        callback(snapshot.val());
    });
}

// Update news status
async function updateNewsStatus(id, status) {
    const newsRef = newsDatabase.ref('newsSubmissions/' + id);
    await newsRef.update({
        status: status,
        reviewedAt: new Date().toISOString()
    });
}

// Delete news
async function deleteNews(id) {
    // Delete from database
    const newsRef = newsDatabase.ref('newsSubmissions/' + id);
    await newsRef.remove();
    
    // Delete files from storage
    try {
        const storageRef = newsStorage.ref('news/' + id);
        const files = await storageRef.listAll();
        await Promise.all(files.items.map(file => file.delete()));
    } catch (e) {
        console.log('No files to delete or error:', e);
    }
}

// Get published news
function getPublishedNews(callback) {
    const newsRef = newsDatabase.ref('newsSubmissions');
    newsRef.orderByChild('status').equalTo('approved').on('value', (snapshot) => {
        const news = [];
        snapshot.forEach((child) => {
            news.unshift(child.val());
        });
        callback(news);
    });
}

// Export functions
window.firebaseNews = {
    init: initFirebaseNews,
    upload: uploadToStorage,
    save: saveNewsToFirebase,
    getAll: getAllNews,
    getById: getNewsById,
    updateStatus: updateNewsStatus,
    delete: deleteNews,
    getPublished: getPublishedNews
};
