const API_KEY = '01c276367571e5fc4c3b3e21a6cc822b';
const API_BASE_URL = 'https://api.openweathermap.org/data/2.5/weather';

const cityInput    = document.getElementById("cityInput");
const searchBtn    = document.getElementById("searchBtn");
const retryBtn     = document.getElementById("retryBtn");
const loadingEl    = document.getElementById("loading");
const errorEl      = document.getElementById("error");
const errorMsg     = document.getElementById("errorMsg");
const weatherCard  = document.getElementById("weatherCard");

const cityNameEl    = document.getElementById("cityName");
const countryNameEl = document.getElementById("countryName");
const weatherIconImg= document.getElementById("weatherIconImg");
const tempValueEl   = document.getElementById("tempValue");
const weatherDescEl = document.getElementById("weatherDesc");
const feelsLikeEl   = document.getElementById("feelsLike");
const humidityEl    = document.getElementById("humidity");
const windSpeedEl   = document.getElementById("windSpeed");
const pressureEl    = document.getElementById("pressure");
const updatedAtEl   = document.getElementById("updatedAt");
const tempmin       = document.getElementById("tempmin");
const tempmax       = document.getElementById("tempmax");


function showLoading() {
  loadingEl.classList.remove("hidden");
  errorEl.classList.add("hidden");
  weatherCard.classList.add("hidden");
}

/**
 * @param {string} message 
 */
function showError(message) {
  errorMsg.textContent = message;
  errorEl.classList.remove("hidden");
  loadingEl.classList.add("hidden");
  weatherCard.classList.add("hidden");
}


function showWeather() {
  weatherCard.classList.remove("hidden");
  loadingEl.classList.add("hidden");
  errorEl.classList.add("hidden");
}

function showEmpty() {
  loadingEl.classList.add("hidden");
  errorEl.classList.add("hidden");
  weatherCard.classList.add("hidden");
}


/**
 * @param {string} city 
 * @returns {Promise<Object>}
 * @throws {Error}
 */
async function fetchWeatherData(city) {
  const url = `${API_BASE_URL}?q=${encodeURIComponent(city)}&APPID=${API_KEY}&units=metric`;
  
  const response = await fetch(url);
  
  if (!response.ok) {
    if (response.status === 404) {
      throw new Error(`City "${city}" not found. Please check the spelling.`);
    } else if (response.status === 401) {
      throw new Error('Invalid API key. Please check your OpenWeatherMap API key.');
    } else if (response.status === 429) {
      throw new Error('Too many requests. Please try again later.');
    } else {
      throw new Error(`Weather service error (${response.status})`);
    }
  }
  
  const data = await response.json();
  return data;
}

/**
 * @param {string} iconCode
 * @returns {string}
 */
function getWeatherIconUrl(iconCode) {
  return `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
}

/**
 * @param {number} timestamp
 * @returns {string}
 */
function formatTime(timestamp) {
  const date = new Date(timestamp * 1000);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

async function getWeather() {
  const city = cityInput.value.trim();
  
  if (!city) {
    showError("Please enter a city name.");
    return;
  }
  
  showLoading();
  searchBtn.disabled = true;
  
  try {
    const data = await fetchWeatherData(city);
        const {
      name,
      sys: { country },
      weather,
      main: { temp, temp_min, temp_max, humidity,},
      wind: { speed },
      dt
    } = data;
    
    cityNameEl.textContent = name;
    countryNameEl.textContent = country;
    weatherIconImg.src = getWeatherIconUrl(weather[0].icon);
    weatherIconImg.alt = weather[0].description;
    tempValueEl.textContent = Math.round(temp);
    weatherDescEl.textContent = weather[0].description;
    tempmin.textContent = `${Math.round(temp_min)}°C`;
    tempmax.textContent = `${Math.round(temp_max)}°C`;
    humidityEl.textContent = `${humidity}%`;
    windSpeedEl.textContent = `${speed} m/s`;
    
    const now = new Date();
    updatedAtEl.textContent = `Updated at ${now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
    
    showWeather();
    
  } catch (error) {
    if (error instanceof TypeError) {
      showError("Network error — please check your internet connection.");
    } else {
      showError(error.message);
    }
    
    console.error('Weather fetch error:', error);
    
  } finally {
    searchBtn.disabled = false;
  }
}

searchBtn.addEventListener("click", getWeather);

cityInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    getWeather();
  }
});

retryBtn.addEventListener("click", () => {
  showEmpty();
  cityInput.focus();
});

showEmpty();