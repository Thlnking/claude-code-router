#!/usr/bin/env node

const { spawn, exec } = require("child_process");
const fs = require("fs");
const path = require("path");
const os = require("os");

// 确保在开发模式下运行
process.env.NODE_ENV = "development";

// 开发模式检测函数
function isDevMode() {
	return process.env.NODE_ENV === "development";
}

// 获取 PID 文件路径
function getPidFile() {
	if (isDevMode()) {
		return path.join(process.cwd(), ".claude-code-router.pid");
	} else {
		return path.join(
			os.homedir(),
			".claude-code-router",
			".claude-code-router.pid"
		);
	}
}

async function cleanupPreviousService() {
	const pidFile = getPidFile();

	if (fs.existsSync(pidFile)) {
		try {
			const pid = parseInt(fs.readFileSync(pidFile, "utf-8"));

			// 检查进程是否还在运行
			try {
				process.kill(pid, 0); // 发送信号 0 来检查进程是否存在
				console.log(`🔄 Stopping previous service (PID: ${pid})...`);

				// 尝试优雅地停止进程
				process.kill(pid, "SIGTERM");

				// 等待进程停止
				await new Promise((resolve) => {
					setTimeout(resolve, 1000);
				});

				// 如果进程还在运行，强制杀死
				try {
					process.kill(pid, 0);
					console.log(`⚠️  Force killing service (PID: ${pid})...`);
					process.kill(pid, "SIGKILL");
				} catch (e) {
					// 进程已经停止
				}
			} catch (e) {
				// 进程不存在，清理 PID 文件
			}

			// 清理 PID 文件
			if (fs.existsSync(pidFile)) {
				fs.unlinkSync(pidFile);
			}

			console.log("✅ Previous service stopped");
		} catch (e) {
			console.log("⚠️  Error cleaning up previous service:", e.message);
		}
	}
}

async function startService() {
	console.log("🚀 Starting Claude Code Router in development mode...");
	console.log(
		`🔧 Dev mode: Using port 3457 (configurable in .claude-code-router/config.json)`
	);

	// 启动服务
	const child = spawn("node", ["dist/cli.js", "start"], {
		stdio: "inherit",
		env: { ...process.env, NODE_ENV: "development" },
	});

	child.on("error", (error) => {
		console.error("❌ Failed to start service:", error);
		process.exit(1);
	});

	child.on("exit", (code) => {
		if (code !== 0) {
			console.error(`❌ Service exited with code ${code}`);
			process.exit(code);
		}
	});

	// 处理进程信号
	process.on("SIGINT", async () => {
		console.log("\n🛑 Received SIGINT, stopping service...");
		await cleanupPreviousService();
		process.exit(0);
	});

	process.on("SIGTERM", async () => {
		console.log("\n🛑 Received SIGTERM, stopping service...");
		await cleanupPreviousService();
		process.exit(0);
	});
}

async function main() {
	try {
		await cleanupPreviousService();
		await startService();
	} catch (error) {
		console.error("❌ Error in development startup:", error);
		process.exit(1);
	}
}

main();
