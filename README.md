# heyer-weather-bot
Automated weather bot that posts to Facebook page
heyer-weather-bot/

├── .gitignore

├── README.md

├── package.json

├── .env.example

├── index.js

└── deploy/

    ├── render.json (optional Render config)

    └── railway.json (optional Railway config)
    # Heyer Tech Weather Bot 🌤️



A Node.js bot that fetches live weather data from OpenWeatherMap and automatically posts daily updates to a Facebook Page.



## Features

- Fetches current temperature, humidity, wind speed, and conditions.

- Posts a nicely formatted status to a Facebook Page.

- Scheduled to run daily (customizable via cron).

- Easily deployable on Render, Railway, or any Node.js hosting.



## Prerequisites

- Node.js (v16 or higher)

- A Facebook Page (admin access)

- OpenWeatherMap API key (free tier)



## Setup
**Clone the repository**
'''bash
git clone https://github.com/yourusername/heyer-weather-bot.git
cd heyer-weather-bot
