import { z } from "zod";
import { publicProcedure } from "~/server/api/trpc";
import { db } from "~/server/db";
import { env } from "~/env";
import { GoogleGenerativeAI } from "@google/generative-ai";

const modelG = "gemini-1.5-pro-latest";
let requestCounter = 0;
const apiKey = env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({
  model: modelG,
  generationConfig: { maxOutputTokens: 8192 },
});

export async function callGemini(prompt: string, reqNumber: string) {
  const start = Date.now();
  const timer = setInterval(() => {
    const elapsed = Math.round((Date.now() - start) / 1000);
    console.log(
      `[Gemini] Requête #${reqNumber} toujours en cours... (${elapsed}s)`,
    );
  }, 5000);

  try {
    const result = await model.generateContent(prompt);
    const response = result.response;
    return { response: response.text() };
  } finally {
    clearInterval(timer);
  }
}

export const sendMessage = publicProcedure
  .input(
    z.object({
      content: z.string().min(1, "Message content cannot be empty"),
    }),
  )
  .mutation(async ({ input }) => {
    const { content } = input;
    const message = await sendMessageCore(content);
    return message;
  });

  export const sendMessageCore = async (content: string) => {
    const reqNumber = ++requestCounter;
    console.log(`[Gemini] Requête #${reqNumber} démarrée 🕵️`);
    // Log the message content
    const response = await callGemini(content, `${reqNumber}`);
    console.log(`[Gemini] Requête #${reqNumber} terminée ✅`);
    // Save the message to the database
    const message = await db.message.create({
      data: {
        text: content,
        response: {
          create: {
            text: response.response,
            model: modelG,
          },
        },
      },
    });

    // Log the saved message
    console.log("Saved message:", message);

    return message;
  }