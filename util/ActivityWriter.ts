import { addActivityToOrg } from '../api/services/orgService';
import { IActivity } from '../interfaces/Activity';
import Activity from '../models/activityModel';

export const writeActivity = async ({
    user,
    organization,
    board,
    action,
}: IActivity ) => {
    const activity = new Activity({
        user: user,
        organization: organization,
        board: board,
        action,
    });
    await activity.save();
    await addActivityToOrg(organization, activity._id);
};
