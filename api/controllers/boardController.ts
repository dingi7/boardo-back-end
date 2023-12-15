import { Context, Hono } from 'hono';
import { checkAuthorization } from '../services/auth';
import {
    createBoard,
    deleteBoard,
    editBoard,
    getBoardById,
    getBoardsByOrgId,
} from '../services/boardService';
import { getOrgById } from '../services/orgService';

const boardController = new Hono();
interface BoardPayload {
    [key: string]: any;
    name: string;
    backgroundUrl?: string;
}

boardController.post('/boards', async (c: Context) => {
    const reqBody = await c.req.json<BoardPayload>();
    checkAuthorization(c);
    if (!reqBody.name || !reqBody.orgId) {
        return c.json({ error: 'Missing required fields' }, 400);
    }
    const name = reqBody['name'];
    const backgroundUrl = reqBody['backgroundUrl'] || '';
    const result = await createBoard(name, backgroundUrl, reqBody.orgId);
    return c.json(result, 201);
});

boardController.get('/boards/org/:orgId', async (c: Context) => {
    const orgId = c.req.param('orgId');
    if (!orgId) {
        return c.json({ error: 'Missing required fields' }, 400);
    }
    const org = await getOrgById(orgId);
    const boards = await getBoardsByOrgId(orgId);
    const response = {
        organization: org,
        boards
    }
    return c.json(response, 200);
});

boardController
    .put('/boards/:boardId', async (c: Context) => {
        const reqBody = await c.req.json();
        const boardId = c.req.param('boardId');
        const user = checkAuthorization(c);
        if (!boardId || !reqBody.boardName || !user?._id) {
            return c.json(
                { error: 'Missing required fields or unauthorized' },
                400
            );
        }
        const name = reqBody['boardName'].toString();
        const lists = reqBody['listIds'];
        const cards = reqBody['cardIds'];
        const result = await editBoard(
            boardId,
            name,
            user?._id,
            lists ? lists : undefined,
            cards ? cards : undefined
        );
        return c.json(result, 200);
    })
    .delete(async (c: Context) => {
        const boardId = c.req.param('boardId');
        const user = checkAuthorization(c);
        if (!boardId || !user?._id) {
            return c.json(
                { error: 'Missing required fields or unauthorized' },
                400
            );
        }
        const result = await deleteBoard(boardId, user?._id);
        return c.json(result, 200);
    })
    .get(async (c: Context) => {
        const boardId = c.req.param('boardId');
        const user = checkAuthorization(c);
        if (!boardId || !user?._id) {
            return c.json(
                { error: 'Missing required fields or unauthorized' },
                400
            );
        }
        const board = await getBoardById(boardId, user?._id);
        return c.json(board, 200);
    })
    .post(async (c: Context) => {
        const reqBody = await c.req.json();
        const boardId = c.req.param('boardId');
        const user = checkAuthorization(c);
        if (!boardId || !user?._id) {
            return c.json(
                { error: 'Missing required fields or unauthorized' },
                400
            );
        }
        const backgroundUrl = reqBody['backgroundUrl'];
        const board = await getBoardById(boardId, user?._id);
        board.backgroundUrl = backgroundUrl;
        await board.save();
        return c.json(board, 200);
    });

export default boardController;