"use strict";
exports.__esModule = true;
var http = require("http");
var path = require("path");
var Server = /** @class */ (function () {
    function Server() {
        this.port = 3456;
        this.root = path.resolve(process.cwd(), 'public');
        this.indexPage = 'index.html';
    }
    Server.prototype.start = function () {
        var _this = this;
        http.createServer(function (req, res) {
            var pathName = path.join(_this.root, path.normalize(req.url));
            res.writeHead(200);
            res.end("Requeste path: " + pathName);
        }).listen(this.port);
    };
    return Server;
}());
exports["default"] = Server;
