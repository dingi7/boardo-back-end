import { Hono } from 'hono';
import boards from './controllers/boardController';
import users from './controllers/usersController';
import lists from './controllers/listController';
import cards from './controllers/cardController';

const api = new Hono();

api.route('/auth', users);
api.route('/items', boards);
api.route('/items', lists)
api.route('/items', cards);

export default api;
