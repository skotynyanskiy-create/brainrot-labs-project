import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment, ContactShadows, Decal, useTexture, Float } from '@react-three/drei';

interface Product3DPreviewProps {
  baseProductId: string;
  designTextureUrl: string | null;
  baseColor?: string;
}

// Plastic Y2K Material
const Y2KPlasticMaterial = ({ color }: { color: string }) => (
  <meshPhysicalMaterial 
    color={color} 
    roughness={0.15} 
    metalness={0.1} 
    clearcoat={1.0} 
    clearcoatRoughness={0.1}
    transmission={0}
    transparent={false}
  />
);

const PLACEHOLDER_TEXTURE = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=';

const MugModel = ({ textureUrl, baseColor }: { textureUrl: string | null, baseColor: string }) => {
  const texture = useTexture(textureUrl || PLACEHOLDER_TEXTURE);
  return (
    <group>
      <mesh castShadow receiveShadow position={[0, 0, 0]}>
        <cylinderGeometry args={[1, 1, 2.5, 64]} />
        <Y2KPlasticMaterial color={baseColor || "#ffffff"} />
        {textureUrl && (
          <Decal position={[0, 0, 1]} rotation={[0, 0, 0]} scale={[2, 2, 2]}>
            <meshStandardMaterial map={texture} transparent polygonOffset polygonOffsetFactor={-1} roughness={0.5} />
          </Decal>
        )}
      </mesh>
      <mesh position={[1.2, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <torusGeometry args={[0.6, 0.15, 32, 64, Math.PI]} />
        <Y2KPlasticMaterial color={baseColor || "#ffffff"} />
      </mesh>
    </group>
  );
};

const TshirtModel = ({ textureUrl, baseColor }: { textureUrl: string | null, baseColor: string }) => {
  const texture = useTexture(textureUrl || PLACEHOLDER_TEXTURE);
  return (
    <group>
      <mesh castShadow receiveShadow position={[0, 0, 0]}>
        <boxGeometry args={[2.8, 3.5, 0.3]} />
        <Y2KPlasticMaterial color={baseColor || "#ffffff"} />
        {textureUrl && (
          <Decal position={[0, 0.2, 0.16]} rotation={[0, 0, 0]} scale={[2.2, 2.2, 2.2]}>
            <meshStandardMaterial map={texture} transparent polygonOffset polygonOffsetFactor={-1} roughness={0.8} />
          </Decal>
        )}
      </mesh>
    </group>
  );
};

const PosterModel = ({ textureUrl, baseColor }: { textureUrl: string | null, baseColor: string }) => {
  const texture = useTexture(textureUrl || PLACEHOLDER_TEXTURE);
  return (
    <group>
      <mesh castShadow receiveShadow position={[0, 0, 0]}>
        <boxGeometry args={[2.4, 3.4, 0.1]} />
        <Y2KPlasticMaterial color="#ff00ff" />
      </mesh>
      <mesh position={[0, 0, 0.06]}>
        <planeGeometry args={[2.2, 3.2]} />
        <Y2KPlasticMaterial color={baseColor || "#ffffff"} />
        {textureUrl && (
          <Decal position={[0, 0, 0.01]} rotation={[0, 0, 0]} scale={[2.2, 3.2, 1]}>
            <meshStandardMaterial map={texture} transparent polygonOffset polygonOffsetFactor={-1} roughness={1} />
          </Decal>
        )}
      </mesh>
    </group>
  );
};

const PhoneCaseModel = ({ textureUrl, baseColor }: { textureUrl: string | null, baseColor: string }) => {
  const texture = useTexture(textureUrl || PLACEHOLDER_TEXTURE);
  return (
    <group>
      <mesh castShadow receiveShadow position={[0, 0, 0]}>
        <boxGeometry args={[1.6, 3.2, 0.2]} />
        <Y2KPlasticMaterial color={baseColor || "#00ffff"} />
        {textureUrl && (
          <Decal position={[0, 0, 0.11]} rotation={[0, 0, 0]} scale={[1.5, 3, 1]}>
            <meshStandardMaterial map={texture} transparent polygonOffset polygonOffsetFactor={-1} roughness={0.2} />
          </Decal>
        )}
      </mesh>
    </group>
  );
};

const Y2KLighting = () => {
  return (
    <>
      <ambientLight intensity={0.4} color="#ffffff" />
      <directionalLight position={[5, 5, 5]} intensity={1.5} color="#ff00ff" castShadow />
      <directionalLight position={[-5, 5, -5]} intensity={1.5} color="#00ffff" />
      <pointLight position={[0, -5, 5]} intensity={2} color="#ffff00" />
      <Environment preset="city" />
    </>
  );
};

const Product3DPreview: React.FC<Product3DPreviewProps> = ({ baseProductId, designTextureUrl, baseColor }) => {
  const renderModel = () => {
    const colorHex = baseColor || '#ffffff';
    switch (baseProductId) {
      case 'base-mug': return <MugModel textureUrl={designTextureUrl} baseColor={colorHex} />;
      case 'base-tshirt':
      case 'base-hoodie': return <TshirtModel textureUrl={designTextureUrl} baseColor={colorHex} />;
      case 'base-poster': return <PosterModel textureUrl={designTextureUrl} baseColor={colorHex} />;
      case 'base-phonecase': return <PhoneCaseModel textureUrl={designTextureUrl} baseColor={colorHex} />;
      default: return <TshirtModel textureUrl={designTextureUrl} baseColor={colorHex} />;
    }
  };

  return (
    <div className="w-full h-full bg-gradient-to-br from-purple-900 via-black to-blue-900 rounded-xl overflow-hidden border-8 border-black shadow-[12px_12px_0_0_rgba(0,0,0,1)] relative">
      <Suspense fallback={
        <div className="flex items-center justify-center w-full h-full text-white font-black uppercase tracking-widest animate-pulse">
          Loading 3D Engine...
        </div>
      }>
        <Canvas shadows dpr={[1, 2]}>
          <PerspectiveCamera makeDefault position={[0, 0, 7]} fov={50} />
          
          <Y2KLighting />
          
          <Float speed={3} rotationIntensity={0.8} floatIntensity={1}>
            {renderModel()}
          </Float>
          
          <ContactShadows position={[0, -3, 0]} opacity={0.8} scale={15} blur={2} far={5} color="#000000" />
          
          <OrbitControls 
            enablePan={false} 
            minDistance={3} 
            maxDistance={12} 
            autoRotate 
            autoRotateSpeed={2}
          />
        </Canvas>
      </Suspense>
      
      <div className="absolute top-4 right-4 bg-yellow-400 text-black px-3 py-1 border-4 border-black font-black uppercase text-xs transform rotate-3 shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
        3D Y2K ENGINE ACTIVE
      </div>
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white text-black px-6 py-3 border-4 border-black text-sm font-black uppercase tracking-widest shadow-[6px_6px_0_0_rgba(0,0,0,1)] z-10">
        Trascina per ruotare 🌍
      </div>
    </div>
  );
};

export default Product3DPreview;
