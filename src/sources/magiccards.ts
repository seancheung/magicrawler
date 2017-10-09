import SourceProvider from '../SourceProvider';
import * as Promise from 'bluebird';
import Set from '../Set';
import Card from '../Card';
import Crawler = require('crawler');

export = class Magiccards implements SourceProvider {

    url: string = 'http://magiccards.info';
    map: string = '/sitemap.html';

    getSets(options: any): Promise<Set[]> {
        return new Promise((resolve, reject) => {
            const crawler = new Crawler(options);
            crawler.queue({
                uri: this.url + this.map,
                callback: (err, res, done) => {
                    if (err) {
                        reject(err);
                    } else {
                        const $ = res.$;
                        const sets: Set[] = [];
                        $('table:not([id])>tr').each(function() {
                            $('tr>td', this).each(function() {
                                const section = $('h3', this).text();
                                $('ul>li', this).each(function() {
                                    const block = $(this)
                                        .contents()
                                        .not($(this).children())
                                        .text();
                                    $('ul>li', this).each(function() {
                                        const name = $('a', this).text();
                                        const href = $('a', this).attr('href');
                                        const code = $('small', this).text();
                                        const match = /[^\./]+(?=\.html$)/.exec(
                                            href
                                        );
                                        const lang = (match && match[0]) || '';
                                        sets.push(
                                            new Set({
                                                section,
                                                block,
                                                url: href,
                                                lang,
                                                name,
                                                code
                                            })
                                        );
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
    getCards(set: Set, options: any): Promise<Card[]> {
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
                    } else {
                        const $ = res.$;
                        const cards: Card[] = [];
                        $('tr.odd, tr.even').each(function() {
                            const card = new Card();
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
                                    card.id = url.parse(
                                        link,
                                        true
                                    ).query.multiverseid;
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
