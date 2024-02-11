import { ObjectId, Types } from 'mongoose';
import Org from '../../models/organizationModel';
import { getUserById } from './auth';

async function createOrg(name: string, password: string, owner: string) {
    try {
        const user = await getUserById(owner);

        if (!user) {
            throw new Error('Owner not found');
        }

        const org = new Org({
            name: name,
            password: password,
            owner: user._id,
            members: [user._id],
        });

        await org.save();

        user.joinedOrganizations.push(org._id);
        await user.save();

        return (await org.populate('owner', '-hashedPassword -joinedOrganizations')).populate('members', '-hashedPassword -joinedOrganizations');
    } catch (err: any) {
        console.error('Error in createOrg:', err.message);
        throw err;
    }
}

async function editOrg(
    orgId: string,
    userId: string,
    name?: string,
    oldPassword?: string,
    password?: string,
    ownerId?: string
) {
    const org = await getOrgById(orgId, false, true);
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
        if (oldPassword !== org.password) {
            throw new Error('Wrong password');
        }
        org.password = password;
    }
    if (ownerId) {
        org.owner = new Types.ObjectId(ownerId);
    }
    await org.save();
    return org;
}

async function deleteOrg(orgId: string, userId: string, orgPassword: string) {
    const org = await getOrgById(orgId, false, true);
    console.log(org.owner, userId, org.owner.equals(userId));
    console.log(org.password, orgPassword);

    if (!org) {
        throw new Error('Organization not found');
    }
    if (!org.owner.equals(userId) || org.password !== orgPassword) {
        throw new Error('Unauthorized');
    }
    await org.deleteOne();
    return { message: 'Organization deleted' };
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

async function leaveOrg(orgId: string, userId: string) {

    const org = await Org.findById(orgId);
    if (!org) {
        throw new Error('Organization not found');
    }
    if (!org.members.includes(userId as any)) {
        throw new Error('User not in the organization');
    }
    org.members.pull(userId);
    await org.save();
    const user = await getUserById(userId);
    const indexToRemove = user!.joinedOrganizations.findIndex(id  => {
        return id === userId
    });
    user?.joinedOrganizations && user.joinedOrganizations.splice(indexToRemove, 1);
    await user?.save();
    if(org.members.length === 0){
        await org.deleteOne();
        return {message: 'Organization deleted'}
    }
    return org;
}

async function getOrgById(orgId: string, populate = false, password = false) {
    try {
        if (password) {
            const org = await Org.findById(orgId);
            if (!org) {
                throw new Error('Organization not found');
            }
            return org;
        }
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
    const orgs = await Org.find({ members: memberId })
        .select('-password')
        .populate({
            path: 'members',
            select: '-hashedPassword -joinedOrganizations',
        })
        .populate({
            path: 'activity',
            populate: {
                path: 'user',
                select: '-hashedPassword -joinedOrganizations',
            },
        })
        .populate({
            path: 'owner',
            select: '-hashedPassword -joinedOrganizations',
        })
        .exec();

    if (!orgs) {
        throw new Error('Organization not found');
    }
    return orgs;
}

async function getAllOrgs() {
    const orgs = await Org.find({})
        .select('-owner -members -password -activity')
        .exec();
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

async function kickMember(ordId: string, memberId: string, userId: string) {
    const org = await getOrgById(ordId);
    if (!org) {
        throw new Error('Organization not found');
    }
    if (!org.owner.equals(userId)) {
        throw new Error('Unauthorized');
    }
    org.members.pull(memberId);
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
    deleteOrg,
    leaveOrg,
    kickMember,
};
