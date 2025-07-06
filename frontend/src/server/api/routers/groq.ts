import { createTRPCRouter } from "~/server/api/trpc";
import { sendAudio } from "./groq/sendAudio";

export const groqRouter = createTRPCRouter({
	sendAudio
});