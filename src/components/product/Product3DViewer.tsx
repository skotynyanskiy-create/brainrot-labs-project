import { Component, Suspense, useLayoutEffect, useMemo, useRef, type ReactNode } from 'react';
import { Canvas, useLoader } from '@react-three/fiber';
import { ContactShadows, Environment, OrbitControls, PerspectiveCamera, useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { STLLoader } from 'three-stdlib';
import Product3DPreview from '../customizer/Product3DPreview';
import Tshirt3DModel, { TSHIRT_MODEL_PATH } from './Tshirt3DModel';

interface Product3DViewerProps {
  modelPath: string;
  className?: string;
  autoRotate?: boolean;
  baseColor?: string;
  designTextureUrl?: string | null;
  usePreviewModel?: boolean;
}

class ViewerErrorBoundary extends Component<
  { fallback: ReactNode; children: ReactNode },
  { hasError: boolean }
> {
  constructor(props: { fallback: ReactNode; children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    void error;
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }

    return this.props.children;
  }
}

function GLBModel({ modelPath }: { modelPath: string }) {
  const { scene } = useGLTF(modelPath);
  const rootRef = useRef<THREE.Group>(null);
  const clonedScene = useMemo(() => scene.clone(true), [scene]);

  useLayoutEffect(() => {
    clonedScene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true;
        child.receiveShadow = true;

        const mats = Array.isArray(child.material) ? child.material : [child.material];
        mats.forEach((mat) => {
          if (mat instanceof THREE.MeshStandardMaterial || mat instanceof THREE.MeshPhysicalMaterial) {
            mat.envMapIntensity = 0.7;
            mat.needsUpdate = true;
          }
        });
      }
    });

    const box = new THREE.Box3().setFromObject(clonedScene);
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    box.getSize(size);
    box.getCenter(center);

    const maxAxis = Math.max(size.x, size.y, size.z) || 1;
    const normalizedScale = 3 / maxAxis;

    if (rootRef.current) {
      rootRef.current.scale.setScalar(normalizedScale);
      rootRef.current.position.set(-center.x * normalizedScale, -center.y * normalizedScale, -center.z * normalizedScale);
    }
  }, [clonedScene]);

  return (
    <group ref={rootRef}>
      <primitive object={clonedScene} />
    </group>
  );
}

function STLModel({ modelPath, color = '#d4d4d4' }: { modelPath: string; color?: string }) {
  const geometry = useLoader(STLLoader, modelPath);
  const meshRef = useRef<THREE.Mesh>(null);

  const { centeredGeo, normalizedScale } = useMemo(() => {
    const geo = geometry.clone();
    geo.computeVertexNormals();
    geo.computeBoundingBox();
    const box = geo.boundingBox ?? new THREE.Box3();
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    box.getSize(size);
    box.getCenter(center);
    geo.translate(-center.x, -center.y, -center.z);
    const maxAxis = Math.max(size.x, size.y, size.z) || 1;
    return { centeredGeo: geo, normalizedScale: 3 / maxAxis };
  }, [geometry]);

  const material = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: new THREE.Color(color),
        roughness: 0.45,
        metalness: 0.08,
        envMapIntensity: 0.75,
      }),
    [color]
  );

  return (
    <mesh
      ref={meshRef}
      geometry={centeredGeo}
      material={material}
      scale={normalizedScale}
      castShadow
      receiveShadow
    />
  );
}

useGLTF.preload(TSHIRT_MODEL_PATH);

export default function Product3DViewer({
  modelPath,
  className = '',
  autoRotate = true,
  baseColor = '#ffffff',
  designTextureUrl = null,
  usePreviewModel = false,
}: Product3DViewerProps) {
  const isSharedTshirtModel = modelPath === TSHIRT_MODEL_PATH;
  const isSTL = modelPath.toLowerCase().endsWith('.stl');
  const fallback = (
    <div className={`relative h-full w-full ${className}`}>
      <Product3DPreview
        baseProductId="base-tshirt"
        baseColor={baseColor}
        designTextureUrl={designTextureUrl}
        autoRotate={autoRotate}
        lightingMode="neutral"
      />
    </div>
  );

  if (usePreviewModel) {
    return fallback;
  }

  return (
    <ViewerErrorBoundary fallback={fallback}>
      <div className={`relative h-full w-full ${className}`}>
        <Suspense
          fallback={
            <div className="flex h-full w-full items-center justify-center border-4 border-black bg-white font-black uppercase tracking-widest text-black">
              Loading 3D...
            </div>
          }
        >
          <Canvas
            shadows
            dpr={[1, 2]}
            gl={{ antialias: true }}
            className="h-full w-full"
          >
            <color attach="background" args={['#ffffff']} />
            <fog attach="fog" args={['#ffffff', 8, 15]} />

            <PerspectiveCamera makeDefault position={[0, 0.28, 5.8]} fov={37} />

            <ambientLight intensity={1.1} color="#ffffff" />
            <hemisphereLight intensity={0.9} color="#ffffff" groundColor="#cccccc" />
            <spotLight
              position={[3.5, 7, 5]}
              angle={0.38}
              penumbra={0.85}
              intensity={3.2}
              color="#ffffff"
              castShadow
              shadow-mapSize-width={2048}
              shadow-mapSize-height={2048}
            />
            <directionalLight position={[-4, 3, -3]} intensity={0.8} color="#e8f0ff" />
            <directionalLight position={[2, -1, 4]} intensity={0.4} color="#fff8f0" />
            <Environment preset="studio" environmentIntensity={0.8} />

            <group position={[0, -0.12, 0]} rotation={[0.05, 0.1, 0]}>
              {isSharedTshirtModel ? (
                <Tshirt3DModel
                  baseColor={baseColor}
                  designTextureUrl={designTextureUrl}
                  scaleTarget={2.84}
                  printOffsetY={0.04}
                />
              ) : isSTL ? (
                <STLModel modelPath={modelPath} color={baseColor} />
              ) : (
                <GLBModel modelPath={modelPath} />
              )}
            </group>

            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.78, 0]}>
              <circleGeometry args={[2.45, 48]} />
              <meshBasicMaterial color="#ffffff" transparent opacity={0.75} />
            </mesh>

            <ContactShadows position={[0, -1.74, 0]} opacity={0.34} blur={2.8} scale={7.4} far={5.2} color="#000000" />

            <OrbitControls
              enablePan={false}
              enableDamping
              dampingFactor={0.07}
              minDistance={3.4}
              maxDistance={7.4}
              minPolarAngle={Math.PI / 3}
              maxPolarAngle={Math.PI / 1.6}
              autoRotate={autoRotate}
              autoRotateSpeed={1.15}
            />
          </Canvas>
        </Suspense>
      </div>
    </ViewerErrorBoundary>
  );
}
