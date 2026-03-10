import { router } from "../trpc";
import { generateRouter } from "./generate";

export const appRouter = router({
  generate: generateRouter,
});

export type AppRouter = typeof appRouter;