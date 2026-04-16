const axios = require('axios');
const cron = require('node-cron');
require('dotenv').config();

// --- Configuration ---
const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY;
const FACEBOOK_PAGE_ACCESS_TOKEN = process.env.FACEBOOK_PAGE_ACCESS_TOKEN;
const FACEBOOK_PAGE_ID = process.env.FACEBOOK_PAGE_ID;
const CITY = 'London'; // Change to your city

// --- Weather Fetching Function ---
async function fetchWeather() {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${CITY}&appid=${OPENWEATHER_API_KEY}&units=metric`;
    try {
        const response = await axios.get(url);
        const data = response.data;
        return {
            city: data.name,
            temp: Math.round(data.main.temp),
            feels_like: Math.round(data.main.feels_like),
            description: data.weather[0].description,
            humidity: data.main.humidity,
            wind: Math.round(data.wind.speed)
        };
    } catch (error) {
        console.error('Weather API error:', error.message);
        return null;
    }
}

// --- Facebook Posting Function ---
async function postToFacebook(weatherData) {
    const message = `🌤️ **Live Weather Update for ${weatherData.city}**\n\n` +
                    `🌡️ Temperature: ${weatherData.temp}°C (feels like ${weatherData.feels_like}°C)\n` +
                    `💧 Humidity: ${weatherData.humidity}%\n` +
                    `💨 Wind: ${weatherData.wind} km/h\n` +
                    `📖 Conditions: ${weatherData.description}\n\n` +
                    `📍 Brought to you by Heyer Tech. #WeatherStation #HeyerTech`;

    const url = `https://graph.facebook.com/${FACEBOOK_PAGE_ID}/feed`;
    const params = {
        message: message,
        access_token: FACEBOOK_PAGE_ACCESS_TOKEN
    };

    try {
        const response = await axios.post(url, null, { params });
        console.log('✅ Posted to Facebook at', new Date().toLocaleString(), 'Post ID:', response.data.id);
    } catch (error) {
        console.error('❌ Facebook API error:', error.response?.data || error.message);
    }
}

// --- The Main Job ---
async function runWeatherPost() {
    console.log('🔄 Fetching weather data...');
    const weather = await fetchWeather();
    if (weather) {
        await postToFacebook(weather);
    } else {
        console.log('⏭️ Skipping post due to weather fetch failure.');
    }
}

// --- Schedule the Job (runs at 8:00 AM every day) ---
cron.schedule('0 8 * * *', () => {
    runWeatherPost();
});
console.log('Weather bot started. Wating for schedule...');
