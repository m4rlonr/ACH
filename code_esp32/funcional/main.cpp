// Onde conectar o lino do led
// An IR LED must be connected to Arduino PWM pin 3.
// On esp pin 4
// Mudar o pino no arquivo IRTimer.cpp linha 806
#include "WiFi.h"               // Biblioteca Wifi
#include "ESPAsyncWebServer.h"  // Biblioteca WebServer
#include <IRremote.h>           // Biblioteca Infravermelho
#include <iostream>             // Manipulação de dados
#include <sstream>              // Manipulação de dados
#include <MFRC522.h>            // RFID
#include <SPI.h>                //RFID

#define SS_PIN    21            // Pino RFID
#define RST_PIN   22            // Pino RFID

#define SIZE_BUFFER     18      // Dados RFID
#define MAX_SIZE_BLOCK  16      // Dados RFID

// Credenciais para acesso a rede wifi
const char* ssid = "irwin";
const char* password = "irwintrena5m";

AsyncWebServer server(80);
String command;
String lenCommand;
String mac;
String presence = "false";

MFRC522 mfrc522(SS_PIN, RST_PIN);     // Definicoes pino modulo RC522

void setup() {
  pinMode(LED_BUILTIN, OUTPUT);
  Serial.begin(115200);

  mfrc522.PCD_Init(); // Inicia MFRC522

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
  server.on("/presence", HTTP_GET, [](AsyncWebServerRequest *request){
    request->send_P(200, "text/plain", presence.c_str());
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

      Serial.println("emitindo");
      IrSender.sendRaw(raw, length, NEC_KHZ);
      request->send_P(200, "text/plain", "Sucesso");
    }
  });

  DefaultHeaders::Instance().addHeader("Access-Control-Allow-Origin", "*");
  server.begin();
}

void loop() {
  // IMPORTANTE NÃO TER DELAY
  if (mfrc522.PICC_IsNewCardPresent()) {
    presence = "true";
  } else {
    presence = "false";
  }
}