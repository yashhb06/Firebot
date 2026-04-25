/*
 * ESP32 FireBot WiFi Controller (Full Hybrid Mode)
 * =================================================
 * FLOW:
 *   1. First boot → AP mode (FireBot-AP). User connects & enters Home WiFi + BotID.
 *   2. ESP32 saves creds, reboots, connects to Home Router.
 *   3. After connecting, publishes its IP to Firebase RTDB via REST HTTP.
 *   4. React app fetches IP from Firebase using Bot ID, then connects directly.
 *
 * PIN MAP (do not change):
 *   Left Sensor:  34 | Forward Sensor: 32 | Right Sensor: 35
 *   LM1: 27 | LM2: 26 | RM1: 25 | RM2: 33
 *   Pump MOSFET: 23 | Servo Signal: 13
 */

#include <WiFi.h>
#include <WebServer.h>
#include <HTTPClient.h>
#include <ESP32Servo.h>
#include <Preferences.h>

// =============================================
// Firebase Configuration (REST API — no library)
// =============================================
const char* FIREBASE_DB_URL = "https://firebot-5077c-default-rtdb.firebaseio.com";
const char* FIREBASE_API_KEY = "AIzaSyABaCepP18z8_eOFz2gFSC-Q-aJrYrZLOU";

// =============================================
// AP Fallback Config
// =============================================
const char* AP_SSID = "FireBot-AP";
const char* AP_PASS = "firebot123";
IPAddress local_IP(192, 168, 4, 1);
IPAddress gateway(192, 168, 4, 1);
IPAddress subnet(255, 255, 255, 0);

WebServer server(80);
Preferences preferences;

// =============================================
// State Variables
// =============================================
String botId       = "";
bool isAPMode      = false; // true when in fallback AP mode
bool manualMode    = false;
bool pumpStatus    = false;
bool fireDetected  = false;

// =============================================
// Hardware Pins
// =============================================
Servo myservo;
int servoPos = 0;

#define Left_S    34
#define Right_S   35
#define Forward_S 32
#define LM1       27
#define LM2       26
#define RM1       25
#define RM2       33
#define pump      23
#define SERVO_PIN 13

// =============================================
// Timing
// =============================================
unsigned long lastSensorRead = 0;
const unsigned long SENSOR_INTERVAL = 100;
unsigned long lastAutoAction = 0;
const unsigned long AUTO_INTERVAL  = 500;
unsigned long lastFirebaseUpdate   = 0;
const unsigned long FIREBASE_INTERVAL = 5000; // push status every 5s

// =============================================
// Forward declarations
// =============================================
void setupHardware();
void setupWiFi();
void startAPMode();
bool connectToHomeWiFi(const String& ssid, const String& pass);
void publishIPToFirebase();
void pushStatusToFirebase();
void setupWebServer();
void setCORSHeaders();
void handleOptions();
void handleRoot();
void handleHealth();
void handleConnect();
void handleDisconnect();
void handleSendCommand();
void handleSetWiFi();
void handleStatus();
void handleNotFound();
void executeCommand(const String& command);
void readSensors();
void autonomousFireFighting();
void put_off_fire();
void stopMotors();
void moveForward();
void moveBackward();
void turnLeft();
void turnRight();
void pumpOn();
void pumpOff();

// =============================================
// SETUP
// =============================================
void setup() {
  Serial.begin(115200);
  Serial.println("\n============================================");
  Serial.println("🔥 FireBot Controller — Hybrid Mode");
  Serial.println("============================================");

  setupHardware();
  setupWiFi();
  setupWebServer();

  Serial.println("✅ System ready!");
}

// =============================================
// LOOP
// =============================================
void loop() {
  server.handleClient();

  // Read sensors every 100ms
  if (millis() - lastSensorRead >= SENSOR_INTERVAL) {
    readSensors();
    lastSensorRead = millis();
  }

  // Autonomous fire-fighting when not in manual mode
  if (!manualMode && (millis() - lastAutoAction >= AUTO_INTERVAL)) {
    autonomousFireFighting();
    lastAutoAction = millis();
  }

  // Push status to Firebase every 5s (only in STA mode)
  if (!isAPMode && botId.length() > 0 && (millis() - lastFirebaseUpdate >= FIREBASE_INTERVAL)) {
    pushStatusToFirebase();
    lastFirebaseUpdate = millis();
  }

  delay(10);
}

