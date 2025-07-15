// --- Countdown Timer Logic ---
function getCountdownTarget() {
  // 30 days from now (in UTC)
  const now = new Date();
  const target = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  // Set to noon to avoid DST issues
  target.setHours(12, 0, 0, 0);
  return target;
}

function updateCountdown() {
  const target = window._countdownTarget || (window._countdownTarget = getCountdownTarget());
  const now = new Date();
  let diff = Math.max(0, target - now);

  // Calculate time parts
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  diff -= days * (1000 * 60 * 60 * 24);
  const hours = Math.floor(diff / (1000 * 60 * 60));
  diff -= hours * (1000 * 60 * 60);
  const mins = Math.floor(diff / (1000 * 60));
  diff -= mins * (1000 * 60);
  const secs = Math.floor(diff / 1000);

  // If time's up, show all zeros
  const segments = [
    { label: "Days", value: days },
    { label: "Hours", value: hours },
    { label: "Minutes", value: mins },
    { label: "Seconds", value: secs },
  ];

  // Render to DOM
  const $countdown = document.getElementById('countdown');
  $countdown.innerHTML = segments.map(seg => `
    <div class="countdown-segment">
      <span>${String(seg.value).padStart(2, '0')}</span>
      <span class="countdown-label">${seg.label}</span>
    </div>
  `).join('');
}

setInterval(updateCountdown, 1000);
updateCountdown();

// --- Weather Widget Logic ---
const LIBERIA_COORDS = { lat: 6.3, lon: -10.8 };

