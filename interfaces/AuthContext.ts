import { Context } from 'hono';
import { ISession } from './Session';

export interface AuthContext extends Context {
    user?: ISession;
}
