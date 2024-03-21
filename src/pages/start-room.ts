import type { APIRoute } from "astro";
import shortUUID from "short-uuid";

export const get: APIRoute = async ({ redirect }) => {
	const id = shortUUID().generate();

	return redirect(`/editor/${id}`, 302);
};
