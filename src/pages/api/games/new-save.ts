import { APIRoute } from "astro";
import { WebrtcProvider } from "y-webrtc";
import * as Y from "yjs";

export const post: APIRoute = async ({ request, cookies }) => {
	try {
		const body = await request.json();
		if (typeof body.id !== "string") throw "Missing/invalid id";
		const id = body.id;
		storeGame(id);
		console.log("Game stored");
	} catch (error) {
		return new Response(
			typeof error === "string" ? error : "Bad request body",
			{ status: 400 }
		);
	}
	return new Response(JSON.stringify({}), { status: 200 });
};

async function storeGame(id: string) {
	console.log("Storing game with id", id);
	const yDoc = new Y.Doc();
	console.log("YDoc", yDoc);
	const provider = new WebrtcProvider(id, yDoc, {
		signaling: ["wss://yjs-signaling-server-5fb6d64b3314.herokuapp.com"],
	});
	console.log("Provider", provider);
	const ytext = yDoc.getText("codemirror");
	const yUndoManager = new Y.UndoManager(ytext);

	provider.awareness.setLocalStateField("user", {
		name: "Saving",
	});
	yDoc.on("update", (update) => {
		console.log("Update", update);
	});
}
