// Vite replaces process.env.NODE_ENV at build time.
// Firebase Functions reads it at runtime from the Node.js environment.
const isDev: boolean = process.env.NODE_ENV !== 'production';

export const logger = {
  log: (...args: unknown[]) => {
    if (isDev) console.log(...args);
  },
  warn: (...args: unknown[]) => {
    if (isDev) console.warn(...args);
  },
  error: (...args: unknown[]) => {
    if (isDev) console.error(...args);
  },
};
