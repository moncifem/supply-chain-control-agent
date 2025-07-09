import { createTRPCRouter } from "~/server/api/trpc";
import { getMessages, getResponses } from "./message/getters";


export const messageRouter = createTRPCRouter({
	getMessages,
	getResponses,
});
