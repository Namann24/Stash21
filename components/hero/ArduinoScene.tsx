"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Float, Environment, RoundedBox, Cylinder, Sparkles, ContactShadows, Line } from "@react-three/drei";
import * as THREE from "three";

function TraceLines() {
  const lines = useMemo(() => {
    const arr = [];
    for (let i = 0; i < 14; i++) {
      arr.push({
        x: -1.5 + i * 0.23,
        z: (Math.random() - 0.5) * 1.6,
        len: 0.8 + Math.random() * 1.2,
        rot: Math.random() * Math.PI
      });
    }
    return arr;
  }, []);
  return (
    <>
      {lines.map((l, i) => (
        <mesh key={i} position={[l.x, 0.077, l.z]} rotation={[-Math.PI / 2, 0, l.rot]}>
          <planeGeometry args={[0.03, l.len]} />
          <meshStandardMaterial color="#FBE2C2" metalness={1} roughness={0.15} emissive="#C9A24B" emissiveIntensity={0.15} />
        </mesh>
      ))}
    </>
  );
}

function Chips() {
  const chips = useMemo(
    () =>
      Array.from({ length: 9 }).map(() => ({
        x: (Math.random() - 0.5) * 2.7,
        z: (Math.random() - 0.5) * 1.7,
        s: 0.12 + Math.random() * 0.18,
        h: 0.06 + Math.random() * 0.08
      })),
    []
  );
  return (
    <>
      {chips.map((c, i) => (
        <RoundedBox key={i} args={[c.s, c.h, c.s]} radius={0.015} position={[c.x, c.h / 2 + 0.08, c.z]}>
          <meshStandardMaterial color="#0d0d10" metalness={0.7} roughness={0.35} />
        </RoundedBox>
      ))}
    </>
  );
}

const EXPLODE_POINTS: [number, number, number][] = [
  [1.6, 0.9, 1.2],
  [-1.8, 1.1, -0.8],
  [1.8, -0.8, -1.4],
  [-1.6, -1.0, 1.3]
];

