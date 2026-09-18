import React, { useRef, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, OrbitControls } from "@react-three/drei";
import * as THREE from "three";

// Stylized athletic human figure with dark navy silhouette and orange rim lighting
const AthleticFigure = () => {
  const groupRef = useRef();
  const [pulse, setPulse] = useState(0);

  // Subtle natural athletic breathing & float motion
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(t * 0.4) * 0.15;
      groupRef.current.position.y = Math.sin(t * 0.8) * 0.05;
    }
    setPulse((Math.sin(t * 3) + 1) / 2);
  });

  // Dark navy athletic surface material with specular orange highlights
  const bodyMaterial = new THREE.MeshStandardMaterial({
    color: new THREE.Color("#172033"),
    metalness: 0.8,
    roughness: 0.25,
  });

  // Orange tracking joint material
  const jointMaterial = new THREE.MeshBasicMaterial({
    color: new THREE.Color("#F97316"),
  });

  const glowingJointMaterial = new THREE.MeshBasicMaterial({
    color: new THREE.Color("#FB923C"),
  });

  // Joint landmark coordinates for dynamic athletic posture
  const joints = {
    head: [0, 1.85, 0],
    neck: [0, 1.5, 0],
    leftShoulder: [-0.45, 1.35, 0],
    rightShoulder: [0.45, 1.35, 0],
    leftElbow: [-0.75, 0.95, 0.2],
    rightElbow: [0.75, 1.05, -0.1],
    leftWrist: [-0.65, 0.55, 0.4],
    rightWrist: [0.65, 0.7, -0.3],
    spine: [0, 1.0, 0],
    pelvis: [0, 0.65, 0],
    leftHip: [-0.25, 0.65, 0],
    rightHip: [0.25, 0.65, 0],
    leftKnee: [-0.35, 0.05, 0.3],
    rightKnee: [0.35, 0.05, -0.2],
    leftAnkle: [-0.35, -0.65, 0.1],
    rightAnkle: [0.35, -0.65, -0.35],
  };

  // Connected skeleton lines
  const skeletonConnections = [
    // Upper body
    [joints.leftWrist, joints.leftElbow],
    [joints.leftElbow, joints.leftShoulder],
    [joints.leftShoulder, joints.neck],
    [joints.neck, joints.rightShoulder],
    [joints.rightShoulder, joints.rightElbow],
    [joints.rightElbow, joints.rightWrist],
    [joints.head, joints.neck],
    [joints.neck, joints.spine],
    [joints.spine, joints.pelvis],
    // Lower body
    [joints.pelvis, joints.leftHip],
    [joints.leftHip, joints.leftKnee],
    [joints.leftKnee, joints.leftAnkle],
    [joints.pelvis, joints.rightHip],
    [joints.rightHip, joints.rightKnee],
    [joints.rightKnee, joints.rightAnkle],
    // Cross kinetic link
    [joints.leftShoulder, joints.pelvis],
    [joints.rightShoulder, joints.pelvis],
  ];

  return (
    <group ref={groupRef} position={[0, -0.4, 0]}>
      {/* --- Human Geometry (Stylized Athletic Silhouette) --- */}
      {/* Head */}
      <mesh position={joints.head} material={bodyMaterial}>
        <sphereGeometry args={[0.18, 24, 24]} />
      </mesh>

      {/* Torso / Ribcage */}
      <mesh position={[0, 1.15, 0]} material={bodyMaterial}>
        <boxGeometry args={[0.55, 0.6, 0.28]} />
      </mesh>

      {/* Pelvis */}
      <mesh position={[0, 0.65, 0]} material={bodyMaterial}>
        <boxGeometry args={[0.45, 0.25, 0.25]} />
      </mesh>

      {/* Left Upper Arm */}
      <mesh position={[-0.6, 1.15, 0.1]} material={bodyMaterial} rotation={[0.2, 0, 0.5]}>
        <cylinderGeometry args={[0.07, 0.06, 0.5, 16]} />
      </mesh>
      {/* Left Forearm */}
      <mesh position={[-0.7, 0.75, 0.3]} material={bodyMaterial} rotation={[-0.3, 0, 0.2]}>
        <cylinderGeometry args={[0.06, 0.05, 0.5, 16]} />
      </mesh>

      {/* Right Upper Arm */}
      <mesh position={[0.6, 1.2, -0.05]} material={bodyMaterial} rotation={[-0.2, 0, -0.5]}>
        <cylinderGeometry args={[0.07, 0.06, 0.5, 16]} />
      </mesh>
      {/* Right Forearm */}
      <mesh position={[0.7, 0.88, -0.2]} material={bodyMaterial} rotation={[0.3, 0, -0.2]}>
        <cylinderGeometry args={[0.06, 0.05, 0.5, 16]} />
      </mesh>

      {/* Left Thigh */}
      <mesh position={[-0.3, 0.35, 0.15]} material={bodyMaterial} rotation={[-0.3, 0, 0.1]}>
        <cylinderGeometry args={[0.1, 0.08, 0.6, 16]} />
      </mesh>
      {/* Left Shin */}
      <mesh position={[-0.35, -0.3, 0.2]} material={bodyMaterial} rotation={[0.2, 0, 0]}>
        <cylinderGeometry args={[0.08, 0.06, 0.65, 16]} />
      </mesh>

      {/* Right Thigh */}
      <mesh position={[0.3, 0.35, -0.1]} material={bodyMaterial} rotation={[0.3, 0, -0.1]}>
        <cylinderGeometry args={[0.1, 0.08, 0.6, 16]} />
      </mesh>
      {/* Right Shin */}
      <mesh position={[0.35, -0.3, -0.28]} material={bodyMaterial} rotation={[-0.2, 0, 0]}>
        <cylinderGeometry args={[0.08, 0.06, 0.65, 16]} />
      </mesh>

      {/* --- AI Tracking Joints (Shoulder, Elbow, Wrist, Hip, Knee, Ankle) --- */}
      {Object.entries(joints).map(([key, pos]) => {
        const isKeyJoint = [
          "leftShoulder",
          "rightShoulder",
          "leftElbow",
          "rightElbow",
          "leftWrist",
          "rightWrist",
          "leftHip",
          "rightHip",
          "leftKnee",
          "rightKnee",
          "leftAnkle",
          "rightAnkle",
        ].includes(key);

        if (!isKeyJoint) return null;

        return (
          <group key={key} position={pos}>
            {/* Solid joint node */}
            <mesh material={jointMaterial}>
              <sphereGeometry args={[0.045, 16, 16]} />
            </mesh>
            {/* Pulsing sensor ring */}
            <mesh material={glowingJointMaterial}>
              <ringGeometry args={[0.06, 0.08, 16]} />
            </mesh>
          </group>
        );
      })}

      {/* --- Connecting AI Sensor Lines --- */}
      {skeletonConnections.map((pair, idx) => {
        const points = [new THREE.Vector3(...pair[0]), new THREE.Vector3(...pair[1])];
        const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
        return (
          <primitive
            key={idx}
            object={
              new THREE.Line(
                lineGeo,
                new THREE.LineBasicMaterial({
                  color: "#F97316",
                  transparent: true,
                  opacity: 0.65,
                  linewidth: 1.5,
                })
              )
            }
          />
        );
      })}

      {/* Subtle floor motion grid */}
      <gridHelper
        args={[3, 10, "#F97316", "#1F2937"]}
        position={[0, -0.7, 0]}
      />
    </group>
  );
};

