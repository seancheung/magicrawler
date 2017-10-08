import Card from './Card';

export type SetOptions = {
    section: string;
    block: string;
    name: string;
    code: string;
    lang: string;
    url: string;
};

export default class Set {

    section: string;
    block: string;
    name: string;
    code: string;
    lang: string;
    url: string;
    cards: Card[];

    constructor(options: SetOptions) {
        this.section = options.section;
        this.block = options.block;
        this.name = options.name;
        this.code = options.code;
        this.lang = options.lang;
        this.url = options.url;
    }

}
