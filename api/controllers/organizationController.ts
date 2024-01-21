import { Context, Hono } from 'hono';
import { checkAuthorization } from '../services/auth';
import {
    joinOrg,
    getAllOrgs,
    createOrg,
    deleteOrg,
    editOrg,
    getOrgsByMemberId,
    kickMember,
} from '../services/orgService';
import { OrgPayload } from '../../interfaces/Auth';

const router = new Hono();

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

router
    .put('/orgs/:id', async (c: Context) => {
        const orgId = c.req.param('id');
        const user = checkAuthorization(c);
        if (!orgId || !user?._id) {
            return c.json(
                { error: 'Missing required fields or unauthorized' },
                400
            );
        }
        const reqBody = await c.req.json<OrgPayload>();
        const result = await editOrg(
            orgId,
            user._id,
            reqBody.name,
            reqBody.password,
            reqBody.owner
        );
        return c.json(result, 200);
    })
    .delete(async (c: Context) => {
        const orgId = c.req.param('id');
        const user = checkAuthorization(c);
        const reqBody = await c.req.json<OrgPayload>();
        if (!orgId || !user?._id || !reqBody.password) {
            return c.json(
                { error: 'Missing required fields or unauthorized' },
                400
            );
        }
        const result = await deleteOrg(orgId, user._id, reqBody.password);
        return c.json(result, 200);
    });

router.post('/orgs/:id/kickMember', async (c: Context) => {
    const orgId = c.req.param('id');
    const user = checkAuthorization(c);
    const { memberId } = await c.req.json<OrgPayload>();
    if (!orgId || !user?._id || !memberId) {
        return c.json(
            { error: 'Missing required fields or unauthorized' },
            400
        );
    }
    const result = await kickMember(orgId, memberId, user._id);
    return c.json(result, 200);
});

export default router;
