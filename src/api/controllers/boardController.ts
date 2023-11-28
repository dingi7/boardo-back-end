import { Context, Hono } from 'hono';
import { checkAuthorization } from '../services/auth';
import {
    createBoard,
    deleteBoard,
    editBoard,
    getBoardById,
    getBoardsByOrgId,
} from '../services/boardService';

const boardController = new Hono();
interface BoardPayload {
    [key: string]: any; // Adding index signature
    name: string;
    // other properties...
}

boardController.post('/boards', async (c: Context) => {
    const reqBody = await c.req.json<BoardPayload>();
    checkAuthorization(c);
    if (!reqBody.name || !reqBody.orgId) {
        return c.json({ error: 'Missing required fields' }, 400);
    }
    const name = reqBody['name'];
    const result = await createBoard(name, reqBody.orgId);
    return c.json(result, 201);
});

boardController.get('/boards/org/:orgId', async (c: Context) => {
    const orgId = c.req.param('orgId');
    if (!orgId) {
        return c.json({ error: 'Missing required fields' }, 400);
    }
    const result = await getBoardsByOrgId(orgId);
    return c.json(result, 200);
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
        const lists = reqBody['lists'];
        const result = await editBoard(boardId, name, user?._id, lists);
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
    });

export default boardController;
