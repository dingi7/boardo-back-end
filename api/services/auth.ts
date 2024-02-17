import bcrypt from 'bcrypt';
import User from '../../models/userModel';
import jsonwebtoken from 'jsonwebtoken';
import { generateUUID } from '../../util/UUID';
import PasswordRecovery from '../../models/passwordRecovery';
import { sendMail } from '../../util/Nodemailer';
import {
    RegisterPayload,
    IUser,
    AuthContext,
    ISession,
    ISessionPayload,
} from '../../interfaces/Auth';
const JWT_SECRET = process.env.JWT_SECRET || 'process.env.JWT_SECRET;'; // braking change

async function registerUser(userPayload: RegisterPayload) {
    const existingUser = await User.findOne({ email: userPayload.email });
    if (existingUser) {
        throw new Error('User already exists');
    }
    const hashedPassword = await hashPassword(userPayload.password);
    const user = new User({
        firstName: userPayload.firstName,
        username: userPayload.username,
        email: userPayload.email,
        hashedPassword: hashedPassword,
        joinedOrganizations: [],
    });
    await user.save();
    return createSession(user);
}

async function loginUser(userPayload: RegisterPayload) {
    const userByUsername = await findUser({ username: userPayload.username });
    const userByEmail = await findUser({ email: userPayload.email });

    const user = userByUsername || userByEmail;

    if (!user) {
        throw new Error('User not found');
    }

    await validatePassword(userPayload.password, user.hashedPassword);

    return createSession(user);
}

async function findUser(query: { username?: string; email?: string }): Promise<IUser | null> {
    return User.findOne<IUser>(query)
        .populate({
            path: 'joinedOrganizations',
            select: '-password',
            populate: {
                path: 'owner',
                select: '-hashedPassword -joinedOrganizations',
            },
        })
        .exec();
}

async function getUserById(id: string) {
    return await User.findById(id);
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

function verifySession(token: string): ISession {
    const decodedData = jsonwebtoken.verify(token, JWT_SECRET) as ISessionPayload;

    return {
        ...decodedData,
        accessToken: token,
    };
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

async function saveResetToken(userEmail: string): Promise<string> {
    const user = await findUser({ email: userEmail });

    if (!user) {
        throw new Error('User not found');
    }

    const uuid = generateUUID();
    const expiryDate = new Date(Date.now() + 3600000); // 1 hour

    const token = new PasswordRecovery({
        user: user._id,
        uuid: uuid,
        expiry: expiryDate,
    });

    await token.save();

    await sendResetPasswordEmail(user.firstName, userEmail, uuid);

    return uuid;
}

async function resetPassword(uuid: string, newPassword: string): Promise<void> {
    try {
        const token = await tokenValidator(uuid);

        const user = await getUserById(token.user);

        if (!user) {
            throw new Error('User not found');
        }

        const newPasswordHash = await hashPassword(newPassword);
        user.hashedPassword = newPasswordHash;

        await user.save();
        await token.deleteOne();
    } catch (error) {
        console.error('Error resetting password:', error.message);
        throw error;
    }
}

async function tokenValidator(uuid: string): Promise<any> {
    const token = await findPasswordRecoveryToken(uuid);

    if (!token || token.expiry < Date.now()) {
        throw new Error('Invalid or expired token');
    }

    return token;
}

async function findPasswordRecoveryToken(uuid: string): Promise<any> {
    const token = await PasswordRecovery.findOne({ uuid });
    return token;
}

async function sendResetPasswordEmail(firstName: string, userEmail: string, uuid: string): Promise<void> {
    const emailContent = `
        <p>Dear ${firstName},</p>
        <p>This is an automatic email in response to your request to reset your password. If you did not initiate this request, please ignore this email.</p>
        <p>To reset your password, click on the following link:</p>
        <p><a href="https://boardo.vercel.app/auth/resetPassword/${uuid}">Reset Your Password Here</a></p>
        <p>Please note that this link is valid for a limited time. If you did not request this password reset or have any concerns, please contact our support team immediately at <a href="mailto:info@board.site">info@board.site</a>.</p>
        <br>
        <p>Best regards,<br><br>
        Boardo Team</p>`;

    await sendMail('Password recovery', emailContent, userEmail);
}

async function changePassword(oldPassword:string, newPassword: string, userId: string) {
    const user = await getUserById(userId);
    if (!user) {
        throw new Error('User not found');
    }
    await validatePassword(oldPassword, user.hashedPassword);
    const newPasswordHash = await hashPassword(newPassword);
    user.hashedPassword = newPasswordHash;
    await user.save();
}

export {
    registerUser,
    loginUser,
    getUserById,
    verifySession,
    checkAuthorization,
    saveResetToken,
    resetPassword,
    tokenValidator,
    changePassword
};
