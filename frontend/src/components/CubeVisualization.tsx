import React, { memo, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import * as THREE from "three";
import type { AssistantState } from "@/types";

// Design Palette Constants
const CYAN = "#22D3EE";
const CYAN_GLOW = "#67E8F9";
const CYAN_DIM = "#0891B2";
const NAVY_GLASS = "rgba(6, 11, 26, 0.75)";
const NAVY_STROKE = "rgba(34, 211, 238, 0.35)";

const CX = 200;
const CY = 200;

// Reusable static geometries to eliminate GPU memory churn across renders
const INNER_BOX = new THREE.BoxGeometry(1.15, 1.15, 1.15);
const OUTER_BOX = new THREE.BoxGeometry(2, 2, 2);

function polar(r: number, deg: number): [number, number] {
  const a = (deg * Math.PI) / 180;
  return [CX + r * Math.cos(a), CY + r * Math.sin(a)];
}

function arcSegment(rIn: number, rOut: number, startDeg: number, endDeg: number): string {
  const [x1o, y1o] = polar(rOut, startDeg);
  const [x2o, y2o] = polar(rOut, endDeg);
  const [x1i, y1i] = polar(rIn, endDeg);
  const [x2i, y2i] = polar(rIn, startDeg);
  const large = endDeg - startDeg > 180 ? 1 : 0;
  return `M ${x1o} ${y1o} A ${rOut} ${rOut} 0 ${large} 1 ${x2o} ${y2o} L ${x1i} ${y1i} A ${rIn} ${rIn} 0 ${large} 0 ${x2i} ${y2i} Z`;
}

function donutPath(rIn: number, rOut: number): string {
  return (
    `M ${CX + rOut} ${CY} A ${rOut} ${rOut} 0 1 0 ${CX - rOut} ${CY} A ${rOut} ${rOut} 0 1 0 ${CX + rOut} ${CY} Z ` +
    `M ${CX + rIn} ${CY} A ${rIn} ${rIn} 0 1 1 ${CX - rIn} ${CY} A ${rIn} ${rIn} 0 1 1 ${CX + rIn} ${CY} Z`
  );
}

function Spinner({
  duration,
  reverse = false,
  children,
}: {
  duration: number;
  reverse?: boolean;
  children: React.ReactNode;
}) {
  return (
    <g>
      {children}
      <animateTransform
        attributeName="transform"
        type="rotate"
        from={`0 ${CX} ${CY}`}
        to={`${reverse ? -360 : 360} ${CX} ${CY}`}
        dur={`${duration}s`}
        repeatCount="indefinite"
      />
    </g>
  );
}

function ArcSegments({
  count,
  rIn,
  rOut,
  arcDeg,
  gapDeg,
  fill,
  phase = 0,
}: {
  count: number;
  rIn: number;
  rOut: number;
  arcDeg: number;
  gapDeg: number;
  fill: string;
  phase?: number;
}) {
  const step = arcDeg + gapDeg;
  return (
    <g fill={fill}>
      {Array.from({ length: count }, (_, i) => {
        const start = i * step + phase;
        return <path key={i} d={arcSegment(rIn, rOut, start, start + arcDeg)} />;
      })}
    </g>
  );
}

function DotsRing({
  count,
  r,
  dotR,
  fill,
  opacity = 1,
}: {
  count: number;
  r: number;
  dotR: number;
  fill: string;
  opacity?: number;
}) {
  return (
    <g fill={fill} opacity={opacity}>
      {Array.from({ length: count }, (_, i) => {
        const [x, y] = polar(r, (i / count) * 360);
        return <circle key={i} cx={x} cy={y} r={dotR} />;
      })}
    </g>
  );
}

function BarcodeTicks({ angle }: { angle: number }) {
  const offsets = [-14, -10, -6, -2, 2, 6, 10, 14];
  return (
    <g transform={`rotate(${angle} ${CX} ${CY})`} fill={CYAN}>
      {offsets.map((o) => (
        <rect key={o} x={CX + o - 0.5} y={5} width={1} height={11} opacity={0.85} />
      ))}
    </g>
  );
}

function CardinalArrow({ angle }: { angle: number }) {
  return (
    <g transform={`rotate(${angle} ${CX} ${CY})`}>
      <polygon points={`${CX - 5},22 ${CX + 5},22 ${CX},32`} fill={CYAN_GLOW} />
    </g>
  );
}

function HUDRings() {
  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      viewBox="0 0 400 400"
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <radialGradient id="rimGlow" cx="50%" cy="50%" r="50%">
          <stop offset="70%" stopColor="rgba(34,211,238,0)" />
          <stop offset="100%" stopColor="rgba(34,211,238,0.22)" />
        </radialGradient>
      </defs>

      <g className="hud-ring-spawn" style={{ animationDelay: "0.85s" }}>
        <Spinner duration={55} reverse>
          <circle cx={CX} cy={CY} r={198} fill="url(#rimGlow)" />
          <path
            d={donutPath(168, 190)}
            fill={NAVY_GLASS}
            fillRule="evenodd"
            stroke={NAVY_STROKE}
            strokeWidth={0.5}
          />
          <circle
            cx={CX}
            cy={CY}
            r={179}
            fill="none"
            stroke={CYAN}
            strokeWidth={22}
            opacity={0}
            className="shell-flash-halo"
          />
          <circle
            cx={CX}
            cy={CY}
            r={179}
            fill="none"
            stroke={CYAN_GLOW}
            strokeWidth={4}
            opacity={0}
            className="shell-flash-core"
          />
          <BarcodeTicks angle={0} />
          <BarcodeTicks angle={90} />
          <BarcodeTicks angle={180} />
          <BarcodeTicks angle={270} />
          <CardinalArrow angle={0} />
          <CardinalArrow angle={90} />
          <CardinalArrow angle={180} />
          <CardinalArrow angle={270} />
        </Spinner>
      </g>

      <g className="hud-ring-spawn" style={{ animationDelay: "0.65s" }}>
        <Spinner duration={22}>
          <ArcSegments
            count={4}
            rIn={148}
            rOut={165}
            arcDeg={62}
            gapDeg={28}
            fill="rgba(34,211,238,0.85)"
          />
        </Spinner>
      </g>

      <g className="hud-ring-spawn" style={{ animationDelay: "0.5s" }}>
        <Spinner duration={16}>
          <DotsRing count={72} r={132} dotR={2} fill="#E0F2FE" opacity={0.95} />
        </Spinner>
      </g>

      <g className="hud-ring-spawn" style={{ animationDelay: "0.35s" }}>
        <Spinner duration={26} reverse>
          <ArcSegments
            count={4}
            rIn={102}
            rOut={118}
            arcDeg={55}
            gapDeg={35}
            fill="rgba(34,211,238,0.85)"
            phase={22}
          />
        </Spinner>
      </g>

      <g className="hud-ring-spawn" style={{ animationDelay: "0.2s" }}>
        <Spinner duration={11} reverse>
          <DotsRing count={54} r={88} dotR={1.6} fill="#67E8F9" opacity={0.9} />
        </Spinner>
      </g>

      <g className="hud-ring-spawn" style={{ animationDelay: "0s" }}>
        <Spinner duration={7} reverse>
          <ArcSegments
            count={2}
            rIn={72}
            rOut={78}
            arcDeg={40}
            gapDeg={140}
            fill="rgba(103,232,249,0.75)"
          />
        </Spinner>
      </g>
    </svg>
  );
}

