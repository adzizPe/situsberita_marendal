// WeatherAPI Integration
const WEATHER_API_KEY = '519600fd63de488d90b180430252912';
const WEATHER_API_URL = 'https://api.weatherapi.com/v1/current.json';

// Kota-kota di Sumatera Utara dan Aceh
const CITIES = [
    { name: 'Medan', query: 'Medan,Indonesia' },
    { name: 'Banda Aceh', query: 'Banda Aceh,Indonesia' },
    { name: 'Binjai', query: 'Binjai,Indonesia' },
    { name: 'Pematangsiantar', query: 'Pematangsiantar,Indonesia' },
    { name: 'Padangsidimpuan', query: 'Padangsidimpuan,Indonesia' },
    { name: 'Langsa', query: 'Langsa,Indonesia' },
    { name: 'Lhokseumawe', query: 'Lhokseumawe,Indonesia' },
    { name: 'Parapat', query: 'Parapat,Indonesia' }
];

// Icon cuaca berdasarkan kondisi
function getWeatherIcon(condition) {
    if (!condition) return '🌤️';
    const c = condition.toLowerCase();
    
    if (c.includes('sunny') || c.includes('clear')) return '☀️';
    if (c.includes('partly cloudy')) return '🌤️';
    if (c.includes('cloudy') || c.includes('overcast')) return '☁️';
    if (c.includes('mist') || c.includes('fog')) return '☁️';
    if (c.includes('thunder')) return '⛈️';
    if (c.includes('heavy rain') || c.includes('torrential')) return '🌧️';
    if (c.includes('rain') || c.includes('drizzle')) return '🌦️';
    if (c.includes('snow')) return '🌨️';
    
    return '🌤️';
}

// Terjemahkan kondisi cuaca ke Bahasa Indonesia
function translateCondition(condition) {
    if (!condition) return '-';
    const c = condition.toLowerCase();
    
    if (c.includes('sunny')) return 'Cerah';
    if (c.includes('clear')) return 'Cerah';
    if (c.includes('partly cloudy')) return 'Berawan Sebagian';
    if (c.includes('cloudy')) return 'Berawan';
    if (c.includes('overcast')) return 'Mendung';
    if (c.includes('mist')) return 'Berkabut';
    if (c.includes('fog')) return 'Kabut';
    if (c.includes('thunder')) return 'Hujan Petir';
    if (c.includes('heavy rain')) return 'Hujan Lebat';
    if (c.includes('moderate rain')) return 'Hujan Sedang';
    if (c.includes('light rain') || c.includes('patchy rain')) return 'Hujan Ringan';
    if (c.includes('drizzle')) return 'Gerimis';
    if (c.includes('rain')) return 'Hujan';
    
    return condition;
}

// Format tanggal & jam
function formatDateTime() {
    const now = new Date();
    return now.toLocaleString('id-ID', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Fetch cuaca satu kota
async function fetchCityWeather(city) {
    try {
        const url = `${WEATHER_API_URL}?key=${WEATHER_API_KEY}&q=${encodeURIComponent(city.query)}&aqi=no`;
        const res = await fetch(url);
        
        if (!res.ok) throw new Error('API Error');
        
        const data = await res.json();
        
        return {
            name: city.name,
            temp: Math.round(data.current.temp_c),
            condition: data.current.condition.text,
            conditionId: translateCondition(data.current.condition.text),
            icon: getWeatherIcon(data.current.condition.text),
            humidity: data.current.humidity
        };
    } catch (e) {
        console.error(`Error fetching weather for ${city.name}:`, e);
        return {
            name: city.name,
            temp: '-',
            conditionId: '-',
            icon: '🌤️'
        };
    }
}

// Fetch semua cuaca
async function fetchAllWeather() {
    const results = [];
    
    // Fetch parallel untuk lebih cepat
    const promises = CITIES.map(city => fetchCityWeather(city));
    const weatherData = await Promise.all(promises);
    
    return weatherData;
}

// Update ticker
async function updateWeatherTicker() {
    const ticker = document.getElementById('weatherTicker');
    const updateEl = document.getElementById('weatherUpdate');
    if (!ticker) return;
    
    ticker.innerHTML = '<span class="ticker-item">Memuat info cuaca...</span>';
    
    try {
        const weatherData = await fetchAllWeather();
        
        let html = '';
        weatherData.forEach(w => {
            if (w.temp !== '-') {
                html += `<span class="ticker-item">${w.icon} ${w.name}: ${w.temp}°C, ${w.conditionId}</span>`;
            } else {
                html += `<span class="ticker-item">${w.icon} ${w.name}: Data tidak tersedia</span>`;
            }
        });
        
        // Duplicate untuk seamless loop
        ticker.innerHTML = html + html;
        
        // Update timestamp
        if (updateEl) {
            updateEl.textContent = `Update: ${formatDateTime()}`;
        }
        
        // Setup drag after content loaded
        setupTickerDrag();
        
    } catch (e) {
        console.error('Error updating weather:', e);
        ticker.innerHTML = '<span class="ticker-item">⚠️ Gagal memuat data cuaca</span>';
    }
}

// ===== Drag/Swipe Ticker =====
function setupTickerDrag() {
    const ticker = document.getElementById('weatherTicker');
    if (!ticker) return;
    
    let isDragging = false;
    let startX = 0;
    let currentTranslate = 0;
    
    // Pause animation on hover
    ticker.addEventListener('mouseenter', () => {
        ticker.classList.add('paused');
    });
    
    ticker.addEventListener('mouseleave', () => {
        if (!isDragging) {
            ticker.classList.remove('paused');
        }
    });
    
    // Mouse drag
    ticker.addEventListener('mousedown', (e) => {
        isDragging = true;
        ticker.classList.add('paused');
        startX = e.pageX;
        
        const style = window.getComputedStyle(ticker);
        const matrix = new DOMMatrix(style.transform);
        currentTranslate = matrix.m41;
    });
    
    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        e.preventDefault();
        
        const x = e.pageX;
        const walk = (x - startX);
        ticker.style.transform = `translateX(${currentTranslate + walk}px)`;
        ticker.style.animation = 'none';
    });
    
    document.addEventListener('mouseup', () => {
        if (isDragging) {
            isDragging = false;
            setTimeout(() => {
                ticker.style.animation = '';
                ticker.style.transform = '';
                ticker.classList.remove('paused');
            }, 2000);
        }
    });
    
    // Touch drag for mobile
    ticker.addEventListener('touchstart', (e) => {
        isDragging = true;
        ticker.classList.add('paused');
        startX = e.touches[0].pageX;
        
        const style = window.getComputedStyle(ticker);
        const matrix = new DOMMatrix(style.transform);
        currentTranslate = matrix.m41;
    }, { passive: true });
    
    ticker.addEventListener('touchmove', (e) => {
        if (!isDragging) return;
        
        const x = e.touches[0].pageX;
        const walk = (x - startX);
        ticker.style.transform = `translateX(${currentTranslate + walk}px)`;
        ticker.style.animation = 'none';
    }, { passive: true });
    
    ticker.addEventListener('touchend', () => {
        isDragging = false;
        setTimeout(() => {
            ticker.style.animation = '';
            ticker.style.transform = '';
            ticker.classList.remove('paused');
        }, 2000);
    });
}

// Init
document.addEventListener('DOMContentLoaded', updateWeatherTicker);

// Refresh setiap 30 menit
setInterval(updateWeatherTicker, 30 * 60 * 1000);
