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
    const { name, orgId, backgroundUrl }: BoardPayload = await c.req.json();
    const user = checkAuthorization(c);

    if (!name || !orgId || !backgroundUrl) {
        return c.json({ error: 'Missing required fields' }, 400);
    }

    const result = await createBoard(name, backgroundUrl, orgId, user._id);
    return c.json(result, 201);
});

boardController.get('/boards/org/:orgId', async (c: Context) => {
    const user = checkAuthorization(c);
    const orgId = c.req.param('orgId');

    if (!orgId || !user?._id) {
        return c.json({ error: 'Missing required fields or unauthorized' }, 400);
    }

    const populate = c.req.query('populate') === 'true';
    const org = await getOrgById(orgId, populate);
    const boards = await getBoardsByOrgId(orgId);

    const response = {
        organization: org,
        boards,
    };

    return c.json(response, 200);
});

boardController
    .put('/boards/:boardId', async (c: Context) => {
        const { boardName, listIds, cardIds, backgroundUrl } = await c.req.json();
        const boardId = c.req.param('boardId');
        const user = checkAuthorization(c);

        if (!boardId || !user?._id) {
            return c.json({ error: 'Missing required fields or unauthorized' }, 400);
        }

        const name = boardName ? boardName.toString() : undefined;
        const lists = listIds;
        const cards = cardIds;

        const result = await editBoard(boardId, user._id, name, lists, cards, backgroundUrl);
        return c.json(result, 200);
    })
    .delete(async (c: Context) => {
        const boardId = c.req.param('boardId');
        const user = checkAuthorization(c);

        if (!boardId || !user?._id) {
            return c.json({ error: 'Missing required fields or unauthorized' }, 400);
        }

        const result = await deleteBoard(boardId, user?._id);
        return c.json(result, 200);
    })
    .get(async (c: Context) => {
        const boardId = c.req.param('boardId');
        const user = checkAuthorization(c);

        if (!boardId || !user?._id) {
            return c.json({ error: 'Missing required fields or unauthorized' }, 400);
        }

        const board = await getBoardById(boardId, user?._id);
        return c.json(board, 200);
    });

export default boardController;