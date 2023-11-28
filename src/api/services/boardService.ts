import Board from '../../models/boardModel';
import { Types } from 'mongoose';
import { getUserById } from './auth';

async function getBoardsByOrgId(orgId: string) {
    try {
        const boards = await Board.find({ owner: orgId });
        if (!boards || boards.length === 0) {
            throw new Error('No boards were found for the given org');
        }
        return boards;
    } catch (err: any) {
        throw new Error('Invalid org id');
    }
}

async function createBoard(name: string, owner: string) {
    const board = new Board({
        name,
        owner,
    });
    await board.save();
    return board;
}

async function getBoardById(boardId: string, meberId: string) {
    const board = await getBoardIfAuthorized(boardId, meberId);
    return board;
}

async function editBoard(
    boardId: string,
    name: string,
    ownerId: string,
    lists: any
) {
    const board = await getBoardIfAuthorized(boardId, ownerId);
    board.name = name || board.name;

    const listIds = lists.map((list: any) => list._id);

    board.lists.forEach((list: any) => {
        console.log(list._id);

        const index = listIds.indexOf(list._id.toString());
        console.log(index);

        if (index > -1) {
            list.position = index;
        }
    });

    await board.save();
    return board;
}

async function deleteBoard(boardId: string, ownerId: string) {
    const board = await getBoardIfAuthorized(boardId, ownerId);
    await board.deleteOne();
    return { message: 'Board deleted successfully' };
}

async function addListToBoard(
    boardId: string,
    listId: string,
    memberId: string
) {
    const board = await getBoardIfAuthorized(boardId, memberId);
    const listObjectId = new Types.ObjectId(listId);
    if (board.lists.includes(listObjectId)) {
        throw new Error('List already present on the board');
    }
    board.lists.push(listObjectId);
    await board.save();
    return board;
}

async function removeListFromBoard(
    boardId: string,
    listId: string,
    memberId: string
) {
    const board = await getBoardIfAuthorized(boardId, memberId);
    const listObjectId = new Types.ObjectId(listId);
    if (!board.lists.includes(listObjectId)) {
        throw new Error('List not found on the board');
    }
    board.lists.pull(listObjectId);
    await board.save();
    return board;
}

async function getBoardIfAuthorized(boardId: string, memberId: string) {
    const board = await Board.findById(boardId);
    if (!board) {
        throw new Error('Board not found');
    }
    const member = await getUserById(memberId);
    if (!member?.joinedOrganizations.includes(board.owner)) {
        throw new Error('Unauthorized access to board');
    }
    return await board.populate('lists.list'); // populate lists.position
}

export {
    createBoard,
    getBoardsByOrgId,
    editBoard,
    deleteBoard,
    addListToBoard,
    removeListFromBoard,
    getBoardById,
};
