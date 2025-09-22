const apiKey = "ca78345b107f18c098ccb314f5ec6229";
const searchBtn = document.getElementById("search-btn");
const cityInput = document.getElementById("city-input");
const weatherInfo = document.getElementById("weather-info");

searchBtn.addEventListener("click", getWeather);
cityInput.addEventListener("keypress", function(e) {
    if (e.key === "Enter") {
        getWeather();
    }
});

async function getWeather() {
    const city = cityInput.value.trim();
    console.log('Input value:', city); // Debug log
    
    if (!city) {
        weatherInfo.innerHTML = "<p>Please enter a city name.</p>";
        return;
    }
    
    weatherInfo.innerHTML = "<p>Loading...</p>";
    
    const isZipCode = /^\d{5}$/.test(city);
    console.log('Is zip code:', isZipCode); // Debug log
    
    if (isZipCode) {
        console.log('Processing zip code...'); // Debug log
        try {
            const apiUrl = `https://api.openweathermap.org/data/2.5/weather?zip=${city},US&units=imperial&appid=${apiKey}`;
            console.log('API URL:', apiUrl); // Debug log
            
            const response = await fetch(apiUrl);
            const data = await response.json();
            
            console.log('API Response:', data); // Debug log
            console.log('Country:', data.sys?.country); // Debug log
            
            if (data.cod === 200) {
                if (data.sys.country !== 'US') {
                    console.log('Blocking non-US result'); // Debug log
                    weatherInfo.innerHTML = "<p>This zip code is not in the United States.</p>";
                    return;
                }
                console.log('Displaying US weather'); // Debug log
                displayWeather(data);
            } else {
                weatherInfo.innerHTML = "<p>US zip code not found.</p>";
            }
        } catch (error) {
            console.error('Error:', error); // Debug log
            weatherInfo.innerHTML = "<p>Error loading weather data.</p>";
        }
    } else {
        try {
            const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&units=imperial&appid=${apiKey}`);
            const data = await response.json();
            
            if (data.cod === 200) {
                displayWeather(data);
            } else {
                weatherInfo.innerHTML = "<p>City not found.</p>";
            }
        } catch (error) {
            weatherInfo.innerHTML = "<p>Error loading weather data.</p>";
        }
    }
}

function displayWeather(data) {
    const html = `
        <div class="weather-card">
            <h2>${data.name}, ${data.sys.country}</h2>
            <div class="weather-main">
                <img src="https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png" 
                     alt="${data.weather[0].description}" class="weather-icon">
                <div class="temperature">${Math.round(data.main.temp)}°F</div>
            </div>
            <div class="weather-description">${data.weather[0].description}</div>
            <div class="weather-details">
                <p>Feels like: ${Math.round(data.main.feels_like)}°F</p>
                <p>Humidity: ${data.main.humidity}%</p>
                <p>Wind: ${Math.round(data.wind.speed)} mph</p>
            </div>
        </div>
    `;
    weatherInfo.innerHTML = html;
    changeBackground(data.weather[0].main);
}

function changeBackground(weather) {
    const body = document.body;
    body.className = '';
    
    if (weather === 'Clear') {
        body.classList.add('weather-clear');
    } else if (weather === 'Clouds') {
        body.classList.add('weather-clouds');
    } else if (weather === 'Rain') {
        body.classList.add('weather-rain');
    } else if (weather === 'Thunderstorm') {
        body.classList.add('weather-thunderstorm');
    } else if (weather === 'Snow') {
        body.classList.add('weather-snow');
    } else if (weather === 'Mist') {
        body.classList.add('weather-mist');
    } else {
        body.classList.add('weather-clouds');
    }
}

window.onload = function() {
    getCurrentLocation();
};

function getCurrentLocation() {
    const currentLocationDiv = document.getElementById('current-weather-info');
    currentLocationDiv.innerHTML = "<p>Getting your location...</p>";
    
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showCurrentWeather, showLocationError);
    } else {
        currentLocationDiv.innerHTML = "<p>Location not supported.</p>";
    }
}

async function showCurrentWeather(position) {
    const lat = position.coords.latitude;
    const lon = position.coords.longitude;
    
    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=imperial&appid=${apiKey}`);
        const data = await response.json();
        
        const currentLocationDiv = document.getElementById('current-weather-info');
        currentLocationDiv.innerHTML = `
            <div class="current-weather-card">
                <h4>${data.name}, ${data.sys.country}</h4>
                <div class="current-weather-main">
                    <img src="https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png" 
                         alt="${data.weather[0].description}" class="current-weather-icon">
                    <div class="current-temperature">${Math.round(data.main.temp)}°F</div>
                </div>
                <div class="current-weather-details">
                    <p>Feels like: ${Math.round(data.main.feels_like)}°F</p>
                    <p>Humidity: ${data.main.humidity}%</p>
                    <p>Wind: ${Math.round(data.wind.speed)} mph</p>
                </div>
            </div>
        `;
        
        weatherInfo.innerHTML = `
            <div class="weather-card">
                <h2>${data.name}, ${data.sys.country}</h2>
                <div class="weather-main">
                    <img src="https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png" 
                         alt="${data.weather[0].description}" class="weather-icon">
                    <div class="temperature">${Math.round(data.main.temp)}°F</div>
                </div>
                <div class="weather-description">${data.weather[0].description}</div>
                <div class="weather-details">
                    <p>Feels like: ${Math.round(data.main.feels_like)}°F</p>
                    <p>Humidity: ${data.main.humidity}%</p>
                    <p>Wind: ${Math.round(data.wind.speed)} mph</p>
                </div>
            </div>
        `;
        
        changeBackground(data.weather[0].main);
    } catch (error) {
        document.getElementById('current-weather-info').innerHTML = "<p>Error loading weather.</p>";
    }
}

function showLocationError(error) {
    const currentLocationDiv = document.getElementById('current-weather-info');
    currentLocationDiv.innerHTML = "<p>Could not get location.</p>";
}