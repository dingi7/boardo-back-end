import { Schema, model, Document, Types } from 'mongoose';

interface IUser extends Document {
    firstName: string;
    username: string;
    email: string;
    hashedPassword: string;
    joinedOrganizations: Types.Array<Types.ObjectId>;
}

const userSchema = new Schema<IUser>({
    firstName: { type: String, required: true },
    username: { type: String, required: true },
    email: { type: String, required: true },
    hashedPassword: { type: String, required: true },
    joinedOrganizations: [{ type: Types.ObjectId, ref: 'Organization' }],
});

const User = model<IUser>('User', userSchema);
export default User;
