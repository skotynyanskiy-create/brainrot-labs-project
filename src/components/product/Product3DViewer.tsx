import { Component, Suspense, useLayoutEffect, useMemo, useRef, type ReactNode } from 'react';
import { Canvas } from '@react-three/fiber';
import { ContactShadows, Environment, OrbitControls, PerspectiveCamera, useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import Product3DPreview from '../customizer/Product3DPreview';

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

        const sourceMaterial = Array.isArray(child.material) ? child.material[0] : child.material;
        const baseColor = sourceMaterial instanceof THREE.Material && 'color' in sourceMaterial
          ? (sourceMaterial as THREE.MeshStandardMaterial).color?.clone?.() ?? new THREE.Color('#f3b3aa')
          : new THREE.Color('#f3b3aa');

        child.material = new THREE.MeshPhysicalMaterial({
          color: baseColor,
          roughness: 0.88,
          metalness: 0.02,
          clearcoat: 0.08,
          clearcoatRoughness: 0.7,
          sheen: 0.45,
          sheenRoughness: 0.92,
          envMapIntensity: 0.65,
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

useGLTF.preload('/models/tshirt-ecommerce-ready.glb');

export default function Product3DViewer({
  modelPath,
  className = '',
  autoRotate = true,
  baseColor = '#ffffff',
  designTextureUrl = null,
  usePreviewModel = false,
}: Product3DViewerProps) {
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
            <color attach="background" args={['#f7f5ef']} />
            <fog attach="fog" args={['#f7f5ef', 8, 15]} />

            <PerspectiveCamera makeDefault position={[0, 0.55, 6.1]} fov={29} />

            <ambientLight intensity={0.72} color="#fffaf2" />
            <hemisphereLight intensity={0.75} color="#fffdf8" groundColor="#d7d0c4" />
            <spotLight
              position={[3.2, 6.5, 4.5]}
              angle={0.34}
              penumbra={0.9}
              intensity={2.3}
              color="#fff4e8"
              castShadow
              shadow-mapSize-width={2048}
              shadow-mapSize-height={2048}
            />
            <directionalLight position={[-3.5, 2.8, -3.5]} intensity={0.5} color="#cfe5ff" />
            <pointLight position={[0, 1.6, 4.2]} intensity={0.35} color="#ffffff" />
            <Environment preset="warehouse" environmentIntensity={0.55} />

            <group rotation={[0.04, 0.12, 0]}>
              <GLBModel modelPath={modelPath} />
            </group>

            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.08, 0]}>
              <circleGeometry args={[2.45, 48]} />
              <meshBasicMaterial color="#ffffff" transparent opacity={0.75} />
            </mesh>

            <ContactShadows position={[0, -2.05, 0]} opacity={0.42} blur={2.8} scale={8.5} far={5.2} color="#000000" />

            <OrbitControls
              enablePan={false}
              enableDamping
              dampingFactor={0.07}
              minDistance={4.8}
              maxDistance={7.2}
              minPolarAngle={Math.PI / 2.3}
              maxPolarAngle={Math.PI / 1.8}
              autoRotate={autoRotate}
              autoRotateSpeed={1.15}
            />
          </Canvas>
        </Suspense>
      </div>
    </ViewerErrorBoundary>
  );
}
