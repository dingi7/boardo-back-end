import { Document } from 'mongoose';
import { IUser } from './Auth';
import { IBoard } from './BoardInterface';

export interface IActivity {
    user: IUser | string
    organization: any
    board?: IBoard | string
    action: string;
    timeStamp?: string;
}
