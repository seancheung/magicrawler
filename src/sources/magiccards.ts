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
        return new Promise((resolve, reject) => {
            const uri = `${this
                .url}/query?q=++e:${set.code}/${set.lang}&v=spoiler&s=issue`;
            const crawler = new Crawler(options);
            crawler.queue({
                uri,
                callback: (err, res, done) => {
                    if (err) {
                        reject(err);
                    } else {
                        const $ = res.$;
                        const cards: Card[] = [];
                        $('td[valign="top"]').each(function() {
                            const card = new Card();
                            card.name = $('span>a', this).text();
                            card.url = $('span>a', this).attr('href');
                            card.rarity = $('p>i', this)
                                .first()
                                .text();
                            card.type = $('p', this)
                                .eq(1)
                                .text()
                                .replace(/\s{2,}/, ' ');
                            card.text = $('p.ctext', this).text();
                            card.flavor = $('p>i', this)
                                .eq(1)
                                .text();
                            card.artist = $('p', this)
                                .last()
                                .text();
                            cards.push(card);
                        });
                        resolve(cards);
                    }
                    done();
                }
            });
        });
    }

};
