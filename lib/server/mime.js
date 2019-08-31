"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const mimeTypes = {
    "css": "text/css",
    "gif": "image/gif",
    "html": "text/html",
    "ico": "image/x-icon",
    "jpeg": "image/jpeg",
    "jpg": "image/jpg",
    "txt": "text/plain"
};
const lookup = (pathName) => {
    let ext = path.extname(pathName);
    ext = ext.split('.').pop();
    return mimeTypes[ext] || mimeTypes['txt'];
};
exports.default = {
    lookup
};
