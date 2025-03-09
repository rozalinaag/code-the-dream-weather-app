import './style.css';
import { cities } from './cities';
import { weatherIcons } from './weatherIcons';

const fetchWeather = async (city) => {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${city.lat}&longitude=${city.lon}&hourly=temperature_2m&daily=temperature_2m_max,temperature_2m_min&current_weather=true&timezone=auto&temperature_unit=fahrenheit`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    const weatherCode = data.current_weather?.weathercode ?? 0;
    const weatherIcon = weatherIcons[weatherCode] || '❓'; // Default if unknown code and doesn't have icon

    return {
      name: city.name,
      temp: data.current_weather?.temperature ?? 'N/A',
      maxTemp: data.daily?.temperature_2m_max?.[0] ?? 'N/A',
      minTemp: data.daily?.temperature_2m_min?.[0] ?? 'N/A',
      icon: weatherIcon,
    };
  } catch (error) {
    console.error('Error loading data: ', error);

    return {
      name: city.name,
      temp: 'N/A',
      maxTemp: 'N/A',
      minTemp: 'N/A',
      icon: '❓',
    };
  }
};

const displayWeather = async () => {
  const container = document.getElementById('weather-container');
  container.innerHTML = '<p>Loading...</p>';
  const weatherData = await Promise.all(cities.map(fetchWeather));
  container.innerHTML = weatherData
    .map(
      (city) => `
      <div class="city-weather">
          <p><strong>${city.name}</strong></p>
          <p>Current temperature: ${city.temp}°F</p>
          <p>Current temperature: ${city.icon}</p>
          <a href="#" onclick="loadCity('${city.name}')">Read more</a>
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
      <h2>${data.name}</h2>
      <p>Current temperature: ${data.temp}°C</p>
      <p>Maximum: ${data.maxTemp}°F</p>
      <p>Minimum: ${data.minTemp}°F</p>
      <a href="#" onclick="displayWeather()">Back</a>
  `;
};

window.displayWeather = displayWeather;
window.loadCity = loadCity;
document.addEventListener('DOMContentLoaded', displayWeather);
