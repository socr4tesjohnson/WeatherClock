// Load saved locations from localStorage, or use default
let savedLocations = JSON.parse(localStorage.getItem('weatherclock_locations')) || [
    { zip: '72704', city: 'Fayetteville' }
];
let currentLocationIndex = parseInt(localStorage.getItem('weatherclock_current_index')) || 0;
let currentZip = savedLocations[currentLocationIndex].zip;
let days = '2';
let clockinterval;

var weatherObject = {};
var weatherArray = [];

// Cache keys for localStorage
const CACHE_KEY_PREFIX = 'weatherclock_cache_';
const CACHE_TIMESTAMP_KEY = 'weatherclock_cache_timestamp';
const options = {
	method: 'GET',
	headers: {
		'X-RapidAPI-Key': '1c8bb6bddfmsh138a2f4e73eec4cp159708jsncd7e288c1033',
		'X-RapidAPI-Host': 'weatherapi-com.p.rapidapi.com'
	}
};

// Add an event listener to the ZIP code input field
const zipInput = document.getElementById("zip");
zipInput.addEventListener("keydown", function(event) {
    if (event.key === "Enter") {
        event.preventDefault(); // Prevent form submission
        updateZip();
    }
});

// Update the 'updateButton' event listener
updateButton.addEventListener("click", updateZip);

// Add save button listener
const saveButton = document.getElementById("saveButton");
saveButton.addEventListener("click", saveCurrentLocation);

// Add navigation button listeners
document.getElementById('prevLocationBtn').addEventListener('click', previousLocation);
document.getElementById('nextLocationBtn').addEventListener('click', nextLocation);

// Function to update the location list UI
function updateLocationList() {
    const locationListContainer = document.getElementById('savedLocationsList');
    if (!locationListContainer) return;
    
    locationListContainer.innerHTML = '';
    
    savedLocations.forEach((location, index) => {
        const locationItem = document.createElement('div');
        locationItem.className = 'location-item' + (index === currentLocationIndex ? ' active' : '');
        
        const locationText = document.createElement('span');
        locationText.textContent = `${location.city}, ${location.zip}`;
        locationText.className = 'location-text';
        locationText.onclick = () => navigateToLocation(index);
        
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-location-btn';
        deleteBtn.innerHTML = '×';
        deleteBtn.onclick = (e) => {
            e.stopPropagation();
            if (confirm(`Delete ${location.city}, ${location.zip}?`)) {
                deleteLocation(index);
            }
        };
        
        locationItem.appendChild(locationText);
        if (savedLocations.length > 1) {
            locationItem.appendChild(deleteBtn);
        }
        
        locationListContainer.appendChild(locationItem);
    });
}

// Function to update navigation buttons visibility
function updateNavigationButtons() {
    const prevBtn = document.getElementById('prevLocationBtn');
    const nextBtn = document.getElementById('nextLocationBtn');
    const locationCounter = document.getElementById('locationCounter');
    
    if (prevBtn && nextBtn && locationCounter) {
        const showNavigation = savedLocations.length > 1;
        prevBtn.style.display = showNavigation ? 'flex' : 'none';
        nextBtn.style.display = showNavigation ? 'flex' : 'none';
        locationCounter.textContent = `${currentLocationIndex + 1} / ${savedLocations.length}`;
    }
}

// Touch/Swipe handling
let touchStartX = 0;
let touchEndX = 0;

function handleSwipe() {
    const swipeThreshold = 50;
    const diff = touchStartX - touchEndX;
    
    if (Math.abs(diff) > swipeThreshold) {
        if (diff > 0) {
            // Swiped left - next location
            nextLocation();
        } else {
            // Swiped right - previous location
            previousLocation();
        }
    }
}

const clockContainer = document.querySelector('.clock-container');
clockContainer.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
});

clockContainer.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
});

// Keyboard navigation
document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') {
        previousLocation();
    } else if (e.key === 'ArrowRight') {
        nextLocation();
    }
});

// Initialize the display with saved location
document.getElementById("currentZip").textContent = currentZip;

