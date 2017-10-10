#! /usr/bin/env node

import * as program from 'commander';
import * as fs from 'fs';
import * as path from 'path';
import * as inquirer from 'inquirer';
import * as chalk from 'chalk';
import { SourceProvider, Set, Promise, CardsOptions, SetsOptions } from './';

declare interface UpdateOptions {
    agent: string;
    out?: string;
    debug: boolean;
}

declare interface InstallOptions extends UpdateOptions {
    rate: number;
    connections: number;
    retries: number;
    lang: string;
}

const UserAgent =
    'Mozilla/5.0 (Windows; U; Windows NT 5.1; de; rv:1.9.2.3) Gecko/20100401 Firefox/3.6.3 (FM Scene 4.6.1)';

program.version('1.0');

program
    .command('sources')
    .description('show available sources')
    .action(sources);

program
    .command('update <source>')
    .description('update set list from target source')
    .option('-o, --out <file>', 'output file path')
    .option('-d, --debug', 'show error messages')
    .option('--agent <useragent>', 'useragent', UserAgent)
    .action(update);

program
    .command('install <source> <code>')
    .description('install set data from the specified source')
    .option('-o, --out <file>', 'output file path')
    .option('-l, --lang <language>', 'language', 'en')
    .option('-d, --debug', 'show error messages')
    .option('--agent <useragent>', 'useragent', UserAgent)
    .option('--rate <limit>', 'retry rate limit', 0)
    .option('--connections <max>', 'max connections', 10)
    .option('--retry <times>', 'retries count', 3)
    .action(install);

program
    .command('formats')
    .description('show available formats')
    .action(formats);

program
    .command('langs')
    .description('show available languages')
    .action(languages);

program
    .command('convert <source> <format> <code>')
    .description('convert set data to the specefied format')
    .action(convert);

program.parse(process.argv);

function sources(): void {
    const dir = path.join(__dirname, 'sources');
    fs
        .readdirSync(dir)
        .filter(f => /.js$/.test(f))
        .map(f => path.basename(f, '.js'))
        .forEach(name => console.log(name));
}

function update(source: string, options: UpdateOptions): void {
    const src = path.join(__dirname, 'sources', `${source}.js`);
    if (!fs.existsSync(src)) {
        throw new Error(
            'Invalid source. Please run [magic list:sources] to check available sources'
        );
    }
    const Provider = require(src);
    const provider: SourceProvider = new Provider();
    const opts: SetsOptions = { userAgent: options.agent };

    if (options.debug) {
        opts.logger = {
            log(level, ...args: any[]) {
                switch (level) {
                case 'warn':
                    console.warn(chalk.yellow(...args));
                    break;
                case 'error':
                case 'critical':
                    console.error(chalk.red(...args));
                    break;
                case 'info':
                    console.error(chalk.green(...args));
                    break;
                default:
                    console.debug(...args);
                    break;
                }
            }
        };
    }

    provider.getSets(opts).then(sets => {
        let file = options.out || `${source}.db.json`;
        if (!path.isAbsolute(file)) {
            file = path.join(process.cwd(), file);
        }
        if (sets && sets.length) {
            fs.truncate(file, 0, () => {
                fs.writeFileSync(file, JSON.stringify(sets));
            });
        }
    });
}

function install(source: string, code: string, options: InstallOptions): void {
    const src = path.join(__dirname, 'sources', `${source}.js`);
    if (!fs.existsSync(src)) {
        throw new Error(
            'Invalid source. Please run [magic list:sources] to check available sources'
        );
    }
    const Provider = require(src);
    const provider: SourceProvider = new Provider();
    const set = { code, lang: options.lang };
    const opts: CardsOptions = {
        set,
        rateLimit: options.rate,
        maxConnections: options.connections,
        userAgent: options.agent,
        retries: options.retries,
        tasks: [],
        total: 0
    };
    if (options.debug) {
        opts.logger = {
            log(level, ...args: any[]) {
                switch (level) {
                case 'warn':
                    console.warn(chalk.yellow(...args));
                    break;
                case 'error':
                case 'critical':
                    console.error(chalk.red(...args));
                    break;
                case 'info':
                    console.error(chalk.green(...args));
                    break;
                default:
                    console.debug(...args);
                    break;
                }
            }
        };
    }

    const ui = new inquirer.ui.BottomBar();
    const frames = ['-', '\\', '|', '/', '-'];
    let index = 0;
    const refresh = () => {
        index++;
        if (index >= frames.length) {
            index = 0;
        }
        const per =
            opts.total > 0
                ? Math.floor(opts.tasks.length / opts.total * 100)
                : 0;
        const success = opts.tasks.filter(t => t === 1).length;
        const failed = opts.tasks.filter(t => t === -1).length;
        ui.updateBottomBar(
            `${frames[index]}\t${opts.total}:${chalk.green(
                String(success)
            )}+${chalk.red(String(failed))}\t(${per}%)`
        );
    };
    const update = setInterval(refresh, 100);

    provider
        .getCards(opts)
        .then(cards => {
            let file = options.out || `${set.code}.${set.lang}.db.json`;
            if (!path.isAbsolute(file)) {
                file = path.join(process.cwd(), file);
            }
            if (cards && cards.length) {
                fs.truncate(file, 0, () => {
                    fs.writeFileSync(file, JSON.stringify(cards));
                });
            }
        })
        .finally(() => {
            clearInterval(update);
            refresh();
            ui.close();
        });
}

function formats() {}

function convert() {}

function languages() {}