async function fetchWeather() {
  // Use Open-Meteo's free weather API (no key needed)
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${LIBERIA_COORDS.lat}&longitude=${LIBERIA_COORDS.lon}&current_weather=true`;
  try {
    const resp = await fetch(url);
    const data = await resp.json();
    const weather = data.current_weather;
    if (!weather) throw new Error("No weather data");

    // Temperature (Celsius)
    const temp = Math.round(weather.temperature);
    document.getElementById('weather-temp').textContent = `${temp}°C`;

    // Weather code mapping for icon (simplified)
    renderWeatherIcon(weather.weathercode);

  } catch (e) {
    // On failure, show placeholder
    document.getElementById('weather-temp').textContent = '--°C';
    renderWeatherIcon(null); // Default sunny
  }
}

// Rough mapping of Open-Meteo weather codes
function renderWeatherIcon(code) {
  const svg = document.getElementById('weather-icon');
  let svgContent = '';
  if (code === 0) { // Clear
    svgContent = `<circle cx="24" cy="24" r="13" fill="#FFD700" stroke="#F4E285" stroke-width="2"/>
      <g>
        <line x1="24" y1="2" x2="24" y2="11" stroke="#FFD700" stroke-width="2"/>
        <line x1="24" y1="37" x2="24" y2="46" stroke="#FFD700" stroke-width="2"/>
        <line x1="2" y1="24" x2="11" y2="24" stroke="#FFD700" stroke-width="2"/>
        <line x1="37" y1="24" x2="46" y2="24" stroke="#FFD700" stroke-width="2"/>
        <line x1="10" y1="10" x2="17" y2="17" stroke="#FFD700" stroke-width="2"/>
        <line x1="31" y1="31" x2="38" y2="38" stroke="#FFD700" stroke-width="2"/>
        <line x1="38" y1="10" x2="31" y2="17" stroke="#FFD700" stroke-width="2"/>
        <line x1="10" y1="38" x2="17" y2="31" stroke="#FFD700" stroke-width="2"/>
      </g>`;
  } else if (code >= 1 && code <= 3) { // Partly cloudy
    svgContent = `<circle cx="18" cy="26" r="10" fill="#FFD700" stroke="#F4E285" stroke-width="2"/>
      <ellipse cx="30" cy="28" rx="10" ry="7" fill="#b2ebf2" opacity="0.8"/>
      <ellipse cx="36" cy="30" rx="6" ry="5" fill="#b2ebf2" opacity="0.5"/>`;
  } else if (code >= 45 && code <= 48) { // Fog
    svgContent = `<ellipse cx="24" cy="34" rx="13" ry="6" fill="#b2ebf2" opacity="0.5"/>
      <ellipse cx="24" cy="27" rx="13" ry="6" fill="#b2ebf2" opacity="0.3"/>
      <circle cx="16" cy="22" r="7" fill="#FFD700" opacity="0.5"/>`;
  } else if (code >= 51 && code <= 67) { // Rain
    svgContent = `<ellipse cx="28" cy="30" rx="10" ry="7" fill="#b2ebf2" opacity="0.8"/>
      <ellipse cx="36" cy="32" rx="6" ry="5" fill="#b2ebf2" opacity="0.5"/>
      <line x1="24" y1="38" x2="24" y2="46" stroke="#1CCAD8" stroke-width="2"/>
      <line x1="28" y1="38" x2="28" y2="46" stroke="#1CCAD8" stroke-width="2"/>
      <line x1="20" y1="38" x2="20" y2="46" stroke="#1CCAD8" stroke-width="2"/>`;
  } else {
    // Default sunny
    svgContent = `<circle cx="24" cy="24" r="13" fill="#FFD700" stroke="#F4E285" stroke-width="2"/>`;
  }
  svg.innerHTML = svgContent;
}

fetchWeather();

// --- Animated Clouds ---
// Cloud SVGs for variety
const cloudSVGs = [
  // Large cloud
  `<svg width="100" height="50" viewBox="0 0 100 50"><ellipse cx="35" cy="30" rx="35" ry="17" fill="#e0f7fa"/><ellipse cx="70" cy="35" rx="20" ry="12" fill="#b2ebf2" opacity="0.7"/><ellipse cx="60" cy="22" rx="18" ry="9" fill="#b2ebf2" opacity="0.5"/></svg>`,
  // Medium cloud
  `<svg width="70" height="35" viewBox="0 0 70 35"><ellipse cx="25" cy="18" rx="25" ry="12" fill="#e0f7fa"/><ellipse cx="50" cy="20" rx="15" ry="8" fill="#b2ebf2" opacity="0.7"/></svg>`,
  // Small cloud
  `<svg width="44" height="20" viewBox="0 0 44 20"><ellipse cx="15" cy="10" rx="15" ry="7" fill="#e0f7fa"/><ellipse cx="32" cy="12" rx="10" ry="5" fill="#b2ebf2" opacity="0.7"/></svg>`
];

/**
 * Create and animate clouds floating across the background.
 * Cloud scale is increased by 20% for all clouds.
 */
function createClouds() {
  const bg = document.querySelector('.sunny-bg');
  // Remove any existing clouds
  Array.from(bg.querySelectorAll('.cloud')).forEach(cloud => cloud.remove());

  // Responsive: more clouds on desktop
  const width = window.innerWidth;
  let numClouds = width > 900 ? 7 : width > 600 ? 5 : 3;

  for (let i = 0; i < numClouds; ++i) {
    const cloud = document.createElement('div');
    cloud.className = 'cloud';
    // Randomly choose a cloud SVG
    let svgIdx = Math.floor(Math.random() * cloudSVGs.length);
    cloud.innerHTML = cloudSVGs[svgIdx];

    // Randomize cloud parameters
    let baseScale = 0.8 + Math.random() * 1.2; // 0.8 - 2.0
    let scale = baseScale * 1.2; // Increase by 20%
    let top = Math.random() * 60 + 5; // 5% - 65% vertical
    let left = Math.random() * 100; // 0 - 100% (start off-screen)
    let duration = 36 + Math.random() * 26; // 36 - 62 sec
    let delay = Math.random() * 20; // 0-20 sec
    let direction = Math.random() > 0.5 ? 1 : -1; // left-to-right or right-to-left

    // Initial position
    cloud.style.transform = `translate(${direction === 1 ? -120 : 120}vw, ${top}vh) scale(${scale})`;
    cloud.style.top = `${top}vh`;
    cloud.style.zIndex = 1 + Math.floor(scale * 2); // Larger clouds float higher

    // Animate using JS for better randomness
    setTimeout(() => animateCloud(cloud, direction, top, scale, duration), delay * 1000);

    bg.appendChild(cloud);
  }
}

function animateCloud(cloud, direction, top, scale, duration) {
  // Start position
  cloud.style.transition = 'none';
  cloud.style.transform = `translate(${direction === 1 ? -120 : 120}vw, ${top}vh) scale(${scale})`;
  requestAnimationFrame(() => {
    // Move across screen
    cloud.style.transition = `transform ${duration}s linear`;
    cloud.style.transform = `translate(${direction === 1 ? 120 : -120}vw, ${top}vh) scale(${scale})`;
  });

  // When finished, reset to start after duration
  setTimeout(() => {
    // Remove and recreate on finish for continuous effect
    try { cloud.remove(); } catch(e){}
    createSingleCloud();
  }, duration * 1000 + 100);
}

// Create a single random cloud for continuous effect
function createSingleCloud() {
  const width = window.innerWidth;
  if (width < 350) return;

  const bg = document.querySelector('.sunny-bg');
  const cloud = document.createElement('div');
  cloud.className = 'cloud';
  let svgIdx = Math.floor(Math.random() * cloudSVGs.length);
  cloud.innerHTML = cloudSVGs[svgIdx];

  let baseScale = 0.8 + Math.random() * 1.2;
  let scale = baseScale * 1.2; // 20% larger
  let top = Math.random() * 60 + 5;
  let duration = 36 + Math.random() * 26;
  let delay = Math.random() * 15;
  let direction = Math.random() > 0.5 ? 1 : -1;

  cloud.style.transform = `translate(${direction === 1 ? -120 : 120}vw, ${top}vh) scale(${scale})`;
  cloud.style.top = `${top}vh`;
  cloud.style.zIndex = 1 + Math.floor(scale * 2);

  setTimeout(() => animateCloud(cloud, direction, top, scale, duration), delay * 1000);
  bg.appendChild(cloud);
}

// On load and resize, create clouds
function resetClouds() {
  createClouds();
}
window.addEventListener('resize', () => {
  resetClouds();
});

// Initial
resetClouds();

// --- Accessibility: fallback for JS off ---
document.getElementById('weather-temp').textContent = '--°C';