// Helper function to get cached weather data for a location
function getCachedWeatherData(zip) {
    const cacheKey = CACHE_KEY_PREFIX + zip;
    const cachedData = localStorage.getItem(cacheKey);
    const cachedTimestamp = localStorage.getItem(CACHE_TIMESTAMP_KEY);
    
    if (!cachedData || !cachedTimestamp) {
        return null;
    }
    
    try {
        const weatherData = JSON.parse(cachedData);
        const timestamp = parseInt(cachedTimestamp);
        return { data: weatherData, timestamp: timestamp };
    } catch (e) {
        console.error('Error parsing cached weather data:', e);
        return null;
    }
}

// Helper function to save weather data to cache
function saveCachedWeatherData(zip, weatherObject) {
    const cacheKey = CACHE_KEY_PREFIX + zip;
    const timestamp = Date.now();
    
    try {
        localStorage.setItem(cacheKey, JSON.stringify(weatherObject));
        localStorage.setItem(CACHE_TIMESTAMP_KEY, timestamp.toString());
    } catch (e) {
        console.error('Error saving weather data to cache:', e);
    }
}

// Helper function to check if cached data covers the next 12 hours
function isCacheValid(cachedWeatherData) {
    if (!cachedWeatherData) {
        return false;
    }
    
    const now = new Date();
    const currentHour = now.getHours();
    
    // We need data for the next 12 hours from the current hour
    const requiredHours = [];
    for (let i = 0; i < 12; i++) {
        requiredHours.push(currentHour + i);
    }
    
    // Build the weather array from cached data the same way we do from API
    const today = cachedWeatherData.data.forecast.forecastday[0].hour.map((x, i) => {
        return { hour: i, temp: x.temp_f, condition: x.condition };
    });
    const tomorrow = cachedWeatherData.data.forecast.forecastday[1].hour.map((x, i) => {
        return { hour: i + 24, temp: x.temp_f, condition: x.condition };
    });
    const cachedArray = today.concat(tomorrow);
    
    // Check if all required hours exist in the cached data
    for (let reqHour of requiredHours) {
        const found = cachedArray.find(x => x.hour === reqHour);
        if (!found) {
            console.log(`Cache missing hour ${reqHour}`);
            return false;
        }
    }
    
    return true;
}

// Define a function to update the ZIP code and fetch the forecast
function updateZip() {
    currentZip = zipInput.value;

    clearTempText();
    clearHourText();
    clearInterval(clockinterval);
    checkForcast();
}

// Function to save current location to saved list
function saveCurrentLocation() {
    const cityName = weatherObject.location?.name || 'Unknown';
    
    // Check if location already exists
    const existingIndex = savedLocations.findIndex(loc => loc.zip === currentZip);
    if (existingIndex === -1) {
        // Add new location
        savedLocations.push({ zip: currentZip, city: cityName });
        currentLocationIndex = savedLocations.length - 1;
    } else {
        // Update existing location
        savedLocations[existingIndex] = { zip: currentZip, city: cityName };
        currentLocationIndex = existingIndex;
    }
    
    // Save to localStorage
    localStorage.setItem('weatherclock_locations', JSON.stringify(savedLocations));
    localStorage.setItem('weatherclock_current_index', currentLocationIndex.toString());
    
    updateLocationList();
    updateNavigationButtons();
}

// Function to delete a saved location
function deleteLocation(index) {
    if (savedLocations.length <= 1) {
        alert('You must have at least one saved location.');
        return;
    }
    
    savedLocations.splice(index, 1);
    
    // Adjust current index if needed
    if (currentLocationIndex >= savedLocations.length) {
        currentLocationIndex = savedLocations.length - 1;
    } else if (currentLocationIndex > index) {
        currentLocationIndex--;
    }
    
    localStorage.setItem('weatherclock_locations', JSON.stringify(savedLocations));
    localStorage.setItem('weatherclock_current_index', currentLocationIndex.toString());
    
    // Load the adjusted current location
    currentZip = savedLocations[currentLocationIndex].zip;
    clearTempText();
    clearHourText();
    clearInterval(clockinterval);
    checkForcast();
    
    updateLocationList();
    updateNavigationButtons();
}

