import { useEffect, useRef, useState, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Float, Stars, PerspectiveCamera, Environment, ContactShadows, Decal, useTexture, RoundedBox } from '@react-three/drei';
import * as THREE from 'three';

function Rig() {
  const { camera, mouse } = useThree();
  const vec = new THREE.Vector3();

  return useFrame(() => {
    camera.position.lerp(vec.set(mouse.x * 2, mouse.y * 1, 5), 0.05);
    camera.lookAt(0, 0, 0);
  });
}

function MemeWithTexture() {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHover] = useState(false);
  
  // Use a data URL for the texture to ensure it always loads
  const textureUrl = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTEyIiBoZWlnaHQ9IjUxMiIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZWM0ODk5Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtc2l6ZT0iODAiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiIgZm9udC13ZWlnaHQ9ImJvbGQiPk1FTUU8L3RleHQ+PC9zdmc+';
  const texture = useTexture(textureUrl);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.5;
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.1;
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
      <RoundedBox
        ref={meshRef}
        args={[2.5, 3.5, 0.5]}
        radius={0.1}
        smoothness={4}
        scale={hovered ? 1.1 : 1}
        onPointerOver={() => setHover(true)}
        onPointerOut={() => setHover(false)}
      >
        <meshStandardMaterial color="#ffffff" metalness={0.2} roughness={0.3} />
        <Decal
          position={[0, 0, 0.26]}
          rotation={[0, 0, 0]}
          scale={[2.2, 3.2, 1]}
        >
          <meshBasicMaterial map={texture} polygonOffset polygonOffsetFactor={-1} />
        </Decal>
      </RoundedBox>
    </Float>
  );
}

function MemeObject() {
  return (
    <Suspense fallback={
      <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
        <RoundedBox args={[2.5, 3.5, 0.5]} radius={0.1}>
          <meshStandardMaterial color="#ffffff" />
        </RoundedBox>
      </Float>
    }>
       <MemeWithTexture />
    </Suspense>
  );
}

function Particles({ count = 100 }) {
  const mesh = useRef<THREE.InstancedMesh>(null);
  const light = useRef<THREE.PointLight>(null);
  const { viewport, mouse } = useThree();

  const dummy = new THREE.Object3D();
  const particles = useRef<any[]>([]);

  if (particles.current.length === 0) {
    for (let i = 0; i < count; i++) {
      const t = Math.random() * 100;
      const factor = 20 + Math.random() * 100;
      const speed = 0.01 + Math.random() / 200;
      const xFactor = -50 + Math.random() * 100;
      const yFactor = -50 + Math.random() * 100;
      const zFactor = -50 + Math.random() * 100;
      particles.current.push({ t, factor, speed, xFactor, yFactor, zFactor, mx: 0, my: 0 });
    }
  }

  useFrame((_state) => {
    particles.current.forEach((particle, i) => {
      let { t, factor, speed, xFactor, yFactor, zFactor } = particle;
      t = particle.t += speed / 2;
      const a = Math.cos(t) + Math.sin(t * 1) / 10;
      const b = Math.sin(t) + Math.cos(t * 2) / 10;
      const s = Math.cos(t);
      particle.mx += (mouse.x * viewport.width - particle.mx) * 0.01;
      particle.my += (mouse.y * viewport.height - particle.my) * 0.01;
      dummy.position.set(
        (particle.mx / 10) * a + xFactor + Math.cos((t / 10) * factor) + (viewport.width / 2) * a,
        (particle.my / 10) * b + yFactor + Math.sin((t / 10) * factor) + (viewport.height / 2) * b,
        (particle.my / 10) * b + zFactor + Math.cos((t / 10) * factor) + (viewport.height / 2) * b
      );
      dummy.scale.set(s, s, s);
      dummy.rotation.set(s * 5, s * 5, s * 5);
      dummy.updateMatrix();
      mesh.current?.setMatrixAt(i, dummy.matrix);
    });
    if (mesh.current) mesh.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <>
      <pointLight ref={light} distance={40} intensity={8} color="lightblue" />
      <instancedMesh ref={mesh} args={[undefined, undefined, count]}>
        <dodecahedronGeometry args={[0.2, 0]} />
        <meshStandardMaterial color="#06b6d4" roughness={0} />
      </instancedMesh>
    </>
  );
}

interface Hero3DProps {
  onReadyChange?: (ready: boolean) => void;
}

export default function Hero3D({ onReadyChange }: Hero3DProps) {
  const [supportsWebgl, setSupportsWebgl] = useState(true);
  const [isSceneReady, setIsSceneReady] = useState(false);

  useEffect(() => {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('webgl') || canvas.getContext('webgl2');
    const supported = Boolean(context);
    setSupportsWebgl(supported);
    if (!supported) {
      onReadyChange?.(false);
    }
  }, [onReadyChange]);

  return (
    <div className="absolute inset-0 z-0">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,#ec4899_0%,#111827_45%,#000000_100%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.08),transparent_40%,rgba(6,182,212,0.25)_100%)]" />
      <div className="absolute inset-0 flex items-center justify-center p-8">
        <div className="w-full max-w-sm border-4 border-white/80 bg-black/35 p-4 backdrop-blur-sm shadow-[0_0_40px_rgba(236,72,153,0.35)]">
          <div className="border-4 border-white bg-white p-3 shadow-[8px_8px_0_0_rgba(0,0,0,1)]">
            <div className="aspect-[4/5] overflow-hidden border-4 border-black bg-yellow-300">
              <img
                src="https://picsum.photos/seed/brainrot-hero-fallback/900/1200"
                alt="Poster Brainrot Labs"
                className="h-full w-full object-cover mix-blend-multiply"
              />
            </div>
          </div>
        </div>
      </div>

      {supportsWebgl && (
        <Canvas
          dpr={[1, 2]}
          gl={{ antialias: true, alpha: true }}
          onCreated={() => {
            setIsSceneReady(true);
            onReadyChange?.(true);
          }}
        >
          <PerspectiveCamera makeDefault position={[0, 0, 5]} fov={45} />
          <ambientLight intensity={0.8} />
          <spotLight position={[10, 10, 10]} angle={0.25} penumbra={1} intensity={1.4} />
          <pointLight position={[-10, -10, -10]} color="#06b6d4" intensity={2.5} />
          
          <Stars radius={100} depth={50} count={2200} factor={4} saturation={0} fade speed={1} />
          
          <MemeObject />
          <Particles count={40} />
          
          <Rig />
          
          <Environment preset="city" />
          <ContactShadows position={[0, -2.5, 0]} opacity={0.45} scale={20} blur={1.5} far={10} />
        </Canvas>
      )}

      {!isSceneReady && supportsWebgl && (
        <div className="absolute inset-x-6 bottom-6 z-20 border-4 border-black bg-white/95 p-3 text-center shadow-[8px_8px_0_0_rgba(0,0,0,1)]">
          <p className="font-mono text-xs font-black uppercase tracking-[0.2em] text-black">
            Booting 3D meme reactor...
          </p>
        </div>
      )}
    </div>
  );
}
