import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { MotionValue, useMotionValue, useReducedMotion, useSpring } from 'framer-motion';

export type CursorVariant = 'default' | 'link' | 'input' | 'image' | 'drag';

export interface CursorConfig {
  ringSize?: number;
  ringScale?: number;
  ringHoverScale?: number;
  ringImageScale?: number;
  ringDragScale?: number;
  ringInputScale?: number;
  pressedScale?: number;
  color?: string;
  outlineColor?: string;
  blendMode?: string;
  springConfig?: {
    stiffness?: number;
    damping?: number;
    mass?: number;
  };
  subtleOpacity?: number;
}

export interface CursorController {
  isEnabled: boolean;
  variant: CursorVariant;
  label: string;
  cursorX: MotionValue<number>;
  cursorY: MotionValue<number>;
  ringX: MotionValue<number>;
  ringY: MotionValue<number>;
  ringScale: MotionValue<number>;
  config: Required<CursorConfig>;
  setVariant: (variant: CursorVariant) => void;
}

const CursorContext = createContext<CursorController | null>(null);

function assertCursorContext(context: CursorController | null): CursorController {
  if (!context) {
    throw new Error('useCursorState must be used within a CursorProvider');
  }
  return context;
}

export function useCursorState(): CursorController {
  return assertCursorContext(useContext(CursorContext));
}

export function useCursorVariant(): CursorVariant {
  return useCursorState().variant;
}

const defaultConfig: Required<CursorConfig> = {
  // increased defaults for a more prominent cursor
  ringSize: 36,
  ringScale: 1,
  ringHoverScale: 1.14,
  ringImageScale: 1.38,
  ringDragScale: 1.38,
  ringInputScale: 0.92,
  pressedScale: 0.88,
  color: '#ffffff',
  outlineColor: '#ffffff',
  blendMode: 'difference',
  subtleOpacity: 0.72,
  springConfig: {
    // reduced lag while keeping a smooth premium motion
    stiffness: 520,
    damping: 42,
    mass: 0.82,
  },
};

const linkSelectors = 'a, button, [role="button"], input[type="submit"], input[type="button"], [data-cursor="link"]';
const inputSelectors = 'input, textarea, select, [contenteditable="true"]';
const imageSelectors = 'img, [data-cursor="image"]';
const dragSelectors = '[draggable], [data-cursor="drag"], .drag-handle, [data-cursor="drag-area"]';

function getVariantFromTarget(target: HTMLElement | null): CursorVariant {
  if (!target) {
    return 'default';
  }

  if (target.closest(imageSelectors)) {
    return 'image';
  }

  if (target.closest(dragSelectors)) {
    return 'drag';
  }

  if (target.closest(inputSelectors)) {
    return 'input';
  }

  if (target.closest(linkSelectors)) {
    return 'link';
  }

  return 'default';
}

function getVariantLabel(variant: CursorVariant): string {
  if (variant === 'image') return 'View';
  if (variant === 'drag') return 'Drag';
  return '';
}

function getVariantScale(variant: CursorVariant, config: Required<CursorConfig>) {
  switch (variant) {
    case 'image':
      return config.ringImageScale;
    case 'drag':
      return config.ringDragScale;
    case 'input':
      return config.ringInputScale;
    case 'link':
      return config.ringHoverScale;
    default:
      return config.ringScale;
  }
}

export function useCursorController(config?: CursorConfig): CursorController {
  const mergedConfig = useMemo(
    () => ({
      ...defaultConfig,
      ...config,
      springConfig: {
        ...defaultConfig.springConfig,
        ...(config?.springConfig ?? {}),
      },
    }),
    [config]
  );

  const prefersReducedMotion = useReducedMotion();
  const [isEnabled, setIsEnabled] = useState(false);
  const [variant, setVariantState] = useState<CursorVariant>('default');
  const [label, setLabel] = useState('');
  const variantRef = useRef<CursorVariant>('default');
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);
  const baseRingScale = useMotionValue(mergedConfig.ringScale);
  const ringX = useSpring(cursorX, mergedConfig.springConfig);
  const ringY = useSpring(cursorY, mergedConfig.springConfig);
  const ringScale = useSpring(baseRingScale, mergedConfig.springConfig);

  const setVariant = (nextVariant: CursorVariant) => {
    variantRef.current = nextVariant;
    setVariantState(nextVariant);
    setLabel(getVariantLabel(nextVariant));
    baseRingScale.set(getVariantScale(nextVariant, mergedConfig));
  };

  useEffect(() => {
    if (prefersReducedMotion) {
      setIsEnabled(false);
      return;
    }

    if (typeof window === 'undefined') {
      return;
    }

    const mediaQuery = window.matchMedia('(pointer: fine)');
    const updateEnabled = () => setIsEnabled(mediaQuery.matches);

    updateEnabled();
    mediaQuery.addEventListener('change', updateEnabled);
    return () => {
      mediaQuery.removeEventListener('change', updateEnabled);
    };
  }, [prefersReducedMotion]);

  useEffect(() => {
    if (!isEnabled) {
      document.body.classList.remove('has-custom-cursor');
      return;
    }

    document.body.classList.add('has-custom-cursor');
    return () => {
      document.body.classList.remove('has-custom-cursor');
    };
  }, [isEnabled]);

  useEffect(() => {
    if (!isEnabled) {
      return;
    }

    const handlePointerMove = (event: PointerEvent) => {
      cursorX.set(event.clientX);
      cursorY.set(event.clientY);

      const nextVariant = getVariantFromTarget(event.target as HTMLElement | null);
      if (nextVariant !== variantRef.current) {
        setVariant(nextVariant);
      }
    };

    const handlePointerDown = () => {
      const activeScale = getVariantScale(variantRef.current, mergedConfig) * mergedConfig.pressedScale;
      baseRingScale.set(activeScale);
    };

    const handlePointerUp = () => {
      baseRingScale.set(getVariantScale(variantRef.current, mergedConfig));
    };

    document.addEventListener('pointermove', handlePointerMove);
    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('pointerup', handlePointerUp);

    return () => {
      document.removeEventListener('pointermove', handlePointerMove);
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('pointerup', handlePointerUp);
    };
  }, [isEnabled, mergedConfig, cursorX, cursorY, baseRingScale]);

  useEffect(() => {
    if (!isEnabled) {
      return;
    }

    setVariant('default');
  }, [isEnabled]);

  return {
    isEnabled,
    variant,
    label,
    cursorX,
    cursorY,
    ringX,
    ringY,
    ringScale,
    config: mergedConfig,
    setVariant,
  };
}

interface CursorProviderProps {
  children: ReactNode;
  config?: CursorConfig;
}

export function CursorProvider({ children, config }: CursorProviderProps) {
  const controller = useCursorController(config);
  return <CursorContext.Provider value={controller}>{children}</CursorContext.Provider>;
}
