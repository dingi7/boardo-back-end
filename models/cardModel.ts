import { Schema, model, Document, Types } from 'mongoose';

interface ICard extends Document {
    name: string;
    list: Types.ObjectId;
    styles: {
        priority: string;
    };
    // Add other properties as needed
}

const cardSchema = new Schema<ICard>({
    name: { type: String, required: true },
    list: { type: Types.ObjectId as any, ref: 'List', required: true }, // Explicitly cast Types.ObjectId
    styles: {
        priority: { type: String, default: 'Normal' }, 
    },
});

const Card = model<ICard>('Card', cardSchema);
export default Card;
