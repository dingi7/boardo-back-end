import { Context, Hono } from 'hono';
import { createList, deleteList, getListById } from '../services/listService';
import { checkAuthorization } from '../services/auth';

const listController = new Hono();

interface listPayload {
    [key: string]: any; // Adding index signature
    name: string;
    boardId: string;
}

listController
    .get('/list/:listId', async (c: Context) => {
        const listId = c.req.param('listId');
        if (!listId) {
            return c.json({ error: 'Missing required fields' }, 400);
        }
        const result = await getListById(listId);
        return c.json(result, 200);
    })
    .delete(async (c: Context) => {
        const user = checkAuthorization(c);
        const listId = c.req.param('listId');
        if (!listId || !user?._id) {
            return c.json(
                { error: 'Missing required fields or unauthorized' },
                400
            );
        }
        await deleteList(listId, user._id);
        return c.json({message: "List removed successfully!"}, 200);
    });

listController.post('/list', async (c: Context) => {
    const { name, boardId } = await c.req.json<listPayload>();
    const { _id } = checkAuthorization(c);

    if (!name || !boardId) {
        return c.json({ error: 'Missing required fields' }, 400);
    }
    const result = await createList(name, boardId, _id);
    return c.json(result, 200);
});

export default listController;
