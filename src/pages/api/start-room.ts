import type { APIRoute } from "astro";
import shortUUID from "short-uuid";
import { getGame, getSession } from "../../lib/game-saving/account";

export const post: APIRoute = async ({ redirect, request, cookies }) => {
	const userId = (await getSession(cookies))?.user.id;
	if (userId === undefined) {
		console.log("No user session, creating new room");
		const id = shortUUID().generate();
		return redirect(`/editor/${id}`, 302);
	}
	let gameId: string;
	try {
		const body = await request.json();
		if (typeof body.gameId !== "string") throw "Missing/invalid game id";
		gameId = body.gameId;
	} catch (error) {
		return new Response(
			typeof error === "string" ? error : "Bad request body",
			{ status: 400 }
		);
	}

	const game = await getGame(gameId);
	if (!game) return new Response("Game does not exist", { status: 404 });
	console.log("Game", gameId);

	if (game.ownerId !== userId)
		return new Response(`Can't start a game you don't own`, {
			status: 403,
		});

	return redirect(`/~/${gameId}`, 302);
};
