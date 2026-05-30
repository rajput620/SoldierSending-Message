const SERVER_URL = 'https://soldiersignup.onrender.com/api/soldier';

document.getElementById('soldier-form').addEventListener('submit', async (event) => {
    event.preventDefault();

    // Gather form data
    const data = {
        name: document.getElementById('name').value,
        unit: document.getElementById('unit').value,
        rank: document.getElementById('rank').value,
        mission: document.getElementById('mission').value,
        heartRate: parseInt(document.getElementById('heart-rate').value, 10),
        bodyTemperature: parseFloat(document.getElementById('body-temperature').value),
        oxygenLevels: parseInt(document.getElementById('oxygen-levels').value, 10),
        bloodPressure: document.getElementById('blood-pressure').value,
        gps: {
            lat: parseFloat(document.getElementById('latitude').value),
            long: parseFloat(document.getElementById('longitude').value),
        },
        distressSignal: document.getElementById('distress-signal').value === 'true',
        environmentalData: {
            weatherConditions: document.getElementById('weather-conditions').value,
            hazardAlerts: document.getElementById('hazard-alerts').value,
        },
        deviceStatus: {
            battery: parseInt(document.getElementById('device-battery').value, 10),
            connectivity: document.getElementById('connectivity-status').value,
        },
    };

    try {
        const response = await fetch(SERVER_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        if (response.ok) {
            document.getElementById('status-message').textContent = 'Data sent successfully!';
        } else {
            document.getElementById('status-message').textContent = 'Failed to send data.';
        }
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('status-message').textContent = 'Error sending data.';
    }
});

// Handle distress signal button
document.getElementById('distress-signal-btn').addEventListener('click', async () => {
    try {
        const response = await fetch(SERVER_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ distressSignal: true }),
        });

        if (response.ok) {
            alert('Distress signal sent!');
        } else {
            console.error('Failed to send distress signal');
        }
    } catch (error) {
        console.error('Error sending distress signal:', error);
    }
});


// real time chat function
const socket = io("https://soldiersignup.onrender.com/");
const myId = location.href.includes("dashboard") ? "commandDashboard" : "soldierDevice";
const otherId = myId === "commandDashboard" ? "soldierDevice" : "commandDashboard";

socket.emit("join", myId);

document.addEventListener("DOMContentLoaded", () => {
    const chatWindow = document.getElementById("chat-window");
    const chatInput = document.getElementById("chat-input");
    const sendChatBtn = document.getElementById("send-chat-btn");
    const clearChatBtn = document.getElementById("clear-chat-btn");
    const typingIndicator = document.getElementById("typing-indicator");

    sendChatBtn.addEventListener("click", () => {
        const message = chatInput.value.trim();
        if (message) {
            socket.emit("sendMessage", {
                sender: myId,
                receiver: otherId,
                message,
                timestamp: new Date().toLocaleTimeString()
            });
            appendChatMessage("You", message, new Date().toLocaleTimeString(), "sent");
            chatInput.value = "";
            typingIndicator.textContent = "";
        }
    });

    chatInput.addEventListener("input", () => {
        socket.emit("typing", { sender: myId, receiver: otherId });
    });

    socket.on("receiveMessage", ({ sender, message, timestamp }) => {
        appendChatMessage(sender, message, timestamp || new Date().toLocaleTimeString(), "received");
    });

    socket.on("showTyping", ({ sender }) => {
        typingIndicator.textContent = `${sender === "commandDashboard" ? "Command" : "Soldier"} is typing...`;
        setTimeout(() => {
            typingIndicator.textContent = "";
        }, 2000);
    });

    clearChatBtn.addEventListener("click", () => {
        chatWindow.innerHTML = "";
        localStorage.removeItem(`chatHistory-${myId}`);
    });

    function appendChatMessage(sender, message, time, type) {
        const msgDiv = document.createElement("div");
        msgDiv.style.marginBottom = "8px";
        msgDiv.style.background = type === "sent" ? "#dcf8c6" : "#e8e8e8";
        msgDiv.style.padding = "5px 10px";
        msgDiv.style.borderRadius = "10px";
        msgDiv.style.textAlign = type === "sent" ? "right" : "left";
        msgDiv.innerHTML = `<strong>${sender}</strong>: ${message}<br><small>${time}</small>`;
        chatWindow.appendChild(msgDiv);
        chatWindow.scrollTop = chatWindow.scrollHeight;
    }
});







