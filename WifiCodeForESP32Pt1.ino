/* 
  ESP32 FireBot WiFi AP + HTTP control
  - AP SSID: FireBot-AP
  - Password: firebot123
  - Mode: automatic (sensors) or manual (remote)
  - Endpoints:
      GET  /status                -> JSON {left,front,right,mode}
      POST /mode?mode=auto        -> set auto mode
      POST /mode?mode=manual      -> set manual mode
      POST /cmd?cmd=forward       -> move forward
           cmd=backward
           cmd=left
           cmd=right
           cmd=stop
           cmd=pump_on
           cmd=pump_off
      POST /pump?state=on|off
*/

#include <WiFi.h>
#include <WebServer.h>
#include <ESP32Servo.h>

Servo myservo;

// ----- Pin definitions (adjust if you changed wiring) -----
const int PIN_LEFT_S   = 34;
const int PIN_RIGHT_S  = 35;
const int PIN_FRONT_S  = 32;

const int PIN_LM1 = 27;
const int PIN_LM2 = 26;
const int PIN_RM1 = 25;
const int PIN_RM2 = 33;

const int PIN_SERVO = 13;
const int PIN_PUMP  = 23; // MOSFET gate (HIGH = ON)

// ----- Behavior params -----
unsigned long pumpOnMillis = 5000; // default pump ON time when put_off_fire is called (ms)
bool autoMode = true;              // start in automatic mode
bool fireDetected = false;

// WiFi AP settings
const char* ap_ssid = "FireBot-AP";
const char* ap_password = "firebot123";

WebServer server(80);

// ---------- Utility / Motor functions ----------
void stopMotors() {
  digitalWrite(PIN_LM1, LOW);
  digitalWrite(PIN_LM2, LOW);
  digitalWrite(PIN_RM1, LOW);
  digitalWrite(PIN_RM2, LOW);
}

void moveForward() {
  digitalWrite(PIN_LM1, HIGH);
  digitalWrite(PIN_LM2, LOW);
  digitalWrite(PIN_RM1, HIGH);
  digitalWrite(PIN_RM2, LOW);
}

void turnLeft() {
  digitalWrite(PIN_LM1, LOW);
  digitalWrite(PIN_LM2, LOW);
  digitalWrite(PIN_RM1, HIGH);
  digitalWrite(PIN_RM2, LOW);
}

void turnRight() {
  digitalWrite(PIN_LM1, HIGH);
  digitalWrite(PIN_LM2, LOW);
  digitalWrite(PIN_RM1, LOW);
  digitalWrite(PIN_RM2, LOW);
}

// Pump control (MOSFET) - HIGH = ON, LOW = OFF
void pumpOn() {
  digitalWrite(PIN_PUMP, HIGH);
}
void pumpOff() {
  digitalWrite(PIN_PUMP, LOW);
}

// Fire extinguish routine (same as before but non-blocking flavor kept simple)
void put_off_fire_blocking() {
  // Keep blocking approach for now (safe and simple).
  stopMotors();
  pumpOn();
  Serial.println("💧 Pump ON - spraying");

  // sweep servo left-right
  for (int p = 60; p <= 120; ++p) {
    myservo.write(p);
    delay(10);
  }
  for (int p = 120; p >= 60; --p) {
    myservo.write(p);
    delay(10);
  }

  delay(pumpOnMillis); // keep pump on a bit longer
  myservo.write(90);
  pumpOff();
  Serial.println("💧 Pump OFF - done");
}

// ---------- HTTP Handlers ----------
void handleRoot() {
  String s = "<h3>FireBot ESP32</h3><p>Use the web app or API endpoints to control the robot.</p>";
  s += "<p>GET /status  POST /cmd?cmd=forward|backward|left|right|stop|pump_on|pump_off</p>";
  server.send(200, "text/html", s);
}

void handleStatus() {
  int left  = digitalRead(PIN_LEFT_S);
  int right = digitalRead(PIN_RIGHT_S);
  int front = digitalRead(PIN_FRONT_S);
  String json = "{";
  json += "\"left\":" + String(left) + ",";
  json += "\"front\":" + String(front) + ",";
  json += "\"right\":" + String(right) + ",";
  json += "\"mode\":\"" + String(autoMode ? "auto" : "manual") + "\"";
  json += "}";
  server.send(200, "application/json", json);
}

void handleMode() {
  // Accept POST with ?mode=auto or ?mode=manual
  if (server.hasArg("mode")) {
    String m = server.arg("mode");
    if (m == "auto") {
      autoMode = true;
      stopMotors();
      server.send(200, "text/plain", "Mode set to auto");
      Serial.println("Mode -> AUTO");
      return;
    } else if (m == "manual") {
      autoMode = false;
      stopMotors();
      server.send(200, "text/plain", "Mode set to manual");
      Serial.println("Mode -> MANUAL");
      return;
    }
  }
  server.send(400, "text/plain", "missing or invalid mode argument");
}

