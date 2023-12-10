import Card from "../../models/cardModel";
import { addCardToList } from "./listService";

export async function getCardById(cardId: string) {
    try{
        const card = await Card.findById(cardId);
        if(!card){
            throw new Error("Card not found");
        }
        return card;
    }catch(err: any){
        throw err;
    }
}

export async function createCard(name: string, listId: string) {
    const card = new Card({
        name,
        list: listId,
    });
    await addCardToList(listId, card._id);
    await card.save();
    return card;
}

export async function deleteCardById(cardId: string, ownerId: string) {
    const card = await getCardById(cardId);
    await card.deleteOne();
    return { message: 'Card deleted successfully' };
}