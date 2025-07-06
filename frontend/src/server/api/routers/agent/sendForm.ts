import { z } from "zod";
import { publicProcedure } from "~/server/api/trpc";
import { db } from "~/server/db";
import path from "path";
import { promises as fs } from "fs";

const generatorQuery = (jsonSchema: string, dataset: string) => {
  return `Please generate the shipment structure block for a supply chain AI agent system prompt.

The section must start with:
"Here is how the shipment process is structured (with timestamps and flags):"

Use the JSON schema below to identify:
- Step names
- Relevant timestamps and flags
- Expected and actual dates
- Final delivery condition
- Any fields that help explain delays

Here is the JSON schema:
${jsonSchema}

Here is a sample of the dataset (first 2–3 rows):
${dataset}

Return only the structured steps explanation block.
`;};

const modelG = "Meta-Agent-hackathon";
// let requestCounter = 0;

interface QueryRequest {
  prompt: string;
}

interface QueryResponse {
  response: string;
}

export async function callSquadAgent(prompt: string, reqNumber: string) {
	const start = Date.now();
	const timer = setInterval(() => {
		const elapsed = Math.round((Date.now() - start) / 1000);
		console.log(
			`[Squad Agent] Requête #${reqNumber} toujours en cours... (${elapsed}s)`,
		);
	}, 5000);

	try {
		const response = await fetch("https://thesquad.fr/agent/generate-prompt", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prompt } as QueryRequest),
    });

		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		const data = (await response.json()) as QueryResponse;
		return { response: data.response };
	} finally {
		clearInterval(timer);
	}
}

export const sendForm = publicProcedure
  .input(
    z.object({
      jsonSchema: z.string().min(1, "JSON schema is required"),
      dataset: z.string().min(1, "Dataset is required"),
    }),
  )
  .mutation(async ({ input }) => {
		const { jsonSchema, dataset } = input;

		// Generate the prompt for the agent
		const prompt = generatorQuery(jsonSchema, dataset);

		// Call the agent with the generated prompt
		const response = await callSquadAgent(prompt, "1");

		// Save the response to the database
		const message = await db.message.create({
      data: {
        text: prompt,
        response: {
          create: {
            text: response.response,
            model: modelG,
          },
        },
      },
    });
		const PROMPT_FILE_PATH = path.join(
			process.cwd(),
			"src/app/api/prompt/prompt.txt",
		);
		// Écrire directement le prompt dans le fichier txt
				await fs.writeFile(PROMPT_FILE_PATH, response.response, "utf8");
		return message;
	});
