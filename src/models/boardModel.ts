import { Schema, model, Document, Types } from 'mongoose';

interface IBoard extends Document {
    name: string;
    owner: Types.ObjectId;
    lists: Types.Array<Types.ObjectId>;
}

const boardSchema = new Schema<IBoard>({
    name: { type: String, required: true },
    owner: { type: Types.ObjectId as any, ref: 'Organization', required: true }, // Explicitly cast Types.ObjectId
    lists: [
        {
            list: { type: Types.ObjectId as any, ref: 'List' },
            position: { type: Number, required: true },
        },
    ],
});

const Board = model<IBoard>('Board', boardSchema);
export default Board;

/* 
const boardId = ...; // Board ID
const listIdToMove = ...; // ID of the list to move
const targetPosition = ...; // New position for the list

// Find the board by ID
const board = await Board.findById(boardId);

if (!board) {
    // Handle error, board not found
}

// Find the list to move within the board's lists array
const listToMove = board.lists.find((list) => list.listId.equals(listIdToMove));

if (!listToMove) {
    // Handle error, list not found in board
}

const currentPosition = listToMove.position;

// Update the positions of other lists to make room for the moved list
if (currentPosition < targetPosition) {
    // Moving the list down the order
    board.lists.forEach((list) => {
        if (list.position > currentPosition && list.position <= targetPosition) {
            list.position -= 1;
        }
    });
} else if (currentPosition > targetPosition) {
    // Moving the list up the order
    board.lists.forEach((list) => {
        if (list.position < currentPosition && list.position >= targetPosition) {
            list.position += 1;
        }
    });
}

// Update the position of the list being moved
listToMove.position = targetPosition;

// Save the updated board
await board.save();

*/
