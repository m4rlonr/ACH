#define MARK_EXCESS_MICROS    20 

#include <IRremote.h>

int IR_RECEIVE_PIN = 11;

void setup() {
    pinMode(LED_BUILTIN, OUTPUT);

    Serial.begin(115200);   
#if defined(__AVR_ATmega32U4__) || defined(SERIAL_USB) || defined(SERIAL_PORT_USBVIRTUAL)  || defined(ARDUINO_attiny3217)
    delay(2000);
#endif
    Serial.println(F("START " __FILE__ " from " __DATE__ "\r\nUsing library version " VERSION_IRREMOTE));

    IrReceiver.begin(IR_RECEIVE_PIN, ENABLE_LED_FEEDBACK);

    Serial.print(F("Ready to receive IR signals at pin "));
    Serial.println(IR_RECEIVE_PIN);
}

void loop() {
    if (IrReceiver.decode()) { 
        if (IrReceiver.results.overflow) {
            Serial.println("IR code too long. Edit IRremote.h and increase RAW_BUFFER_LENGTH");
        } else {
            Serial.println();                               
            IrReceiver.compensateAndPrintIRResultAsCArray(&Serial, true); 

        }
        IrReceiver.resume();
    }
}
