// Production-ready logger
export const logger = {
  info: (...args: any[]) => console.log(...args),
  warn: (...args: any[]) => console.warn(...args),
  error: (...args: any[]) => console.error(...args),
  debug: (...args: any[]) => console.log('[DEBUG]', ...args),
  log: (...args: any[]) => console.log(...args),
};

export default logger;
