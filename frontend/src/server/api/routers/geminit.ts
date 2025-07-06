import { createTRPCRouter } from "~/server/api/trpc";
import { getMessages, getResponses } from "./gemini/getters";
import { sendMessage } from "./gemini/sendMessage";


export const geminiRouter = createTRPCRouter({
	getMessages,
	getResponses,
	sendMessage
});