const CORNERS: [number, number, number][] = [
  [1, 1, 1], [-1, 1, 1], [1, -1, 1], [1, 1, -1],
  [-1, -1, 1], [-1, 1, -1], [1, -1, -1], [-1, -1, -1],
];

function CornerDots() {
  return (
    <>
      {CORNERS.map((c, i) => (
        <mesh key={i} position={c}>
          <sphereGeometry args={[0.055, 16, 16]} />
          <meshBasicMaterial color={CYAN_GLOW} toneMapped={false} />
        </mesh>
      ))}
    </>
  );
}

function InnerCube({ speedMultiplier = 1.0 }: { speedMultiplier?: number }) {
  const ref = useRef<THREE.Group>(null!);
  useFrame((_, delta) => {
    ref.current.rotation.y -= delta * 0.45 * speedMultiplier;
    ref.current.rotation.z += delta * 0.20 * speedMultiplier;
  });
  return (
    <group ref={ref}>
      <mesh>
        <boxGeometry args={[1.15, 1.15, 1.15]} />
        <meshStandardMaterial
          color={CYAN}
          metalness={0.6}
          roughness={0.35}
          transparent
          opacity={0.16}
        />
      </mesh>
      <lineSegments>
        <edgesGeometry args={[INNER_BOX]} />
        <lineBasicMaterial color={CYAN_GLOW} transparent opacity={0.8} toneMapped={false} />
      </lineSegments>
    </group>
  );
}

