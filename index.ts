import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { prettyJSON } from 'hono/pretty-json';
import { logger } from 'hono/logger';
import mongoose from 'mongoose';
import { authHeader } from './middlewares';
import { cors } from 'hono/cors'

import api from './api';
import dotenv from 'dotenv';

dotenv.config();

async function connectToDatabase() {
    const databaseUrl: string = process.env.MONGODB_URI || 'mongodb+srv://vercel-admin-user-657c114b46a12b1baa10a0c4:YmoC0dlSBhlGxtAW@boardocluster.ysfd69e.mongodb.net/myFirstDatabase?retryWrites=true&w=majority';
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
    app.use(cors());

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
    serve(app, () => {
        console.log('Server is running on port 3000');
    });
}

async function start() {
    await connectToDatabase();
    const app = configureServer();
    startServer(app);
}

start();
