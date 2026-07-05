import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE_KEY as string
);

const NEW_POSTS = [
  {
    title: "Building the Ultimate Cyberpunk Smart Home Dashboard",
    slug: "cyberpunk-smart-home-dashboard",
    category: "Projects",
    cover_image: "/images/dashboard.png",
    tags: ["react", "iot", "dashboard", "mqtt"],
    published: true,
    content: `
Building a custom dashboard for your smart home is a rite of passage for any maker. Instead of relying on off-the-shelf apps, I decided to build a cyberpunk-themed React interface running on a wall-mounted iPad.

## The Architecture

The system uses **MQTT** to communicate with all the local devices, bridging the gap between Node-RED and a Next.js frontend. 

### Tech Stack
- Next.js (React)
- TailwindCSS for styling
- MQTT.js for live sensor data
- Framer Motion for sleek animations

## Code Example

Here's how I established a reliable MQTT connection in a React hook to stream the live security camera and temperature feeds:

\`\`\`typescript
import mqtt from "mqtt";
import { useEffect, useState } from "react";

export function useMqtt(topic: string) {
  const [payload, setPayload] = useState<string>("");

  useEffect(() => {
    const client = mqtt.connect("ws://home-broker:9001");
    
    client.on("connect", () => {
      client.subscribe(topic);
    });

    client.on("message", (t, message) => {
      if (t === topic) setPayload(message.toString());
    });

    return () => {
      client.end();
    };
  }, [topic]);

  return payload;
}
\`\`\`

## Result

The resulting dashboard looks incredible. The dark mode combined with high-contrast neon accents makes the tablet look like a prop from Blade Runner. 

Have you built your own dashboard? Share your tech stack in the comments!
    `.trim()
  },
  {
    title: "Overclocking a Custom Raspberry Pi Cluster",
    slug: "raspberry-pi-cluster-overclock",
    category: "Hardware Builds",
    cover_image: "/images/pi.png",
    tags: ["raspberry-pi", "linux", "cluster", "k3s"],
    published: true,
    content: `
Why run one Raspberry Pi when you can run a cluster of them? I recently built a 4-node Raspberry Pi 4 cluster to run some localized machine learning models and host a K3s Kubernetes cluster.

## Power Delivery

The biggest challenge wasn't the software—it was the power delivery and heat dissipation. A standard USB hub won't cut it. 

### The Solution
I wired a 5V 20A industrial power supply directly to the GPIO pins of each Pi, completely bypassing the USB-C limitations. 

## Overclocking the Nodes

With custom aluminum heatsinks and dual 120mm Noctua fans blasting the cluster, I was able to safely overclock the CPU.

\`\`\`bash
# Edit /boot/config.txt
over_voltage=6
arm_freq=2000
gpu_freq=750
\`\`\`

## Benchmarks

The resulting compute power is surprisingly capable for edge AI tasks. Running distributed object detection algorithms across the cluster yielded a 40% performance increase over a single node. The entire rig consumes less than 30W under full load!
    `.trim()
  },
  {
    title: "Designing a Brass & Acrylic Mechanical Keyboard",
    slug: "custom-brass-mechanical-keyboard",
    category: "Hardware Builds",
    cover_image: "/images/keyboard.png",
    tags: ["keyboard", "soldering", "pcb", "qmk"],
    published: true,
    content: `
I've finally finished my dream mechanical keyboard build. I designed the PCB from scratch in KiCad, laser cut the acrylic layers, and machined a solid brass weight for the base.

## The Specs

- **Switches:** Lubed and filmed Gateron Black Inks
- **MCU:** Elite-C (ATmega32U4)
- **Firmware:** QMK (Custom keymap)
- **Case:** Stacked frosted acrylic with a 2kg brass base

## The Build Process

Soldering 65 diodes and hot-swap sockets by hand took hours, but the result is a perfectly tuned board. The acoustic profile of the brass weight mixed with the acrylic case creates a deep, satisfying "thock" sound.

### QMK Configuration

Here is a snippet of my custom \`keymap.c\` focusing on the specialized macro layer I use for CAD software:

\`\`\`c
bool process_record_user(uint16_t keycode, keyrecord_t *record) {
  switch (keycode) {
    case MACRO_1:
      if (record->event.pressed) {
        // Send Ctrl + Shift + E for easy export
        SEND_STRING(SS_LCTL(SS_LSFT("e")));
      }
      return false;
    default:
      return true; 
  }
}
\`\`\`

This keyboard weighs nearly 8 pounds, meaning it absolutely will not slide on the desk. 
    `.trim()
  }
];

async function seed2() {
  console.log("Seeding 3 new posts...");
  for (const post of NEW_POSTS) {
    const { error } = await supabase.from("posts").upsert({
      title: post.title,
      slug: post.slug,
      content: post.content,
      cover_image: post.cover_image,
      category: post.category,
      tags: post.tags,
      published: post.published,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }, { onConflict: "slug" });
    
    if (error) {
      console.error("Error inserting:", post.title, error);
    } else {
      console.log("Inserted:", post.title);
    }
  }
}

seed2();