const FACE_LABELS: {
  pos: [number, number, number];
  rot: [number, number, number];
  label: string;
}[] = [
  { pos: [0, 0, 1.005], rot: [0, 0, 0], label: "SG" },
  { pos: [0, 0, -1.005], rot: [0, Math.PI, 0], label: "CUBE" },
  { pos: [1.005, 0, 0], rot: [0, Math.PI / 2, 0], label: "SG" },
  { pos: [-1.005, 0, 0], rot: [0, -Math.PI / 2, 0], label: "CUBE" },
  { pos: [0, 1.005, 0], rot: [-Math.PI / 2, 0, 0], label: "SG" },
  { pos: [0, -1.005, 0], rot: [Math.PI / 2, 0, 0], label: "CUBE" },
];

function FaceLabels() {
  return (
    <>
      {FACE_LABELS.map((f, i) => (
        <Text
          key={i}
          position={f.pos}
          rotation={f.rot}
          fontSize={f.label === "SG" ? 0.5 : 0.4}
          color={CYAN_GLOW}
          anchorX="center"
          anchorY="middle"
          letterSpacing={0.12}
          outlineWidth={0.008}
          outlineColor={CYAN}
          material-toneMapped={false}
        >
          {f.label}
        </Text>
      ))}
    </>
  );
}

function Cube({ state = "IDLE", pulse = 1.0 }: { state?: AssistantState; pulse?: number }) {
  const group = useRef<THREE.Group>(null!);

  const speedMult = useMemo(() => {
    if (state === "AI_SPEAKING") return 1.6;
    if (state === "USER_SPEAKING") return 1.3;
    if (state === "AI_THINKING") return 1.4;
    if (state === "SAFETY_ALERT") return 1.8;
    if (state === "SLEEPING") return 0.25;
    return 1.0;
  }, [state]);

  useFrame((_, delta) => {
    group.current.rotation.y += delta * 0.30 * speedMult;
    group.current.rotation.x += delta * 0.12 * speedMult;
    
    // Smooth pulse breathing
    const targetScale = state === "SLEEPING" ? 0.85 : (0.95 + pulse * 0.05);
    group.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);
  });

  return (
    <group ref={group} scale={1}>
      {/* Translucent cyber cube body */}
      <mesh>
        <boxGeometry args={[2, 2, 2]} />
        <meshStandardMaterial
          color={CYAN_DIM}
          metalness={0.6}
          roughness={0.3}
          transparent
          opacity={state === "SLEEPING" ? 0.25 : 0.48}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Radiant cyan edges */}
      <lineSegments>
        <edgesGeometry args={[OUTER_BOX]} />
        <lineBasicMaterial color={CYAN_GLOW} transparent opacity={1} toneMapped={false} />
      </lineSegments>

      <CornerDots />
      <InnerCube speedMultiplier={speedMult} />
      <FaceLabels />
    </group>
  );
}

function Particles({ count = 80 }: { count?: number }) {
  const points = useRef<THREE.Points>(null!);
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r = 1.3 + Math.random() * 1.2;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      arr[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      arr[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      arr[i * 3 + 2] = r * Math.cos(phi);
    }
    return arr;
  }, [count]);

  useFrame((_, delta) => {
    points.current.rotation.y += delta * 0.05;
  });

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} count={count} />
      </bufferGeometry>
      <pointsMaterial color={CYAN_GLOW} size={0.03} transparent opacity={0.7} sizeAttenuation />
    </points>
  );
}

interface CubeVisualizationProps {
  state?: AssistantState;
  pulse?: number;
}

export const CubeVisualization = memo(function CubeVisualization({
  state = "IDLE",
  pulse = 1.0,
}: CubeVisualizationProps) {
  return (
    <div
      id="sg-cube-centerpiece"
      className="relative w-full h-full min-h-[260px] flex items-center justify-center select-none"
      onContextMenu={(e) => e.preventDefault()}
    >
      <HUDRings />
      <Canvas
        className="relative"
        camera={{ position: [3.5, 2.4, 4.0], fov: 42 }}
        gl={{ alpha: true, antialias: true, preserveDrawingBuffer: false }}
        dpr={[1, 2]}
      >
        <ambientLight intensity={0.35} />
        <directionalLight position={[5, 6, 5]} intensity={2.2} color="#FFFFFF" />
        <directionalLight position={[-5, -3, -2]} intensity={0.9} color={CYAN} />
        <pointLight position={[0, 0, 3]} intensity={2.5} color={CYAN_GLOW} />
        <pointLight position={[0, -3, -3]} intensity={1.2} color={CYAN} />
        <Cube state={state} pulse={pulse} />
        <Particles />
        <EffectComposer>
          <Bloom
            intensity={1.4}
            luminanceThreshold={0.15}
            luminanceSmoothing={0.85}
            mipmapBlur
          />
        </EffectComposer>
      </Canvas>
    </div>
  );
});
