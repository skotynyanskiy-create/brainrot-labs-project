import type { BaseProductId } from '../services/commerce/types';

type Vec3 = [number, number, number];

interface OrbitConfig {
  minDistance: number;
  maxDistance: number;
  minPolarAngle?: number;
  maxPolarAngle?: number;
}

interface ContactShadowsConfig {
  position: Vec3;
  scale: number;
  opacity: number;
  blur: number;
  far: number;
}

interface CameraConfig {
  position: Vec3;
  fov: number;
}

interface PreviewModelConfig {
  scaleTarget?: number;
  printOffsetY?: number;
}

interface ViewerModelConfig {
  groupPosition: Vec3;
  groupRotation: Vec3;
  tshirtScaleTarget?: number;
  tshirtPrintOffsetY?: number;
}

export interface Product3DConfig {
  previewCamera: CameraConfig;
  previewContactShadows: ContactShadowsConfig;
  previewOrbit: OrbitConfig;
  previewModel: PreviewModelConfig;
  viewerCamera?: CameraConfig;
  viewerContactShadows?: ContactShadowsConfig;
  viewerOrbit?: OrbitConfig;
  viewerModel?: ViewerModelConfig;
}

const DEFAULT_PREVIEW_CONFIG: Product3DConfig = {
  previewCamera: {
    position: [0, 0.1, 5.85],
    fov: 36,
  },
  previewContactShadows: {
    position: [0, -1.78, 0],
    scale: 7.4,
    opacity: 0.48,
    blur: 2.8,
    far: 5,
  },
  previewOrbit: {
    minDistance: 4,
    maxDistance: 9,
  },
  previewModel: {
    scaleTarget: 3.05,
    printOffsetY: 0.04,
  },
  viewerCamera: {
    position: [0, 0.28, 5.8],
    fov: 37,
  },
  viewerContactShadows: {
    position: [0, -1.74, 0],
    scale: 7.4,
    opacity: 0.34,
    blur: 2.8,
    far: 5.2,
  },
  viewerOrbit: {
    minDistance: 3.4,
    maxDistance: 7.4,
    minPolarAngle: Math.PI / 3,
    maxPolarAngle: Math.PI / 1.6,
  },
  viewerModel: {
    groupPosition: [0, -0.12, 0],
    groupRotation: [0.05, 0.1, 0],
    tshirtScaleTarget: 2.84,
    tshirtPrintOffsetY: 0.04,
  },
};

export const PRODUCT_3D_CONFIG: Record<BaseProductId, Product3DConfig> = {
  'base-tshirt': DEFAULT_PREVIEW_CONFIG,
  'base-phonecase': {
    ...DEFAULT_PREVIEW_CONFIG,
    previewCamera: {
      position: [0, 0, 5.5],
      fov: 45,
    },
    previewContactShadows: {
      position: [0, -2.2, 0],
      scale: 10,
      opacity: 0.48,
      blur: 2.8,
      far: 5,
    },
    previewOrbit: {
      minDistance: 3,
      maxDistance: 9,
    },
    previewModel: {
      scaleTarget: 3.05,
    },
  },
  'base-poster': {
    ...DEFAULT_PREVIEW_CONFIG,
    previewCamera: {
      position: [0, 0, 6.2],
      fov: 32,
    },
    previewContactShadows: {
      position: [0, -2.05, 0],
      scale: 8.5,
      opacity: 0.48,
      blur: 2.8,
      far: 5,
    },
    previewOrbit: {
      minDistance: 4.2,
      maxDistance: 9,
    },
    previewModel: {},
  },
};

export function getProduct3DConfig(baseProductId: BaseProductId): Product3DConfig {
  return PRODUCT_3D_CONFIG[baseProductId];
}