void handlePump() {
  if (server.hasArg("state")) {
    String st = server.arg("state");
    if (st == "on") {
      pumpOn();
      server.send(200, "text/plain", "pump on");
      return;
    } else if (st == "off") {
      pumpOff();
      server.send(200, "text/plain", "pump off");
      return;
    }
  }
  server.send(400, "text/plain", "missing state=on|off");
}

void handleCmd() {
  // Accept simple movement and pump commands
  if (!server.hasArg("cmd")) {
    server.send(400, "text/plain", "missing cmd argument");
    return;
  }
  String c = server.arg("cmd");
  c.toLowerCase();

  if (c == "forward") {
    moveForward();
    server.send(200, "text/plain", "ok forward");
  } else if (c == "backward") {
    // if you have backward wiring, implement here; for now stop
    stopMotors();
    server.send(200, "text/plain", "ok backward (not implemented)");
  } else if (c == "left") {
    turnLeft();
    server.send(200, "text/plain", "ok left");
  } else if (c == "right") {
    turnRight();
    server.send(200, "text/plain", "ok right");
  } else if (c == "stop") {
    stopMotors();
    server.send(200, "text/plain", "ok stop");
  } else if (c == "pump_on") {
    pumpOn();
    server.send(200, "text/plain", "pump on");
  } else if (c == "pump_off") {
    pumpOff();
    server.send(200, "text/plain", "pump off");
  } else if (c == "auto_on") {
    autoMode = true;
    stopMotors();
    server.send(200, "text/plain", "auto on");
  } else if (c == "auto_off") {
    autoMode = false;
    stopMotors();
    server.send(200, "text/plain", "auto off");
  } else {
    server.send(400, "text/plain", "unknown cmd");
  }
}

// ---------- Setup ----------
void setupWiFiAP() {
  WiFi.mode(WIFI_AP);
  bool ok = WiFi.softAP(ap_ssid, ap_password);
  if (!ok) {
    Serial.println("AP start failed!");
  } else {
    Serial.println("✅ WiFi AP started.");
    Serial.print("SSID: "); Serial.println(ap_ssid);
    Serial.print("IP: "); Serial.println(WiFi.softAPIP()); // usually 192.168.4.1
  }
}

void setup() {
  Serial.begin(115200);
  delay(200);

  // pins
  pinMode(PIN_LEFT_S, INPUT);
  pinMode(PIN_RIGHT_S, INPUT);
  pinMode(PIN_FRONT_S, INPUT);

  pinMode(PIN_LM1, OUTPUT);
  pinMode(PIN_LM2, OUTPUT);
  pinMode(PIN_RM1, OUTPUT);
  pinMode(PIN_RM2, OUTPUT);

  pinMode(PIN_PUMP, OUTPUT);
  digitalWrite(PIN_PUMP, LOW); // Pump OFF initially (LOW)

  myservo.attach(PIN_SERVO);
  myservo.write(90);

  // WiFi AP
  setupWiFiAP();

  // HTTP handlers
  server.on("/", HTTP_GET, handleRoot);
  server.on("/status", HTTP_GET, handleStatus);
  server.on("/mode", HTTP_POST, handleMode);
  server.on("/pump", HTTP_POST, handlePump);
  server.on("/cmd", HTTP_POST, handleCmd);

  server.begin();
  Serial.println("✅ Web server started on port 80");
}

// ---------- Loop ----------
unsigned long lastAutoCheck = 0;
const unsigned long autoInterval = 300; // ms

void loop() {
  server.handleClient();

  // If in automatic mode, check sensors periodically
  if (autoMode) {
    unsigned long now = millis();
    if (now - lastAutoCheck >= autoInterval) {
      lastAutoCheck = now;
      int left  = digitalRead(PIN_LEFT_S);
      int right = digitalRead(PIN_RIGHT_S);
      int front = digitalRead(PIN_FRONT_S);

      // NOTE: adapt active HIGH/LOW depending on your sensors (this assumes HIGH -> fire)
      if (front == HIGH) {
        Serial.println("AUTO: fire front");
        put_off_fire_blocking();
      } else if (left == HIGH) {
        Serial.println("AUTO: fire left - turning left");
        turnLeft();
        delay(400);
        stopMotors();
      } else if (right == HIGH) {
        Serial.println("AUTO: fire right - turning right");
        turnRight();
        delay(400);
        stopMotors();
      } else {
        // nothing -> move forward a little (optional)
        // moveForward(); delay(200); stopMotors();
      }
    }
  }

  // In manual mode web commands control motors/pump, so nothing else to do here
}
