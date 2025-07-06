import { createTRPCRouter } from "~/server/api/trpc";
import { sendMessage } from "./agent/sendMessage";
import { sendForm } from "./agent/sendForm";


export const agentRouter = createTRPCRouter({
	sendMessage,
	sendForm
});
