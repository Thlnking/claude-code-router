#!/usr/bin/env node

const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");

// 确保在开发模式下运行
process.env.NODE_ENV = "development";

// 获取本地 CLI 路径
const localCliPath = path.join(__dirname, "..", "dist", "cli.js");

// 获取命令行参数（跳过前两个：node 和脚本路径）
const args = process.argv.slice(2);

if (args.length === 0) {
	console.log("🔧 Local Development CLI for Claude Code Router");
	console.log("");
	console.log("Usage: node scripts/dev-cli.js [command]");
	console.log("");
	console.log("Commands:");
	console.log("  start         Start service in development mode");
	console.log("  stop          Stop development service");
	console.log("  status        Show development service status");
	console.log("  code          Execute code command using development service");
	console.log("  -v, version   Show version information");
	console.log("  -h, help      Show this help information");
	console.log("");
	console.log("Examples:");
	console.log("  node scripts/dev-cli.js start");
	console.log("  node scripts/dev-cli.js status");
	console.log('  node scripts/dev-cli.js code "Write a Hello World"');
	console.log("");
	console.log("Note: This uses local development configuration (port 3457)");
	process.exit(1);
}

// 检查开发模式服务是否运行
function isDevServiceRunning() {
	const devPidFile = path.join(process.cwd(), ".claude-code-router", ".claude-code-router.pid");
	console.log("======>",devPidFile, fs.existsSync(devPidFile));
	if (!fs.existsSync(devPidFile)) {
		return false;
	}

	try {
		const pid = parseInt(fs.readFileSync(devPidFile, "utf-8"));
		console.log("======>",pid);

		// process.kill(pid, 0); // 发送信号 0 来检查进程是否存在
		return !!pid;
	} catch (e) {
		return false;
	}
}

// 等待服务启动
async function waitForDevService(timeout = 10000, initialDelay = 1000) {
	await new Promise((resolve) => setTimeout(resolve, initialDelay));

	const startTime = Date.now();
	while (Date.now() - startTime < timeout) {
		if (isDevServiceRunning()) {
			await new Promise((resolve) => setTimeout(resolve, 500));
			return true;
		}
		await new Promise((resolve) => setTimeout(resolve, 100));
	}
	return false;
}


function execCodeCommand() {

	// 执行代码命令
	const codeProcess = spawn("node", [localCliPath, "code", ...codeArgs], {
		stdio: "inherit",
		env: { ...process.env, NODE_ENV: "development" },
	});

	codeProcess.on("error", (error) => {
		console.error("❌ Failed to execute code command:", error);
		process.exit(1);
	});

	codeProcess.on("exit", (code) => {
		process.exit(code);
	});
}

// 处理 code 命令
async function handleCodeCommand() {
	const codeArgs = args.slice(1); // 跳过 'code' 命令

	if (!isDevServiceRunning()) {
		console.log("🔧 Development service not running, starting service...");

		// 启动开发服务
		const startProcess = spawn("node", [localCliPath, "start"], {
			detached: true,
			stdio: "ignore",
			env: { ...process.env, NODE_ENV: "development" },
		});

		startProcess.on("error", (error) => {
			console.error("❌ Failed to start development service:", error);
			process.exit(1);
		});

		startProcess.unref();

		if (await waitForDevService()) {
			console.log("✅ Development service started, executing code command...");
			execCodeCommand()
		} else {
			console.error("❌ Development service startup timeout");
			console.log(
				'💡 Please run "npm run dev" to start the development service'
			);
			process.exit(1);
		}
	} else {
		console.log("🔧 Development service is running, executing code command...");
		execCodeCommand()
	}
}

// 主函数
async function main() {
	const command = args[0];

	if (command === "code") {
		await handleCodeCommand();
		return;
	}

	// 对于其他命令，直接传递给本地 CLI
	const child = spawn("node", [localCliPath, ...args], {
		stdio: "inherit",
		env: { ...process.env, NODE_ENV: "development" },
	});

	child.on("error", (error) => {
		console.error("❌ Failed to execute command:", error);
		process.exit(1);
	});

	child.on("exit", (code) => {
		process.exit(code);
	});
}

main().catch((error) => {
	console.error("❌ Error in development CLI:", error);
	process.exit(1);
});
