let currentZip = '72704';
let days = '2';
let clockinterval;

var weatherObject = {};
var weatherArray = [];
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
    clearInterval(clockinterval);
    checkForcast();
}


checkForcast();
async function checkForcast(){

    try {
        const url = `https://weatherapi-com.p.rapidapi.com/forecast.json?q=${currentZip}&days=${days}`;
        const response = await fetch(url, options);

        if (!response.ok) {
            throw new Error(`Weather API error: ${response.status} ${response.statusText}`);
        }

        weatherObject = await response.json();

        const cityName = weatherObject.location.name; // Get the city name from the response
        document.getElementById("currentZip").textContent = currentZip; // Display the current zip
        document.getElementById("currentCity").textContent = cityName; // Display the city name

        const today = weatherObject.forecast.forecastday[0].hour.map((x,i) => {return {hour: i, temp: x.temp_f, condition: x.condition}});
        const tomorrow = weatherObject.forecast.forecastday[1].hour.map((x,i) => {return {hour: i+24, temp: x.temp_f, condition: x.condition}});
        weatherArray = today.concat(tomorrow);

        clockinterval = setInterval(updateClockHands, 1000);
        updateTemperatureColors();
        console.log(weatherObject);
    } catch (error) {
        console.error('Error fetching weather:', error);
        alert('Failed to fetch weather data. Please check the ZIP code and try again.');
    }
}

const now = new Date();
const currentHour = now.getHours();
const clockSVG = document.getElementById("clock");

// Get the forecast hour offset from current time for a given clock hour position
function getForecastHour(clockHour) {
    const now = new Date();
    const currentHour = now.getHours();

    // Calculate which hour in the forecast this clock position represents
    // Clock shows next 12 hours starting from current hour
    let forecastHour = currentHour + clockHour;

    // Keep within 48-hour forecast range
    if (forecastHour >= 48) {
        forecastHour = forecastHour - 48;
    }

    return forecastHour;
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

        // Get the forecast hour for this clock position
        const forecastHour = getForecastHour(hour);
        const weatherData = weatherArray.find(x => x.hour === forecastHour);

        // Skip if no weather data available for this hour
        if (!weatherData) {
            console.warn(`No weather data for forecast hour ${forecastHour}`);
            continue;
        }

        const tempText = document.createElementNS("http://www.w3.org/2000/svg", "text");
        tempText.setAttribute("x", textX);
        tempText.setAttribute("y", textY);
        tempText.setAttribute("class", "temp-text");
        tempText.setAttribute("transform", `rotate(-90 ${textX} ${textY})`); // Rotate the number back to upright
        const tempValue = weatherData.temp;
        tempText.innerHTML = `${Math.round(tempValue)}&deg;F`;

        const conditionIcon = document.createElementNS("http://www.w3.org/2000/svg", "image");
        const iconPositionX = textX - 15; // Adjust as needed
        const iconPositionY = textY + 40; // Adjust as needed

        conditionIcon.setAttribute("x", iconPositionX+40); // Adjust position as needed
        conditionIcon.setAttribute("y", iconPositionY); // Adjust position as needed
        conditionIcon.setAttribute("class", "condition-icon");
        conditionIcon.setAttribute("width", 25); // Adjust size as needed
        conditionIcon.setAttribute("height", 25); // Adjust size as needed
        conditionIcon.setAttribute("href", 'https:' + weatherData.condition.icon);
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
        // Get the hour this wedge represents (0-11)
        const clockHour = parseInt(wedgePath.getAttribute("data-hour"));

        // Skip if this isn't a wedge (might be other paths in the SVG)
        if (isNaN(clockHour)) return;

        // Calculate which forecast hour this represents
        // For clock position 1, we want 1 hour from now, etc.
        const forecastHour = getForecastHour(clockHour + 1);

        // Find the weather data for this forecast hour
        const weatherData = weatherArray.find(x => x.hour === forecastHour);

        if (weatherData) {
            // Set the wedge color based on the temperature
            wedgePath.setAttribute("fill", getColor(weatherData.temp));
        } else {
            console.warn(`No weather data for wedge ${clockHour}, forecast hour ${forecastHour}`);
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