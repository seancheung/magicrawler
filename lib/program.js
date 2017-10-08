#! /usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const program = require("commander");
const fs = require("fs");
const path = require("path");
const Blurbird = require("bluebird");
const UserAgent = 'Mozilla/5.0 (Windows; U; Windows NT 5.1; de; rv:1.9.2.3) Gecko/20100401 Firefox/3.6.3 (FM Scene 4.6.1)';
program.version('1.0');
program
    .command('list:sources')
    .description('show available sources')
    .action(sources);
program
    .command('update <source>')
    .description('update sets list from target source')
    .option('--agent <useragent>', 'useragent', UserAgent)
    .action(update);
program
    .command('install <source> <codes>')
    .description('install target set data from the specified source')
    .option('-l, --lang <language>', 'language', 'en')
    .option('--agent <useragent>', 'useragent', UserAgent)
    .option('--rate <limit>', 'retry rate limit', 0)
    .option('--connections <max>', 'max connections', 10)
    .option('--retry <times>', 'retries count', 3)
    .action(install);
program.parse(process.argv);
function sources() {
    const dir = path.join(__dirname, 'sources');
    fs
        .readdirSync(dir)
        .filter(f => /.js$/.test(f))
        .map(f => path.basename(f, '.js'))
        .forEach(name => console.log(name));
}
function update(source, options) {
    const src = path.join(__dirname, 'sources', `${source}.js`);
    if (!fs.existsSync(src)) {
        throw new Error('Invalid source. Please run [magic list:sources] to check available sources');
    }
    const Provider = require(src);
    const provider = new Provider();
    provider.getSets({ userAgent: options.agent }).then(sets => {
        const file = path.join(process.cwd(), `${source}.db.json`);
        if (sets && sets.length) {
            fs.truncate(file, 0, () => {
                fs.writeFileSync(file, JSON.stringify(sets));
            });
        }
    });
}
function install(source, codes, options) {
    const src = path.join(__dirname, 'sources', `${source}.js`);
    if (!fs.existsSync(src)) {
        throw new Error('Invalid source. Please run [magic list:sources] to check available sources');
    }
    const Provider = require(src);
    const provider = new Provider();
    const dbfile = path.join(process.cwd(), `${source}.db.json`);
    if (!fs.existsSync(dbfile)) {
        throw new Error('No sets db found. Please run [magic update] first');
    }
    const database = require(dbfile);
    const sets = [];
    codes.split(',').forEach(code => {
        const set = database.find(set => set.code === code && set.lang === options.lang);
        if (!set) {
            console.warn(`cannot find ${code}@${options.lang} from database`);
        }
        else {
            sets.push(set);
        }
    });
    Blurbird.mapSeries(sets, set => provider
        .getCards(set, {
        rateLimit: options.rate,
        maxConnections: options.connections,
        userAgent: options.agent,
        retries: options.retries
    })
        .then(cards => {
        const file = path.join(process.cwd(), `${set.code}.${set.lang}.db.json`);
        if (cards && cards.length) {
            fs.truncate(file, 0, () => {
                fs.writeFileSync(file, JSON.stringify(cards));
            });
        }
    }));
}
//# sourceMappingURL=program.js.map