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
    lists?: any,
    cards?: any
) {
    const board = await getBoardIfAuthorized(boardId, ownerId);
    board.name = name || board.name;
    console.log(lists);

    if (lists) {
        // Create a Map for quick lookups
        const listPositions = new Map(
            lists.map((list: any, index: number) => [list, index])
        );
        board.lists.forEach((list: any) => {
            const position = listPositions.get(list.list._id.toString());
            if (position !== undefined) {
                list.position = position;
            }
        });
    }

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
