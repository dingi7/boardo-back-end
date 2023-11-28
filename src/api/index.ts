import { Hono } from 'hono';
import boards from './controllers/boardController';
import users from './controllers/usersController';
import lists from './controllers/listController';

const api = new Hono();

api.route('/auth', users);
api.route('/items', boards);
api.route('/items', lists)

export default api;
