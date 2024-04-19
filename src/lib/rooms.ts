import { Timestamp } from "firebase-admin/firestore";
import { addDocument, getDocument } from "./game-saving/account";

export interface Room {
	id: string;
	owner: string;
	password: string | undefined;
	createdAt: Timestamp;
	modifiedAt: Timestamp;
}

export const makeRoom = async (
	userId: string,
	roomId: string,
	password: string | undefined
): Promise<Room> => {
	let data = {
		owner: userId,
		id: roomId,
		password: password,
		createdAt: Timestamp.now(),
		modifiedAt: Timestamp.now(),
	};
	console.log("Creating room with id: ", roomId + "by user: ", userId);

	// const _room = await addDocument("rooms", data);

	return { ...data } as Room;
};

export const getRoom = async (roomId: string): Promise<Room | null> => {
	const _room = await getDocument("rooms", roomId);
	if (!_room.exists) return null;
	return { id: _room.id, ..._room.data() } as Room;
};
