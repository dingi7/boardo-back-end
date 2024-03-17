import { Context, Hono } from 'hono';
import { checkAuthorization } from '../services/auth';
import { createCard, deleteCardById, editCard } from '../services/cardService';
import { getBoardById } from '../services/boardService';

const cardController = new Hono();

interface CardPayload {
    [key: string]: any; // Adding index signature
    content: string;
    listId: string;
    organizationId?: string;
    boardId?: string;
    priority?: string;
    dueDate?: Date;
}

cardController.post('/cards', async (c: Context) => {
    const { content, listId, organizationId }: CardPayload = await c.req.json();
    const user = checkAuthorization(c);

    if (!content || !listId || !user?._id || !organizationId) {
        return c.json({ error: 'Missing required fields' }, 400);
    }

    const result = await createCard(content, listId, user._id, organizationId);
    return c.json(result, 201);
});

cardController
    .delete('/cards/:cardId', async (c: Context) => {
        const { boardId, organizationId } = await c.req.json();
        const cardId = c.req.param('cardId');
        const user = checkAuthorization(c);

        if (!cardId || !user?._id || !boardId || !organizationId) {
            return c.json({ error: 'Missing required fields or unauthorized' }, 400);
        }

        await getBoardById(boardId, user?._id);
        const result = await deleteCardById(cardId, user!._id, organizationId);
        return c.json(result, 200);
    })
    .put(async (c: Context) => {
        const { organizationId, name, priority, dueDate }: CardPayload = await c.req.json();
        const cardId = c.req.param('cardId');
        const user = checkAuthorization(c);

        if (!cardId || !user?._id || !organizationId) {
            return c.json({ error: 'Missing required fields or unauthorized' }, 400);
        }

        const result = await editCard(cardId, user._id, organizationId, name, priority, dueDate);
        return c.json(result, 200);
    });

export default cardController;