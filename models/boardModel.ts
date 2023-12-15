import { Schema, model, Document, Types } from 'mongoose';

interface IBoard extends Document {
    name: string;
    owner: Types.ObjectId;
    lists: Types.Array<Types.ObjectId>;
    backgroundUrl?: { type: String },
}

const boardSchema = new Schema<IBoard>({
    name: { type: String, required: true },
    owner: { type: Types.ObjectId as any, ref: 'Organization', required: true }, // Explicitly cast Types.ObjectId
    lists: [{ type: Types.ObjectId as any, ref: 'List' }],
    backgroundUrl: { type: String },
});

const Board = model<IBoard>('Board', boardSchema);
export default Board;

