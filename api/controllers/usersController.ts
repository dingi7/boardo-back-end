import {
    registerUser,
    loginUser,
    resetPassword,
    saveResetToken,
    tokenValidator,
    checkAuthorization,
    changePassword,
    getUserById,

} from '../services/auth';
import { Context, Hono } from 'hono';
import {
    ChangePassword,
    RegisterPayload,
    ResetPassword,
    UpdateUserCredentials
} from '../../interfaces/Auth';
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

router.post('/changePassword', async (c: Context) => {
    const user = checkAuthorization(c);
    const reqBody = await c.req.json<ChangePassword>();
    if (!reqBody.oldPassword || !reqBody.newPassword || !user._id) {
        return c.json({ error: 'Missing required fields' }, 400);
    }
    try {
        await changePassword(
            reqBody.oldPassword,
            reqBody.newPassword,
            user._id
        );
        return c.json({ message: 'Success' }, 200);
    } catch (err) {
        return c.json({ error: err.message }, 400);
    }
});

router.put('/updateCredentials', async (c: Context) => {
    const user = checkAuthorization(c);
    const reqBody = await c.req.json<UpdateUserCredentials>();
    if (!reqBody.username || !reqBody.email) {
        return c.json({ error: 'Missing required fields' }, 400);
    }
    try {
        const userDoc = await getUserById(user._id)
        if (!userDoc) {
            return c.json({ error: 'User not found' }, 404);
        }
        userDoc.username = reqBody.username ?? user.username,
        userDoc.email = reqBody.email ?? user.email
        await userDoc.save()
        return c.json({ message: 'Success' }, 200);
    } catch (err) {
        return c.json({ error: err.message }, 400);
    }
})
export default router;
