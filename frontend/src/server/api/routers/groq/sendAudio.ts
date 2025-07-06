import { z } from "zod";
import { publicProcedure } from "~/server/api/trpc";
import { db } from "~/server/db";
import { env } from "~/env";
import Groq from "groq-sdk";
import fs from "fs";
import path from "path";
import { sendMessageCore } from "../agent/sendMessage";

const modelG = "whisper-large-v3-turbo";

// Fonction pour déterminer l'extension de fichier basée sur le mimeType
function getFileExtension(mimeType?: string): string {
  if (!mimeType) return ".webm"; // Default pour MediaRecorder

  const mimeToExt: Record<string, string> = {
    "audio/wav": ".wav",
    "audio/wave": ".wav",
    "audio/mp3": ".mp3",
    "audio/mpeg": ".mp3",
    "audio/mp4": ".mp4",
    "audio/webm": ".webm",
    "audio/ogg": ".ogg",
    "audio/flac": ".flac",
  };

  return mimeToExt[mimeType] ?? ".webm";
}

export async function callGroqAudio(audioPath: string, reqNumber: string) {
  const start = Date.now();
  const timer = setInterval(() => {
    const elapsed = Math.round((Date.now() - start) / 1000);
    console.log(
      `[Groq] Requête #${reqNumber} toujours en cours... (${elapsed}s)`,
    );
  }, 5000);

  try {
    const groq = new Groq({
      apiKey: env.GROQ_API_KEY,
    });

    const response = await groq.audio.transcriptions.create({
      model: modelG,
      file: fs.createReadStream(audioPath), // Utiliser le bon chemin
    });

    return { response: response.text };
  } finally {
    clearInterval(timer);
  }
}

export const sendAudio = publicProcedure
  .input(
    z.object({
      audio: z.string().min(1, "Audio content cannot be empty"),
      mimeType: z.string().optional(),
    }),
  )
  .mutation(async ({ input }) => {
    const { audio, mimeType } = input;
    const reqNumber = Date.now();
    console.log(`[Groq] Requête #${reqNumber} démarrée 🕵️`);
    console.log(`[Groq] MIME Type: ${mimeType ?? "non spécifié"}`);

    // Créer le dossier audio s'il n'existe pas
    const audioDir = path.join(process.cwd(), "uploads", "audio");
    if (!fs.existsSync(audioDir)) {
      fs.mkdirSync(audioDir, { recursive: true });
    }

    // Obtenir le dernier ID d'audio
    const lastAudio = (await db.audio.findFirst({
      orderBy: { id: "desc" },
      select: { id: true },
    })) ?? { id: 0 };

    // Déterminer l'extension basée sur le mimeType
    const fileExtension = getFileExtension(mimeType);
    const fileName = `${lastAudio.id + 1}${fileExtension}`;
    const filePath = path.join(audioDir, fileName);

    try {
      // Écrire le fichier audio
      fs.writeFileSync(filePath, audio, "base64");
      console.log(`[Groq] Fichier audio sauvé: ${filePath}`);

      // Transcrire avec Groq
      const response = await callGroqAudio(filePath, `${reqNumber}`);
      console.log(`[Groq] Requête #${reqNumber} terminée ✅`);
      console.log("Groq response:", response);


      const message = await sendMessageCore(response.response);
			fs.unlinkSync(filePath); // Nettoyer le fichier après utilisation
			console.log(`[Groq] Requête #${reqNumber} terminée et message envoyé ✅`);
			return message;
    } catch (error) {
      // Nettoyer le fichier en cas d'erreur
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      throw error;
    }
  });
