import { z } from "zod";
import { publicProcedure } from "~/server/api/trpc";
import { db } from "~/server/db";

const modelG = "supply-agent-hackathon";
let requestCounter = 0;

interface QueryRequest {
  query: string;
}

interface QueryResponse {
  result: string;
}

export async function callSquadAgent(query: string, reqNumber: string) {
  const start = Date.now();
  const timer = setInterval(() => {
    const elapsed = Math.round((Date.now() - start) / 1000);
    console.log(
      `[Squad Agent] Requête #${reqNumber} toujours en cours... (${elapsed}s)`,
    );
  }, 5000);

  try {
    const response = await fetch("https://thesquad.fr/agent/query", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query } as QueryRequest),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = (await response.json()) as QueryResponse;
    return { response: data.result };
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
    const message = await sendMessageCore(content, modelG);

    return message;
  });

  export async function sendMessageCore(
    content: string,
    model: string = modelG,
  ) {
    const reqNumber = ++requestCounter;
    console.log(`[Squad Agent] Requête #${reqNumber} démarrée 🕵️`);
    // Log the message content
    console.log("Message content:", content);

    const response = await callSquadAgent(content, `${reqNumber}`);

    console.log(`[Squad Agent] Requête #${reqNumber} terminée ✅`);
    console.log("Squad Agent response:", response);

    // Save the message to the database
    const message = await db.message.create({
      data: {
        text: content,
        response: {
          create: {
            text: response.response,
            model,
          },
        },
      },
    });

    // Log the saved message
    console.log("Saved message:", message);

    return message;
  }
