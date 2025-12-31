// ===== Quiz Data =====
const quizQuestions = [
    {
        question: "Berapa total anggaran APBD Sumut 2026 yang baru disahkan?",
        options: ["Rp 15 triliun", "Rp 18,5 triliun", "Rp 20 triliun", "Rp 12 triliun"],
        correct: 1
    },
    {
        question: "Tim sepak bola mana yang meraih kemenangan dramatis di Stadion Teladan?",
        options: ["Persib Bandung", "Persija Jakarta", "PSMS Medan", "Arema FC"],
        correct: 2
    },
    {
        question: "Berapa kabupaten/kota di Sumut yang mendapat program vaksinasi gratis?",
        options: ["25", "30", "33", "35"],
        correct: 2
    },
    {
        question: "Siswa dari sekolah mana yang meraih medali emas Olimpiade Sains Nasional?",
        options: ["SMA Negeri 2 Medan", "SMA Negeri 1 Medan", "SMA Sutomo", "SMA Methodist"],
        correct: 1
    },
    {
        question: "Festival kuliner Medan 2025 menghadirkan berapa tenant UMKM?",
        options: ["50 tenant", "75 tenant", "100 tenant", "150 tenant"],
        correct: 2
    }
];

// ===== Quiz State =====
let currentQuestion = 0;
let score = 0;
let correctAnswers = 0;
let timer;
let timeLeft = 300; // 5 minutes in seconds

// ===== DOM Elements =====
const quizStart = document.getElementById('quizStart');
const quizQuestions_el = document.getElementById('quizQuestions');
const quizResult = document.getElementById('quizResult');
const questionCard = document.getElementById('questionCard');
const progressFill = document.getElementById('progressFill');
const questionNumber = document.getElementById('questionNumber');
const timerDisplay = document.getElementById('timer');

// ===== Start Quiz =====
document.getElementById('btnStartQuiz')?.addEventListener('click', startQuiz);

function startQuiz() {
    quizStart.style.display = 'none';
    quizQuestions_el.style.display = 'block';
    currentQuestion = 0;
    score = 0;
    correctAnswers = 0;
    timeLeft = 300;
    loadQuestion();
    startTimer();
}

// ===== Load Question =====
function loadQuestion() {
    const q = quizQuestions[currentQuestion];
    const progress = ((currentQuestion) / quizQuestions.length) * 100;
    
    progressFill.style.width = `${progress}%`;
    questionNumber.textContent = `${currentQuestion + 1}/${quizQuestions.length}`;
    
    questionCard.innerHTML = `
        <h3 class="question-text">${q.question}</h3>
        <div class="options-list">
            ${q.options.map((opt, i) => `
                <button class="option-btn" data-index="${i}">${opt}</button>
            `).join('')}
        </div>
    `;
    
    // Add click handlers
    document.querySelectorAll('.option-btn').forEach(btn => {
        btn.addEventListener('click', () => selectAnswer(parseInt(btn.dataset.index)));
    });
}

// ===== Select Answer =====
function selectAnswer(index) {
    const q = quizQuestions[currentQuestion];
    const buttons = document.querySelectorAll('.option-btn');
    
    buttons.forEach(btn => btn.disabled = true);
    
    if (index === q.correct) {
        buttons[index].classList.add('correct');
        score += 10;
        correctAnswers++;
    } else {
        buttons[index].classList.add('wrong');
        buttons[q.correct].classList.add('correct');
    }
    
    setTimeout(() => {
        currentQuestion++;
        if (currentQuestion < quizQuestions.length) {
            loadQuestion();
        } else {
            endQuiz();
        }
    }, 1000);
}

// ===== Timer =====
function startTimer() {
    timer = setInterval(() => {
        timeLeft--;
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        timerDisplay.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        
        if (timeLeft <= 0) {
            endQuiz();
        }
    }, 1000);
}

// ===== End Quiz =====
function endQuiz() {
    clearInterval(timer);
    quizQuestions_el.style.display = 'none';
    quizResult.style.display = 'block';
    
    const wrongAnswers = quizQuestions.length - correctAnswers;
    
    document.getElementById('scoreValue').textContent = score;
    document.getElementById('correctCount').textContent = correctAnswers;
    document.getElementById('wrongCount').textContent = wrongAnswers;
    
    const resultIcon = document.getElementById('resultIcon');
    const resultTitle = document.getElementById('resultTitle');
    const resultMessage = document.getElementById('resultMessage');
    
    if (score >= 40) {
        resultIcon.textContent = '🏆';
        resultTitle.textContent = 'Luar Biasa!';
        resultMessage.textContent = 'Kamu sangat update dengan berita Sumut!';
    } else if (score >= 30) {
        resultIcon.textContent = '🎉';
        resultTitle.textContent = 'Bagus!';
        resultMessage.textContent = 'Pengetahuanmu tentang berita Sumut cukup baik!';
    } else {
        resultIcon.textContent = '💪';
        resultTitle.textContent = 'Terus Belajar!';
        resultMessage.textContent = 'Baca lebih banyak berita untuk meningkatkan skormu!';
    }
}

// ===== Retry =====
document.getElementById('btnRetry')?.addEventListener('click', () => {
    quizResult.style.display = 'none';
    quizStart.style.display = 'block';
});
