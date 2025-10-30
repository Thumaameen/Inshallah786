
declare module '*.js' {
  const content: any;
  export default content;
}

declare module 'express' {
  export interface Request {
    user?: any;
    session?: any;
  }
}

declare module 'node:*' {
  export * from '*';
}

// Fix for path module
declare module 'path' {
  export * from 'node:path';
  export default path;
}
