import React, { Suspense, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import {
  OrbitControls, PerspectiveCamera, Environment,
  ContactShadows, Decal, useTexture, Float, RoundedBox,
} from '@react-three/drei';

export interface Product3DPreviewProps {
  baseProductId: 'base-tshirt' | 'base-phonecase';
  designTextureUrl: string | null;
  baseColor?: string;
  /** 'neutral' = studio lighting (default), 'y2k' = neon Y2K lights */
  lightingMode?: 'neutral' | 'y2k';
  /** When true the model auto-rotates and floats (use in Step 3 / confirm view) */
  autoRotate?: boolean;
}

// ── Minimal 1×1 transparent PNG used as placeholder texture ──────────────────
const PLACEHOLDER_TEXTURE =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=';

// ── Lighting presets ──────────────────────────────────────────────────────────
const NeutralLighting = () => (
  <>
    <ambientLight intensity={0.9} color="#ffffff" />
    <directionalLight position={[3, 5, 4]}  intensity={1.4} color="#fff8f0" castShadow />
    <directionalLight position={[-4, 3, -2]} intensity={0.5} color="#e8f0ff" />
    <Environment preset="studio" />
  </>
);

const Y2KLighting = () => (
  <>
    <ambientLight intensity={0.4} color="#ffffff" />
    <directionalLight position={[5, 5, 5]}  intensity={1.5} color="#ff00ff" castShadow />
    <directionalLight position={[-5, 5, -5]} intensity={1.5} color="#00ffff" />
    <pointLight       position={[0, -5, 5]}  intensity={2}   color="#ffff00" />
    <Environment preset="city" />
  </>
);

// ── T-Shirt Model ─────────────────────────────────────────────────────────────
// Body: flat plane + two sleeve boxes + collar torus half-ring
const TshirtModel = ({
  textureUrl,
  baseColor,
}: {
  textureUrl: string | null;
  baseColor: string;
}) => {
  const texture = useTexture(textureUrl || PLACEHOLDER_TEXTURE);
  const mat = { color: baseColor, roughness: 0.85, metalness: 0 } as const;

  return (
    <group>
      {/* Body front face */}
      <mesh castShadow receiveShadow position={[0, 0, 0]}>
        <planeGeometry args={[2.8, 3.6]} />
        <meshStandardMaterial {...mat} side={2} />
        {textureUrl && (
          <Decal position={[0, 0.3, 0.01]} rotation={[0, 0, 0]} scale={[2.2, 2.2, 1]}>
            <meshStandardMaterial
              map={texture}
              transparent
              polygonOffset
              polygonOffsetFactor={-1}
              roughness={0.9}
            />
          </Decal>
        )}
      </mesh>

      {/* Body — thin box for depth */}
      <mesh position={[0, 0, -0.06]}>
        <boxGeometry args={[2.8, 3.6, 0.12]} />
        <meshStandardMaterial {...mat} />
      </mesh>

      {/* Left sleeve */}
      <mesh castShadow position={[-1.95, 0.9, 0]} rotation={[0, 0, 0.45]}>
        <boxGeometry args={[1.2, 0.75, 0.12]} />
        <meshStandardMaterial {...mat} />
      </mesh>

      {/* Right sleeve */}
      <mesh castShadow position={[1.95, 0.9, 0]} rotation={[0, 0, -0.45]}>
        <boxGeometry args={[1.2, 0.75, 0.12]} />
        <meshStandardMaterial {...mat} />
      </mesh>

      {/* Collar */}
      <mesh position={[0, 1.75, 0.01]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.55, 0.1, 8, 24, Math.PI]} />
        <meshStandardMaterial {...mat} />
      </mesh>
    </group>
  );
};

