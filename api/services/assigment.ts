import Assigment from '../../models/assigment';

async function createAssigment(userId: string, cardId: string) {
    const assigment = new Assigment({ user: userId, card: cardId });
    await assigment.save();
    // activity writer
    return assigment;
}

async function deleteAssigment(assigmentId: string) {
    try {
        await Assigment.deleteOne({ _id: assigmentId });
    } catch (err) {
        throw err;
    }
    return { message: 'Assigment deleted successfully' };
}

async function getUserAssigments(userId: string) {
    try {
        const assigments = await Assigment.find({ user: userId });
        return assigments;
    } catch (err) {
        throw err;
    }
}

async function getCardAssigments(cardId: string){
    try {
        const assigments = await Assigment.find({ card: cardId }).populate('user', '-hashedPassword -joinedOrganizations');
       
        return assigments;
    } catch (err) {
        throw err;
    }
}

export { createAssigment, deleteAssigment, getUserAssigments, getCardAssigments };
