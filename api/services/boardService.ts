import Board from '../../models/boardModel';
import { ObjectId, Types } from 'mongoose';
import { getUserById } from './auth';
import { IBoard } from '../../interfaces/BoardInterface';
import { writeActivity } from '../../util/ActivityWriter';
import pusher from '../../util/PusherUtil';


async function getBoardsByOrgId(orgId: string) {
    try {
        const boards = await Board.find({ owner: orgId });
        if (!boards || boards.length === 0) {
            throw new Error('No boards were found for the given org');
        }
        return boards;
    } catch (err: any) {
        return null;
    }
}

async function createBoard(
    name: string,
    backgroundUrl: string,
    owner: string,
    userId: string
) {
    const existingBoards = await getBoardsByOrgId(owner);
    if (existingBoards && existingBoards.length >= 5) {
        throw new Error(
            'You have reached the maximum number of boards for your organization'
        );
    }
    const board = new Board({
        name,
        backgroundUrl,
        owner,
    });
    await board.save();
    writeActivity({
        user: userId,
        organization: owner,
        board: board._id,
        action: 'Created a board',
    });
    return board;
}

async function getBoardById(boardId: string, meberId: string) {
    const board = await getBoardIfAuthorized(boardId, meberId);
    return board;
}

async function editBoard(
    boardId: string,
    userId: string,
    name?: string,
    lists?: any,
    cards?: any,
    backgroundUrl?: string
) {
    const board = (await getBoardIfAuthorized(
        boardId,
        userId
    )) as unknown as IBoard;
    board.name = name || board.name;
    board.backgroundUrl = backgroundUrl || board.backgroundUrl;

    if (!lists && !cards) {
        writeActivity({
            user: userId,
            organization: board.owner,
            board: board._id,
            action: name ? `Renamed the board to ${name}` : backgroundUrl ? 'Changed the background image' : 'Edited the board',
        });
    }

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

    pusher.trigger(board._id.toString(), 'board-edited', 
        board,
    );
    console.log('pusher triggered for board-edited event');

    await board.save();
    return board;
}

async function deleteBoard(boardId: string, userId: string) {
    const board = await getBoardIfAuthorized(boardId, userId);
    await writeActivity({
        user: userId,
        organization: board.owner,
        action: 'Deleted board ' + board.name,
    });
    await board.deleteOne();
    return { message: 'Board deleted successfully' };
}

async function removeListFromBoard(
    boardId: string,
    listId: string,
    memberId: string
) {
    const board = await getBoardIfAuthorized(boardId, memberId);
    const listObjectId = new Types.ObjectId(listId);
    // if (!board.lists.includes(listObjectId)) {
    //     throw new Error('List not found on the board');
    // }
    board.lists.pull(listObjectId);
    await board.save();
    writeActivity({
        user: memberId,
        organization: board.owner,
        board: board._id,
        action: 'Removed list ' + listId + ' from board ' + board.name,
    });
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
    removeListFromBoard,
    getBoardById,
};
