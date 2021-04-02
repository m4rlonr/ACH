// An IR LED must be connected to Arduino PWM pin 3.
// On esp pin 4
#include "WiFi.h"
#include "ESPAsyncWebServer.h"
#include <IRremote.h>
#include <iostream>
#include <sstream>

// Credenciais para acesso a rede wifi
const char* ssid = "irwin";
const char* password = "irwintrena5m";

AsyncWebServer server(80);
String command;
String lenCommand;
String mac;

void setup() {
  pinMode(LED_BUILTIN, OUTPUT);
  Serial.begin(115200);

  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(1000);
    Serial.println("Connecting to WiFi..");
  }

  mac = WiFi.macAddress();
  Serial.println(WiFi.localIP());
  Serial.println(WiFi.macAddress());

  server.on("/check", HTTP_GET, [](AsyncWebServerRequest *request){
    request->send_P(200, "text/plain", mac.c_str());
  });
  server.on("/emissor", HTTP_POST, [](AsyncWebServerRequest *request) {
    int params = request->params();
    for(int i = 0; i < params; i++ ) {
      AsyncWebParameter* p = request->getParam(i);
      lenCommand = p->name();
      command = p->value();

      const uint8_t NEC_KHZ = 38;
      int length = atoi(lenCommand.c_str());

      std::istringstream ss(command.c_str());
      std::string token;

      uint16_t raw[length] = {};
      int f = 0;

      while(std::getline(ss, token, ',')) {
        raw[f] = atoi(token.c_str());
        f++;
      };

      IrSender.sendRaw(raw, length, NEC_KHZ);
      request->send_P(200, "text/plain", "Sucesso");
    }
  });

  DefaultHeaders::Instance().addHeader("Access-Control-Allow-Origin", "*");
  server.begin();
}

void loop() {}