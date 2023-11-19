import { Context, Hono } from 'hono';
import { MessageResponse } from '../interfaces/MessageResponse';
import boards from './controllers/boardController';
import users from './controllers/usersController';

const api = new Hono();

// router.get('/', (c: Context) => {
//     c.json({
//         message: 'API - 👋🌎🌍🌏',
//     });
// });

// router.use('/emojis', emojis);
api.route('/auth', users);
api.route('/items', boards);

export default api;
