import { spawn } from "child_process";
import {
  incrementReferenceCount,
  decrementReferenceCount,
} from "./processCheck";
import { closeService } from "./close";
import { readConfigFile } from ".";
import {isDevMode} from "../constants";

export async function executeCodeCommand(args: string[] = []) {
  console.log(" ====>",args);
  // Set environment variables
  const config = await readConfigFile();



  const common_env = {
    ...process.env,
    ANTHROPIC_BASE_URL: `http://127.0.0.1:${config.PORT || isDevMode() ? 3457 : 3456 }`,
    API_TIMEOUT_MS: "600000",
  };

  const other_env = config?.APIKEY ? { ANTHROPIC_API_KEY: config.APIKEY } : {};



  const env = {
    ...common_env,
    ...other_env,
  };

  // Increment reference count when command starts
  incrementReferenceCount();

  // Execute claude command
  const claudePath = process.env.CLAUDE_PATH || "claude";
  const claudeProcess = spawn(claudePath, args, {
    env,
    stdio: "inherit",
    shell: true,
  });

  claudeProcess.on("error", (error) => {
    console.error("Failed to start claude command:", error.message);
    console.log(
      "Make sure Claude Code is installed: npm install -g @anthropic-ai/claude-code"
    );
    decrementReferenceCount();
    process.exit(1);
  });

  claudeProcess.on("close", (code) => {
    decrementReferenceCount();
    closeService();
    process.exit(code || 0);
  });
}
