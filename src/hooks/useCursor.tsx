import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { MotionValue, useMotionValue, useReducedMotion, useSpring } from 'framer-motion';

export type CursorVariant = 'default' | 'link' | 'input' | 'image' | 'drag';

export interface CursorConfig {
  dotSize?: number;
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
  dotScale: MotionValue<number>;
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
  dotSize: 16,
  ringSize: 36,
  ringScale: 1,
  ringHoverScale: 1.55,
  ringImageScale: 1.9,
  ringDragScale: 1.9,
  ringInputScale: 0.92,
  pressedScale: 0.78,
  color: '#ffffff',
  outlineColor: '#ffffff',
  blendMode: 'difference',
  subtleOpacity: 0.7,
  springConfig: {
    // tuned spring for a smooth, premium lag
    stiffness: 220,
    damping: 28,
    mass: 0.9,
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
  const dotScale = useMotionValue(1);
  const baseRingScale = useMotionValue(mergedConfig.ringScale);
  const ringX = useSpring(cursorX, mergedConfig.springConfig);
  const ringY = useSpring(cursorY, mergedConfig.springConfig);
  const ringScale = useSpring(baseRingScale, mergedConfig.springConfig);

  const setVariant = (nextVariant: CursorVariant) => {
    variantRef.current = nextVariant;
    setVariantState(nextVariant);
    setLabel(getVariantLabel(nextVariant));
    baseRingScale.set(getVariantScale(nextVariant, mergedConfig));
    // hide the center dot for clickable elements (links/buttons)
    if (nextVariant === 'link') {
      dotScale.set(0);
    } else {
      dotScale.set(1);
    }
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
      // only animate the dot on press if it's visible for the current variant
      if (variantRef.current !== 'link') {
        dotScale.set(mergedConfig.pressedScale);
      }
    };

    const handlePointerUp = () => {
      baseRingScale.set(getVariantScale(variantRef.current, mergedConfig));
      // restore dot only when it should be visible
      if (variantRef.current !== 'link') {
        dotScale.set(1);
      }
    };

    document.addEventListener('pointermove', handlePointerMove);
    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('pointerup', handlePointerUp);

    return () => {
      document.removeEventListener('pointermove', handlePointerMove);
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('pointerup', handlePointerUp);
    };
  }, [isEnabled, mergedConfig, cursorX, cursorY, dotScale, baseRingScale]);

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
    dotScale,
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
