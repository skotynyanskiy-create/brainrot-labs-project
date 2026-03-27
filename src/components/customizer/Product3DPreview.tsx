import React, { Suspense, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import {
  ContactShadows,
  Environment,
  Float,
  OrbitControls,
  PerspectiveCamera,
} from '@react-three/drei';
import Tshirt3DModel from '../product/Tshirt3DModel';
import PhoneCase3DModel from '../product/PhoneCase3DModel';
import Poster3DModel from '../product/Poster3DModel';
import { getProduct3DConfig } from '../../config/product3d';

export interface Product3DPreviewProps {
  baseProductId: 'base-tshirt' | 'base-phonecase' | 'base-poster';
  designTextureUrl: string | null;
  baseColor?: string;
  lightingMode?: 'neutral' | 'y2k';
  autoRotate?: boolean;
}

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

const Product3DPreview: React.FC<Product3DPreviewProps> = ({
  baseProductId,
  designTextureUrl,
  baseColor,
  lightingMode = 'neutral',
  autoRotate = false,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const colorHex = baseColor || '#ffffff';
  const config = getProduct3DConfig(baseProductId);

  const model = baseProductId === 'base-phonecase'
    ? <PhoneCase3DModel baseColor={colorHex} designTextureUrl={designTextureUrl} scaleTarget={config.previewModel.scaleTarget} />
    : baseProductId === 'base-poster'
      ? <Poster3DModel baseColor={colorHex} designTextureUrl={designTextureUrl} />
      : (
        <Tshirt3DModel
          baseColor={colorHex}
          designTextureUrl={designTextureUrl}
          scaleTarget={config.previewModel.scaleTarget}
          printOffsetY={config.previewModel.printOffsetY}
        />
      );

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
          <color attach="background" args={['#ffffff']} />
          <PerspectiveCamera
            makeDefault
            position={config.previewCamera.position}
            fov={config.previewCamera.fov}
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
            position={config.previewContactShadows.position}
            opacity={config.previewContactShadows.opacity}
            scale={config.previewContactShadows.scale}
            blur={config.previewContactShadows.blur}
            far={config.previewContactShadows.far}
            color="#000000"
          />

          <OrbitControls
            enablePan={false}
            minDistance={config.previewOrbit.minDistance}
            maxDistance={config.previewOrbit.maxDistance}
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
