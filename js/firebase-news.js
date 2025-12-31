// Firebase News - Realtime Database Only (No Storage)
const firebaseNewsConfig = {
    apiKey: "AIzaSyAAjCd2CvsfiRCVWcwNSmjNt_w3N4eVSbM",
    authDomain: "login-fe9bf.firebaseapp.com",
    databaseURL: "https://login-fe9bf-default-rtdb.firebaseio.com",
    projectId: "login-fe9bf",
    storageBucket: "login-fe9bf.firebasestorage.app",
    messagingSenderId: "698680870534",
    appId: "1:698680870534:web:bc3f03d534a9659f6d7307"
};

let firebaseNewsApp;
let newsDatabase;

function initFirebaseNews() {
    return new Promise((resolve, reject) => {
        const checkFirebase = setInterval(() => {
            if (typeof firebase !== 'undefined') {
                clearInterval(checkFirebase);
                try {
                    try {
                        firebaseNewsApp = firebase.app('newsApp');
                    } catch (e) {
                        firebaseNewsApp = firebase.initializeApp(firebaseNewsConfig, 'newsApp');
                    }
                    newsDatabase = firebaseNewsApp.database();
                    console.log('Firebase News initialized');
                    resolve();
                } catch (err) {
                    console.error('Firebase News init error:', err);
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

// Save news to Firebase Database
async function saveNewsToFirebase(newsData) {
    const newsRef = newsDatabase.ref('newsSubmissions/' + newsData.id);
    await newsRef.set(newsData);
    return newsData.id;
}

// Get all news from Firebase (realtime)
function getAllNews(callback) {
    const newsRef = newsDatabase.ref('newsSubmissions');
    newsRef.orderByChild('submittedAt').on('value', (snapshot) => {
        const news = [];
        snapshot.forEach((child) => {
            news.unshift(child.val());
        });
        callback(news);
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
    const newsRef = newsDatabase.ref('newsSubmissions/' + id);
    await newsRef.remove();
}

// Export
window.firebaseNews = {
    init: initFirebaseNews,
    save: saveNewsToFirebase,
    getAll: getAllNews,
    updateStatus: updateNewsStatus,
    delete: deleteNews
};
