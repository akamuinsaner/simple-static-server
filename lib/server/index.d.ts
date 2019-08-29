declare class Server {
    constructor();
    port: number;
    root: string;
    indexPage: string;
    enableCacheControl: boolean;
    enableExpires: boolean;
    enableETag: boolean;
    enableLastModified: boolean;
    maxAge: number;
    zipMatch: RegExp;
    respondNotFound(req: any, res: any): void;
    compressHandler(readStream: any, req: any, res: any): any;
    respondFile(pathName: any, req: any, res: any): void;
    generateETag(stat: any): string;
    setFreshHeaders(stat: any, res: any): void;
    isFresh(reqHeaders: any, resHeaders: any): boolean;
    respondDirectory(pathName: any, req: any, res: any): void;
    respondRedirect(req: any, res: any): void;
    hasTrailingSlash(path: string): boolean;
    responseNotModified(res: any): void;
    routeHandler(pathName: any, req: any, res: any): void;
    start(): void;
}
export default Server;
