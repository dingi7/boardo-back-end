import { Context, Hono } from 'hono';
import { checkAuthorization } from '../services/auth';
import { createCard, deleteCardById } from '../services/cardService';
import { getBoardById } from '../services/boardService';

const cardController = new Hono();

interface CardPayload {
    [key: string]: any; // Adding index signature
    content: string;
    listId: string;
    boardId?: string;
}

cardController.post('/cards', async (c: Context) => {
    const reqBody = await c.req.json<CardPayload>();
    checkAuthorization(c);
    if (!reqBody.content || !reqBody.listId) {
        return c.json({ error: 'Missing required fields' }, 400);
    }
    const content = reqBody['content'].toString();
    const listId = reqBody['listId'].toString();
    const result = await createCard(content, listId);
    return c.json(result, 201);
});

cardController.delete('/cards/:cardId', async (c: Context) => {
    const reqBody = await c.req.json();
    const cardId = c.req.param('cardId');
    const user = checkAuthorization(c);
    if (!cardId || !user?._id || !reqBody.boardId) {
        return c.json(
            { error: 'Missing required fields or unauthorized' },
            400
        );
    }
    const boardId = reqBody['boardId'].toString();
    await getBoardById(boardId, user?._id);
    const result = await deleteCardById(cardId, user!._id);
    return c.json(result, 200);
});

export default cardController;
