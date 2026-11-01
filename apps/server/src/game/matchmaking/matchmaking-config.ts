export function readMatchmakingConfig(env: Record<string, string | undefined>) {
  const enabled = env.MATCHMAKING_PAIR_LIMIT_ENABLED ?? "true";
  const minimum = env.RANKED_MINIMUM_GAMES ?? "5";
  if (!["true", "false"].includes(enabled) || !/^[1-5]$/.test(minimum)) throw new Error("Invalid YC9 configuration");
  const minimumGames = Number(minimum);
  const demo = enabled === "false" || minimumGames < 5;
  if (demo && (env.NODE_ENV === "production" || !(env.NODE_ENV === "development" || env.NODE_ENV === "test" || env.DEMO_ENABLED === "true"))) throw new Error("YC9 demo overrides are forbidden in release environments");
  return {pairLimitEnabled:enabled === "true",minimumGames,demo};
}
