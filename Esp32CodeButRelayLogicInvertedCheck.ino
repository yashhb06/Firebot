#include <ESP32Servo.h>
//working code for 9th october 2025
Servo myservo;
int pos = 0;
bool fireDetected = false;

// 🔹 Sensor Pins
#define Left_S    34
#define Right_S   35
#define Forward_S 32

// 🔹 Motor Driver Pins
#define LM1 27
#define LM2 26
#define RM1 25
#define RM2 33

// 🔹 MOSFET-controlled Pump
#define pump 23  

void setup() {
  Serial.begin(115200);

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
  digitalWrite(pump, LOW); // Pump OFF at startup (LOW = OFF)

  // Servo setup
  myservo.attach(13);
  myservo.write(90); // center position

  Serial.println("System Initialized");
}

void loop() {
  int left = digitalRead(Left_S);
  int right = digitalRead(Right_S);
  int front = digitalRead(Forward_S);

  Serial.print("Left: "); Serial.print(left);
  Serial.print(" | Front: "); Serial.print(front);
  Serial.print(" | Right: "); Serial.println(right);

  if (front == HIGH) {
    fireDetected = true;
    Serial.println("🔥 Fire detected in FRONT! Extinguishing...");
    put_off_fire();
  }
  else if (left == HIGH) {
    Serial.println("🔥 Fire on LEFT — turning left");
    turnLeft();
    delay(400);
    stopMotors();
  }
  else if (right == HIGH) {
    Serial.println("🔥 Fire on RIGHT — turning right");
    turnRight();
    delay(400);
    stopMotors();
  }
  else if (left == LOW && right == LOW && front == LOW) {
    fireDetected = false;
    Serial.println("✅ No fire — moving forward");
    moveForward();
    delay(400);
    stopMotors();
  }

  delay(100);
}

// 🔹 Fire Extinguishing Routine
void put_off_fire() {
  stopMotors();
  digitalWrite(pump, HIGH); // Pump ON
  Serial.println("💧 Pump ON — spraying water");

  for (pos = 60; pos <= 120; pos++) {
    myservo.write(pos);
    delay(10);
  }
  for (pos = 120; pos >= 60; pos--) {
    myservo.write(pos);
    delay(10);
  }

  
  delay(3000);
  myservo.write(90);
  digitalWrite(pump, LOW); // Pump OFF
  Serial.println("✅ Fire extinguished — Pump OFF");
  delay(2000);
}

// 🔹 Motor Control
void stopMotors() {
  digitalWrite(LM1, LOW);
  digitalWrite(LM2, LOW);
  digitalWrite(RM1, LOW);
  digitalWrite(RM2, LOW);
}

void moveForward() {
  digitalWrite(LM1, HIGH);
  digitalWrite(LM2, LOW);
  digitalWrite(RM1, HIGH);
  digitalWrite(RM2, LOW);
}

void turnLeft() {
  digitalWrite(LM1, LOW);
  digitalWrite(LM2, LOW);
  digitalWrite(RM1, HIGH);
  digitalWrite(RM2, LOW);
}

void turnRight() {
  digitalWrite(LM1, HIGH);
  digitalWrite(LM2, LOW);
  digitalWrite(RM1, LOW);
  digitalWrite(RM2, LOW);
}
