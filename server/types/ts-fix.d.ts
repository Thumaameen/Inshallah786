
declare module '*.js' {
  const content: any;
  export default content;
  export = content;
}

declare module 'express' {
  export interface Request {
    user?: any;
    session?: any;
    body: any;
  }
  export interface Response {
    locals?: any;
  }
}

declare module 'node:*' {
  const content: any;
  export = content;
}

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      [key: string]: string | undefined;
    }
    interface Global {
      gc?: () => void;
    }
  }
  
  var gc: (() => void) | undefined;
}

// Fix for common module imports
declare module 'compression' {
  import { RequestHandler } from 'express';
  function compression(options?: any): RequestHandler;
  export = compression;
}

declare module 'helmet' {
  import { RequestHandler } from 'express';
  function helmet(options?: any): RequestHandler;
  export = helmet;
}

declare module 'cors' {
  import { RequestHandler } from 'express';
  function cors(options?: any): RequestHandler;
  export = cors;
}

declare module 'express-rate-limit' {
  import { RequestHandler } from 'express';
  export function rateLimit(options?: any): RequestHandler;
}

// Fix for storage imports
declare module '*/storage' {
  export const storage: any;
  export default storage;
}

// Fix for any missing type definitions
declare module '*' {
  const content: any;
  export = content;
}

export {};
