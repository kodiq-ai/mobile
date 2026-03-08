import { useCallback, useState } from 'react';

export function useConfetti() {
  const [visible, setVisible] = useState(false);
  const trigger = useCallback(() => setVisible(true), []);
  const onComplete = useCallback(() => setVisible(false), []);
  return { visible, trigger, onComplete };
}
