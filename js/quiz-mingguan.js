// ===== Weekly Quiz Data =====
const weeklyQuestions = [
    {
        question: "Siapa Gubernur Sumatera Utara saat ini?",
        options: ["Edy Rahmayadi", "Gatot Pujo Nugroho", "Tengku Erry Nuradi", "Bobby Nasution"],
        correct: 0
    },
    {
        question: "Danau Toba terletak di kabupaten mana?",
        options: ["Simalungun", "Samosir", "Karo", "Dairi"],
        correct: 1
    },
    {
        question: "Apa nama bandara internasional di Medan?",
        options: ["Soekarno-Hatta", "Kualanamu", "Polonia", "Silangit"],
        correct: 1
    },
    {
        question: "Makanan khas Medan yang terbuat dari tepung beras dan santan adalah?",
        options: ["Rendang", "Bika Ambon", "Gudeg", "Pempek"],
        correct: 1
    },
    {
        question: "Berapa jumlah kabupaten/kota di Sumatera Utara?",
        options: ["25", "30", "33", "38"],
        correct: 2
    },
    {
        question: "Suku asli yang mendiami sekitar Danau Toba adalah?",
        options: ["Melayu", "Batak", "Minang", "Aceh"],
        correct: 1
    },
    {
        question: "Apa nama stadion kebanggaan PSMS Medan?",
        options: ["Gelora Bung Karno", "Stadion Teladan", "Stadion Jakabaring", "Stadion Manahan"],
        correct: 1
    },
    {
        question: "Universitas negeri tertua di Sumatera Utara adalah?",
        options: ["Universitas Negeri Medan", "Universitas Sumatera Utara", "Institut Teknologi Medan", "Politeknik Negeri Medan"],
        correct: 1
    },
    {
        question: "Kopi terkenal dari Sumatera Utara berasal dari daerah?",
        options: ["Medan", "Sidikalang", "Binjai", "Tebing Tinggi"],
        correct: 1
    },
    {
        question: "Apa nama pelabuhan utama di Kota Medan?",
        options: ["Pelabuhan Tanjung Priok", "Pelabuhan Belawan", "Pelabuhan Merak", "Pelabuhan Bakauheni"],
        correct: 1
    }
];

// ===== Quiz State =====
let currentQuestion = 0;
let score = 0;
let correctAnswers = 0;
let timer;
let timeLeft = 600; // 10 minutes

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
    timeLeft = 600;
    loadQuestion();
    startTimer();
}

function loadQuestion() {
    const q = weeklyQuestions[currentQuestion];
    const progress = ((currentQuestion) / weeklyQuestions.length) * 100;
    
    progressFill.style.width = `${progress}%`;
    questionNumber.textContent = `${currentQuestion + 1}/${weeklyQuestions.length}`;
    
    questionCard.innerHTML = `
        <h3 class="question-text">${q.question}</h3>
        <div class="options-list">
            ${q.options.map((opt, i) => `
                <button class="option-btn" data-index="${i}">${opt}</button>
            `).join('')}
        </div>
    `;
    
    document.querySelectorAll('.option-btn').forEach(btn => {
        btn.addEventListener('click', () => selectAnswer(parseInt(btn.dataset.index)));
    });
}

function selectAnswer(index) {
    const q = weeklyQuestions[currentQuestion];
    const buttons = document.querySelectorAll('.option-btn');
    
    buttons.forEach(btn => btn.disabled = true);
    
    if (index === q.correct) {
        buttons[index].classList.add('correct');
        score += 20;
        correctAnswers++;
    } else {
        buttons[index].classList.add('wrong');
        buttons[q.correct].classList.add('correct');
    }
    
    setTimeout(() => {
        currentQuestion++;
        if (currentQuestion < weeklyQuestions.length) {
            loadQuestion();
        } else {
            endQuiz();
        }
    }, 1000);
}

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

function endQuiz() {
    clearInterval(timer);
    quizQuestions_el.style.display = 'none';
    quizResult.style.display = 'block';
    
    const wrongAnswers = weeklyQuestions.length - correctAnswers;
    
    document.getElementById('scoreValue').textContent = score;
    document.getElementById('correctCount').textContent = correctAnswers;
    document.getElementById('wrongCount').textContent = wrongAnswers;
    
    const resultIcon = document.getElementById('resultIcon');
    const resultTitle = document.getElementById('resultTitle');
    const resultMessage = document.getElementById('resultMessage');
    
    if (score >= 160) {
        resultIcon.textContent = '🏆';
        resultTitle.textContent = 'Luar Biasa!';
        resultMessage.textContent = 'Kamu berpeluang masuk 10 besar minggu ini!';
    } else if (score >= 100) {
        resultIcon.textContent = '🎉';
        resultTitle.textContent = 'Bagus!';
        resultMessage.textContent = 'Skor yang bagus! Terus tingkatkan!';
    } else {
        resultIcon.textContent = '💪';
        resultTitle.textContent = 'Terus Belajar!';
        resultMessage.textContent = 'Coba lagi minggu depan untuk skor lebih baik!';
    }
}
