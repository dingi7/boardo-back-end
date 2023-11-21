import { Context, Hono } from 'hono';
import { checkAuthorization } from '../services/auth';
import {
    createBoard,
    deleteBoard,
    editBoard,
    getBoardsByOrgId,
} from '../services/boardService';

const boardController = new Hono();
interface BoardPayload {
    [key: string]: any; // Adding index signature
    name: string;
    // other properties...
}

boardController.post('/boards', async (c: Context) => {
    const reqBody = await c.req.json<BoardPayload>();
    checkAuthorization(c);
    if (!reqBody.name || !reqBody.orgId) {
        return c.json({ error: 'Missing required fields' }, 400);
    }
    const name = reqBody['name'];
    const result = await createBoard(name, reqBody.orgId);
    return c.json(result, 201);
});

boardController.get('/boards/org/:orgId', async (c: Context) => {
    const orgId = c.req.param('orgId');
    if (!orgId) {
        return c.json({ error: 'Missing required fields' }, 400);
    }
    const result = await getBoardsByOrgId(orgId);
    return c.json(result, 200);
});

// boardController.get('/boards/member/:memberId', async (c: Context) => {
//     const memberId = c.req.param('memberId');
//     if (!memberId) {
//         return c.json(
//             { error: 'Missing required fields or unauthorized' },
//             400
//         );
//     }
//     const result = await getBoardsByMemberId(memberId);
//     return c.json(result, 200);
// });

// boardController.post('/boards/:boardId/members', async (c: Context) => {
//     // add error handling for non existing user
//     const boardId = c.req.param('boardId');
//     const user = checkAuthorization(c);
//     const reqBody = await c.req.json();
//     if (!boardId || !reqBody.userId || !user?._id) {
//         return c.json(
//             { error: 'Missing required fields or unauthorized' },
//             400
//         );
//     }
//     const userId = reqBody['userId'].toString();
//     const result = await addMemberToBoard(boardId, userId, user?._id);
//     return c.json(result, 200);
// });

// boardController.delete(
//     '/boards/:boardId/members/:memberId',
//     async (c: Context) => {
//         // add error handling for not existing user
//         const { boardId, memberId } = c.req.param();
//         const user = checkAuthorization(c);
//         if (!boardId || !memberId || !user?._id) {
//             return c.json(
//                 { error: 'Missing required fields or unauthorized' },
//                 400
//             );
//         }
//         const result = await removeMemberFromBoard(
//             boardId,
//             memberId,
//             user?._id
//         );
//         return c.json(result, 200);
//     }
// );

boardController
    .put('/boards/:boardId', async (c: Context) => {
        const reqBody = await c.req.json();
        const boardId = c.req.param('boardId');
        const user = checkAuthorization(c);
        if (!boardId || !reqBody.name || !user?._id) {
            return c.json(
                { error: 'Missing required fields or unauthorized' },
                400
            );
        }
        const name = reqBody['boardName'].toString();
        const result = await editBoard(boardId, name, user?._id);
        return c.json(result, 200);
    })
    .delete('/boards/:boardId', async (c: Context) => {
        const boardId = c.req.param('boardId');
        const user = checkAuthorization(c);
        if (!boardId || !user?._id) {
            return c.json(
                { error: 'Missing required fields or unauthorized' },
                400
            );
        }
        const result = await deleteBoard(boardId, user?._id);
        return c.json(result, 200);
    });

export default boardController;
