export const createTRPCContext = async () => {
  return {};
};

export type Context = Awaited<ReturnType<typeof createTRPCContext>>;
