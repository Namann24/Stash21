import type { Post } from "./types";

export const SAMPLE_POSTS: Post[] = [
  {
    id: "sample-1",
    title: "Building a Solar-Powered ESP32 Weather Station",
    slug: "solar-esp32-weather-station",
    content: `# Building a Solar-Powered ESP32 Weather Station

This build combines an **ESP32-S3**, a BME280 sensor, and a small 6V solar panel with a TP4056 charge controller to create a fully off-grid weather station that reports to a home dashboard over WiFi.

## Parts List

- ESP32-S3 DevKit
- BME280 temperature/humidity/pressure sensor
- 6V 1W solar panel
- TP4056 LiPo charge controller
- 18650 LiPo cell
- Weatherproof enclosure (IP65)

## Power Budget

The ESP32 spends most of its life in deep sleep, waking every 10 minutes to take a reading and publish over MQTT. This gets average current draw down to about 0.8mA, which the solar panel can easily sustain even on cloudy days.

\`\`\`cpp
esp_sleep_enable_timer_wakeup(600 * 1000000);
esp_deep_sleep_start();
\`\`\`

## Enclosure Notes

Ventilation matters more than you'd think — the BME280 needs airflow to read humidity accurately, so a Stevenson screen style louvered enclosure works far better than a sealed box.

## Results

After three weeks outdoors through rain and full sun, the battery has never dropped below 70%. Next step: adding a rain gauge and wind vane input.`,
    cover_image: "/covers/solar-esp32.jpg",
    category: "Projects",
    tags: ["esp32", "solar", "mqtt", "sensors"],
    author_id: "system",
    created_at: "2026-06-18T10:00:00Z",
    updated_at: "2026-06-18T10:00:00Z",
    published: true,
    views: 1240,
    reactions: 85,
    commentsCount: 12
  },
  {
    id: "sample-2",
    title: "MQTT vs LoRa: Choosing the Right Protocol for Your IoT Build",
    slug: "mqtt-vs-lora-iot-protocol",
    content: `# MQTT vs LoRa: Choosing the Right Protocol

Picking a communication protocol early saves you a full rebuild later. Here's how the two most common approaches for hobbyist IoT actually compare in practice.

## Range and Power

LoRa wins decisively on range — 2 to 10km line-of-sight versus WiFi's typical 30-50m indoors. But that range comes at the cost of bandwidth: LoRa tops out around 50kbps, fine for sensor readings but not for anything media-heavy.

## When to Use MQTT (over WiFi)

- You already have WiFi coverage where the device lives
- You need frequent updates (sub-second)
- You want easy integration with Home Assistant or Node-RED

## When to Use LoRa

- Devices are spread across a property with no WiFi
- Battery life is critical (LoRa radios sip power)
- You're fine with occasional, small payloads

## A Hybrid Approach

Most of our recent builds actually use both: LoRa nodes report to a central ESP32 "gateway" that then republishes to MQTT over WiFi, giving the best of both — long range at the edge, rich integration at the hub.`,
    cover_image: "/covers/mqtt-lora.jpg",
    category: "IoT Networking",
    tags: ["mqtt", "lora", "protocols", "networking"],
    author_id: "system",
    created_at: "2026-06-10T14:30:00Z",
    updated_at: "2026-06-10T14:30:00Z",
    published: true,
    views: 4321,
    reactions: 142,
    commentsCount: 38
  },
  {
    id: "sample-3",
    title: "Reverse-Engineering a Cheap Smart Plug's Firmware",
    slug: "reverse-engineering-smart-plug-firmware",
    content: `# Reverse-Engineering a Cheap Smart Plug

Most budget smart plugs run a Tuya-based module underneath the branding. Here's how we pulled the firmware off one and flashed it with open-source Tasmota instead.

## Step 1: Identify the Chip

Opening the case revealed a BK7231N chip — common in Tuya-based devices and well supported by the open-source flashing community.

## Step 2: Find the UART Pins

Four unpopulated through-holes on the PCB turned out to be TX, RX, GND, and 3.3V. A multimeter in continuity mode against the chip's datasheet pinout confirmed which was which.

## Step 3: Flash Tasmota

\`\`\`
python3 -m tuya-cloudcutter --port /dev/ttyUSB0 --firmware tasmota-bk7231n.bin
\`\`\`

## Why Bother?

Once flashed, the plug talks MQTT locally with zero cloud dependency — no more relying on a manufacturer's server staying online, and full local control even if your internet goes down.

## Caution

This voids your warranty and briefly exposes the device to bricking risk. Always keep a backup of the stock firmware before flashing.`,
    cover_image: "/covers/smart-plug.jpg",
    category: "Hardware Builds",
    tags: ["reverse-engineering", "tasmota", "firmware", "smart-home"],
    author_id: "system",
    created_at: "2026-05-28T09:15:00Z",
    updated_at: "2026-05-28T09:15:00Z",
    published: true,
    views: 3105,
    reactions: 98,
    commentsCount: 24
  }
];
