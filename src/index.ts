import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { prettyJSON } from 'hono/pretty-json';
import { logger } from 'hono/logger';
import mongoose from 'mongoose';
import { authHeader } from './middlewares';
import api from './api';
import dotenv from 'dotenv';
dotenv.config();

async function start() {
    const dataBase: string = process.env.DATABASE_URL || 'mongodb://127.0.0.1:27017/boardo';
    try {
        await mongoose.connect(dataBase);
        console.log('Connected to database');
    } catch (error) {
        console.log('Database connection failed: ' + error);
        process.exit(1);
    }
    const app = new Hono();
    // add routes
    app.use('*', logger());
    app.use(prettyJSON());
    app.use(authHeader);
    app.get('/', (c) => c.text('Hello Hono!'));
    app.route('/api/v1', api);
    app.notFound((c) => {
        return c.json({error: `🔍 - Not Found - ${c.req.url}`}, 404);
    });
    app.onError((err, c) => {
        return c.json(
            {
                message: err.message,
                stack: process.env.NODE_ENV === 'production' ? '🥞' : err.stack,
            },
            500
        );
    });

    serve(app, () => console.log('Server is running on port 3000'));
}

start();
