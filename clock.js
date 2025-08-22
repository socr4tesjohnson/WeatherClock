let currentZip = '72704';
let days = '2';
let clockinterval;

var weatherObject = {};
var weatherArray = [];
var sunriseTime = null;
var sunsetTime = null;
const options = {
	method: 'GET',
	headers: {
		'X-RapidAPI-Key': '102e5627d5msh4f0eea098bff292p1c0d6djsn4553209f04a8',
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

// Define a function to update the ZIP code and fetch the forecast
function updateZip() {
    currentZip = zipInput.value;
    clearTempText();
    clearHourText();
    clearSunIndicators();
    clearInterval(clockinterval);
    checkForcast();
}


checkForcast();
async function checkForcast(){

    try {
        const url = `https://weatherapi-com.p.rapidapi.com/forecast.json?q=${currentZip}&days=${days}`;
        const response = await fetch(url, options);
        weatherObject = await response.text();

        weatherObject = JSON.parse(weatherObject)

        const cityName = weatherObject.location.name; // Get the city name from the response
        document.getElementById("currentZip").textContent = currentZip; // Display the current zip
        document.getElementById("currentCity").textContent = cityName; // Display the city name

        const today = weatherObject.forecast.forecastday[0].hour.map((x,i) => {return {min: i, temp: x.temp_f, condition: x.condition}});
        const tomorrow = weatherObject.forecast.forecastday[1].hour.map((x,i) => {return {min: i+24, temp: x.temp_f, condition: x.condition}});
        weatherArray = today.concat(tomorrow);
        
        // Extract sunrise and sunset times
        if (weatherObject.forecast.forecastday[0].astro) {
            sunriseTime = parseTimeToHours(weatherObject.forecast.forecastday[0].astro.sunrise);
            sunsetTime = parseTimeToHours(weatherObject.forecast.forecastday[0].astro.sunset);
        }
        
        clockinterval = setInterval(updateClockHands, 1000);
        updateTemperatureColors();
        console.log(weatherObject);
    } catch (error) {
        console.error("API failed, using mock data:", error);
        // Use mock data for testing
        useMockData();
    }
}

function useMockData() {
    // Mock weather data for testing
    weatherArray = [];
    for (let i = 0; i < 48; i++) {
        const temp = 50 + Math.sin(i / 4) * 20 + Math.random() * 10; // Vary temperature throughout day
        weatherArray.push({
            min: i,
            temp: temp,
            condition: { icon: "//cdn.weatherapi.com/weather/64x64/day/116.png" }
        });
    }
    
    // Mock sunrise/sunset times
    sunriseTime = 7.5;  // 7:30 AM
    sunsetTime = 18.75; // 6:45 PM
    
    document.getElementById("currentCity").textContent = "Mock City";
    
    clockinterval = setInterval(updateClockHands, 1000);
    updateTemperatureColors();
}

const now = new Date();
const currentHour = now.getHours();
const clockSVG = document.getElementById("clock");

function getCurrentHour(hour){
    if(currentHour > 12){
        hour += 12;
        if(currentHour > hour){
            hour += 12;
        }
        return hour;
    }

    if(currentHour > hour){
        hour += 12;
    }
    return hour;
}

function getColor(temperature) {
    // Normalize the temperature to a value between 0 and 100
    const normalizedTemp = (temperature - 32) / 68 * 100;
  
    // Calculate the hue value based on the normalized temperature
    const hue = (1 - normalizedTemp / 100) * 240;
  
    // Set saturation and lightness values
    const saturation = 100;
    const lightness = 50;
  
    // Return the HSL color string
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}

function parseTimeToHours(timeString) {
    const [time, period] = timeString.split(' ');
    const [hours, minutes] = time.split(':').map(Number);
    let totalHours = hours;
    
    if (period === 'PM' && hours !== 12) {
        totalHours += 12;
    } else if (period === 'AM' && hours === 12) {
        totalHours = 0;
    }
    
    return totalHours + (minutes / 60);
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
    // Clear existing hour numbers first
    const existingHours = hourNumbersGroup.querySelectorAll(".hour-number");
    existingHours.forEach(el => el.remove());
    
    for (let hour = 1; hour <= 12; hour++) {
        const angle = ((hour - 3) / 12) * 360;
        const distFromCenter = 120;
        const textX = distFromCenter * Math.cos((angle - 90) * (Math.PI / 180));
        const textY = distFromCenter * Math.sin((angle - 90) * (Math.PI / 180));
        
        // Create AM hour number
        const hourNumberAM = document.createElementNS("http://www.w3.org/2000/svg", "text");
        hourNumberAM.setAttribute("x", textX);
        hourNumberAM.setAttribute("y", textY - 8);
        hourNumberAM.setAttribute("class", "hour-number hour-am");
        hourNumberAM.setAttribute("transform", `rotate(-90 ${textX} ${textY - 8})`);
        hourNumberAM.textContent = `${hour}AM`;
        hourNumbersGroup.appendChild(hourNumberAM);
        
        // Create PM hour number
        const hourNumberPM = document.createElementNS("http://www.w3.org/2000/svg", "text");
        hourNumberPM.setAttribute("x", textX);
        hourNumberPM.setAttribute("y", textY + 8);
        hourNumberPM.setAttribute("class", "hour-number hour-pm");
        hourNumberPM.setAttribute("transform", `rotate(-90 ${textX} ${textY + 8})`);
        hourNumberPM.textContent = `${hour}PM`;
        hourNumbersGroup.appendChild(hourNumberPM);
    }
    
    // Add sunrise and sunset indicators if available
    addSunriseSunsetIndicators();
}

function addSunriseSunsetIndicators() {
    if (sunriseTime !== null) {
        addSunIndicator(sunriseTime, "☀️", "sunrise-indicator", "#FFD700");
    }
    if (sunsetTime !== null) {
        addSunIndicator(sunsetTime, "🌅", "sunset-indicator", "#FF6B35");
    }
}

function addSunIndicator(timeInHours, symbol, className, color) {
    // Convert 24-hour time to 12-hour clock position
    const hour12 = timeInHours > 12 ? timeInHours - 12 : timeInHours;
    const angle = ((hour12 - 3) / 12) * 360;
    const distFromCenter = 100;
    const textX = distFromCenter * Math.cos((angle - 90) * (Math.PI / 180));
    const textY = distFromCenter * Math.sin((angle - 90) * (Math.PI / 180));
    
    const indicator = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    indicator.setAttribute("cx", textX);
    indicator.setAttribute("cy", textY);
    indicator.setAttribute("r", "8");
    indicator.setAttribute("class", className);
    indicator.setAttribute("fill", color);
    indicator.setAttribute("stroke", "#000");
    indicator.setAttribute("stroke-width", "2");
    hourNumbersGroup.appendChild(indicator);
    
    // Add text label
    const label = document.createElementNS("http://www.w3.org/2000/svg", "text");
    label.setAttribute("x", textX);
    label.setAttribute("y", textY + 20);
    label.setAttribute("class", `${className}-label`);
    label.setAttribute("fill", "#000");
    label.setAttribute("font-size", "10");
    label.setAttribute("font-weight", "bold");
    label.setAttribute("text-anchor", "middle");
    label.setAttribute("transform", `rotate(-90 ${textX} ${textY + 20})`);
    label.textContent = className.includes('sunrise') ? 'RISE' : 'SET';
    hourNumbersGroup.appendChild(label);
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
        tempText.setAttribute("transform", `rotate(-90 ${textX} ${textY})`); // Rotate the number back to upright
        const currentHour = getCurrentHour(hour);
        const tempValue = weatherArray.find(x => x.min === currentHour).temp;
        tempText.innerHTML = `${Math.round(tempValue)}&deg;`;
      
        const conditionIcon = document.createElementNS("http://www.w3.org/2000/svg", "image");
        const iconPositionX = textX - 15; // Adjust as needed
        const iconPositionY = textY + 40; // Adjust as needed
    
        conditionIcon.setAttribute("x", iconPositionX+40); // Adjust position as needed
        conditionIcon.setAttribute("y", iconPositionY); // Adjust position as needed
        conditionIcon.setAttribute("class", "condition-icon");
        conditionIcon.setAttribute("width", 25); // Adjust size as needed
        conditionIcon.setAttribute("height", 25); // Adjust size as needed
        conditionIcon.setAttribute("href", 'https:' + weatherArray.find(x => x.min === currentHour).condition.icon);
        conditionIcon.setAttribute("transform", `rotate(-90 ${iconPositionX + 15} ${iconPositionY + 15})`); // Rotate the icon

        
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

// Function to clear sunrise/sunset indicators
function clearSunIndicators() {
    const sunriseElements = hourNumbersGroup.querySelectorAll(".sunrise-indicator");
    const sunsetElements = hourNumbersGroup.querySelectorAll(".sunset-indicator");
    const sunriseLabels = hourNumbersGroup.querySelectorAll(".sunrise-indicator-label");
    const sunsetLabels = hourNumbersGroup.querySelectorAll(".sunset-indicator-label");
    
    sunriseElements.forEach(element => element.remove());
    sunsetElements.forEach(element => element.remove());
    sunriseLabels.forEach(element => element.remove());
    sunsetLabels.forEach(element => element.remove());
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
        clearSunIndicators();
        clearInterval(clockinterval);
        checkForcast();
    }
}

function updateTemperatureColors() {
    const wedgePaths = clockSVG.querySelectorAll("path");
    wedgePaths.forEach((wedgePath, index) => {
        let currentHour = getCurrentHour(Math.floor(index/5));
        wedgePath.setAttribute("fill", getColor(weatherArray.find(x => x.min == currentHour).temp));
    });
    SetHourText()
    SetTempText()
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