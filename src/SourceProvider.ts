import Set from './Set';
import Card from './Card';
import * as Promise from 'bluebird';

export default interface SourceProvider {
    getSets(options: any): Promise<Set[]>;
    getCards(set: Set, options: any): Promise<Card[]>;
};
