import { cities } from './cities';
import { weatherIcons } from './weatherIcons';
import { loading } from './loader/loader';

const fetchWeather = async (city) => {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${city.lat}&longitude=${city.lon}&hourly=temperature_2m&daily=temperature_2m_max,temperature_2m_min&current_weather=true&timezone=auto&temperature_unit=fahrenheit`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    const weatherCode = data.current_weather?.weathercode ?? 0;
    const weatherIcon = weatherIcons[weatherCode] || '❓'; // Default if unknown code

    return {
      name: city.name,
      image: city.image,
      temp: data.current_weather?.temperature ?? 'N/A',
      maxTemp: data.daily?.temperature_2m_max?.[0] ?? 'N/A',
      minTemp: data.daily?.temperature_2m_min?.[0] ?? 'N/A',
      icon: weatherIcon,
    };
  } catch (error) {
    console.error('Error loading data: ', error);

    return {
      name: city.name,
      image: city.image,
      temp: 'N/A',
      maxTemp: 'N/A',
      minTemp: 'N/A',
      icon: '❓',
    };
  }
};

const displayWeather = async () => {
  const container = document.getElementById('weather-container');
  container.innerHTML = loading;
  const weatherData = await Promise.all(cities.map(fetchWeather));
  container.innerHTML = weatherData
    .map(
      (city) => `
      <div class="city-weather">
          <div class="city"><strong>${city.name}</strong></div>
          <div>Current temperature: <strong class="temp">${city.temp}°F</strong> ${city.icon}</div>
          <a class="read" href="#" onclick="loadCity('${city.name}')">Read more</a>
      </div>
  `
    )
    .join('');
};

const loadCity = async (cityName) => {
  const city = cities.find((c) => c.name === cityName);
  if (!city) return;
  const data = await fetchWeather(city);
  document.getElementById('weather-container').innerHTML = `
      <div class="info-city">${data.name}</div>
      <div class="info">
       <div>Current temperature: <strong>${data.temp}°F</strong></div>
       <div>Maximum: <strong>${data.maxTemp}°F</strong> </div>
       <div>Minimum: <strong>${data.minTemp}°F</strong></div>
      </div>
      <img class="city-image" src=${data.image} alt="city">
      <a class="button" href="#" onclick="displayWeather()">Back</a>
  `;
};

window.displayWeather = displayWeather;
window.loadCity = loadCity;
document.addEventListener('DOMContentLoaded', displayWeather);
