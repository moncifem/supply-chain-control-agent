import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";
import { geminiRouter } from "./routers/geminit";
import { agentRouter } from "./routers/agent";
import { groqRouter } from "./routers/groq";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  gemini: geminiRouter,
  agent: agentRouter,
  groq: groqRouter
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