// Function to navigate to a specific location
function navigateToLocation(index) {
    if (index < 0 || index >= savedLocations.length) return;
    
    currentLocationIndex = index;
    currentZip = savedLocations[index].zip;
    localStorage.setItem('weatherclock_current_index', currentLocationIndex.toString());
    
    clearTempText();
    clearHourText();
    clearInterval(clockinterval);
    checkForcast();
    
    updateNavigationButtons();
}

// Function to navigate to next location
function nextLocation() {
    const nextIndex = (currentLocationIndex + 1) % savedLocations.length;
    navigateToLocation(nextIndex);
}

// Function to navigate to previous location
function previousLocation() {
    const prevIndex = (currentLocationIndex - 1 + savedLocations.length) % savedLocations.length;
    navigateToLocation(prevIndex);
}


checkForcast();
async function checkForcast(){
    // Check if we have valid cached data for this location
    const cachedWeather = getCachedWeatherData(currentZip);
    
    if (cachedWeather && isCacheValid(cachedWeather)) {
        console.log('Using cached weather data for', currentZip);
        weatherObject = cachedWeather.data;
        
        const cityName = weatherObject.location.name;
        document.getElementById("currentZip").textContent = currentZip;
        document.getElementById("currentCity").textContent = cityName;

        const today = weatherObject.forecast.forecastday[0].hour.map((x,i) => {return {hour: i, temp: x.temp_f, condition: x.condition}});
        const tomorrow = weatherObject.forecast.forecastday[1].hour.map((x,i) => {return {hour: i+24, temp: x.temp_f, condition: x.condition}});
        weatherArray = today.concat(tomorrow);

        clockinterval = setInterval(updateClockHands, 1000);
        updateTemperatureColors();
        console.log('Weather array populated from cache with', weatherArray.length, 'hours of data');
        return;
    }

    console.log('Fetching fresh weather data for', currentZip);

    try {
        const url = `https://weatherapi-com.p.rapidapi.com/forecast.json?q=${currentZip}&days=${days}`;
        console.log('Fetching weather data from:', url);
        console.log('API Key (first 10 chars):', options.headers['X-RapidAPI-Key'].substring(0, 10));

        const response = await fetch(url, options);

        console.log('Response status:', response.status, response.statusText);
        console.log('Response headers:', Object.fromEntries(response.headers.entries()));

        if (!response.ok) {
            // Try to get more detailed error information
            const errorText = await response.text();
            console.error('API Error Response:', errorText);
            throw new Error(`Weather API error: ${response.status} ${response.statusText} - ${errorText}`);
        }

        weatherObject = await response.json();
        console.log('Weather data received:', weatherObject);

        // Save the fresh data to cache
        saveCachedWeatherData(currentZip, weatherObject);

        const cityName = weatherObject.location.name; // Get the city name from the response
        document.getElementById("currentZip").textContent = currentZip; // Display the current zip
        document.getElementById("currentCity").textContent = cityName; // Display the city name
        
        // Update the saved location with the actual city name
        savedLocations[currentLocationIndex] = { zip: currentZip, city: cityName };
        localStorage.setItem('weatherclock_locations', JSON.stringify(savedLocations));
        updateLocationList();

        const today = weatherObject.forecast.forecastday[0].hour.map((x,i) => {return {hour: i, temp: x.temp_f, condition: x.condition}});
        const tomorrow = weatherObject.forecast.forecastday[1].hour.map((x,i) => {return {hour: i+24, temp: x.temp_f, condition: x.condition}});
        weatherArray = today.concat(tomorrow);

        clockinterval = setInterval(updateClockHands, 1000);
        updateTemperatureColors();
        console.log('Weather array populated with', weatherArray.length, 'hours of data');
    } catch (error) {
        console.error('Error fetching weather:', error);
        console.error('Error stack:', error.stack);

        // Display error on the page
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = 'position: fixed; top: 10px; left: 50%; transform: translateX(-50%); background: #ff4444; color: white; padding: 15px; border-radius: 5px; z-index: 1000; max-width: 80%;';
        errorDiv.innerHTML = `<strong>API Error:</strong> ${error.message}<br><small>Check browser console for details</small>`;
        document.body.appendChild(errorDiv);

        alert('Failed to fetch weather data. Error: ' + error.message + '\n\nThe API key may be expired or invalid. Check the browser console for details.');
    }
}

