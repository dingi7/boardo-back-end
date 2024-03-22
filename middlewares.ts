import { Context, Next } from 'hono';
import { verifySession } from './api/services/auth';
import { AuthContext } from './interfaces/Auth';

export async function authHeader(c: AuthContext, next: Next) {
    const token = c.req.header('x-authorization');
    try {
        if (token) {
            const userData = verifySession(token.toString());
            c.user = userData;
        }
        await next();
    } catch (err) {
        c.json(
            {
                message: 'Invalid access token. Please sign in',
            },
            498
        );
        await next();
    }
}


