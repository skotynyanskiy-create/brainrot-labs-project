import { useTexture } from '@react-three/drei';
import { useLoader } from '@react-three/fiber';
import { useMemo } from 'react';
import * as THREE from 'three';
import { STLLoader } from 'three-stdlib';

export const PHONECASE_MODEL_PATH = '/models/iphone-17.stl';

const PLACEHOLDER_TEXTURE =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=';

interface PhoneCase3DModelProps {
  baseColor?: string;
  designTextureUrl?: string | null;
  scaleTarget?: number;
}

export default function PhoneCase3DModel({
  baseColor = '#f5f5f5',
  designTextureUrl = null,
  scaleTarget = 3.1,
}: PhoneCase3DModelProps) {
  const geometry = useLoader(STLLoader, PHONECASE_MODEL_PATH);
  const texture = useTexture(designTextureUrl || PLACEHOLDER_TEXTURE, (loadedTexture) => {
    loadedTexture.colorSpace = THREE.SRGBColorSpace;
    loadedTexture.anisotropy = 8;
    loadedTexture.needsUpdate = true;
  });

  const sceneMetrics = useMemo(() => {
    const centeredGeometry = geometry.clone();
    centeredGeometry.computeVertexNormals();
    centeredGeometry.computeBoundingBox();

    const box = centeredGeometry.boundingBox ?? new THREE.Box3();
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    box.getSize(size);
    box.getCenter(center);
    centeredGeometry.translate(-center.x, -center.y, -center.z);

    const maxAxis = Math.max(size.x, size.y, size.z) || 1;
    const normalizedScale = scaleTarget / maxAxis;

    return {
      centeredGeometry,
      normalizedScale,
      scaledWidth: size.x * normalizedScale,
      scaledHeight: size.y * normalizedScale,
      scaledDepth: size.z * normalizedScale,
    };
  }, [geometry, scaleTarget]);

  const isMatte = baseColor.toLowerCase() === '#e0e0e0';

  return (
    <group>
      <mesh
        geometry={sceneMetrics.centeredGeometry}
        scale={sceneMetrics.normalizedScale}
        castShadow
        receiveShadow
      >
        <meshPhysicalMaterial
          color={baseColor}
          roughness={isMatte ? 0.72 : 0.26}
          metalness={0.04}
          clearcoat={isMatte ? 0.08 : 0.85}
          clearcoatRoughness={isMatte ? 0.55 : 0.14}
          envMapIntensity={0.72}
        />
      </mesh>

      {designTextureUrl && (
        <mesh position={[0, 0, sceneMetrics.scaledDepth * 0.52]}>
          <planeGeometry args={[sceneMetrics.scaledWidth * 0.88, sceneMetrics.scaledHeight * 0.92]} />
          <meshStandardMaterial
            map={texture}
            transparent
            alphaTest={0.02}
            roughness={0.34}
            metalness={0}
            polygonOffset
            polygonOffsetFactor={-2}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}
    </group>
  );
}
