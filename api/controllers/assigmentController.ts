import { Hono } from 'hono';
import {
    createAssigment,
    deleteAssigment,
    getUserAssigments,
} from '../services/assigment';
import { checkAuthorization } from '../services/auth';

const assigmentController = new Hono();

interface AssigmentPayload {
    [key: string]: any;
    user: string;
    card: string;
}

assigmentController.get('/assigments', async (c) => {
    const user = checkAuthorization(c);
    if (!user?._id) {
        return c.json(
            { error: 'Missing required fields or unauthorized' },
            400
        );
    }

    const assigments = await getUserAssigments(user._id);
    return c.json(assigments, 200);
});

assigmentController.post('/assigments', async (c) => {
    checkAuthorization(c);
    const { user, card }: AssigmentPayload = await c.req.json();
    const result = await createAssigment(user, card);
    return c.json(result, 201);
});

assigmentController.delete('/assigments/:assigmentId', async (c) => {
    const assigmentId = c.req.param('assigmentId');
    const user = checkAuthorization(c);
    if (!assigmentId || !user?._id) {
        return c.json(
            { error: 'Missing required fields or unauthorized' },
            400
        );
    }
    await deleteAssigment(assigmentId);
    return c.json({ message: 'Assigment deleted successfully' }, 200);
});

export default assigmentController;
