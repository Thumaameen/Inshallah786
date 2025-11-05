declare module 'express' {
    import { Request as ExpressRequest, Response as ExpressResponse } from 'express-serve-static-core';
    
    export interface Request extends ExpressRequest {
        body: any;
    }
    
    export interface Response extends ExpressResponse {
        json: (body: any) => void;
        status: (code: number) => Response;
    }
    
    export interface Router {
        get: (path: string, handler: (req: Request, res: Response) => void) => void;
        post: (path: string, handler: (req: Request, res: Response) => void) => void;
    }
    
    export function Router(): Router;
}