import { Schema, model, Document, Types } from "mongoose";

interface IBoard extends Document {
    name: string;
    owner: Types.ObjectId;
    // members: Types.ObjectId[];
    members: Types.Array<Types.ObjectId>;
    lists: Types.Array<Types.ObjectId>;
}

const boardSchema = new Schema<IBoard>({
    name: { type: String, required: true },
    owner: { type: Types.ObjectId as any, ref: 'User', required: true }, // Explicitly cast Types.ObjectId
    members: [{ type: Types.ObjectId as any, ref: 'User' }],
    lists: [{ type: Types.ObjectId as any, ref: 'List' }],
});

const Board = model<IBoard>('Board', boardSchema);
export default Board;
