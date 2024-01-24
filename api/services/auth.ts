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
} from '../../interfaces/Auth';
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
    })
        .populate('joinedOrganizations')
        .select('-password')
        .populate('joinedOrganizations.owner')
        .select('-hashedPassword -joinedOrganizations')
        .exec();

    const userByEmail = await User.findOne<IUser>({
        email: userPayload.email,
    })
        .populate('joinedOrganizations')
        .select('-password')
        .populate('joinedOrganizations.owner')
        .select('-hashedPassword -joinedOrganizations')
        .exec();

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
    const uuid = generateUUID();
    const token = new PasswordRecovery({
        user: user._id,
        uuid: uuid,
        expirity: new Date(Date.now() + 3600000), // 1 hour
    });

    await token.save();
    await sendMail(
        'Password recovery',
        `<p>Dear ${user.firstName},</p>

        <p>This is an automatic email in response to your request to reset your password. If you did not initiate this request, please ignore this email.</p>
    
        <p>To reset your password, click on the following link:</p>
        <p><a href="https://boardo.vercel.app/auth/resetPassword/${uuid}">Reset Your Password Here</a></p>
    
        <p>Please note that this link is valid for a limited time. If you did not request this password reset or have any concerns, please contact our support team immediately at <a href="mailto:info@board.site">info@board.site</a>.</p>
        <br>
        <p>Best regards,<br><br>
        Boardo Team</p>`,
        userEmail
    );
    return uuid;
}

async function resetPassword(uuid: string, newPassword: string) {
    try {
        // Find the password recovery token
        const token: any = await PasswordRecovery.findOne({ uuid });

        if (!token) {
            throw new Error('Invalid token');
        }

        // Check if the token has expired
        if (Number(token.expiry) < Date.now()) {
            throw new Error('Token expired');
        }

        // Find the user by the token's user ID
        const user = await User.findById(token.user);

        if (!user) {
            throw new Error('User not found');
        }

        // Hash the new password
        const newPasswordHash = await hashPassword(newPassword);

        // Update the user's hashedPassword field
        user.hashedPassword = newPasswordHash;

        // Save the updated user
        await user.save();

        // Delete the password recovery token
        await token.deleteOne();
    } catch (error) {
        // Handle errors appropriately
        console.error('Error resetting password:', error.message);
        throw error;
    }
}

async function tokenValidarot(uuid: string) {
    const token: any = await PasswordRecovery.findOne({ uuid });
    if (!token) {
        throw new Error('Invalid token');
    }
    if (Number(token.expiry) < Date.now()) {
        throw new Error('Token expired');
    }
    return token;
}

export {
    registerUser,
    loginUser,
    getUserById,
    verifySession,
    checkAuthorization,
    getUserByEmail,
    saveResetToken,
    resetPassword,
    tokenValidarot,
};
