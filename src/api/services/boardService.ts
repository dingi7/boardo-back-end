import Board from '../../models/boardModel';
import { Types } from 'mongoose';
import { getUserById } from './auth';
import { IBoard } from '../../interfaces/BoardInterface';

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

async function createBoard(name: string, backgroundUrl: string, owner: string) {
    const board = new Board({
        name,
        backgroundUrl,
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

    const board = await getBoardIfAuthorized(boardId, ownerId) as unknown as IBoard;
    board.name = name || board.name;

    if (lists) {
        // Map list IDs to list objects
        const listMap = new Map(
            board.lists.map((list) => [list._id.toString(), list])
        );

        // Reorder board.lists
        board.lists = lists.map((listId: string) => {
            const list = listMap.get(listId);
            if (!list) {
                throw new Error(`List with ID ${listId} not found`);
            }
            return list;
        });
    }

    if (cards) {
        console.log(cards);
        if (cards.length !== board.lists.length) {
            throw new Error(
                'The length of the cards array must match the number of lists'
            );
        }

        // Reorder cards in each list
        for (let i = 0; i < board.lists.length; i++) {
            const list = board.lists[i];
            const cardIds = cards[i];
            list.cards = cardIds;
            await list.save();
        }
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
    return (await board.populate('lists')).populate('lists.cards'); // populate lists.position
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
