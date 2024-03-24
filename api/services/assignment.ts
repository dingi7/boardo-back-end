import Assigment from '../../models/assignment';

async function createAssigment(userId: string, cardId: string) {
    const currentUserAssignments = await Assigment.find({ user: userId });
    currentUserAssignments.forEach((assignment) => {
        if (assignment.card.toString() === cardId) {
            throw { message: 'Assignment already exists' };
        }
    });
    const assignment = new Assigment({ user: userId, card: cardId });
    await assignment.save();
    // activity writer
    return assignment;
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
    console.log('userId', userId);

    try {
        const assignments = await Assigment.find({ user: userId }).populate({
            path: 'card', // First level of population: populates the 'card' field
            populate: {
                path: 'list', // Second level of population: populates the 'list' field within each 'card'
                model: 'List', // Ensure you've defined the 'List' model somewhere in your code
            },
        });

        // populate card list

        return assignments;
    } catch (err) {
        throw err;
    }
}

async function getCardAssigments(cardId: string) {
    try {
        const assignments = await Assigment.find({ card: cardId }).populate(
            'user',
            '-hashedPassword -joinedOrganizations'
        );

        return assignments;
    } catch (err) {
        throw err;
    }
}

export {
    createAssigment,
    deleteAssigment,
    getUserAssigments,
    getCardAssigments,
};
