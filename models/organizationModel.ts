import { Schema, model, Document, Types } from 'mongoose';

interface IOrganization extends Document {
    owner: Types.ObjectId;
    name: string;
    members: Types.Array<Types.ObjectId>;
    password: string;
    activity: Types.Array<Types.ObjectId>;
}

const organizationSchema = new Schema<IOrganization>({
    name: { type: String, required: true },
    owner: { type: Types.ObjectId as any, ref: 'User', required: true }, // Explicitly cast Types.ObjectId
    members: [{ type: Types.ObjectId as any, ref: 'User' }],
    password: { type: String, required: true },
    activity: [{ type: Types.ObjectId as any, ref: 'Activity' }],
});

const Org = model<IOrganization>('Organization', organizationSchema);
export default Org;
