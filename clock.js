let currentZip = '72704';
let days = '2';
let clockinterval;

var weatherObject = {};
var weatherArray = [];
const PROXY_URL = window.WEATHER_API_PROXY_URL || "";

// Add an event listener to the ZIP code input field
const zipInput = document.getElementById("zip");
zipInput.addEventListener("keydown", function(event) {
    if (event.key === "Enter") {
        event.preventDefault(); // Prevent form submission
        updateZip();
    }
});

const updateButton = document.getElementById("updateButton");
// Update the 'updateButton' event listener
updateButton.addEventListener("click", updateZip);

// Define a function to update the ZIP code and fetch the forecast
function updateZip() {
    currentZip = zipInput.value;
    clearTempText();
    clearHourText();
    clearInterval(clockinterval);
    checkForcast();
}


checkForcast();
async function checkForcast(){

    try {
        if (!PROXY_URL) {
            showError("API proxy not configured. Set window.WEATHER_API_PROXY_URL in config.js");
            return;
        }
        showError("");
        showLoading(true);
        const url = `${PROXY_URL}?q=${encodeURIComponent(currentZip)}&days=${encodeURIComponent(days)}`;
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);
        const response = await fetch(url, { signal: controller.signal });
        clearTimeout(timeoutId);
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        weatherObject = await response.json();

        const cityName = weatherObject.location.name; // Get the city name from the response
        document.getElementById("currentZip").textContent = currentZip; // Display the current zip
        document.getElementById("currentCity").textContent = cityName; // Display the city name

        const today = weatherObject.forecast.forecastday[0].hour.map((x,i) => ({ idx: i, temp: x.temp_f, condition: x.condition }));
        const tomorrow = weatherObject.forecast.forecastday[1].hour.map((x,i) => ({ idx: i+24, temp: x.temp_f, condition: x.condition }));
        weatherArray = today.concat(tomorrow);
        
        clearInterval(clockinterval);
        clockinterval = setInterval(updateClockHands, 1000);
        updateTemperatureColors();
    } catch (error) {
        console.error(error);
        showError("Failed to load forecast. Check ZIP or try again.");
    } finally {
        showLoading(false);
    }
}

const now = new Date();
const currentHour = now.getHours();
const clockSVG = document.getElementById("clock");
const statusEl = document.getElementById("status");

function showLoading(isLoading) {
    if (!statusEl) return;
    statusEl.textContent = isLoading ? "Loading forecast..." : "";
}

function showError(message) {
    if (!statusEl) return;
    statusEl.textContent = message || "";
}

function getForecastIndex(offsetHours) {
    const nowHour = new Date().getHours();
    const index = nowHour + offsetHours;
    return Math.max(0, Math.min(47, index));
}

function getColor(temperature) {
    const normalizedTemp = (temperature - 32) / 68 * 100;
    const clamped = Math.max(0, Math.min(100, normalizedTemp));
    const hue = (1 - clamped / 100) * 240;
    const saturation = 100;
    const lightness = 50;
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}

for (let i = 0; i < 60; i++) {
  const startAngle = ((i / 60) * 2 * Math.PI) - (Math.PI / 2);
  const endAngle = (((i + 1) / 60) * 2 * Math.PI) - (Math.PI / 2);

  const startX = 150 + Math.sin(startAngle) * 140;
  const startY = 150 - Math.cos(startAngle) * 140;

  const endX = 150 + Math.sin(endAngle) * 140;
  const endY = 150 - Math.cos(endAngle) * 140;

  const color = getColor(60);

  const wedgePath = document.createElementNS("http://www.w3.org/2000/svg", "path");
  wedgePath.setAttribute("d", `M 150 150 L ${startX} ${startY} A 140 140 0 0 1 ${endX} ${endY} Z`);
  wedgePath.setAttribute("fill", color);
  wedgePath.setAttribute("stroke", "none");

  clockSVG.appendChild(wedgePath);
}

const handsGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
handsGroup.setAttribute("transform", "translate(150, 150)");
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
        const angle = ((hour - 3) / 12) * 360;
        const distFromCenter = 120;
        const textX = distFromCenter * Math.cos((angle - 90) * (Math.PI / 180));
        const textY = distFromCenter * Math.sin((angle - 90) * (Math.PI / 180));
      
        const hourNumber = document.createElementNS("http://www.w3.org/2000/svg", "text");
        hourNumber.setAttribute("x", textX);
        hourNumber.setAttribute("y", textY);
        hourNumber.setAttribute("class", "hour-number");
        hourNumber.setAttribute("transform", `rotate(-90 ${textX} ${textY})`); // Rotate the number back to upright
        hourNumber.textContent = hour.toString();
        hourNumbersGroup.appendChild(hourNumber);
      }
}

function SetTempText(){
    for (let hour = 1; hour <= 12; hour++) {
        const angle = ((hour - 2.5) / 12) * 360; 
        const distFromCenter = 80;
        const textX = distFromCenter * Math.cos((angle - 90) * (Math.PI / 180));
        const textY = distFromCenter * Math.sin((angle - 90) * (Math.PI / 180));
      
        const tempText = document.createElementNS("http://www.w3.org/2000/svg", "text");
        tempText.setAttribute("x", textX);
        tempText.setAttribute("y", textY);
        tempText.setAttribute("class", "temp-text");
        tempText.setAttribute("transform", `rotate(-90 ${textX} ${textY})`);
        const offsetHours = hour - 1;
        const forecastIdx = getForecastIndex(offsetHours);
        const tempValue = weatherArray[forecastIdx]?.temp ?? "?";
        tempText.innerHTML = `${tempValue}&deg;F`;
      
        const conditionIcon = document.createElementNS("http://www.w3.org/2000/svg", "image");
        const iconPositionX = textX - 15;
        const iconPositionY = textY + 40;
    
        conditionIcon.setAttribute("x", iconPositionX+40);
        conditionIcon.setAttribute("y", iconPositionY);
        conditionIcon.setAttribute("class", "condition-icon");
        conditionIcon.setAttribute("width", 25);
        conditionIcon.setAttribute("height", 25);
        const iconHref = weatherArray[forecastIdx]?.condition?.icon ? 'https:' + weatherArray[forecastIdx].condition.icon : '';
        if (iconHref) {
            conditionIcon.setAttribute("href", iconHref);
        }
        conditionIcon.setAttribute("transform", `rotate(-90 ${iconPositionX + 15} ${iconPositionY + 15})`);

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
    tempTextElements.forEach(el => {
        el.remove();
    });
}

// Function to clear hour text
function clearHourText() {
    const hourNumberElements = hourNumbersGroup.querySelectorAll(".hour-number");
    hourNumberElements.forEach(el => {
        el.remove();
    });
}

function updateClockHands() {
  const now = new Date();
  const hours = now.getHours() % 12;
  const minutes = now.getMinutes();
  const seconds = now.getSeconds();

  const hourAngle = ((hours + minutes / 60) / 12) * 360 - 90;
  const minuteAngle = ((minutes + seconds / 60) / 60) * 360 - 90;
  const secondAngle = (seconds / 60) * 360 - 90;

  hourHand.setAttribute("transform", `rotate(${hourAngle})`);
  minuteHand.setAttribute("transform", `rotate(${minuteAngle})`);
  secondHand.setAttribute("transform", `rotate(${secondAngle})`);
  
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
        const offsetHours = Math.floor(index / 5);
        const forecastIdx = getForecastIndex(offsetHours);
        const temp = weatherArray[forecastIdx]?.temp ?? 60;
        wedgePath.setAttribute("fill", getColor(temp));
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