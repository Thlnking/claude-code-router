import { existsSync } from "fs";
import { writeFile } from "fs/promises";
import { homedir } from "os";
import { join } from "path";
import { initConfig, initDir } from "@/utils";
import { createServer } from "@/server";
import { router } from "@/utils/router";
import { apiKeyAuth } from "@/middleware/auth";
import {
  cleanupPidFile,
  isServiceRunning,
  savePid,
} from "@/utils/processCheck";
import { getHomeDir, getConfigFile, getPidFile} from "@/constants";

const isDev = process.env.NODE_ENV === "development";


async function initializeClaudeConfig() {
  const configPath = join(getHomeDir(), ".claude.json");
  if (!existsSync(configPath)) {
    const userID = Array.from(
      { length: 64 },
      () => Math.random().toString(16)[2]
    ).join("");
    const configContent = {
      numStartups: 184,
      autoUpdaterStatus: "enabled",
      userID,
      hasCompletedOnboarding: true,
      lastOnboardingVersion: "1.0.17",
      projects: {},
    };
    await writeFile(configPath, JSON.stringify(configContent, null, 2));
  }
}

interface RunOptions {
  port?: number;
}

async function run(options: RunOptions = {}) {
  // Check if service is already running

  const pidFile = getPidFile()
    if (isServiceRunning(pidFile)) {
    console.log (
      `${isDev ? "development" : ""}. ✅ Service is already running in the background, PID file found at ${pidFile},  .`
    );
    return;
  }

  await initializeClaudeConfig();
  await initDir();
  const config = await initConfig();
  let HOST = config.HOST || "127.0.0.1";

  if (config.HOST && !config.APIKEY) {
    HOST = "127.0.0.1";
    console.warn(
      "⚠️ API key is not set. HOST is forced to 127.0.0.1."
    );
  }

  const port = config.PORT || isDev ? 3457: 3456;

  // Save the PID of the background process
  savePid(process.pid, pidFile);

  // Handle SIGINT (Ctrl+C) to clean up PID file
  process.on("SIGINT", () => {
    const pidFile = getPidFile()
    console.log(` Received SIGINT, cleaning up pidFile ${pidFile}..`);
    cleanupPidFile(getPidFile());
    process.exit(0);
  });

  // Handle SIGTERM to clean up PID file
  process.on("SIGTERM", () => {
    cleanupPidFile(getPidFile());
    process.exit(0);
  });
  console.log(`=========> Starting service on ${HOST}:${port}`);

  // Use port from environment variable if set (for background process)
  const servicePort = process.env.SERVICE_PORT
    ? parseInt(process.env.SERVICE_PORT)
    : port;
  const server = createServer({
    jsonPath: getConfigFile(),
    initialConfig: {
      // ...config,
      providers: config.Providers || config.providers,
      HOST: HOST,
      PORT: servicePort,
      LOG_FILE: join(
        homedir(),
        ".claude-code-router",
        "claude-code-router.log"
      ),
    },
  });
  server.addHook("preHandler", apiKeyAuth(config));
  server.addHook("preHandler", async (req: any, reply: any) =>
    router(req, reply, config)
  );
  server.start();
}

export { run };
// run();
