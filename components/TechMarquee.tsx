const ITEMS = [
  "ESP32", "RP2040", "LoRa", "MQTT", "KiCad", "STM32", "FreeRTOS", "Zigbee",
  "I2C", "SPI", "Matter", "Raspberry Pi"
];

export default function TechMarquee() {
  const items = [...ITEMS, ...ITEMS];
  return (
    <div className="relative overflow-hidden py-6 border-y border-copper/15 bg-black/20">
      <div className="marquee-track">
        {items.map((item, i) => (
          <div key={i} className="flex items-center gap-3 px-8 shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-brass chip-glow" />
            <span className="font-mono text-sm tracking-[0.2em] text-steel uppercase whitespace-nowrap">{item}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
