"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Bluebird = require("bluebird");
exports.Promise = Bluebird;
const crawler = require("crawler");
class Crawler extends crawler {
    constructor(options) {
        if (!options.logger) {
            options.logger = { log() { } };
        }
        super(options);
    }
}
exports.Crawler = Crawler;
class Card {
}
exports.Card = Card;
class Set {
}
exports.Set = Set;
//# sourceMappingURL=index.js.map