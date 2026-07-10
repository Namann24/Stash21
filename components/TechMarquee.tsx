const ITEMS = [
  "ESP32", "RP2040", "LoRa", "MQTT", "KiCad", "STM32", "FreeRTOS", "Zigbee",
  "I2C", "SPI", "Matter", "Raspberry Pi"
];

export default function TechMarquee() {
  const items = [...ITEMS, ...ITEMS];
  return (
    <div className="relative overflow-hidden py-6 border-y border-copper/15 bg-black/20 crt-overlay">
      {/* Fade masks on edges */}
      <div className="absolute left-0 top-0 bottom-0 w-24 z-10 bg-gradient-to-r from-ink to-transparent pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-24 z-10 bg-gradient-to-l from-ink to-transparent pointer-events-none" />
      <div className="marquee-track">
        {items.map((item, i) => (
          <div key={i} className="flex items-center gap-3 px-8 shrink-0 group">
            <span className="w-1.5 h-1.5 rounded-full bg-brass chip-glow group-hover:bg-circuit group-hover:shadow-[0_0_12px_rgba(77,216,232,0.5)] transition-all duration-300" />
            <span className="font-mono text-sm tracking-[0.2em] text-steel uppercase whitespace-nowrap group-hover:text-brass-light transition-colors duration-300">{item}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
