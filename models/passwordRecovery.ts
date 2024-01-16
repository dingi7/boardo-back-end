import { Schema, model, Document, Types } from 'mongoose';

interface IPasswordRecovery extends Document {
    user: { type: Types.ObjectId; ref: 'User'; required: true };
    uuid: { type: Types.ObjectId; ref: 'Organization'; required: true };
    expirity: { type: Date; required: true};
}

const passwordRecoverySchema = new Schema<IPasswordRecovery>({
    user: { type: Types.ObjectId, ref: 'User', required: true },
    uuid: { type: String, required: true }, 
    expirity: { type: Date, default: () => Date.now() + 3600000, required: true },
});

const PasswordRecovery = model<IPasswordRecovery>('PasswordRecovery', passwordRecoverySchema);
export default PasswordRecovery;