const now = new Date();
const currentHour = now.getHours();
const clockSVG = document.getElementById("clock");

// Get the forecast hour for a given wedge index (0-11)
// Wedge 0 is at 12 o'clock and represents the current hour
// Returns the hour index in weatherArray (0-47)
function getForecastHourFromWedge(wedgeIndex) {
    const now = new Date();
    const currentHour = now.getHours();

    // Each wedge represents one hour in the next 12 hours
    // wedgeIndex 0 = current hour, wedgeIndex 1 = current hour + 1, etc.
    let forecastHour = currentHour + wedgeIndex;

    // weatherArray has hours 0-23 for today, 24-47 for tomorrow
    // If forecastHour >= 24, it wraps to tomorrow's data
    // which is already mapped correctly (hour 24 = midnight tomorrow)

    return forecastHour;
}

function getColor(temperature) {
    // Temperature range: 0°F (extreme cold) to 110°F (extreme hot)
    // Normalize the temperature to a value between 0 and 100
    const minTemp = 0;
    const maxTemp = 110;
    const normalizedTemp = ((temperature - minTemp) / (maxTemp - minTemp)) * 100;
  
    // Clamp normalized temperature to prevent invalid hues
    const clampedTemp = Math.max(0, Math.min(100, normalizedTemp));
  
    // Calculate the hue value based on the normalized temperature
    // 0°F (cold) → hue 240 (blue), 110°F (hot) → hue 0 (red)
    const hue = (1 - clampedTemp / 100) * 240;
  
    // Set saturation and lightness values
    const saturation = 100;
    const lightness = 50;
  
    // Return the HSL color string
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
  }

// Create 12 hour wedges for the circular watch face
// Each wedge represents one hour of weather forecast
for (let i = 0; i < 12; i++) {
  const startAngle = ((i / 12) * 2 * Math.PI) - (Math.PI / 2);
  const endAngle = (((i + 1) / 12) * 2 * Math.PI) - (Math.PI / 2);

  const startX = 150 + Math.sin(startAngle) * 140;
  const startY = 150 - Math.cos(startAngle) * 140;

  const endX = 150 + Math.sin(endAngle) * 140;
  const endY = 150 - Math.cos(endAngle) * 140;

  const color = getColor(60); // Default color, will be updated when weather loads

  const wedgePath = document.createElementNS("http://www.w3.org/2000/svg", "path");
  wedgePath.setAttribute("d", `M 150 150 L ${startX} ${startY} A 140 140 0 0 1 ${endX} ${endY} Z`);
  wedgePath.setAttribute("fill", color);
  wedgePath.setAttribute("stroke", "white");
  wedgePath.setAttribute("stroke-width", "2");
  wedgePath.setAttribute("data-hour", i); // Store which hour this wedge represents

  clockSVG.appendChild(wedgePath);
}

const handsGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
handsGroup.setAttribute("transform", "translate(150, 150) rotate(90)");
clockSVG.appendChild(handsGroup);

const hourHand = document.createElementNS("http://www.w3.org/2000/svg", "line");
hourHand.setAttribute("x1", 0);
hourHand.setAttribute("y1", 0);
hourHand.setAttribute("x2", 0);
hourHand.setAttribute("y2", -60);
hourHand.setAttribute("stroke-width", "6");
hourHand.setAttribute("class", "hand");
handsGroup.appendChild(hourHand);

const minuteHand = document.createElementNS("http://www.w3.org/2000/svg", "line");
minuteHand.setAttribute("x1", 0);
minuteHand.setAttribute("y1", 0);
minuteHand.setAttribute("x2", 0);
minuteHand.setAttribute("y2", -90);
minuteHand.setAttribute("stroke-width", "4");
minuteHand.setAttribute("class", "hand");
handsGroup.appendChild(minuteHand);

const secondHand = document.createElementNS("http://www.w3.org/2000/svg", "line");
secondHand.setAttribute("x1", 0);
secondHand.setAttribute("y1", 0);
secondHand.setAttribute("x2", 0);
secondHand.setAttribute("y2", -100);
secondHand.setAttribute("stroke-width", "2");
secondHand.setAttribute("class", "hand");
handsGroup.appendChild(secondHand);

const hourNumbersGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
hourNumbersGroup.setAttribute("transform", "translate(150, 150)");
clockSVG.appendChild(hourNumbersGroup);

function SetHourText(){
    for (let hour = 1; hour <= 12; hour++) {
        const angle = ((hour) / 12) * 360;
        const distFromCenter = 120;
        const textX = distFromCenter * Math.cos((angle - 90) * (Math.PI / 180));
        const textY = distFromCenter * Math.sin((angle - 90) * (Math.PI / 180));

        // Create background circle with white border
        const bgCircle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        bgCircle.setAttribute("cx", textX);
        bgCircle.setAttribute("cy", textY);
        bgCircle.setAttribute("r", 16);
        bgCircle.setAttribute("class", "hour-number-bg");
        hourNumbersGroup.appendChild(bgCircle);

        const hourNumber = document.createElementNS("http://www.w3.org/2000/svg", "text");
        hourNumber.setAttribute("x", textX);
        hourNumber.setAttribute("y", textY);
        hourNumber.setAttribute("class", "hour-number");
        hourNumber.textContent = hour.toString();
        hourNumbersGroup.appendChild(hourNumber);
      }
}

function SetTempText(){
    for (let i = 0; i < 12; i++) {
        // Calculate angle for this wedge position
        // We need to position text in the center of each wedge
        // Wedge i spans from (i/12) to ((i+1)/12) of the circle
        const centerAngle = ((i + 0.5) / 12) * 360 - 90; // -90 to start at top
        const tempDistFromCenter = 70;
        const textX = tempDistFromCenter * Math.cos(centerAngle * (Math.PI / 180));
        const textY = tempDistFromCenter * Math.sin(centerAngle * (Math.PI / 180));

        // Get the forecast hour for this wedge
        const forecastHour = getForecastHourFromWedge(i);
        const weatherData = weatherArray.find(x => x.hour === forecastHour);

        // Skip if no weather data available for this hour
        if (!weatherData) {
            console.warn(`SetTempText: No weather data for wedge ${i}, forecast hour ${forecastHour}`);
            continue;
        }

        const tempText = document.createElementNS("http://www.w3.org/2000/svg", "text");
        tempText.setAttribute("x", textX);
        tempText.setAttribute("y", textY);
        tempText.setAttribute("class", "temp-text");
        const tempValue = weatherData.temp;
        tempText.innerHTML = `${Math.round(tempValue)}&deg;F`;

        // Position weather icon radially between temp text and hour numbers
        const iconDistFromCenter = 95;
        const iconSize = 28;
        const iconX = iconDistFromCenter * Math.cos(centerAngle * (Math.PI / 180));
        const iconY = iconDistFromCenter * Math.sin(centerAngle * (Math.PI / 180));

        const conditionIcon = document.createElementNS("http://www.w3.org/2000/svg", "image");
        conditionIcon.setAttribute("x", iconX - iconSize/2); // Center the icon
        conditionIcon.setAttribute("y", iconY - iconSize/2); // Center the icon
        conditionIcon.setAttribute("class", "condition-icon");
        conditionIcon.setAttribute("width", iconSize);
        conditionIcon.setAttribute("height", iconSize);
        conditionIcon.setAttribute("href", 'https:' + weatherData.condition.icon);


        hourNumbersGroup.appendChild(conditionIcon);
        hourNumbersGroup.appendChild(tempText);
    }
}

// Function to clear temperature text
// Function to clear temperature texts and condition icons
function clearIcons() {
    const tempTextElements = hourNumbersGroup.querySelectorAll(".temp-text");
    const conditionIconElements = hourNumbersGroup.querySelectorAll("image");
    
    tempTextElements.forEach(tempTextElement => {
        tempTextElement.textContent = "";
    });
    
    conditionIconElements.forEach(iconElement => {
        iconElement.remove();
    });
}


// Function to clear temperature text
function clearTempText() {
    const tempTextElements = hourNumbersGroup.querySelectorAll(".temp-text");
    tempTextElements.forEach(tempTextElement => {
        tempTextElement.textContent = "";
    });
}

