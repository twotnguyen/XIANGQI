import process from "node:process";

// The shared local .env sets development for the server; web builds always use production React.
process.env.NODE_ENV = "production";
const { build } = await import("vite");
await build();
