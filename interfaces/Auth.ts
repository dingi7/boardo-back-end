import { Context } from 'hono';

export interface AuthContext extends Context {
    user?: ISession;
}

export interface IUser {
    _id: string;
    firstName: string;
    username: string;
    email: string;
    joinedOrganizations: string[];
    hashedPassword: string;
}

export interface ISessionPayload {
    _id: string;
    username: string;
    email: string;
    joinedOrganizations: string[];
}

export interface ISession extends ISessionPayload {
    accessToken: string;
}

export interface RegisterPayload {
    [key: string]: any;
    username?: string;
    password: string;
    email: string;
    firstName?: string;
}

export interface ResetPassword {
    [key: string]: any;
    email: string;
    newPassword?: string;
    token?: string;
}

export interface ChangePassword {
    [key: string]: any;
    oldPassword: string;
    newPassword: string;
}

export interface OrgPayload {
    [key: string]: any;
    name: string;
    password: string;
    oldPassword?: string;
    owner?: string;
    memberId?: string;
}
