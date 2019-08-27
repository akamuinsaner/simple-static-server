import * as http from 'http';
import * as path from 'path';
import * as fs from 'fs';
import * as url from 'url';
import mime from './mime';

class Server {
    constructor() {
        this.port = 3456;
        this.root = path.resolve(process.cwd());
        this.indexPage = 'index.html';
    }

    port: number;
    root: string;
    indexPage: string;

    respondNotFound(req, res) {
        res.writeHead(404, {
            'Content-Type': 'text/html'
        });
        res.end(`<h1>Not Found</h1><p>The requested URL ${req.url} was not found on this server.</p>`);
    }

    respondFile(pathName, req, res) {
        const readStream = fs.createReadStream(pathName);
        res.setHeader('Content-Type', mime.lookup(pathName));
        readStream.pipe(res);
    }

    respondDirectory(pathName, req, res) {
        const indexPagePath = path.join(pathName, this.indexPage);
        if (fs.existsSync(indexPagePath)) {
            this.respondFile(indexPagePath, req, res);
        } else {
            fs.readdir(pathName, (err, files) => {
                if (err) {
                    res.writeHead(500);
                    return res.end(err);
                }
                const requestPath = url.parse(req.url).pathname;
                let content = `<h1>Index of ${requestPath}</h1>`;
                files.forEach(file => {
                    let itemLink = path.join(requestPath,file);
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

    hasTrailingSlash(path: string) {
        return path.endsWith('/');
    }

    routeHandler(pathName, req, res) {
        fs.stat(pathName, (err, stat) => {
            console.log(pathName)
            if (!err) {
                const requestedPath = url.parse(req.url).pathname;
                if (this.hasTrailingSlash(requestedPath) && stat.isDirectory()) {
                    this.respondDirectory(pathName, req, res);
                } else if (stat.isDirectory()) {
                    this.respondRedirect(req, res);
                } else {
                    this.respondFile(pathName, req, res);
                }
            } else {
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

export default Server;