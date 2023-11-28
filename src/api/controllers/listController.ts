import { Context, Hono } from 'hono';
import { createList, getListById } from '../services/listService';
import { checkAuthorization } from '../services/auth';

const listController = new Hono();

interface listPayload {
    [key: string]: any; // Adding index signature
    name: string;
    boardId: string;
}

listController.get('/list/:listId', async (c: Context) => {
    const listId = c.req.param('listId');
    if (!listId) {
        return c.json({ error: 'Missing required fields' }, 400);
    }
    const result = await getListById(listId);
    return c.json(result, 200);
});

listController.post('/list', async (c: Context) => {
    const { name, boardId } = await c.req.json<listPayload>();
    const { _id } = checkAuthorization(c);
    console.log(_id);
    
    if (!name || !boardId) {
        return c.json({ error: 'Missing required fields' }, 400);
    }
    const result = await createList(name, boardId, _id);
    return c.json(result, 200);
});


export default listController;