const express = require('express');
const http = require('http');
const cors = require('cors');
const WebSocket = require('ws');
const mongoose = require('mongoose');
const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });
const path = require('path');
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect('mongodb+srv://danh:danh@cluster0.x9gr3wu.mongodb.net/', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('Connected to MongoDB');
}).catch(err => {
  console.error('MongoDB connection error:', err);
});

// Create SensorData model
const sensorDataSchema = new mongoose.Schema({
  temperature: Number,
  humidity: Number,
  time: { type: Date, default: Date.now }
});

const SensorData = mongoose.model('SensorData', sensorDataSchema);

let latestSensorData = { temperature: null, humidity: null };
let espClient = null; // Store reference to the ESP32 client
let lastStoredTime = null; // Track last time data was stored

// Function to store sensor data every 10 minutes
function storeSensorData(data) {
  const currentTime = new Date();
  // If no data stored yet or it's been at least 10 minutes since last storage
  if (!lastStoredTime || (currentTime - lastStoredTime) >= 10 * 60 * 1000) {
    const sensorData = new SensorData({
      temperature: data.temperature,
      humidity: data.humidity,
      time: currentTime
    });
    
    sensorData.save()
      .then(() => {
        console.log('Sensor data saved to database');
        lastStoredTime = currentTime;
      })
      .catch(err => console.error('Error saving sensor data:', err));
  }
}

// Add API endpoint to get historical sensor data
app.get('/api/history', async (req, res) => {
  try {
    // Get query parameters
    const limit = 50;
    
    let startDate, endDate;
    
    // Handle custom date range
    if (req.query.from_day && req.query.to_day) {
      startDate = new Date(req.query.from_day);
      endDate = new Date(req.query.to_day);
      // Set end date to end of day
      endDate.setHours(23, 59, 59, 999);
    } else {
      // Handle predefined time filters
      endDate = new Date(); // Current time
      
    }
    
    // Query MongoDB for data within date range
    const historyData = await SensorData.find({
      time: { $gte: startDate, $lte: endDate }
    })
    .sort({ time: -1 })
    .limit(limit);
    
    res.json(historyData);
  } catch (error) {
    console.error('Error fetching history:', error);
    res.status(500).json({ error: 'Failed to fetch history data' });
  }
});

// Function to broadcast data to all web clients except ESP32
function broadcastToWebClients(data) {
  wss.clients.forEach(client => {
    if (client !== espClient && client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  });
}

wss.on('connection', (ws) => {
  console.log('New WebSocket client connected');
  ws.on('message', (message) => {
    try {
      const dataStr = message.toString();
      console.log('Received WebSocket message:', dataStr);
      
      // Check if it's sensor data format (temperature_humidity)
      if (dataStr.includes('_')) {
        // This is from ESP32 with sensor data
        const [temperature, humidity, timeStr] = dataStr.split('_');
        latestSensorData = {
          temperature: parseFloat(temperature),
          humidity: parseFloat(humidity),
          time: timeStr,
        };
        console.log('Received sensor data via WebSocket:', latestSensorData);
        
        // Mark this client as the ESP32
        espClient = ws;
        
        // Try to store data in MongoDB if needed
        storeSensorData(latestSensorData);
        
        broadcastToWebClients(latestSensorData);
      }
      else if(dataStr.includes('status')) {
        broadcastToWebClients(dataStr)
      }
      else {
        // This is likely a control command from a web client
        const command = JSON.parse(dataStr);
        console.log('Received command via WebSocket:', command);
        
        // Forward command to ESP32 if connected
        if (espClient && espClient.readyState === WebSocket.OPEN) {
          espClient.send(command.action);
        }
        
        // Broadcast command confirmation to all web clients
        broadcastToWebClients(command);
      }
    } catch (error) {
      console.error('Error processing WebSocket message:', error);
    }
  });
  
  ws.on('close', () => {
    // If the ESP32 client disconnected, clear the reference
    if (ws === espClient) {
      console.log('ESP32 client disconnected');
      espClient = null;
    }
  });
  
  // // Send the latest sensor data to the newly connected client
  // if (latestSensorData.temperature !== null) {
  //   ws.send(JSON.stringify(latestSensorData));
  // }
});

app.use(express.static(path.join(__dirname, 'public')));

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
