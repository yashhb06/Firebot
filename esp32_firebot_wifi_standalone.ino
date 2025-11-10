/*
 * ESP32 FireBot WiFi Controller (Final Clean Version)
 * ===================================================
 * - Auto & Manual mode switching
 * - WiFi Access Point (FireBot-AP)
 * - React frontend compatible (CORS fixed)
 * - MOSFET pump timing stabilized
 */

#include <WiFi.h>
#include <WebServer.h>
#include <ESP32Servo.h>

// ========================================
// WiFi Configuration
// ========================================
const char* ssid = "FireBot-AP";
const char* password = "firebot123";

IPAddress local_IP(192, 168, 4, 1);
IPAddress gateway(192, 168, 4, 1);
IPAddress subnet(255, 255, 255, 0);

WebServer server(80);

// ========================================
// Hardware Setup
// ========================================
Servo myservo;
int pos = 0;
bool fireDetected = false;
bool manualMode = false;  // false = auto mode, true = manual mode
bool pumpStatus = false;

// Sensor Pins
#define Left_S    34
#define Right_S   35
#define Forward_S 32

// Motor Driver Pins
#define LM1 27
#define LM2 26
#define RM1 25
#define RM2 33

// MOSFET-controlled Pump
#define pump 23

// Timing
unsigned long lastSensorRead = 0;
const unsigned long SENSOR_READ_INTERVAL = 100;
unsigned long lastAutoAction = 0;
const unsigned long AUTO_ACTION_INTERVAL = 500;

// ========================================
// Setup
// ========================================
void setup() {
  Serial.begin(115200);
  Serial.println("\n========================================");
  Serial.println("🔥 ESP32 FireBot WiFi Controller (Final)");
  Serial.println("========================================");

  // Sensor setup
  pinMode(Left_S, INPUT);
  pinMode(Right_S, INPUT);
  pinMode(Forward_S, INPUT);

  // Motor setup
  pinMode(LM1, OUTPUT);
  pinMode(LM2, OUTPUT);
  pinMode(RM1, OUTPUT);
  pinMode(RM2, OUTPUT);

  // Pump setup
  pinMode(pump, OUTPUT);
  digitalWrite(pump, LOW);
  pumpStatus = false;

  // Servo setup
  myservo.attach(13);
  myservo.write(90); // center position

  // Setup WiFi Access Point
  setupWiFi();

  // Setup web server routes
  setupWebServer();

  Serial.println("✅ System Initialized");
  Serial.println("🤖 FireBot Ready - Auto Mode Active");
  Serial.println("========================================\n");
}

// ========================================
// Main Loop
// ========================================
void loop() {
  server.handleClient();

  if (millis() - lastSensorRead >= SENSOR_READ_INTERVAL) {
    readSensors();
    lastSensorRead = millis();
  }

  if (!manualMode && (millis() - lastAutoAction >= AUTO_ACTION_INTERVAL)) {
    autonomousFireFighting();
    lastAutoAction = millis();
  }

  delay(10);
}

// ========================================
// WiFi Setup
// ========================================
void setupWiFi() {
  Serial.println("📡 Setting up WiFi Access Point...");

  if (!WiFi.softAPConfig(local_IP, gateway, subnet)) {
    Serial.println("❌ Failed to configure static IP");
  }

  if (WiFi.softAP(ssid, password)) {
    Serial.println("✅ WiFi Access Point started!");
    Serial.println("   SSID: " + String(ssid));
    Serial.println("   Password: " + String(password));
    Serial.println("   IP Address: " + WiFi.softAPIP().toString());
  } else {
    Serial.println("❌ Failed to start Access Point!");
  }
}

// ========================================
// Web Server Setup
// ========================================
void setupWebServer() {
  server.on("/", HTTP_GET, handleRoot);
  server.on("/api/health", HTTP_GET, handleHealth);
  server.on("/api/connect", HTTP_OPTIONS, handleOptions);
  server.on("/api/connect", HTTP_POST, handleConnect);
  server.on("/api/connect", HTTP_GET, handleConnect);
  server.on("/api/disconnect", HTTP_POST, handleDisconnect);
  server.on("/api/send-command", HTTP_OPTIONS, handleOptions);
  server.on("/api/send-command", HTTP_POST, handleSendCommand);
  server.on("/api/status", HTTP_GET, handleStatus);
  server.onNotFound(handleNotFound);

  server.begin();
  Serial.println("✅ Web server started on port 80");
}

// ========================================
// CORS Helpers
// ========================================
void setCORSHeaders() {
  server.sendHeader("Access-Control-Allow-Origin", "*");
  server.sendHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  server.sendHeader("Access-Control-Allow-Headers", "Content-Type");
}

void handleOptions() {
  setCORSHeaders();
  server.send(204);
}

// ========================================
// Sensor Reading
// ========================================
void readSensors() {
  int left = digitalRead(Left_S);
  int right = digitalRead(Right_S);
  int front = digitalRead(Forward_S);

  fireDetected = (front == HIGH || left == HIGH || right == HIGH);

  static unsigned long lastDebug = 0;
  if (millis() - lastDebug > 2000) {
    Serial.print("Sensors - L: "); Serial.print(left);
    Serial.print(" | F: "); Serial.print(front);
    Serial.print(" | R: "); Serial.print(right);
    Serial.print(" | Mode: "); Serial.println(manualMode ? "MANUAL" : "AUTO");
    lastDebug = millis();
  }
}

