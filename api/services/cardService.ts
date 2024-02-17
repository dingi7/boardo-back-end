import Card from '../../models/cardModel';
import { writeActivity } from '../../util/ActivityWriter';
import pusher from '../../util/PusherUtil';
import { addCardToList, getListById } from './listService';

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
    await card.save();
    await addCardToList(listId, card);
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
    const list = await getListById(card.list.toString());
    await card.deleteOne();
    pusher.trigger(list.board.toString(), 'card-deleted', 
        card,
    );
    console.log('pusher triggered for card-deleted event');
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
    name?: string,
    priority?: string,
    dueDate?: Date
) {
    const card = (await getCardById(cardId)) as any;
    card.name = name || card.name;
    card.styles.priority = priority || card.styles.priority;

    card.dueDate = dueDate || card.dueDate;
    await card.save();
    const list = await getListById(card.list.toString());
    pusher.trigger(list.board.toString(), 'card-edited', 
        card,
    );
    console.log('pusher triggered for card-edited event');
    writeActivity({
        user: userId,
        organization: organizationId,
        action: 'Edited card ' + card.name,
    });
    return card;
}
