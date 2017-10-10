import {
    SourceProvider,
    Set,
    Card,
    SetsOptions,
    CardsOptions,
    Promise,
    Crawler
} from '../';
import * as _ from 'url';

export = class Magiccards implements SourceProvider {

    url: string = 'http://magiccards.info';
    map: string = '/sitemap.html';

    getSets(options: SetsOptions): Promise<Set[]> {
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
                                        const set = new Set();
                                        set.section = section;
                                        set.block = block;
                                        set.name = $('a', this).text();
                                        set.url = $('a', this).attr('href');
                                        set.code = $('small', this).text();
                                        const match = /[^\./]+(?=\.html$)/.exec(
                                            set.url
                                        );
                                        set.lang = (match && match[0]) || '';
                                        sets.push(set);
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
    getCards(options: CardsOptions): Promise<Card[]> {
        const base = this.url;

        return new Promise((resolve, reject) => {
            const uri = `${base}/query?q=++e:${options.set.code}/${options.set
                .lang}&v=olist&s=issue`;
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
                            options.total++;
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

                            crawler.queue({
                                uri: base + card.url,
                                callback: (err, res, done) => {
                                    if (!err) {
                                        const $ = res.$;
                                        card.text = $('p.ctext').text();
                                        card.flavor = $('p > i').text();
                                        const link = $('p.ctext')
                                            .next()
                                            .next()
                                            .next()
                                            .find('a')
                                            .attr('href');
                                        card.id = _.parse(
                                            link,
                                            true
                                        ).query.multiverseid;
                                        cards.push(card);
                                        options.tasks.push(1);
                                    } else {
                                        options.tasks.push(-1);
                                    }
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