// Graceful fallback if WebGL context is disabled or loading
const FallbackHero = () => (
  <div className="relative w-full h-full flex items-center justify-center">
    <div className="w-56 h-72 rounded-3xl bg-navy-800/80 border border-brand-orange/30 p-6 flex flex-col items-center justify-center relative overflow-hidden shadow-orange-glow">
      <div className="absolute inset-0 bg-gradient-to-b from-brand-orange/10 via-transparent to-navy-950 pointer-events-none" />
      {/* Stylized SVG Athlete Silhouette */}
      <svg
        viewBox="0 0 100 140"
        className="w-40 h-56 text-brand-orange drop-shadow-md"
        fill="none"
        stroke="currentColor"
      >
        <circle cx="50" cy="20" r="10" strokeWidth="2.5" className="text-textPrimary" fill="#172033" />
        <line x1="50" y1="30" x2="50" y2="70" strokeWidth="3" className="text-textSecondary" />
        {/* Arms */}
        <line x1="50" y1="40" x2="28" y2="55" strokeWidth="2.5" stroke="#F97316" />
        <line x1="28" y1="55" x2="20" y2="40" strokeWidth="2.5" stroke="#FB923C" />
        <line x1="50" y1="40" x2="72" y2="55" strokeWidth="2.5" stroke="#F97316" />
        <line x1="72" y1="55" x2="80" y2="70" strokeWidth="2.5" stroke="#FB923C" />
        {/* Legs */}
        <line x1="50" y1="70" x2="35" y2="95" strokeWidth="2.5" stroke="#F97316" />
        <line x1="35" y1="95" x2="32" y2="125" strokeWidth="2.5" stroke="#FB923C" />
        <line x1="50" y1="70" x2="65" y2="95" strokeWidth="2.5" stroke="#F97316" />
        <line x1="65" y1="95" x2="68" y2="125" strokeWidth="2.5" stroke="#FB923C" />
        {/* Joint landmarks */}
        <circle cx="28" cy="55" r="3.5" fill="#F97316" />
        <circle cx="20" cy="40" r="3.5" fill="#FB923C" />
        <circle cx="72" cy="55" r="3.5" fill="#F97316" />
        <circle cx="80" cy="70" r="3.5" fill="#FB923C" />
        <circle cx="35" cy="95" r="3.5" fill="#F97316" />
        <circle cx="65" cy="95" r="3.5" fill="#F97316" />
      </svg>
      <span className="text-[11px] font-mono tracking-widest text-brand-soft uppercase mt-2">
        AI MOTION SCANNING
      </span>
    </div>
  </div>
);

