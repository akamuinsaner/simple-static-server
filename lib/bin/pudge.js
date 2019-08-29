"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const program = require("commander");
const path = require("path");
const index_1 = require("../server/index");
const pkg = require(path.join(process.cwd(), 'package.json'));
program.version(pkg.version);
program
    .command('start')
    .description('start pudge server')
    .action(() => {
    const server = new index_1.default();
    server.start();
});
program.parse(process.argv);
