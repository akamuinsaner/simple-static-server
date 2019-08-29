import * as program from 'commander';
import * as path from 'path';
import PudgeServer from '../server/index';

const pkg = require(path.join(process.cwd(), 'package.json'));

program.version(pkg.version);

program
    .command('start')
    .description('start pudge server')
    .action(() => {
        const server = new PudgeServer();
        server.start();
    });

program.parse(process.argv);

