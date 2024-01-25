import {
    registerUser,
    loginUser,
    resetPassword,
    saveResetToken,
    tokenValidator,
} from '../services/auth';
import { Context, Hono } from 'hono';
import { RegisterPayload, ResetPassword } from '../../interfaces/Auth';
const router = new Hono();

router.post('/register', async (c: Context) => {
    const reqBody = await c.req.json<RegisterPayload>();
    if (
        !reqBody.username ||
        !reqBody.password ||
        !reqBody.email ||
        !reqBody.firstName
    ) {
        return c.json({ error: 'Missing required fields' }, 400);
    }
    const result = await registerUser(reqBody);
    return c.json(result, 201);
});

router.post('/login', async (c: Context) => {
    const reqBody = await c.req.json<RegisterPayload>();
    if ((!reqBody.username && !reqBody.email) || !reqBody.password) {
        return c.json({ error: 'Missing required fields' }, 400);
    }
    const result = await loginUser(reqBody);
    return c.json(result, 200);
});

router.post('/resetPasswordRequest', async (c: Context) => {
    const reqBody = await c.req.json<ResetPassword>();
    if (!reqBody.email) {
        return c.json({ error: 'Missing required fields' }, 400);
    }
    await saveResetToken(reqBody.email);
    return c.json({ message: 'Email was sent!' }, 200);
});

router.post('/resetPassword/:uuid', async (c: Context) => {
    const uuid = c.req.param('uuid');
    const reqBody = await c.req.json<ResetPassword>();
    if (!reqBody.newPassword) {
        return c.json({ error: 'Missing required fields' }, 400);
    }
    await resetPassword(uuid, reqBody.newPassword);
    return c.json({ message: 'Success' }, 200);
});

router.post('/tokenValidator/:uuid', async (c: Context) => {
    const uuid = c.req.param('uuid');
    await tokenValidator(uuid);
    return c.json({ message: 'Success' }, 200);
});

export default router;