// Function to clear hour text
function clearHourText() {
    const hourNumberElements = hourNumbersGroup.querySelectorAll(".hour-number");
    hourNumberElements.forEach(hourNumberElement => {
        hourNumberElement.textContent = "";
    });
}

let lastSecondAngle = -90;

function updateClockHands() {
  const now = new Date();
  const hours = now.getHours() % 12;
  const minutes = now.getMinutes();
  const seconds = now.getSeconds();

  const hourAngle = ((hours + minutes / 60) / 12) * 360 - 90;
  const minuteAngle = ((minutes + seconds / 60) / 60) * 360 - 90;
  const secondAngle = (seconds / 60) * 360 - 90;

  // Detect when second hand needs to jump back (from 354 to -90 degrees)
  if (lastSecondAngle > 300 && secondAngle < 0) {
    // Temporarily disable transition for the jump
    secondHand.style.transition = 'none';
    secondHand.setAttribute("transform", `rotate(${secondAngle})`);
    // Force a reflow to ensure the transition: none takes effect
    secondHand.getBoundingClientRect();
    // Re-enable transition
    setTimeout(() => {
      secondHand.style.transition = '';
    }, 50);
  } else {
    secondHand.setAttribute("transform", `rotate(${secondAngle})`);
  }

  lastSecondAngle = secondAngle;

  hourHand.setAttribute("transform", `rotate(${hourAngle})`);
  minuteHand.setAttribute("transform", `rotate(${minuteAngle})`);

    if(minutes === 0){
        clearTempText();
        clearHourText();
        clearIcons();
        clearInterval(clockinterval);
        checkForcast();
    }
}

function updateTemperatureColors() {
    const wedgePaths = clockSVG.querySelectorAll("path");

    wedgePaths.forEach((wedgePath, index) => {
        // Get the hour this wedge represents (0-11)
        const wedgeIndex = parseInt(wedgePath.getAttribute("data-hour"));

        // Skip if this isn't a wedge (might be other paths in the SVG)
        if (isNaN(wedgeIndex)) return;

        // Get the forecast hour for this wedge position
        const forecastHour = getForecastHourFromWedge(wedgeIndex);

        // Find the weather data for this forecast hour
        const weatherData = weatherArray.find(x => x.hour === forecastHour);

        if (weatherData) {
            // Set the wedge color based on the temperature
            wedgePath.setAttribute("fill", getColor(weatherData.temp));
            console.log(`Wedge ${wedgeIndex}: forecast hour ${forecastHour}, temp ${weatherData.temp}°F`);
        } else {
            console.warn(`No weather data for wedge ${wedgeIndex}, forecast hour ${forecastHour}`);
            console.warn(`Available hours:`, weatherArray.map(w => w.hour));
            // Set a neutral color if no data available
            wedgePath.setAttribute("fill", "#cccccc");
        }
    });

    SetHourText();
    SetTempText();
}


// function getCurrentLocation() {
//     if (navigator.geolocation) {
//         navigator.geolocation.getCurrentPosition(
//             function(position) {
//                 const latitude = position.coords.latitude;
//                 const longitude = position.coords.longitude;

//                 currentZip = `${longitude},${}`

//                 fetchCityAndZip(latitude, longitude);
//             },
//             function(error) {
//                 console.error("Error getting location:", error);
//             }
//         );
//     } else {
//         console.error("Geolocation is not supported by this browser.");
//     }
// }

// // Add a new function to fetch the city and ZIP code using a geocoding API
// async function fetchCityAndZip(latitude, longitude) {
//     try {
//         const response = await fetch(`https://geocoding.example.com/api?lat=${latitude}&lon=${longitude}`);
//         const data = await response.json();
//         if (data.zipcode) {
//             currentZip = data.zipcode;
//             document.getElementById("zip").value = currentZip; // Set the ZIP code in the input field
//         } else {
//             console.error("ZIP code not found in geocoding data.");
//         }
//     } catch (error) {
//         console.error("Error fetching city and ZIP code:", error);
//     }
// }

// window.addEventListener("load", function() {
//     getCurrentLocation();
// });

// Initialize UI on load
window.addEventListener("load", function() {
    updateLocationList();
    updateNavigationButtons();
});