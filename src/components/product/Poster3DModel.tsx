import { useTexture } from '@react-three/drei';
import * as THREE from 'three';

const PLACEHOLDER_TEXTURE =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=';

interface Poster3DModelProps {
  baseColor?: string;
  designTextureUrl?: string | null;
}

export default function Poster3DModel({
  baseColor = '#f8f6f0',
  designTextureUrl = null,
}: Poster3DModelProps) {
  const texture = useTexture(designTextureUrl || PLACEHOLDER_TEXTURE, (loadedTexture) => {
    loadedTexture.colorSpace = THREE.SRGBColorSpace;
    loadedTexture.anisotropy = 8;
    loadedTexture.needsUpdate = true;
  });

  return (
    <group rotation={[0.02, -0.12, 0]}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[2.4, 3.2, 0.08]} />
        <meshStandardMaterial color={baseColor} roughness={0.82} metalness={0.02} />
      </mesh>

      <mesh position={[0, 0, 0.045]} castShadow receiveShadow>
        <planeGeometry args={[2.1, 2.9]} />
        <meshStandardMaterial
          map={texture}
          transparent
          alphaTest={0.02}
          roughness={0.7}
          metalness={0}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}
