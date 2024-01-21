import { Schema, model, Document, Types } from 'mongoose';

interface IList extends Document {
    name: string;
    board: Types.ObjectId;
    cards: Types.ObjectId[];
    styles: {
        backgroundColor: string;
    };
}

const listSchema = new Schema<IList>({
    name: { type: String, required: true },
    board: { type: Schema.Types.ObjectId, ref: 'Board', required: true },
    cards: [{ type: Schema.Types.ObjectId, ref: 'Card' }],
    styles: { type: Schema.Types.Mixed },
});

const List = model<IList>('List', listSchema);
export default List;
