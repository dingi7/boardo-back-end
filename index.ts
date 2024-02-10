import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { prettyJSON } from 'hono/pretty-json';
import { logger } from 'hono/logger';
import mongoose from 'mongoose';
import { authHeader } from './middlewares';
import { cors } from 'hono/cors';
import { Server } from 'socket.io';

import api from './api';
import dotenv from 'dotenv';

dotenv.config();

async function connectToDatabase() {
    const databaseUrl: string = process.env.MONGODB_URI || "mongodb://localhost:27017/hono";
    try {
        await mongoose.connect(databaseUrl);
        console.log('Connected to the database');
    } catch (error) {
        console.error('Database connection failed:', error);
        process.exit(1);
    }
}

function configureServer() {
    const app = new Hono();

    // Middleware
    app.use('*', logger());
    app.use(authHeader);
    app.use(prettyJSON());

    // cors
    app.use(cors({ origin: '*' }));

    // Routes
    app.get('/', (c) => c.text('Hello Hono!'));
    app.route('/api/v1', api);

    // Error Handling
    app.notFound((c) => {
        return c.json({ error: `🔍 - Not Found - ${c.req.url}` }, 404);
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

    return app;
}

function startServer(app: Hono) {
    const server = serve(app, () => {
        console.log('Server is running on port 3000');
    });
    return server;
}

async function start() {
    await connectToDatabase();
    const app = configureServer();
    const server = startServer(app);
    const io = new Server(server, { cors: { origin: '*' } });

    io.on('connection', (socket: any) => {
        socket.on('join-board', (boardId: string) => {
            console.log('joined board ' + boardId);
            socket.join(boardId);
        });

        socket.on('create-card', (data: any, boardId: string) => {
            console.log('ran ' + data);
            socket.to(boardId).emit('card-created', data);
        });

        socket.on('delete-card', (cardId: string, boardId: string) => {
            socket.to(boardId).emit('card-deleted', cardId);
        });

        socket.on('create-list', (list: any, boardId: string) => {
            console.log('ran');
            socket.to(boardId).emit('list-created', list);
        });
    });
}

start();
