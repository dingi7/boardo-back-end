import Card from '../../models/cardModel';
import { writeActivity } from '../../util/ActivityWriter';
import { addCardToList } from './listService';

export async function getCardById(cardId: string) {
    try {
        const card = await Card.findById(cardId);
        if (!card) {
            throw new Error('Card not found');
        }
        return card;
    } catch (err: any) {
        throw err;
    }
}

export async function createCard(
    name: string,
    listId: string,
    userId: string,
    organizationId: string
) {
    const card = new Card({
        name,
        list: listId,
    });
    await addCardToList(listId, card._id);
    await card.save();
    writeActivity({
        user: userId,
        organization: organizationId,
        action: 'Created card ' + name + ' on list ' + listId,
    });
    return card;
}

export async function deleteCardById(
    cardId: string,
    userId: string,
    organizationId: string
) {
    const card = await getCardById(cardId);
    await card.deleteOne();
    writeActivity({
        user: userId,
        organization: organizationId,
        action: 'Deleted card ' + card.name,
    });
    return { message: 'Card deleted successfully' };
}

export async function editCard(
    cardId: string,
    userId: string,
    organizationId: string,
    name: string
) {
    const card = (await getCardById(cardId)) as any;
    card.name = name;
    await card.save();
    writeActivity({
        user: userId,
        organization: organizationId,
        action: 'Edited card ' + card.name,
    });
    return card;
}
