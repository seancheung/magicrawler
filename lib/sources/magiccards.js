"use strict";
const Promise = require("bluebird");
const Set_1 = require("../Set");
const Card_1 = require("../Card");
const Crawler = require("crawler");
module.exports = class Magiccards {
    constructor() {
        this.url = 'http://magiccards.info';
        this.map = '/sitemap.html';
    }
    getSets(options) {
        return new Promise((resolve, reject) => {
            const crawler = new Crawler(options);
            crawler.queue({
                uri: this.url + this.map,
                callback: (err, res, done) => {
                    if (err) {
                        reject(err);
                    }
                    else {
                        const $ = res.$;
                        const sets = [];
                        $('table:not([id])>tr').each(function () {
                            $('tr>td', this).each(function () {
                                const section = $('h3', this).text();
                                $('ul>li', this).each(function () {
                                    const block = $(this)
                                        .contents()
                                        .not($(this).children())
                                        .text();
                                    $('ul>li', this).each(function () {
                                        const name = $('a', this).text();
                                        const href = $('a', this).attr('href');
                                        const code = $('small', this).text();
                                        const match = /[^\./]+(?=\.html$)/.exec(href);
                                        const lang = (match && match[0]) || '';
                                        sets.push(new Set_1.default({
                                            section,
                                            block,
                                            url: href,
                                            lang,
                                            name,
                                            code
                                        }));
                                    });
                                });
                            });
                        });
                        resolve(sets);
                    }
                    done();
                }
            });
        });
    }
    getCards(set, options) {
        const base = this.url;
        return new Promise((resolve, reject) => {
            const uri = `${this
                .url}/query?q=++e:${set.code}/${set.lang}&v=olist&s=issue`;
            const crawler = new Crawler(options);
            crawler.queue({
                uri,
                callback: (err, res, done) => {
                    if (err) {
                        reject(err);
                    }
                    else {
                        const $ = res.$;
                        const cards = [];
                        $('tr.odd, tr.even').each(function () {
                            const card = new Card_1.default();
                            let td = $(this)
                                .children('td')
                                .first();
                            card.url = $('a', td).attr('href');
                            card.name = $('a', td).text();
                            td = td.next();
                            card.type = td.text().replace(/\s{2,}/, ' ');
                            td = td.next();
                            card.cost = td.text();
                            td = td.next();
                            card.rarity = td.text();
                            td = td.next();
                            card.artist = td.text();
                            td = td.next();
                            cards.push(card);
                            crawler.queue({
                                uri: base + card.url,
                                callback: (req, res, done) => {
                                    const $ = res.$;
                                    card.text = $('p.ctext').text();
                                    card.flavor = $('p > i').text();
                                    const link = $('p.ctext')
                                        .next()
                                        .next()
                                        .next()
                                        .find('a')
                                        .attr('href');
                                    const url = require('url');
                                    card.id = url.parse(link, true).query.multiverseid;
                                    done();
                                }
                            });
                        });
                        crawler.on('drain', () => {
                            resolve(cards);
                        });
                    }
                    done();
                }
            });
        });
    }
};
//# sourceMappingURL=magiccards.js.map