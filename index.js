const axios = require('axios');
const cron = require('node-cron');
require('dotenv').config();

// --- Configuration from environment ---
const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY;
const FACEBOOK_PAGE_ACCESS_TOKEN = process.env.FACEBOOK_PAGE_ACCESS_TOKEN;
const FACEBOOK_PAGE_ID = process.env.FACEBOOK_PAGE_ID;
const CITY = process.env.CITY || 'London';
const CRON_SCHEDULE = process.env.CRON_SCHEDULE || '0 8 * * *'; // default: 8 AM daily

if (!OPENWEATHER_API_KEY || !FACEBOOK_PAGE_ACCESS_TOKEN || !FACEBOOK_PAGE_ID) {
    console.error('❌ Missing required environment variables. Check your .env file.');
    process.exit(1);
}

// --- Fetch weather from OpenWeatherMap ---
async function fetchWeather() {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(CITY)}&appid=${OPENWEATHER_API_KEY}&units=metric`;
    try {
        const response = await axios.get(url);
        const data = response.data;
        return {
            city: data.name,
            temp: Math.round(data.main.temp),
            feels_like: Math.round(data.main.feels_like),
            description: data.weather[0].description,
            humidity: data.main.humidity,
            wind: Math.round(data.wind.speed),
            icon: data.weather[0].icon,
        };
    } catch (error) {
        console.error('Weather API error:', error.response?.data || error.message);
        return null;
    }
}

// --- Post to Facebook Page ---
async function postToFacebook(weather) {
    const weatherIconMap = {
        '01d': '☀️', '01n': '🌙', '02d': '⛅', '02n': '☁️', 
        '03d': '☁️', '03n': '☁️', '04d': '☁️', '04n': '☁️',
        '09d': '🌧️', '09n': '🌧️', '10d': '🌦️', '10n': '🌧️',
        '11d': '⛈️', '11n': '⛈️', '13d': '❄️', '13n': '❄️',
        '50d': '🌫️', '50n': '🌫️'
    };
    const emoji = weatherIconMap[weather.icon] || '🌡️';

    const message = `${emoji} **Live Weather Update for ${weather.city}**\n\n` +
                    `🌡️ Temperature: ${weather.temp}°C (feels like ${weather.feels_like}°C)\n` +
                    `💧 Humidity: ${weather.humidity}%\n` +
                    `💨 Wind: ${weather.wind} km/h\n` +
                    `📖 Conditions: ${weather.description}\n\n` +
                    `📍 Brought to you by Heyer Tech. #WeatherStation #HeyerTech`;

    const url = `https://graph.facebook.com/${FACEBOOK_PAGE_ID}/feed`;
    const params = {
        message: message,
        access_token: FACEBOOK_PAGE_ACCESS_TOKEN
    };

    try {
        const response = await axios.post(url, null, { params });
        console.log(`✅ Posted to Facebook at ${new Date().toLocaleString()} - Post ID: ${response.data.id}`);
        return true;
    } catch (error) {
        console.error('❌ Facebook API error:', error.response?.data || error.message);
        return false;
    }
}

// --- Main job ---
async function runWeatherPost() {
    console.log(`🔄 Fetching weather for ${CITY}...`);
    const weather = await fetchWeather();
    if (weather) {
        await postToFacebook(weather);
    } else {
        console.log('⏭️ Skipping post due to weather fetch failure.');
    }
}

// --- Start scheduling ---
console.log(`🚀 Weather bot started. Will post at: ${CRON_SCHEDULE} (Cron expression)`);
cron.schedule(CRON_SCHEDULE, () => {
    runWeatherPost();
});

// Optional: run once immediately on start (comment out if not wanted)
// runWeatherPost();