// =============================================
// Hardware Setup
// =============================================
void setupHardware() {
  // Sensors
  pinMode(Left_S, INPUT);
  pinMode(Right_S, INPUT);
  pinMode(Forward_S, INPUT);

  // Motors
  pinMode(LM1, OUTPUT); pinMode(LM2, OUTPUT);
  pinMode(RM1, OUTPUT); pinMode(RM2, OUTPUT);
  stopMotors();

  // Pump
  pinMode(pump, OUTPUT);
  digitalWrite(pump, LOW);

  // Servo
  myservo.attach(SERVO_PIN);
  myservo.write(90);

  Serial.println("✅ Hardware pins initialized");
}

// =============================================
// WiFi Setup — STA first, AP fallback
// =============================================
void setupWiFi() {
  preferences.begin("config", true);
  String savedSSID = preferences.getString("ssid",     "");
  String savedPass = preferences.getString("password", "");
  botId            = preferences.getString("botId",    "");
  preferences.end();

  if (savedSSID.length() > 0) {
    Serial.println("📡 Saved WiFi found: " + savedSSID);
    if (connectToHomeWiFi(savedSSID, savedPass)) {
      publishIPToFirebase(); // Tell Firebase our IP
      return;
    }
    Serial.println("❌ Could not connect to saved router. Switching to AP mode.");
  } else {
    Serial.println("⚠️  No saved credentials. First-time setup required.");
  }

  startAPMode();
}

// =============================================
// Connect to Home Router
// =============================================
bool connectToHomeWiFi(const String& ssid, const String& pass) {
  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid.c_str(), pass.c_str());
  Serial.print("   Connecting");
  unsigned long t = millis();
  while (WiFi.status() != WL_CONNECTED && millis() - t < 12000) {
    Serial.print(".");
    delay(500);
  }
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\n✅ Connected! IP: " + WiFi.localIP().toString());
    isAPMode = false;
    return true;
  }
  Serial.println("\n❌ Connection failed.");
  return false;
}

// =============================================
// Start AP Mode (first boot / fallback)
// =============================================
void startAPMode() {
  isAPMode = true;
  WiFi.mode(WIFI_AP);
  WiFi.softAPConfig(local_IP, gateway, subnet);
  if (WiFi.softAP(AP_SSID, AP_PASS)) {
    Serial.println("✅ FireBot-AP started at 192.168.4.1");
    Serial.println("   Connect to FireBot-AP and open the setup page.");
  }
}

// =============================================
// Publish IP to Firebase RTDB (REST API)
// =============================================
void publishIPToFirebase() {
  if (botId.length() == 0) {
    Serial.println("⚠️  No Bot ID saved — skipping Firebase IP publish.");
    return;
  }
  if (WiFi.status() != WL_CONNECTED) return;

  HTTPClient http;
  String url = String(FIREBASE_DB_URL) + "/bots/" + botId + "/ip.json?auth=" + FIREBASE_API_KEY;
  String ipStr = "\"" + WiFi.localIP().toString() + "\"";

  http.begin(url);
  http.addHeader("Content-Type", "application/json");
  int code = http.PUT(ipStr);

  if (code == 200) {
    Serial.println("✅ IP published to Firebase: " + WiFi.localIP().toString());
  } else {
    Serial.println("❌ Firebase IP publish failed. Code: " + String(code));
  }
  http.end();
}

// =============================================
// Push Status to Firebase RTDB (REST API)
// =============================================
void pushStatusToFirebase() {
  if (WiFi.status() != WL_CONNECTED || botId.length() == 0) return;

  HTTPClient http;
  String url = String(FIREBASE_DB_URL) + "/bots/" + botId + "/status.json?auth=" + FIREBASE_API_KEY;
  String body = "{\"fireDetected\":" + String(fireDetected ? "true" : "false") +
                ",\"pumpStatus\":"   + String(pumpStatus   ? "true" : "false") +
                ",\"manualMode\":"   + String(manualMode   ? "true" : "false") +
                ",\"lastSeen\":"     + String(millis()) + "}";

  http.begin(url);
  http.addHeader("Content-Type", "application/json");
  int code = http.PUT(body);
  http.end();

  if (code != 200) {
    Serial.println("⚠️  Firebase status push failed. Code: " + String(code));
  }
}

// =============================================
// Web Server Routes
// =============================================
void setupWebServer() {
  server.on("/",                  HTTP_GET,     handleRoot);
  server.on("/api/health",        HTTP_GET,     handleHealth);
  server.on("/api/connect",       HTTP_OPTIONS, handleOptions);
  server.on("/api/connect",       HTTP_POST,    handleConnect);
  server.on("/api/connect",       HTTP_GET,     handleConnect);
  server.on("/api/disconnect",    HTTP_POST,    handleDisconnect);
  server.on("/api/send-command",  HTTP_OPTIONS, handleOptions);
  server.on("/api/send-command",  HTTP_POST,    handleSendCommand);
  server.on("/api/wifi",          HTTP_OPTIONS, handleOptions);
  server.on("/api/wifi",          HTTP_POST,    handleSetWiFi);
  server.on("/api/status",        HTTP_GET,     handleStatus);
  server.onNotFound(handleNotFound);
  server.begin();
  Serial.println("✅ HTTP server started on port 80");
}

