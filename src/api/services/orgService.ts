import Org from '../../models/organization';
import { getUserById } from './auth';

async function createOrg(name: string, password: string, owner: string) {
    const org = new Org({
        name: name,
        password: password,
        owner: owner,
        members: [owner],
    });
    await org.save();
    const user = await getUserById(owner);
    user?.joinedOrganizations.push(org._id);
    await user?.save();
    return org;
}

async function joinOrg(orgId: string, orgPassword: string, userId: string) {
    const org = await Org.findById(orgId);
    if (!org) {
        throw new Error('Organization not found');
    }
    if (org.password !== orgPassword) {
        throw new Error('Wrong password');
    }
    if(org.members.includes(userId as any)) {
        throw new Error('User already in the organization');
    }
    org.members.push(userId);
    await org.save();
    const user = await getUserById(userId);
    user?.joinedOrganizations.push(orgId);
    await user?.save();
    return org;
}

export { createOrg, joinOrg };
