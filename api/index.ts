import { Hono } from 'hono';
import boards from './controllers/boardController';
import users from './controllers/usersController';
import orgs from './controllers/organizationController';
import lists from './controllers/listController';
import cards from './controllers/cardController';

const api = new Hono();

api.route('/auth', users);
api.route('/auth', orgs);
api.route('/items', cards);
api.route('/items', boards);
api.route('/items', lists);

export default api;