// =============================================
// CORS
// =============================================
void setCORSHeaders() {
  server.sendHeader("Access-Control-Allow-Origin",  "*");
  server.sendHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  server.sendHeader("Access-Control-Allow-Headers", "Content-Type");
}

void handleOptions() { setCORSHeaders(); server.send(204); }

// =============================================
// Handlers
// =============================================
void handleRoot() {
  setCORSHeaders();
  String html =
    "<!DOCTYPE html><html><head><meta charset='UTF-8'>"
    "<meta name='viewport' content='width=device-width,initial-scale=1'>"
    "<title>FireBot</title></head><body style='background:#0f172a;color:#fff;font-family:sans-serif;text-align:center;padding:20px'>"
    "<h1>&#128293; FireBot</h1>"
    "<p>Mode: " + String(isAPMode ? "Setup (AP)" : "Active (STA)") + "</p>"
    "<p>Bot ID: " + (botId.length() ? botId : "Not set") + "</p>"
    "<p>Fire: " + String(fireDetected ? "YES" : "NO") + " | Pump: " + String(pumpStatus ? "ON" : "OFF") + "</p>"
    "</body></html>";
  server.send(200, "text/html", html);
}

void handleHealth() {
  setCORSHeaders();
  String json = "{\"status\":\"running\",\"mode\":\"" + String(isAPMode ? "ap" : "sta") +
                "\",\"botId\":\"" + botId + "\",\"version\":\"2.0\"}";
  server.send(200, "application/json", json);
}

void handleConnect() {
  setCORSHeaders();
  server.send(200, "application/json",
    "{\"success\":true,\"connected\":true,\"botId\":\"" + botId + "\",\"message\":\"Connected to FireBot\"}");
  Serial.println("📱 Client connected");
}

void handleDisconnect() {
  setCORSHeaders();
  server.send(200, "application/json", "{\"success\":true,\"connected\":false}");
}

void handleStatus() {
  setCORSHeaders();
  String json = "{\"connected\":true"
                ",\"fireDetected\":"  + String(fireDetected ? "true" : "false") +
                ",\"pumpStatus\":"    + String(pumpStatus   ? "true" : "false") +
                ",\"manualMode\":"    + String(manualMode   ? "true" : "false") +
                ",\"isAPMode\":"      + String(isAPMode     ? "true" : "false") +
                ",\"botId\":\""       + botId + "\"}";
  server.send(200, "application/json", json);
}

// POST /api/wifi  body: {"ssid":"...","password":"...","botId":"FIREBOT_001"}
void handleSetWiFi() {
  setCORSHeaders();
  if (!server.hasArg("plain")) {
    server.send(400, "application/json", "{\"success\":false,\"message\":\"No body\"}");
    return;
  }

  String body = server.arg("plain");
  Serial.println("📥 /api/wifi body: " + body);

  // --- parse ssid ---
  int s1 = body.indexOf("\"ssid\":\"") + 8;
  int s2 = body.indexOf("\"", s1);
  String newSSID = (s1 > 7 && s2 > s1) ? body.substring(s1, s2) : "";

  // --- parse password ---
  int p1 = body.indexOf("\"password\":\"") + 12;
  int p2 = body.indexOf("\"", p1);
  String newPass = (p1 > 11 && p2 > p1) ? body.substring(p1, p2) : "";

  // --- parse botId ---
  int b1 = body.indexOf("\"botId\":\"") + 9;
  int b2 = body.indexOf("\"", b1);
  String newBotId = (b1 > 8 && b2 > b1) ? body.substring(b1, b2) : "";

  if (newSSID.length() == 0) {
    server.send(400, "application/json", "{\"success\":false,\"message\":\"Invalid SSID\"}");
    return;
  }

  Serial.println("💾 Saving: SSID=" + newSSID + " | BotID=" + newBotId);
  preferences.begin("config", false);
  preferences.putString("ssid",     newSSID);
  preferences.putString("password", newPass);
  preferences.putString("botId",    newBotId);
  preferences.end();

  server.send(200, "application/json",
    "{\"success\":true,\"message\":\"Saved! Rebooting to connect to home WiFi...\"}");

  delay(1500);
  ESP.restart();
}

