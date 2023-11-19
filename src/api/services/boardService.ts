import Board from '../../models/boardModel';
import { Types } from 'mongoose';

async function createBoard(name: string, owner: string) {
    const board = new Board({
        name,
        owner,
        members: [owner],
    });
    await board.save();
    return board;
}

async function getBoardsByOwnerId(userId: string) {
    try {
        const boards = await Board.find({ owner: userId });
        if (!boards || boards.length === 0) {
            throw new Error('No boards were found for the given owner');
        }
        return boards;
    } catch (err: any) {
        throw new Error('Invalid user id');
    }
}

async function getBoardsByMemberId(userId: string) {
    try {
        const boards = await Board.find({ members: userId });
        if (!boards) {
            throw new Error('No boards were found for the given owner');
        }
        return boards;
    } catch (err: any) {
        throw new Error('Invalid user id');
    }
}

async function getBoardByIdAndOwner(boardId: string, ownerId: string) {
    const board = await Board.findById(boardId);
    if (!board) {
        throw new Error('No boards were found for the given owner');
    }
    if (board.owner.toString() !== ownerId) {
        throw new Error('Unauthorized access to board');
    }
    return board;
}

async function addMemberToBoard(
    boardId: string,
    userId: string,
    ownerId: string
) {
    const board = await getBoardByIdAndOwner(boardId, ownerId);
    const userObjectId = new Types.ObjectId(userId);
    if (board.members.includes(userObjectId)) {
        throw new Error('User is already a member');
    }
    board.members.push(userObjectId);
    await board.save();
    return board;
}

async function removeMemberFromBoard(
    boardId: string,
    userId: string,
    ownerId: string
) {
    const board = await getBoardByIdAndOwner(boardId, ownerId);
    const userObjectId = new Types.ObjectId(userId);
    if (!board.members.includes(userObjectId)) {
        throw new Error("User isn't a member");
    }
    board.members.pull(userObjectId);
    await board.save();
    return board;
}

async function editBoard(boardId: string, name: string, ownerId: string) {
    const board = await getBoardByIdAndOwner(boardId, ownerId);
    board.name = name;
    await board.save();
    return board;
}

async function deleteBoard(boardId: string, ownerId: string) {
    const board = await getBoardByIdAndOwner(boardId, ownerId);
    await board.deleteOne();
    return { message: 'Board deleted successfully' };
}

async function getBoardIfAuthorized(boardId: string, memberId: string) {
    const board = await Board.findById(boardId);
    if (!board) {
        throw new Error('Board not found');
    }
    const memberObjectId = new Types.ObjectId(memberId);
    if (!board.members.includes(memberObjectId)) {
        throw new Error('Unauthorized access to board');
    }
    return board;
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

export {
    createBoard,
    addMemberToBoard,
    removeMemberFromBoard,
    getBoardsByMemberId,
    getBoardsByOwnerId,
    editBoard,
    deleteBoard,
    addListToBoard,
    removeListFromBoard,
};