export const Hero3DScene = () => {
  const [hasWebGL, setHasWebGL] = useState(true);

  useEffect(() => {
    try {
      const canvas = document.createElement("canvas");
      const gl =
        canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
      if (!gl) setHasWebGL(false);
    } catch {
      setHasWebGL(false);
    }
  }, []);

  if (!hasWebGL) {
    return <FallbackHero />;
  }

  return (
    <div className="w-full h-[360px] sm:h-[420px] lg:h-[460px] relative select-none">
      {/* Subtle radial orange glow behind the 3D figure */}
      <div className="absolute inset-0 bg-radial from-brand-orange/15 via-transparent to-transparent pointer-events-none rounded-full blur-2xl transform scale-90" />

      <Canvas
        camera={{ position: [0, 0.4, 3.2], fov: 42 }}
        className="w-full h-full cursor-grab active:cursor-grabbing"
      >
        <ambientLight intensity={0.65} />
        {/* Directional key light with cool tone */}
        <directionalLight position={[3, 5, 4]} intensity={1.2} color="#E2E8F0" />
        {/* Orange rim / edge highlight light from behind */}
        <directionalLight position={[-3, 2, -3]} intensity={2.4} color="#F97316" />
        <pointLight position={[0, 1.5, 1]} intensity={0.8} color="#FB923C" />

        <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.3}>
          <AthleticFigure />
        </Float>

        <OrbitControls
          enableZoom={false}
          enablePan={false}
          maxPolarAngle={Math.PI / 2 + 0.1}
          minPolarAngle={Math.PI / 2 - 0.4}
        />
      </Canvas>

      {/* Floating Joint Overlay Badges */}
      <div className="absolute top-4 right-4 bg-navy-900/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 text-[11px] font-mono text-textSecondary flex items-center gap-2 pointer-events-none shadow-sm">
        <span className="w-2 h-2 rounded-full bg-brand-orange animate-ping" />
        <span>33 KINEMATIC NODES</span>
      </div>

      <div className="absolute bottom-4 left-4 bg-navy-900/80 backdrop-blur-md px-3 py-1 rounded-lg border border-white/10 text-[10px] font-mono text-textMuted flex items-center gap-1.5 pointer-events-none">
        <span className="text-brand-orange">●</span>
        <span>DRAG TO ROTATE 3D POSE</span>
      </div>
    </div>
  );
};

export default Hero3DScene;