// ── iPhone 15 Pro Case Model ──────────────────────────────────────────────────
const PhoneCaseModel = ({
  textureUrl,
  baseColor,
}: {
  textureUrl: string | null;
  baseColor: string;
}) => {
  const texture = useTexture(textureUrl || PLACEHOLDER_TEXTURE);

  return (
    <group>
      {/* Case body — rounded box */}
      <RoundedBox args={[1.7, 3.4, 0.22]} radius={0.14} smoothness={6} castShadow receiveShadow>
        <meshPhysicalMaterial
          color={baseColor || '#f0f0f0'}
          roughness={baseColor === '#E0E0E0' ? 0.75 : 0.15}
          metalness={0}
          clearcoat={baseColor === '#E0E0E0' ? 0 : 0.8}
          clearcoatRoughness={0.1}
        />
        {textureUrl && (
          <Decal position={[0, 0, 0.12]} rotation={[0, 0, 0]} scale={[1.5, 3.1, 1]}>
            <meshStandardMaterial
              map={texture}
              transparent
              polygonOffset
              polygonOffsetFactor={-1}
              roughness={0.3}
            />
          </Decal>
        )}
      </RoundedBox>

      {/* Camera bump */}
      <mesh position={[-0.4, 1.1, 0.15]}>
        <boxGeometry args={[0.55, 0.55, 0.09]} />
        <meshPhysicalMaterial color="#1a1a1a" roughness={0.4} metalness={0.6} />
      </mesh>
      {/* Camera lenses */}
      {[[-0.22, 0.15], [0.15, 0.15], [-0.22, -0.17], [0.15, -0.17]].map(([x, y], i) => (
        <mesh key={i} position={[-0.4 + x, 1.1 + y, 0.2]}>
          <cylinderGeometry args={[0.1, 0.1, 0.04, 16]} />
          <meshPhysicalMaterial color="#111111" roughness={0.05} metalness={0.9} />
        </mesh>
      ))}

      {/* Side buttons */}
      <mesh position={[0.88, 0.4, 0]}>
        <boxGeometry args={[0.06, 0.35, 0.18]} />
        <meshPhysicalMaterial color="#aaaaaa" roughness={0.3} metalness={0.8} />
      </mesh>
      <mesh position={[-0.88, 0.0, 0]}>
        <boxGeometry args={[0.06, 0.22, 0.14]} />
        <meshPhysicalMaterial color="#aaaaaa" roughness={0.3} metalness={0.8} />
      </mesh>
    </group>
  );
};

// ── Main Component ────────────────────────────────────────────────────────────
const Product3DPreview: React.FC<Product3DPreviewProps> = ({
  baseProductId,
  designTextureUrl,
  baseColor,
  lightingMode = 'neutral',
  autoRotate = false,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const colorHex = baseColor || '#ffffff';

  const model = baseProductId === 'base-phonecase'
    ? <PhoneCaseModel textureUrl={designTextureUrl} baseColor={colorHex} />
    : <TshirtModel    textureUrl={designTextureUrl} baseColor={colorHex} />;

  const isPhoneCase = baseProductId === 'base-phonecase';

  return (
    <div
      className="w-full h-full relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Suspense
        fallback={
          <div className="flex items-center justify-center w-full h-full bg-gray-900 text-white font-black uppercase tracking-widest text-sm animate-pulse">
            3D Engine...
          </div>
        }
      >
        <Canvas
          shadows
          dpr={[1, 1.5]}
          performance={{ min: 0.5 }}
          className="w-full h-full"
        >
          <PerspectiveCamera
            makeDefault
            position={isPhoneCase ? [0, 0, 5.5] : [0, 0, 7]}
            fov={45}
          />

          {lightingMode === 'y2k' ? <Y2KLighting /> : <NeutralLighting />}

          {autoRotate ? (
            <Float speed={2} rotationIntensity={0.4} floatIntensity={0.6}>
              {model}
            </Float>
          ) : (
            model
          )}

          <ContactShadows
            position={[0, isPhoneCase ? -2.2 : -2.8, 0]}
            opacity={0.6}
            scale={10}
            blur={2.5}
            far={5}
            color="#000000"
          />

          <OrbitControls
            enablePan={false}
            minDistance={isPhoneCase ? 3 : 4}
            maxDistance={isPhoneCase ? 9 : 12}
            autoRotate={autoRotate}
            autoRotateSpeed={autoRotate ? 2.5 : 0}
            enableDamping
            dampingFactor={0.08}
          />
        </Canvas>
      </Suspense>

      {/* Drag hint — only shown when not auto-rotating */}
      {!autoRotate && (
        <div
          className={`absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/80 text-white px-4 py-2 text-xs font-black uppercase tracking-widest border border-white/20 transition-opacity duration-300 pointer-events-none ${
            isHovered ? 'opacity-0' : 'opacity-70'
          }`}
        >
          Trascina per ruotare
        </div>
      )}

      {/* Lighting mode badge */}
      {lightingMode === 'y2k' && (
        <div className="absolute top-3 right-3 bg-yellow-400 text-black px-2 py-1 border-2 border-black font-black uppercase text-[10px] rotate-2 shadow-[3px_3px_0_0_rgba(0,0,0,1)] pointer-events-none">
          Y2K MODE
        </div>
      )}
    </div>
  );
};

export default Product3DPreview;
