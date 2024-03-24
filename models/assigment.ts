import { Schema, model, Document, Types } from 'mongoose';

interface IAssigment extends Document {
    user: Types.ObjectId;
    card: Types.ObjectId;

}

const assigmentSchema = new Schema<IAssigment>({
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    card: { type: Schema.Types.ObjectId, ref: 'Card', required: true },
});

const Assigment = model<IAssigment>('assigmentSchema', assigmentSchema);
export default Assigment;
