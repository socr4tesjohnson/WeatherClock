let currentZip = '72704';
let days = '2';
let clockinterval;

var weatherObject = {};
const options = {
	method: 'GET',
	headers: {
		'X-RapidAPI-Key': '102e5627d5msh4f0eea098bff292p1c0d6djsn4553209f04a8',
		'X-RapidAPI-Host': 'weatherapi-com.p.rapidapi.com'
	}
};


updateButton.addEventListener("click", function() {
    currentZip = document.getElementById("zip").value;
    clearTempText();
    clearHourText();
    clearInterval(clockinterval);
    checkForcast();
});

checkForcast();
async function checkForcast(){

    try {
        const url = `https://weatherapi-com.p.rapidapi.com/forecast.json?q=${currentZip}&days=${days}`;
        const response = await fetch(url, options);
        weatherObject = await response.text();
        const today = JSON.parse(weatherObject).forecast.forecastday[0].hour.map((x,i) => {return {min: i, temp: x.temp_f}});
        const tomorrow = JSON.parse(weatherObject).forecast.forecastday[1].hour.map((x,i) => {return {min: i+24, temp: x.temp_f}});
        weatherObject = today.concat(tomorrow);
        
        clockinterval = setInterval(updateClockHands, 1000);
        updateTemperatureColors();
    } catch (error) {
        console.error(error);
    }
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
        const angle = ((hour - 3) / 12) * 360; 
        const distFromCenter = 80;
        const textX = distFromCenter * Math.cos((angle - 90) * (Math.PI / 180));
        const textY = distFromCenter * Math.sin((angle - 90) * (Math.PI / 180));
      
        const tempText = document.createElementNS("http://www.w3.org/2000/svg", "text");
        tempText.setAttribute("x", textX);
        tempText.setAttribute("y", textY);
        tempText.setAttribute("class", "temp-text");
        tempText.setAttribute("transform", `rotate(-90 ${textX} ${textY})`); // Rotate the number back to upright
        let currentHour = getCurrentHour(hour);
        tempText.textContent = weatherObject.find(x => x.min == currentHour).temp;
        hourNumbersGroup.appendChild(tempText);
      }
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
        clearInterval(clockinterval);
        checkForcast();
    }
}



function updateTemperatureColors() {
    const wedgePaths = clockSVG.querySelectorAll("path");
    wedgePaths.forEach((wedgePath, index) => {
        let currentHour = getCurrentHour(Math.floor(index/5));
        wedgePath.setAttribute("fill", getColor(weatherObject.find(x => x.min == currentHour).temp));
    });
    SetHourText()
    SetTempText()
}

