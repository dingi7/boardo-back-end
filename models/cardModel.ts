import { Schema, model, Document, Types } from 'mongoose';

interface ICard extends Document {
    name: string;
    list: Types.ObjectId;
    dueDate: Date;
    styles: {
        priority: string;
    };
}

const cardSchema = new Schema<ICard>({
    name: { type: String, required: true },
    list: { type: Types.ObjectId as any, ref: 'List', required: true }, // Explicitly cast Types.ObjectId
    dueDate: { type: Date },
    styles: {
        priority: { type: String, default: 'Normal' }, 
    },
});

const Card = model<ICard>('Card', cardSchema);
export default Card;
