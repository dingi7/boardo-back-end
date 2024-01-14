import { IUser } from './../../interfaces/User';
import bcrypt from 'bcrypt';
import { RegisterPayload } from '../../interfaces/RegisterPayload';
import User from '../../models/userModel';
import { ISession } from '../../interfaces/Session';
import jsonwebtoken from 'jsonwebtoken';
import { AuthContext } from '../../interfaces/AuthContext';
import { generateUUID } from '../../util/UUID';
import PasswordRecovery from '../../models/passwordRecovery';
const JWT_SECRET = process.env.JWT_SECRET || 'process.env.JWT_SECRET;';

async function registerUser(userPayload: RegisterPayload) {
    const alUser = await User.findOne({ email: userPayload.email });
    if (alUser) {
        throw new Error('User already exists');
    }
    const hashedPassword = await hashPassword(userPayload.password);
    const user = new User({
        firstName: userPayload.firstName,
        username: userPayload.username,
        email: userPayload.email,
        hashedPassword: hashedPassword,
        joinedOrganizations: [], // Add an empty array for joinedOrganizations
    });
    await user.save();
    return createSession(user);
}

async function loginUser(userPayload: RegisterPayload) {
    const userByUsername = await User.findOne<IUser>({
        username: userPayload.username,
    }).populate('joinedOrganizations');

    const userByEmail = await User.findOne<IUser>({ email: userPayload.email }).populate('joinedOrganizations');

    const user = userByUsername || userByEmail;

    if (!user) {
        throw new Error('User not found');
    }

    await validatePassword(userPayload.password, user.hashedPassword);
    return createSession(user);
}

async function getUserById(id: string) {
    return await User.findById(id);
}

async function getUserByEmail(email: string) {
    return await User.findOne<IUser>({ email });
}

function checkAuthorization(c: AuthContext): ISession | any {
    if (c.user) {
        return c.user;
    } else {
        throw new Error('Unauthorized');
    }
}

function createSession(user: IUser | any): ISession {
    // fix tipization later
    return {
        _id: user._id,
        username: user.username,
        email: user.email,
        joinedOrganizations: user.joinedOrganizations,
        accessToken: jsonwebtoken.sign({ _id: user._id }, JWT_SECRET),
    };
}

function verifySession(token: string) {
    const data = jsonwebtoken.verify(token, JWT_SECRET) as {
        _id: string;
        username: string;
        email: string;
        joinedOrganizations: string[];
    };
    const session: ISession = {
        _id: data._id,
        username: data.username,
        email: data.email,
        joinedOrganizations: data.joinedOrganizations,
        accessToken: token,
    };
    return session;
}

async function validatePassword(inputPassword: string, storedPassword: string) {
    const match = await bcrypt.compare(inputPassword, storedPassword);
    if (!match) {
        throw new Error('Invalid password');
    }
}

async function hashPassword(password: string) {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    return hashedPassword;
}

async function saveResetToken(userEmail: string) {
    const user = await getUserByEmail(userEmail);
    if (!user) {
        throw new Error('User not found');
    }
    const uuid = generateUUID()
    const token = new PasswordRecovery({
        user: user._id,
        uuid: uuid,
        expirity: new Date(Date.now() + 3600000), // 1 hour
    });
    await token.save();
    return uuid;
}

async function resetPassword(uuid: string, newPassword: string) {
    const token = await PasswordRecovery.findOne({ uuid: uuid });
    if (!token) {
        throw new Error('Invalid token');
    }
    if (Number(token.expirity) < Date.now()) {
        throw new Error('Token expired');
    }
    const user = await User.findById(token.user);
    if (!user) {
        throw new Error('User not found');
    }
    user.hashedPassword = await hashPassword(newPassword);
    await user.save();
    await token.deleteOne();
}

export {
    registerUser,
    loginUser,
    getUserById,
    verifySession,
    checkAuthorization,
    getUserByEmail,
    saveResetToken,
    resetPassword
};
