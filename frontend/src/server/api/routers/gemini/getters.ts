import { publicProcedure } from "../../trpc";
import { db } from "~/server/db";
import { z } from "zod";
import fs from "fs";
import path from "path";
import type { Prisma } from "@prisma/client";

// Récupérer tous les messages avec leur réponse associée
export const getMessages = publicProcedure.query(async () => {
  const messages = await db.message.findMany({
    include: {
      response: true,
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  return messages;
});


// Récupérer toutes les réponses avec leur message associé
export const getResponses = publicProcedure.query(async () => {
  return await db.response.findMany({
    include: {
      message: true,
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
});
