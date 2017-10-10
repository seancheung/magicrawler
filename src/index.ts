import * as Bluebird from 'bluebird';
import crawler = require('crawler');

export { Bluebird as Promise };

export type Level =
    | 'silly'
    | 'debug'
    | 'verbose'
    | 'info'
    | 'warn'
    | 'error'
    | 'critical';

export interface Logger {
    log(level: Level, ...args: any[]): void;
}

export interface CrawlerOptions {
    autoWindowClose?: boolean;
    forceUTF8?: boolean;
    gzip?: boolean;
    incomingEncoding?: string;
    jQuery?: boolean;
    maxConnections?: number;
    method?: string;
    priority?: number;
    priorityRange?: number;
    rateLimit?: number;
    referer?: boolean;
    retries?: number;
    retryTimeout?: number;
    timeout?: number;
    skipDuplicates?: boolean;
    rotateUA?: boolean;
    homogeneous?: boolean;
    userAgent?: string;
    logger?: Logger;
}

export interface CardsOptions extends CrawlerOptions {
    set: {
        code: string;
        lang: string;
    };
    total: number;
    tasks: number[];
}

export interface SetsOptions extends CrawlerOptions {}

export interface SourceProvider {
    getSets(options: SetsOptions): Bluebird<Set[]>;
    getCards(options: CardsOptions): Bluebird<Card[]>;
}

export class Crawler extends crawler {

    constructor(options: CrawlerOptions) {
        if (!options.logger) {
            options.logger = { log() {} };
        }
        super(options);
    }

}

export class Card {

    id: string;
    name: string;
    rarity: string;
    number: string;
    type: string;
    power: string;
    toughness: string;
    loyalty: string;
    cost: string;
    cmc: string;
    text: string;
    flavor: string;
    artist: string;
    url: string;

}

export class Set {

    section: string;
    block: string;
    name: string;
    code: string;
    lang: string;
    url: string;

}
