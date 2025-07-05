import { createTRPCRouter } from "~/server/api/trpc";
import { sendMessage } from "./agent/sendMessage";


export const agentRouter = createTRPCRouter({
	sendMessage
});
