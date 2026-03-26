import { useEffect } from 'react';

const EMOJIS = ['😂', '😭', '💀', '🤡', '👽', '💩', '💅', '🤌', '🍕', '🚀', '💸', '🐒', '🐸', '🗿', '🔥', '👀', '💯', '✨', '🌭', '🦍', '🦄', '🤯', '🥸', '🥴'];

export function useDynamicCursor() {
  useEffect(() => {
    const handleMouseDown = () => {
      const randomEmoji = EMOJIS[Math.floor(Math.random() * EMOJIS.length)];
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" style="font-size:24px"><text y="24">${randomEmoji}</text></svg>`;
      const cursorUrl = `url('data:image/svg+xml;utf8,${encodeURIComponent(svg)}')`;
      
      document.documentElement.style.setProperty('--cursor-default', `${cursorUrl} 0 0, auto`);
      document.documentElement.style.setProperty('--cursor-pointer', `${cursorUrl} 16 16, pointer`);
    };

    window.addEventListener('mousedown', handleMouseDown);
    return () => window.removeEventListener('mousedown', handleMouseDown);
  }, []);
}
