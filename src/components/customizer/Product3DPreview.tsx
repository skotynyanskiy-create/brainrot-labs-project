import React, { Suspense, useMemo, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import {
  ContactShadows,
  Decal,
  Environment,
  Float,
  OrbitControls,
  PerspectiveCamera,
  RoundedBox,
  useTexture,
} from '@react-three/drei';
import * as THREE from 'three';

export interface Product3DPreviewProps {
  baseProductId: 'base-tshirt' | 'base-phonecase';
  designTextureUrl: string | null;
  baseColor?: string;
  lightingMode?: 'neutral' | 'y2k';
  autoRotate?: boolean;
}

const PLACEHOLDER_TEXTURE =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=';

const NeutralLighting = () => (
  <>
    <ambientLight intensity={0.9} color="#ffffff" />
    <directionalLight position={[3, 5, 4]} intensity={1.4} color="#fff8f0" castShadow />
    <directionalLight position={[-4, 3, -2]} intensity={0.5} color="#e8f0ff" />
    <Environment preset="studio" />
  </>
);

const Y2KLighting = () => (
  <>
    <ambientLight intensity={0.4} color="#ffffff" />
    <directionalLight position={[5, 5, 5]} intensity={1.5} color="#ff00ff" castShadow />
    <directionalLight position={[-5, 5, -5]} intensity={1.5} color="#00ffff" />
    <pointLight position={[0, -5, 5]} intensity={2} color="#ffff00" />
    <Environment preset="city" />
  </>
);

function createTshirtShape() {
  const shape = new THREE.Shape();

  shape.moveTo(-1.18, -1.95);
  shape.lineTo(1.18, -1.95);
  shape.lineTo(1.18, 0.7);
  shape.bezierCurveTo(1.5, 0.76, 1.84, 1.0, 2.05, 1.3);
  shape.lineTo(2.42, 1.9);
  shape.lineTo(1.58, 2.12);
  shape.lineTo(1.18, 1.48);
  shape.bezierCurveTo(1.03, 1.22, 0.83, 1.08, 0.62, 1.01);
  shape.bezierCurveTo(0.56, 1.54, 0.3, 1.9, 0, 1.9);
  shape.bezierCurveTo(-0.3, 1.9, -0.56, 1.54, -0.62, 1.01);
  shape.bezierCurveTo(-0.83, 1.08, -1.03, 1.22, -1.18, 1.48);
  shape.lineTo(-1.58, 2.12);
  shape.lineTo(-2.42, 1.9);
  shape.lineTo(-2.05, 1.3);
  shape.bezierCurveTo(-1.84, 1.0, -1.5, 0.76, -1.18, 0.7);
  shape.lineTo(-1.18, -1.95);

  const neckHole = new THREE.Path();
  neckHole.absellipse(0, 1.65, 0.42, 0.24, 0, Math.PI, true, 0);
  shape.holes.push(neckHole);

  return shape;
}

const TshirtModel = ({
  textureUrl,
  baseColor,
}: {
  textureUrl: string | null;
  baseColor: string;
}) => {
  const texture = useTexture(textureUrl || PLACEHOLDER_TEXTURE);
  const tshirtShape = useMemo(() => createTshirtShape(), []);

  return (
    <group rotation={[0.08, 0.1, 0]} position={[0, -0.1, 0]}>
      <mesh castShadow receiveShadow>
        <extrudeGeometry
          args={[
            tshirtShape,
            {
              depth: 0.34,
              bevelEnabled: true,
              bevelSegments: 3,
              steps: 1,
              bevelSize: 0.05,
              bevelThickness: 0.035,
              curveSegments: 24,
            },
          ]}
        />
        <meshPhysicalMaterial
          color={baseColor}
          roughness={0.92}
          metalness={0}
          clearcoat={0.04}
          sheen={0.25}
          sheenRoughness={0.9}
        />
      </mesh>

      <mesh position={[0, 0.15, 0.23]} castShadow receiveShadow>
        <planeGeometry args={[1.7, 1.95]} />
        <meshStandardMaterial color={baseColor} roughness={0.98} />
        {textureUrl && (
          <Decal position={[0, 0, 0.01]} rotation={[0, 0, 0]} scale={[1.55, 1.75, 1]}>
            <meshStandardMaterial
              map={texture}
              transparent
              polygonOffset
              polygonOffsetFactor={-1}
              roughness={0.88}
            />
          </Decal>
        )}
      </mesh>

      <mesh position={[0, -1.95, 0.16]}>
        <boxGeometry args={[2.15, 0.09, 0.22]} />
        <meshStandardMaterial color="#000000" transparent opacity={0.08} />
      </mesh>

      <mesh position={[0, 1.63, 0.18]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.44, 0.08, 10, 36, Math.PI]} />
        <meshStandardMaterial color="#111111" roughness={0.75} metalness={0.05} />
      </mesh>

      <mesh position={[-1.78, 1.45, 0.16]} rotation={[0, 0, 0.5]}>
        <boxGeometry args={[0.72, 0.08, 0.22]} />
        <meshStandardMaterial color="#000000" transparent opacity={0.08} />
      </mesh>

      <mesh position={[1.78, 1.45, 0.16]} rotation={[0, 0, -0.5]}>
        <boxGeometry args={[0.72, 0.08, 0.22]} />
        <meshStandardMaterial color="#000000" transparent opacity={0.08} />
      </mesh>
    </group>
  );
};

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

      <mesh position={[-0.4, 1.1, 0.15]}>
        <boxGeometry args={[0.55, 0.55, 0.09]} />
        <meshPhysicalMaterial color="#1a1a1a" roughness={0.4} metalness={0.6} />
      </mesh>

      {[[-0.22, 0.15], [0.15, 0.15], [-0.22, -0.17], [0.15, -0.17]].map(([x, y], index) => (
        <mesh key={index} position={[-0.4 + x, 1.1 + y, 0.2]}>
          <cylinderGeometry args={[0.1, 0.1, 0.04, 16]} />
          <meshPhysicalMaterial color="#111111" roughness={0.05} metalness={0.9} />
        </mesh>
      ))}

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
    : <TshirtModel textureUrl={designTextureUrl} baseColor={colorHex} />;

  const isPhoneCase = baseProductId === 'base-phonecase';

  return (
    <div
      className="relative h-full w-full"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Suspense
        fallback={
          <div className="flex h-full w-full items-center justify-center bg-gray-900 text-sm font-black uppercase tracking-widest text-white animate-pulse">
            3D Engine...
          </div>
        }
      >
        <Canvas shadows dpr={[1, 1.5]} performance={{ min: 0.5 }} className="h-full w-full">
          <PerspectiveCamera
            makeDefault
            position={isPhoneCase ? [0, 0, 5.5] : [0, 0.1, 7.4]}
            fov={isPhoneCase ? 45 : 42}
          />

          {lightingMode === 'y2k' ? <Y2KLighting /> : <NeutralLighting />}

          {autoRotate ? (
            <Float speed={2} rotationIntensity={0.35} floatIntensity={0.5}>
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

      {!autoRotate && (
        <div
          className={`pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 border border-white/20 bg-black/80 px-4 py-2 text-xs font-black uppercase tracking-widest text-white transition-opacity duration-300 ${
            isHovered ? 'opacity-0' : 'opacity-70'
          }`}
        >
          Trascina per ruotare
        </div>
      )}

      {lightingMode === 'y2k' && (
        <div className="pointer-events-none absolute right-3 top-3 rotate-2 border-2 border-black bg-yellow-400 px-2 py-1 text-[10px] font-black uppercase text-black shadow-[3px_3px_0_0_rgba(0,0,0,1)]">
          Y2K MODE
        </div>
      )}
    </div>
  );
};

export default Product3DPreview;
