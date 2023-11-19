import { Schema, model, Document } from "mongoose";

interface IUser extends Document {
    firstName: string;
    username: string;
    email: string;
    hashedPassword: string;
}

const userSchema = new Schema<IUser>({
    firstName: { type: String, required: true },
    username: { type: String, required: true },
    email: { type: String, required: true },
    hashedPassword: { type: String, required: true },
});

const User = model<IUser>('User', userSchema);
export default User;
