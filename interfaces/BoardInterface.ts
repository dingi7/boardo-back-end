import { Document } from 'mongoose';
export interface IBoard extends Document {
    _id: string;
    name: string;
    owner: string;
    lists: IList[];
    backgroundUrl?: string;
}

interface IList extends Document {
    name: string;
    board: string;
    cards: ICard[];
}

interface ICard extends Document {
    name: string;
    list: string;
}
