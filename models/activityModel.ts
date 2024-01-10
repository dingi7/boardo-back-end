import { Schema, model, Document, Types } from 'mongoose';

interface IActivity extends Document {
    user: { type: Types.ObjectId; ref: 'User'; required: true };
    organization: { type: Types.ObjectId; ref: 'Organization'; required: true };
    board: { type: Types.ObjectId; ref: 'Board'; required: false };
    action: string;
    timeStamp: Date;
}

const activitySchema = new Schema<IActivity>(
    {
        user: { type: Types.ObjectId, ref: 'User', required: true },
        organization: {
            type: Types.ObjectId,
            ref: 'Organization',
            required: true,
        },
        board: { type: Types.ObjectId, ref: 'Board', required: false },
        action: { type: String, required: true },
        timeStamp: { type: Date, default: Date.now }
    },
    {}
);

const Activity = model<IActivity>('Activity', activitySchema);
export default Activity;
