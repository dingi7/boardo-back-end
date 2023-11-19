import { Hono } from 'hono';
import boards from './controllers/boardController';
import users from './controllers/usersController';

const api = new Hono();

api.route('/auth', users);
api.route('/items', boards);

export default api;
