import path from "node:path";
import os from "node:os";

export const HOME_DIR = path.join(os.homedir(), ".claude-code-router");

export const CONFIG_FILE = path.join(HOME_DIR, "config.json");

export const PLUGINS_DIR = path.join(HOME_DIR, "plugins");

export const PID_FILE = path.join(HOME_DIR, '.claude-code-router.pid');

export const REFERENCE_COUNT_FILE = path.join(os.tmpdir(), "claude-code-reference-count.txt");

export const DEFAULT_CONFIG = {
  LOG: false,
  OPENAI_API_KEY: "",
  OPENAI_BASE_URL: "",
  OPENAI_MODEL: "",
};

// 检查是否为开发模式
export const isDevMode = () => process.env.NODE_ENV === 'development';

// 以当前项目目录为 home目录
export const DEV_HOME_DIR = path.join(process.cwd(), ".claude-code-router");

export const DEV_CONFIG_FILE = path.join(DEV_HOME_DIR, "config.json");

export const DEV_PLUGINS_DIR = path.join(DEV_HOME_DIR, "plugins");

export const DEV_PID_FILE = path.join(DEV_HOME_DIR, '.claude-code-router.pid');

export const DEV_REFERENCE_COUNT_FILE = path.join(os.tmpdir(), "claude-code-reference-count.txt");

// 根据环境返回相应的路径
export const getHomeDir = () => isDevMode() ? DEV_HOME_DIR : HOME_DIR;
export const getConfigFile = () => isDevMode() ? DEV_CONFIG_FILE : CONFIG_FILE;
export const getPluginsDir = () => isDevMode() ? DEV_PLUGINS_DIR : PLUGINS_DIR;
export const getPidFile = () => isDevMode() ? DEV_PID_FILE : PID_FILE;
export const getReferenceCountFile = () => isDevMode() ? DEV_REFERENCE_COUNT_FILE : REFERENCE_COUNT_FILE;


