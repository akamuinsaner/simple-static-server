"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const http = require("http");
const path = require("path");
const fs = require("fs");
const url = require("url");
const zlib = require("zlib");
const mime_1 = require("./mime");
class Server {
    constructor() {
        this.port = 3456;
        this.root = path.resolve(process.cwd());
        this.indexPage = 'index.html';
        this.enableCacheControl = true;
        this.enableExpires = true;
        this.enableETag = true;
        this.enableLastModified = true;
        this.maxAge = 100;
        this.zipMatch = new RegExp("^\\.(css|js|html)$");
    }
    respondNotFound(req, res) {
        res.writeHead(404, {
            'Content-Type': 'text/html'
        });
        res.end(`<h1>Not Found</h1><p>The requested URL ${req.url} was not found on this server.</p>`);
    }
    compressHandler(readStream, req, res) {
        const acceptEncoding = req.headers['accept-encoding'];
        if (!acceptEncoding || !acceptEncoding.match(/\b(gzip|deflate)\b/)) {
            return readStream;
        }
        else if (acceptEncoding.match(/\bgzip\b/)) {
            res.setHeader('Content-Encoding', 'gzip');
            return readStream.pipe(zlib.createGzip());
        }
        else if (acceptEncoding.match(/\bdeflate\b/)) {
            res.setHeader('Content-Encoding', 'deflate');
            return readStream.pipe(zlib.createDeflate());
        }
    }
    respondFile(pathName, req, res) {
        const readStream = this.compressHandler(fs.createReadStream(pathName), req, res);
        res.setHeader('Content-Type', mime_1.default.lookup(pathName));
        readStream.pipe(res);
    }
    generateETag(stat) {
        const mtime = stat.mtime.getTime().toString(16);
        const size = stat.size.toString(16);
        return `W/"${size}-${mtime}"`;
    }
    setFreshHeaders(stat, res) {
        const lastModified = stat.mtime.toUTCString();
        if (this.enableExpires) {
            const expireTime = (new Date(Date.now() + this.maxAge * 1000)).toUTCString();
            res.setHeader('Expires', expireTime);
        }
        if (this.enableCacheControl) {
            res.setHeader('Cache-Control', `public, max-age=${this.maxAge}`);
        }
        if (this.enableLastModified) {
            res.setHeader('Last-Modified', lastModified);
        }
        if (this.enableETag) {
            res.setHeader('ETag', this.generateETag(stat));
        }
    }
    isFresh(reqHeaders, resHeaders) {
        const noneMatch = reqHeaders['if-none-match'];
        const lastModified = reqHeaders['if-modified-since'];
        if (!(noneMatch || lastModified))
            return false;
        if (noneMatch && (noneMatch !== resHeaders['etag']))
            return false;
        if (lastModified && lastModified !== resHeaders['last-modified'])
            return false;
        return true;
    }
    respondDirectory(pathName, req, res) {
        const indexPagePath = path.join(pathName, this.indexPage);
        if (fs.existsSync(indexPagePath)) {
            this.respondFile(indexPagePath, req, res);
        }
        else {
            fs.readdir(pathName, (err, files) => {
                if (err) {
                    res.writeHead(500);
                    return res.end(err);
                }
                const requestPath = url.parse(req.url).pathname;
                let content = `<h1>Index of ${requestPath}</h1>`;
                files.forEach(file => {
                    let itemLink = path.join(requestPath, file);
                    const stat = fs.statSync(path.join(pathName, file));
                    if (stat && stat.isDirectory()) {
                        itemLink = path.join(itemLink, '/');
                    }
                    content += `<p><a href='${itemLink}'>${file}</a></p>`;
                });
                res.writeHead(200, {
                    'Content-Type': 'text/html'
                });
                res.end(content);
            });
        }
    }
    respondRedirect(req, res) {
        const location = req.url + '/';
        res.writeHead(301, {
            'Location': location,
            'Content-Type': 'text/html'
        });
        res.end(`Redirecting to <a href='${location}'>${location}</a>`);
    }
    hasTrailingSlash(path) {
        return path.endsWith('/');
    }
    responseNotModified(res) {
        res.writeHead(304);
        res.end('');
    }
    routeHandler(pathName, req, res) {
        fs.stat(pathName, (err, stat) => {
            if (!err) {
                const requestedPath = url.parse(req.url).pathname;
                if (this.hasTrailingSlash(requestedPath) && stat.isDirectory()) {
                    this.respondDirectory(pathName, req, res);
                }
                else if (stat.isDirectory()) {
                    this.respondRedirect(req, res);
                }
                else {
                    this.setFreshHeaders(stat, res);
                    if (this.isFresh(req.headers, res._headers)) {
                        this.responseNotModified(res);
                    }
                    else {
                        this.respondFile(pathName, req, res);
                    }
                }
            }
            else {
                this.respondNotFound(req, res);
            }
        });
    }
    start() {
        http.createServer((req, res) => {
            const pathName = path.join(this.root, path.normalize(req.url));
            this.routeHandler(pathName, req, res);
        }).listen(this.port);
    }
}
exports.default = Server;
