import { useState, useRef, useCallback, useEffect } from 'react';

export interface BadgeInfo {
  id: string;
  name: string;
  icon: string;
  description: string;
}

export interface GamificationState {
  xp: number;
  level: number;
  xpToNextLevel: number;
  showXP: boolean;
  showLevelUp: boolean;
  showBadge: boolean;
  pendingBadge: BadgeInfo | null;
  levelUpLevel: number;
}

const INITIAL_STATE: GamificationState = {
  xp: 0,
  level: 1,
  xpToNextLevel: 0,
  showXP: false,
  showLevelUp: false,
  showBadge: false,
  pendingBadge: null,
  levelUpLevel: 0,
};

export function useGamification() {
  const [state, setState] = useState<GamificationState>(INITIAL_STATE);
  const lastKnownLevel = useRef<number>(0);
  const xpTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (xpTimerRef.current) clearTimeout(xpTimerRef.current);
    };
  }, []);

  const onXPUpdate = useCallback(
    (xp: number, level: number, xpToNextLevel: number, badge?: BadgeInfo) => {
      const levelChanged =
        lastKnownLevel.current > 0 && level > lastKnownLevel.current;
      lastKnownLevel.current = level;

      setState(prev => ({
        ...prev,
        xp,
        level,
        xpToNextLevel,
        showXP: true,
        showLevelUp: levelChanged,
        showBadge: !levelChanged && !!badge,
        pendingBadge: badge ?? null,
        levelUpLevel: levelChanged ? level : prev.levelUpLevel,
      }));

      if (xpTimerRef.current) clearTimeout(xpTimerRef.current);
      xpTimerRef.current = setTimeout(() => {
        setState(prev => ({ ...prev, showXP: false }));
      }, 3000);
    },
    [],
  );

  const dismissXP = useCallback(() => {
    if (xpTimerRef.current) clearTimeout(xpTimerRef.current);
    setState(prev => ({ ...prev, showXP: false }));
  }, []);

  const dismissLevelUp = useCallback(() => {
    setState(prev => ({
      ...prev,
      showLevelUp: false,
      showBadge: !!prev.pendingBadge,
    }));
  }, []);

  const dismissBadge = useCallback(() => {
    setState(prev => ({ ...prev, showBadge: false, pendingBadge: null }));
  }, []);

  return {
    ...state,
    onXPUpdate,
    dismissXP,
    dismissLevelUp,
    dismissBadge,
  };
}