// ========================================
// Autonomous Fire Fighting
// ========================================
void autonomousFireFighting() {
  int left = digitalRead(Left_S);
  int right = digitalRead(Right_S);
  int front = digitalRead(Forward_S);

  if (front == HIGH) {
    Serial.println("🔥 Fire detected in FRONT! Extinguishing...");
    put_off_fire();
  } else if (left == HIGH) {
    Serial.println("🔥 Fire on LEFT — turning left");
    turnLeft(); delay(400); stopMotors();
  } else if (right == HIGH) {
    Serial.println("🔥 Fire on RIGHT — turning right");
    turnRight(); delay(400); stopMotors();
  } else {
    Serial.println("🔍 No fire — moving forward");
    moveForward(); delay(400); stopMotors();
  }
}

// ========================================
// Fire Extinguishing Routine
// ========================================
void put_off_fire() {
  stopMotors();
  pumpOn();
  delay(200);

  for (pos = 60; pos <= 120; pos++) { myservo.write(pos); delay(10); }
  for (pos = 120; pos >= 60; pos--) { myservo.write(pos); delay(10); }

  delay(3000);
  myservo.write(90);
  pumpOff();
  delay(2000);
}

// ========================================
// Motor Control
// ========================================
void stopMotors() { digitalWrite(LM1, LOW); digitalWrite(LM2, LOW); digitalWrite(RM1, LOW); digitalWrite(RM2, LOW); }
void moveForward() { digitalWrite(LM1, HIGH); digitalWrite(LM2, LOW); digitalWrite(RM1, HIGH); digitalWrite(RM2, LOW); }
void moveBackward() { digitalWrite(LM1, LOW); digitalWrite(LM2, HIGH); digitalWrite(RM1, LOW); digitalWrite(RM2, HIGH); }
void turnLeft() { digitalWrite(LM1, LOW); digitalWrite(LM2, LOW); digitalWrite(RM1, HIGH); digitalWrite(RM2, LOW); }
void turnRight() { digitalWrite(LM1, HIGH); digitalWrite(LM2, LOW); digitalWrite(RM1, LOW); digitalWrite(RM2, LOW); }

// ========================================
// Pump Control
// ========================================
void pumpOn() { digitalWrite(pump, HIGH); pumpStatus = true; Serial.println("💧 Pump ON"); }
void pumpOff() { digitalWrite(pump, LOW); pumpStatus = false; Serial.println("💧 Pump OFF"); }

// ========================================
// HTTP Handlers
// ========================================
void handleRoot() {
  setCORSHeaders();
  String html = "<html><body><h1>🔥 FireBot WiFi Controller</h1>";
  html += "<p>Mode: " + String(manualMode ? "Manual" : "Auto") + "</p>";
  html += "<p>Fire Detected: " + String(fireDetected ? "YES" : "NO") + "</p>";
  html += "<p>Pump: " + String(pumpStatus ? "ON" : "OFF") + "</p>";
  html += "<p>Connected Clients: " + String(WiFi.softAPgetStationNum()) + "</p></body></html>";
  server.send(200, "text/html", html);
}

void handleHealth() {
  setCORSHeaders();
  server.send(200, "application/json", "{\"status\":\"running\",\"version\":\"1.0.1\"}");
}

void handleConnect() {
  setCORSHeaders();
  server.send(200, "application/json", "{\"success\":true,\"connected\":true,\"message\":\"Connected to FireBot\"}");
  Serial.println("📱 Client connected via web interface");
}

void handleDisconnect() {
  setCORSHeaders();
  server.send(200, "application/json", "{\"success\":true,\"connected\":false,\"message\":\"Disconnected\"}");
  Serial.println("📱 Client disconnected");
}

void handleSendCommand() {
  setCORSHeaders();
  
  if (!server.hasArg("plain")) {
    server.send(400, "application/json", "{\"success\":false,\"message\":\"No body\"}");
    return;
  }

  String body = server.arg("plain");
  int commandStart = body.indexOf("\"command\":\"") + 11;
  int commandEnd = body.indexOf("\"", commandStart);
  String command = body.substring(commandStart, commandEnd);

  Serial.println("📨 Command: " + command);
  executeCommand(command);

  server.send(200, "application/json", "{\"success\":true,\"message\":\"Command " + command + " executed\"}");
}

void handleStatus() {
  setCORSHeaders();
  String response = "{";
  response += "\"connected\":true,";
  response += "\"sensorData\":{";
  response += "\"fireDetected\":" + String(fireDetected ? "true" : "false") + ",";
  response += "\"pumpStatus\":" + String(pumpStatus ? "true" : "false");
  response += "},";
  response += "\"manualMode\":" + String(manualMode ? "true" : "false");
  response += "}";
  server.send(200, "application/json", response);
}

void handleNotFound() {
  setCORSHeaders();
  server.send(404, "application/json", "{\"error\":\"Not Found\",\"path\":\"" + server.uri() + "\"}");
}

// ========================================
// Command Execution
// ========================================
void executeCommand(String command) {
  if (command == "F" || command == "FORWARD") { manualMode = true; moveForward(); Serial.println("→ Moving Forward"); }
  else if (command == "B" || command == "BACKWARD") { manualMode = true; moveBackward(); Serial.println("→ Moving Backward"); }
  else if (command == "L" || command == "LEFT") { manualMode = true; turnLeft(); Serial.println("→ Turning Left"); }
  else if (command == "R" || command == "RIGHT") { manualMode = true; turnRight(); Serial.println("→ Turning Right"); }
  else if (command == "S" || command == "STOP") { manualMode = true; stopMotors(); Serial.println("→ Stopped"); }
  else if (command == "P1") { manualMode = true; pumpOn(); }
  else if (command == "P0") { manualMode = true; pumpOff(); }
  else if (command == "AUTO") { manualMode = false; stopMotors(); Serial.println("→ Switched to AUTO MODE"); }
  else { Serial.println("⚠️ Unknown command: " + command); }
}
