import { useGLTF, useTexture } from '@react-three/drei';
import { useLayoutEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';

export const TSHIRT_MODEL_PATH = '/models/tshirt-brainrot.glb';

const PLACEHOLDER_TEXTURE =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=';

interface Tshirt3DModelProps {
  baseColor?: string;
  designTextureUrl?: string | null;
  scaleTarget?: number;
  printOffsetY?: number;
}

interface PrintLayout {
  width: number;
  height: number;
  y: number;
  z: number;
}

export default function Tshirt3DModel({
  baseColor = '#ffffff',
  designTextureUrl = null,
  scaleTarget = 3.2,
  printOffsetY = 0,
}: Tshirt3DModelProps) {
  const { scene } = useGLTF(TSHIRT_MODEL_PATH);
  const texture = useTexture(designTextureUrl || PLACEHOLDER_TEXTURE, (loadedTexture) => {
    loadedTexture.colorSpace = THREE.SRGBColorSpace;
    loadedTexture.anisotropy = 8;
    loadedTexture.needsUpdate = true;
  });
  const rootRef = useRef<THREE.Group>(null);
  const clonedScene = useMemo(() => scene.clone(true), [scene]);

  const sceneMetrics = useMemo(() => {
    const box = new THREE.Box3().setFromObject(clonedScene);
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    box.getSize(size);
    box.getCenter(center);
    const maxAxis = Math.max(size.x, size.y, size.z) || 1;
    const normalizedScale = scaleTarget / maxAxis;

    return {
      normalizedScale,
      scaledWidth: size.x * normalizedScale,
      scaledHeight: size.y * normalizedScale,
      scaledDepth: size.z * normalizedScale,
      center,
    };
  }, [clonedScene, scaleTarget]);

  const printLayout = useMemo<PrintLayout>(() => ({
    width: Math.min(sceneMetrics.scaledWidth * 0.42, 1.18),
    height: Math.min(sceneMetrics.scaledHeight * 0.46, 1.42),
    y: sceneMetrics.scaledHeight * 0.06 + printOffsetY,
    z: sceneMetrics.scaledDepth * 0.44 + 0.05,
  }), [sceneMetrics, printOffsetY]);

  useLayoutEffect(() => {
    const tint = new THREE.Color(baseColor);
    if (tint.r > 0.97 && tint.g > 0.97 && tint.b > 0.97) {
      tint.multiplyScalar(0.95);
    }

    clonedScene.traverse((child) => {
      if (!(child instanceof THREE.Mesh)) {
        return;
      }

      child.castShadow = true;
      child.receiveShadow = true;

      const materials = Array.isArray(child.material) ? child.material : [child.material];
      const remappedMaterials = materials.map((material) => {
        if (!(material instanceof THREE.MeshStandardMaterial || material instanceof THREE.MeshPhysicalMaterial)) {
          return material;
        }

        const nextMaterial = material.userData.brainrotClone
          ? material
          : material.clone();

        nextMaterial.userData.brainrotClone = true;
        nextMaterial.color.copy(tint);
        nextMaterial.roughness = 0.88;
        nextMaterial.metalness = 0.02;
        nextMaterial.envMapIntensity = 0.58;
        nextMaterial.needsUpdate = true;
        return nextMaterial;
      });

      child.material = Array.isArray(child.material) ? remappedMaterials : remappedMaterials[0];
    });

    if (rootRef.current) {
      const { normalizedScale, center } = sceneMetrics;
      rootRef.current.scale.setScalar(normalizedScale);
      rootRef.current.position.set(
        -center.x * normalizedScale,
        -center.y * normalizedScale,
        -center.z * normalizedScale
      );
    }
  }, [baseColor, clonedScene, sceneMetrics]);

  return (
    <group ref={rootRef}>
      <primitive object={clonedScene} />
      {designTextureUrl && (
        <mesh position={[0, printLayout.y, printLayout.z]} renderOrder={3}>
          <planeGeometry args={[printLayout.width, printLayout.height]} />
          <meshStandardMaterial
            map={texture}
            transparent
            alphaTest={0.02}
            roughness={0.78}
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

useGLTF.preload(TSHIRT_MODEL_PATH);
