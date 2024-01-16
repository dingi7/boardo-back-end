import { Types } from 'mongoose';
import Org from '../../models/organization';
import { getUserById } from './auth';

async function createOrg(name: string, password: string, owner: string) {
    try {
        const user = await getUserById(owner);
        const org = new Org({
            name: name,
            password: password,
            owner: user?._id,
            members: [user?._id],
        });
        await org.save();
        user?.joinedOrganizations.push(org._id);
        await user?.save();
        return org;
    } catch (err: any) {
        console.log(err);
        // throw err;
    }
}

async function editOrg(
    orgId: string,
    userId: string,
    name?: string,
    password?: string,
    ownerId?: string
) {
    const org = await getOrgById(orgId);
    if (!org) {
        throw new Error('Organization not found');
    }
    if (!org.owner.equals(userId)) {
        throw new Error('Unauthorized');
    }
    if (name) {
        org.name = name;
    }
    if (password) {
        org.password = password;
    }
    if (ownerId) {
        org.owner = new Types.ObjectId(ownerId);
    }
    await org.save();
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
    if (org.members.includes(userId as any)) {
        throw new Error('User already in the organization');
    }
    org.members.push(userId);
    await org.save();
    const user = await getUserById(userId);
    user?.joinedOrganizations.push(orgId);
    await user?.save();
    return org;
}

async function getOrgById(orgId: string, populate = false) {
    try {
        const org = await Org.findById(new Types.ObjectId(orgId)).select(
            '-password'
        );
        if (!org) {
            throw new Error('Organization not found');
        }
        if (populate) {
            await (
                await (
                    await org.populate(
                        'owner',
                        '-hashedPassword -joinedOrganizations'
                    )
                ).populate('activity')
            ).populate('members', '-hashedPassword -joinedOrganizations');
        }
        return org;
    } catch (err: any) {
        console.log(err);
        if (
            err.message ===
            'input must be a 24 character hex string, 12 byte Uint8Array, or an integer'
        ) {
            throw new Error('Organization not found');
        }
        throw err;
    }
}

async function getOrgsByMemberId(memberId: string, populate = false) {
    // const orgs = await Org.find({ members: memberId }).populate('members -hashedPassword -joinedOrganizations').exec();
    // console.log(orgs);

    // if (!orgs) {
    //     throw new Error('Organization not found');
    // }
    // return orgs;

    try {
        const orgs = await Org.find({ members: memberId }).select('-password');
        if (!orgs) {
            throw new Error('Organization not found');
        }
        if (populate) {
            orgs.forEach(async (org) => {

                await org.populate('owner', '-hashedPassword -joinedOrganizations')
                await org.populate('activity')
                await org.populate('members', '-hashedPassword -joinedOrganizations')});
        }
        return orgs;
    } catch (err: any) {
        console.log(err);
        if (
            err.message ===
            'input must be a 24 character hex string, 12 byte Uint8Array, or an integer'
        ) {
            throw new Error('Organization not found');
        }
        throw err;
    }
}

async function getAllOrgs() {
    const orgs = await Org.find({}).select('-owner -members -password').exec();
    if (!orgs) {
        throw new Error('No organizations were found');
    }
    return orgs;
}

async function addActivityToOrg(orgId: string, activityId: string) {
    const org = await getOrgById(orgId);
    org.activity.push(activityId);
    await org.save();
    return org;
}

export {
    createOrg,
    joinOrg,
    getOrgById,
    getOrgsByMemberId,
    getAllOrgs,
    addActivityToOrg,
    editOrg,
};
