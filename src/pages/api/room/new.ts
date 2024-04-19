import type { APIRoute } from "astro";
import { User, getSession } from "../../../lib/game-saving/account";
import { assessCaptcha } from "../../../lib/recaptcha";
import { makeRoom } from "../../../lib/rooms";
import shortUUID from "short-uuid";

export const post: APIRoute = async ({ request, cookies }) => {
	let password: string | undefined;

	try {
		const body = await request.json();
		if (body.password && typeof body.password !== "string")
			throw "Invalid password";
		password = body.password;
	} catch (error) {
		return new Response(
			typeof error === "string" ? error : "Bad request body",
			{ status: 400 }
		);
	}

	let sessionInfo = await getSession(cookies);
	let user: User;
	if (!(sessionInfo && sessionInfo.session.full)) {
		return new Response("Unauthorized", { status: 401 });
	}
	user = sessionInfo.user;
	const roomId = shortUUID.generate();
	console.log("Creating room with id: ", roomId);
	makeRoom(user.id, roomId, password);

	return new Response(JSON.stringify({}), { status: 200 });
};