void handleSendCommand() {
  setCORSHeaders();
  if (!server.hasArg("plain")) {
    server.send(400, "application/json", "{\"success\":false,\"message\":\"No body\"}");
    return;
  }
  String body = server.arg("plain");
  int c1 = body.indexOf("\"command\":\"") + 11;
  int c2 = body.indexOf("\"", c1);
  String command = (c1 > 10 && c2 > c1) ? body.substring(c1, c2) : "";

  if (command.length() == 0) {
    server.send(400, "application/json", "{\"success\":false,\"message\":\"No command\"}");
    return;
  }
  executeCommand(command);
  server.send(200, "application/json",
    "{\"success\":true,\"command\":\"" + command + "\"}");
}

void handleNotFound() {
  setCORSHeaders();
  server.send(404, "application/json",
    "{\"error\":\"Not Found\",\"path\":\"" + server.uri() + "\"}");
}

// =============================================
// Command Execution
// =============================================
void executeCommand(const String& command) {
  Serial.println("📨 CMD: " + command);
  if      (command == "F" || command == "FORWARD")  { manualMode = true; moveForward();  }
  else if (command == "B" || command == "BACKWARD") { manualMode = true; moveBackward(); }
  else if (command == "L" || command == "LEFT")     { manualMode = true; turnLeft();     }
  else if (command == "R" || command == "RIGHT")    { manualMode = true; turnRight();    }
  else if (command == "S" || command == "STOP")     { manualMode = true; stopMotors();   }
  else if (command == "P1")   { manualMode = true;  pumpOn();  }
  else if (command == "P0")   { manualMode = true;  pumpOff(); }
  else if (command == "AUTO") { manualMode = false; stopMotors(); Serial.println("→ AUTO MODE"); }
  else { Serial.println("⚠️  Unknown: " + command); }
}

// =============================================
// Sensor Reading
// =============================================
void readSensors() {
  int l = digitalRead(Left_S);
  int r = digitalRead(Right_S);
  int f = digitalRead(Forward_S);
  fireDetected = (f == HIGH || l == HIGH || r == HIGH);

  static unsigned long lastPrint = 0;
  if (millis() - lastPrint > 3000) {
    Serial.printf("Sensors L:%d F:%d R:%d | Mode:%s | Fire:%s\n",
      l, f, r, manualMode ? "MANUAL" : "AUTO", fireDetected ? "YES" : "NO");
    lastPrint = millis();
  }
}

// =============================================
// Autonomous Fire Fighting
// =============================================
void autonomousFireFighting() {
  int l = digitalRead(Left_S);
  int r = digitalRead(Right_S);
  int f = digitalRead(Forward_S);

  if (f == HIGH) {
    Serial.println("🔥 Fire FRONT! Extinguishing...");
    put_off_fire();
  } else if (l == HIGH) {
    Serial.println("🔥 Fire LEFT — turning");
    turnLeft(); delay(400); stopMotors();
  } else if (r == HIGH) {
    Serial.println("🔥 Fire RIGHT — turning");
    turnRight(); delay(400); stopMotors();
  } else {
    moveForward(); delay(400); stopMotors();
  }
}

// =============================================
// Fire Extinguishing Routine
// =============================================
void put_off_fire() {
  stopMotors();
  pumpOn();
  delay(200);
  for (servoPos = 60;  servoPos <= 120; servoPos++) { myservo.write(servoPos); delay(10); }
  for (servoPos = 120; servoPos >= 60;  servoPos--) { myservo.write(servoPos); delay(10); }
  delay(3000);
  myservo.write(90);
  pumpOff();
  delay(2000);
}

// =============================================
// Motor Control
// =============================================
void stopMotors()    { digitalWrite(LM1,LOW);  digitalWrite(LM2,LOW);  digitalWrite(RM1,LOW);  digitalWrite(RM2,LOW);  }
void moveForward()   { digitalWrite(LM1,HIGH); digitalWrite(LM2,LOW);  digitalWrite(RM1,HIGH); digitalWrite(RM2,LOW);  }
void moveBackward()  { digitalWrite(LM1,LOW);  digitalWrite(LM2,HIGH); digitalWrite(RM1,LOW);  digitalWrite(RM2,HIGH); }
void turnLeft()      { digitalWrite(LM1,LOW);  digitalWrite(LM2,LOW);  digitalWrite(RM1,HIGH); digitalWrite(RM2,LOW);  }
void turnRight()     { digitalWrite(LM1,HIGH); digitalWrite(LM2,LOW);  digitalWrite(RM1,LOW);  digitalWrite(RM2,LOW);  }

// =============================================
// Pump Control
// =============================================
void pumpOn()  { digitalWrite(pump, HIGH); pumpStatus = true;  Serial.println("💧 Pump ON");  }
void pumpOff() { digitalWrite(pump, LOW);  pumpStatus = false; Serial.println("💧 Pump OFF"); }