// === Real-time GPS Location Tracking ===
function startLiveLocationTracking() {
    if (!navigator.geolocation) {
        console.error("Geolocation is not supported by this browser.");
        return;
    }

    navigator.geolocation.watchPosition(
        async (position) => {
            const latitude = position.coords.latitude;
            const longitude = position.coords.longitude;

            console.log("Updated GPS Coordinates:", latitude, longitude);

            // Optionally update visible input fields
            document.getElementById('latitude').value = latitude.toFixed(6);
            document.getElementById('longitude').value = longitude.toFixed(6);

            // Send updated location to the server
            try {
                const response = await fetch(`${SERVER_URL}/location`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        name: document.getElementById('name').value,
                        gps: {
                            lat: latitude,
                            long: longitude
                        }
                    })
                });

                if (!response.ok) {
                    console.error("Failed to send live location.");
                }
            } catch (err) {
                console.error("Error sending live GPS:", err);
            }
        },
        (error) => {
            console.error("Error getting location:", error);
        },
        {
            enableHighAccuracy: true,
            maximumAge: 10000,
            timeout: 5000
        }
    );
}

// Start tracking after DOM is ready
document.addEventListener("DOMContentLoaded", startLiveLocationTracking);

















    document.getElementById("soldier-form").addEventListener("submit", function (e) {
        e.preventDefault();
    
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());
    
        // Send data to server via socket or fetch here...
    
        // Show data preview
        document.getElementById("sent-data-box").textContent = JSON.stringify(data, null, 2);
    
        // Optional: Confirmation message
        document.getElementById("status-message").textContent = "✅ Data sent successfully!";
    });
    



    // Function to get the soldier's current location using Geolocation API
function getCurrentLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
            const latitude = position.coords.latitude;
            const longitude = position.coords.longitude;

            // Auto-fill latitude and longitude input fields
            document.getElementById('latitude').value = latitude;
            document.getElementById('longitude').value = longitude;
        }, function(error) {
            alert("Error fetching location: " + error.message);
        });
    } else {
        alert("Geolocation is not supported by this browser.");
    }
}

// Call the function to get and display location
getCurrentLocation();




const weatherApiKey = "2a023e620333d1124994c6d6d3b5e032";  // Replace with your OpenWeatherMap API Key

// Function to fetch weather data based on soldier's location
function getWeatherData(latitude, longitude) {
    const weatherApiUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${weatherApiKey}&units=metric`;

    fetch(weatherApiUrl)
        .then(response => response.json())
        .then(data => {
            // Extract weather conditions and temperature
            const weatherConditions = data.weather[0].description;
            const temperature = data.main.temp;

            // Auto-fill weather conditions and temperature input fields
            document.getElementById('weather-conditions').value = `${weatherConditions}, ${temperature}°C`;

            // Optional: Add weather icon (e.g., for clear skies, rain, etc.)
            const iconCode = data.weather[0].icon;
            document.getElementById("weather-icon").src = `http://openweathermap.org/img/wn/${iconCode}@2x.png`;
        })
        .catch(error => {
            alert("Error fetching weather data: " + error.message);
        });
}

// Get location and weather on page load
getCurrentLocation();

// Call weather function after getting the location
navigator.geolocation.getCurrentPosition(function(position) {
    const latitude = position.coords.latitude;
    const longitude = position.coords.longitude;
    getWeatherData(latitude, longitude);
});
