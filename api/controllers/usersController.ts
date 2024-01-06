import { registerUser, loginUser, checkAuthorization } from '../services/auth';
import { Context, Hono } from 'hono';
import { RegisterPayload } from '../../interfaces/RegisterPayload';
import { createOrg, getAllOrgs, getOrgsByMemberId, joinOrg } from '../services/orgService';

const router = new Hono();

interface OrgPayload {
    [key: string]: any; // Adding index signature
    name: string;
    password: string;
    // other properties...
}

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

router.post('/joinOrg/:id', async (c: Context) => {
    const reqBody = await c.req.json<OrgPayload>();
    const orgId = c.req.param('id');
    const user = checkAuthorization(c);
    if (!orgId || !reqBody?.password || !user?._id) {
        return c.json(
            { error: 'Missing required fields or unauthorized' },
            400
        );
    }
    const result = await joinOrg(orgId, reqBody.password, user._id);
    return c.json(result, 200);
});

router.get('/allOrgs', async (c: Context) => {
    const result = await getAllOrgs();
    return c.json(result, 200);
});

router
    .get('/orgs', async (c: Context) => {
        const user = checkAuthorization(c);
        const result = await getOrgsByMemberId(user._id);
        return c.json(result, 200);
    })
    .post(async (c: Context) => {
        const reqBody = await c.req.json<OrgPayload>();
        const user = checkAuthorization(c);
        if (!reqBody?.password || !reqBody?.name || !user?._id) {
            return c.json(
                { error: 'Missing required fields or unauthorized' },
                400
            );
        }
        const result = await createOrg(
            reqBody.name,
            reqBody.password,
            user._id
        );
        return c.json(result, 200);
    });

export default router;