function ExplodeWires({ progress }: { progress: React.MutableRefObject<number> }) {
  const groupRef = useRef<THREE.Group>(null);
  const materials = useRef<THREE.MeshStandardMaterial[]>([]);

  useFrame(() => {
    const t = progress.current;
    const phase2 = THREE.MathUtils.clamp((t - 0.3) / 0.35, 0, 1);
    if (groupRef.current) {
      groupRef.current.visible = phase2 > 0.01;
      groupRef.current.children.forEach((child) => {
        child.scale.setScalar(phase2);
      });
    }
    materials.current.forEach((m) => {
      if (m) m.emissiveIntensity = 0.4 + phase2 * 1.4;
    });
  });

  return (
    <group ref={groupRef}>
      {EXPLODE_POINTS.map((pt, i) => (
        <group key={i} position={[pt[0] / 2, pt[1] / 2, pt[2] / 2]}>
          <Line
            points={[
              [0, 0, 0],
              [pt[0] / 2, pt[1] / 2, pt[2] / 2]
            ]}
            color={i % 2 === 0 ? "#00E5FF" : "#FFD600"}
            lineWidth={2.5}
            transparent
            opacity={0.9}
          />
          <mesh position={[pt[0] / 2, pt[1] / 2, pt[2] / 2]}>
            <sphereGeometry args={[0.04, 12, 12]} />
            <meshStandardMaterial
              ref={(el) => {
                if (el) materials.current[i] = el;
              }}
              color={i % 2 === 0 ? "#00E5FF" : "#FFD600"}
              emissive={i % 2 === 0 ? "#00E5FF" : "#FFD600"}
              emissiveIntensity={0.6}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function Board({ scrollProgress, mouse }: { scrollProgress: React.MutableRefObject<number>; mouse: React.MutableRefObject<{ x: number; y: number }> }) {
  const group = useRef<THREE.Group>(null);
  const led1 = useRef<THREE.Mesh>(null);
  const led2 = useRef<THREE.Mesh>(null);
  const ring = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const t = scrollProgress.current;
    const et = state.clock.elapsedTime;
    const phase1 = THREE.MathUtils.clamp(t / 0.3, 0, 1);
    const settleFactor = THREE.MathUtils.clamp((t - 0.65) / 0.35, 0, 1);

    if (group.current) {
      const baseRotY = 0.5 + phase1 * Math.PI * 1.2 + mouse.current.x * 0.4;
      const baseRotX = phase1 * 0.25 + mouse.current.y * 0.25;
      group.current.rotation.y = THREE.MathUtils.lerp(group.current.rotation.y, baseRotY, 0.08);
      group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, baseRotX, 0.08);
      group.current.rotation.z = Math.sin(t * Math.PI * 0.5) * 0.06;

      const zoom = phase1 * 0.8;
      group.current.position.z = THREE.MathUtils.lerp(group.current.position.z, zoom - settleFactor * 0.4, 0.06);
      group.current.position.y = -t * 0.9 + Math.sin(et * 0.6) * 0.04;
    }

    if (led1.current) {
      const pulse = 0.6 + Math.sin(et * 5) * 0.4;
      (led1.current.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.4 + pulse;
    }
    if (led2.current) {
      const pulse2 = 0.6 + Math.sin(et * 3.2 + 1) * 0.4;
      (led2.current.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.3 + pulse2;
    }
    if (ring.current) {
      ring.current.rotation.z = et * 0.6;
    }
  });

  return (
    <group ref={group}>
      <RoundedBox args={[3.3, 0.16, 2.1]} radius={0.07} smoothness={6} position={[0, 0, 0]} castShadow receiveShadow>
        <meshPhysicalMaterial color="#1A1A1F" metalness={0.4} roughness={0.4} clearcoat={0.7} clearcoatRoughness={0.25} />
      </RoundedBox>

      <RoundedBox args={[3.36, 0.02, 2.16]} radius={0.07} position={[0, -0.09, 0]}>
        <meshStandardMaterial color="#0B0B0E" metalness={0.2} roughness={0.8} />
      </RoundedBox>

      <TraceLines />
      <Chips />

      <RoundedBox args={[0.85, 0.13, 0.85]} radius={0.04} position={[0, 0.145, 0]} castShadow>
        <meshStandardMaterial color="#0a0a0d" metalness={0.75} roughness={0.25} />
      </RoundedBox>
      <mesh position={[0, 0.22, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.28, 0.32, 32]} />
        <meshStandardMaterial color="#C9A24B" metalness={1} roughness={0.1} emissive="#C9A24B" emissiveIntensity={0.3} />
      </mesh>

      {Array.from({ length: 12 }).map((_, i) => (
        <Cylinder key={`pin-top-${i}`} args={[0.018, 0.018, 0.14, 8]} position={[-1.45 + i * 0.26, 0.155, -1.05]} castShadow>
          <meshStandardMaterial color="#FBE2C2" metalness={1} roughness={0.12} />
        </Cylinder>
      ))}
      {Array.from({ length: 12 }).map((_, i) => (
        <Cylinder key={`pin-bot-${i}`} args={[0.018, 0.018, 0.14, 8]} position={[-1.45 + i * 0.26, 0.155, 1.05]} castShadow>
          <meshStandardMaterial color="#FBE2C2" metalness={1} roughness={0.12} />
        </Cylinder>
      ))}

      <mesh ref={ring} position={[0, 0.09, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.35, 0.008, 8, 64]} />
        <meshStandardMaterial color="#82553E" metalness={1} roughness={0.2} emissive="#B87333" emissiveIntensity={0.2} />
      </mesh>

      <mesh ref={led1} position={[1.25, 0.16, 0.75]}>
        <sphereGeometry args={[0.055, 16, 16]} />
        <meshStandardMaterial color="#FF3D71" emissive="#FF3D71" emissiveIntensity={0.6} />
      </mesh>
      <mesh ref={led2} position={[-1.25, 0.16, -0.75]}>
        <sphereGeometry args={[0.05, 16, 16]} />
        <meshStandardMaterial color="#00E5FF" emissive="#00E5FF" emissiveIntensity={0.5} />
      </mesh>

      <Cylinder args={[0.35, 0.35, 0.06, 32]} position={[-1.0, 0.11, 0.5]} castShadow>
        <meshStandardMaterial color="#111318" metalness={0.6} roughness={0.4} />
      </Cylinder>
    </group>
  );
}

function CameraRig({ scrollProgress }: { scrollProgress: React.MutableRefObject<number> }) {
  const { camera } = useThree();
  useFrame(() => {
    const t = scrollProgress.current;
    const targetZ = THREE.MathUtils.lerp(5.2, 3.6, THREE.MathUtils.clamp(t / 0.3, 0, 1));
    const settle = THREE.MathUtils.clamp((t - 0.65) / 0.35, 0, 1);
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, targetZ + settle * 1.2, 0.05);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, 0.7 - settle * 0.3, 0.05);
    camera.lookAt(0, 0, 0);
  });
  return null;
}

export default function ArduinoScene({ scrollProgress }: { scrollProgress: React.MutableRefObject<number> }) {
  const mouse = useRef({ x: 0, y: 0 });

  const handlePointerMove = (e: React.PointerEvent) => {
    const x = (e.clientX / window.innerWidth) * 2 - 1;
    const y = (e.clientY / window.innerHeight) * 2 - 1;
    mouse.current = { x, y };
  };

  return (
    <div onPointerMove={handlePointerMove} className="w-full h-full">
      <Canvas
        camera={{ position: [0, 0.7, 5.2], fov: 45 }}
        dpr={[1, 1.5]}
        shadows
        gl={{ antialias: true, alpha: true }}
        style={{ width: "100%", height: "100%" }}
      >
        <ambientLight intensity={0.35} />
        <fog attach="fog" args={["#0A0908", 4, 12]} />
        <directionalLight position={[4, 5, 3]} intensity={1.6} color="#FBE2C2" castShadow />
        <pointLight position={[-3, -2, -2]} intensity={1} color="#B87333" />
        <pointLight position={[2, -1, 2]} intensity={0.6} color="#5A1220" />
        <pointLight position={[0, 1, -4]} intensity={0.7} color="#8B6FE8" />
        <spotLight position={[0, 4, 0]} angle={0.4} penumbra={1} intensity={0.8} color="#C9A24B" />
        <Environment preset="city" resolution={128} />
        <Sparkles count={22} scale={[7, 5, 5]} size={1.6} speed={0.3} color="#FBE2C2" opacity={0.45} />

        <Float speed={1.3} rotationIntensity={0.2} floatIntensity={0.45}>
          <Board scrollProgress={scrollProgress} mouse={mouse} />
          <ExplodeWires progress={scrollProgress} />
        </Float>

        <CameraRig scrollProgress={scrollProgress} />
        <ContactShadows position={[0, -0.9, 0]} opacity={0.4} scale={8} blur={2.5} far={2} color="#000000" />
      </Canvas>
    </div>
  );
}
