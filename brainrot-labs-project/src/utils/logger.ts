// import.meta.env.DEV is set by Vite at build time (true in dev, false in prod).
const isDev: boolean = import.meta.env.DEV;

/* eslint-disable no-console */
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
/* eslint-enable no-console */
