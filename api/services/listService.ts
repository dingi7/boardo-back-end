import mongoose from 'mongoose';
import List from '../../models/listModel';
import { getBoardById } from './boardService';

async function getListById(listId: string) {
    try {
        const list = await List.findById(listId);
        if (!list) {
            throw new Error('No list found for the given id');
        }
        await list.populate('cards');
        return list;
    } catch (err: any) {
        throw new Error('Invalid list id');
    }
}

async function createList(name: string, boardId: string, _id: string) {
    const board = await getBoardById(boardId, _id);
    const list = new List({
        name: name,
        board: boardId,
        cards: [],
    });
    await list.save();
    board.lists.push(list._id);
    await board.save();
    return list;
}

async function addCardToList(listId: string, cardId: string) {
    const list = await getListById(listId);
    list.cards.push(new mongoose.Types.ObjectId(cardId));
    await list.save();
    return list;
}

export { getListById, createList, addCardToList };