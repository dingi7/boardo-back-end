import mongoose from 'mongoose';
import List from '../../models/listModel';
import { getBoardById, removeListFromBoard } from './boardService';
import { writeActivity } from '../../util/ActivityWriter';

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

    writeActivity({
        user: _id,
        organization: board.owner._id,
        board: board._id,
        action: 'Created list ' + name + ' on board ' + board.name,
    });
    return list;
}

async function deleteList(listId: string, userId: string) {
    const list = await getListById(listId);
    await removeListFromBoard(list.board._id.toString(), listId, userId);
    await list.deleteOne();
    return list;
}

async function editList(
    listId: string,
    name: string,
    userId: string,
    organizationId: string
) {
    const list = await getListById(listId);
    writeActivity({
        user: userId,
        organization: organizationId,
        board: list.board._id.toString(),
        action: 'Renamed list ' + list.name + ' to ' + name,
    });
    list.name = name;
    await list.save();
    return list;
}

async function addCardToList(listId: string, cardId: string) {
    const list = await getListById(listId);
    list.cards.push(new mongoose.Types.ObjectId(cardId));
    await list.save();
    return list;
}

export { getListById, createList, addCardToList, deleteList, editList };
