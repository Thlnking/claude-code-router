import fs from "node:fs/promises";
import readline from "node:readline";
import {
  getConfigFile,
  getHomeDir,
  getPluginsDir,
  DEFAULT_CONFIG,
  isDevMode,
} from "../constants";

const ensureDir = async (dir_path: string) => {
  try {
    await fs.access(dir_path);
  } catch {
    await fs.mkdir(dir_path, { recursive: true });
  }
};

export const initDir = async () => {
  const homeDir = getHomeDir();
  const pluginsDir = getPluginsDir();
  
  await ensureDir(homeDir);
  await ensureDir(pluginsDir);
  
  if (isDevMode()) {
    console.log(`🔧 Dev mode: Using project directory: ${homeDir}`);
  }
};

const createReadline = () => {
  return readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
};

const question = (query: string): Promise<string> => {
  return new Promise((resolve) => {
    const rl = createReadline();
    rl.question(query, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
};

const confirm = async (query: string): Promise<boolean> => {
  const answer = await question(query);
  return answer.toLowerCase() !== "n";
};

export const readConfigFile = async () => {
  const configFile = getConfigFile();
  try {
    const config = await fs.readFile(configFile, "utf-8");
    return JSON.parse(config);
  } catch {
    const name = await question("Enter Provider Name: ");
    const APIKEY = await question("Enter Provider API KEY: ");
    const baseUrl = await question("Enter Provider URL: ");
    const model = await question("Enter MODEL Name: ");
    const config = Object.assign({}, DEFAULT_CONFIG, {
      Providers: [
        {
          name,
          api_base_url: baseUrl,
          api_key: APIKEY,
          models: [model],
        },
      ],
      Router: {
        default: `${name},${model}`,
      },
    });
    await writeConfigFile(config);
    return config;
  }
};

export const writeConfigFile = async (config: any) => {
  const homeDir = getHomeDir();
  const configFile = getConfigFile();
  await ensureDir(homeDir);
  await fs.writeFile(configFile, JSON.stringify(config, null, 2));
};

export const initConfig = async () => {
  const config = await readConfigFile();
  Object.assign(process.env, config);
  return config;
};
