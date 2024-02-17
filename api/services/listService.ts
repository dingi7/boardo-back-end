import mongoose from 'mongoose';
import List from '../../models/listModel';
import { getBoardById, removeListFromBoard } from './boardService';
import { writeActivity } from '../../util/ActivityWriter';

import pusher from '../../util/PusherUtil';
import { ICard } from '../../interfaces/BoardInterface';

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
    
    pusher.trigger(board._id.toString(), 'list-created', 
        list
    );
    console.log('pusher triggered for list-created event');

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
    pusher.trigger(list.board.toString(), 'list-deleted', 
        list
    );
    console.log('pusher triggered for list-deleted event');
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
    pusher.trigger(list.board.toString(), 'list-edited', list);
    console.log('pusher triggered for list-edited event');
    return list;
}

async function addCardToList(listId: string, card: ICard | any) {
    const list = await getListById(listId);
    list.cards.push(new mongoose.Types.ObjectId(card._id));
    pusher.trigger(list.board.toString(), 'card-added', card);
    console.log('pusher triggered for card-added event');
    await list.save();
    return list;
}

export { getListById, createList, addCardToList, deleteList, editList };
