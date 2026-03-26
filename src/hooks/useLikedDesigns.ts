import { useCallback, useState } from 'react';

const STORAGE_KEY = 'brainrot_liked_designs';

function loadLiked(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return new Set<string>(raw ? (JSON.parse(raw) as string[]) : []);
  } catch {
    return new Set();
  }
}

function saveLiked(ids: Set<string>): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...ids]));
  } catch {
    // storage full or unavailable — ignore
  }
}

/**
 * Device-local like tracking. Returns the set of liked design IDs and a
 * toggle function. Persists to localStorage across page reloads.
 */
export function useLikedDesigns() {
  const [liked, setLiked] = useState<Set<string>>(loadLiked);

  const toggle = useCallback((designId: string): 'liked' | 'unliked' => {
    let action: 'liked' | 'unliked' = 'liked';
    setLiked((prev) => {
      const next = new Set(prev);
      if (next.has(designId)) {
        next.delete(designId);
        action = 'unliked';
      } else {
        next.add(designId);
        action = 'liked';
      }
      saveLiked(next);
      return next;
    });
    return action;
  }, []);

  const isLiked = useCallback((designId: string) => liked.has(designId), [liked]);

  return { liked, toggle, isLiked };
}
