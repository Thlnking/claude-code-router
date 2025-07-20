# Development Mode

## 概述

Claude Code Router 现在支持开发模式，允许开发者在项目目录中进行开发和测试，而不影响用户的正式配置。

## 功能特性

### 🔧 开发模式标识

- 当 `NODE_ENV=development` 时自动启用开发模式
- 在状态输出中显示开发模式标识
- 在日志中显示开发模式信息

### 📁 独立配置目录

- 配置文件存储在项目目录的 `.claude-code-router/` 文件夹中
- 与用户的正式配置（`~/.claude-code-router/`）完全隔离
- 自动创建开发配置目录

### 🔄 热重载支持

- 使用 `nodemon` 监控源文件变化
- 自动重新构建和重启服务
- 支持 TypeScript 文件的热重载
- **智能服务管理**: 在重启前自动关闭之前的服务，避免端口冲突

### 🛡️ 安全隔离

- 开发模式的 PID 文件独立存储
- 引用计数文件独立管理
- 日志文件存储在项目目录中
- **端口隔离**: 开发模式默认使用端口 3457，避免与生产模式（3456）冲突

## 使用方法

### 1. 启动开发模式

```bash
npm run dev
```

这个命令会：

- 设置 `NODE_ENV=development`
- 监控 `src/**` 目录下的 TypeScript 文件变化
- 在重启前自动关闭之前的服务
- 自动重新构建和重启服务

### 2. 配置开发环境

复制开发配置示例：

```bash
mkdir -p .claude-code-router
cp config.dev.example.json .claude-code-router/config.json
```

然后编辑 `.claude-code-router/config.json` 文件，添加你的 API 密钥和配置。

**注意**: 开发模式默认使用端口 3457，可以在配置文件中修改。

### 3. 使用本地开发版本

**重要**: 开发模式下应该使用本地版本，而不是全局的 `ccr` 命令！

#### 检查服务状态

```bash
# 使用本地开发版本
npm run dev:status
# 或者
node scripts/dev-cli.js status
```

#### 执行代码命令

```bash
# 使用本地开发版本
npm run dev:code "Hello, World!"
# 或者
node scripts/dev-cli.js code "Hello, World!"
```

#### 停止服务

```bash
# 使用本地开发版本
npm run dev:stop
# 或者
node scripts/dev-cli.js stop
```

### 4. 便捷的开发脚本

项目提供了便捷的 npm 脚本：

```bash
npm run dev:start    # 启动开发服务
npm run dev:stop     # 停止开发服务
npm run dev:status   # 查看开发服务状态
npm run dev:code     # 执行代码命令
```

## 文件结构

开发模式下的文件结构：

```
project-root/
├── .claude-code-router/          # 开发配置目录
│   ├── config.json              # 开发配置文件
│   ├── plugins/                 # 开发插件目录
│   └── claude-code-router.log   # 开发日志文件
├── .claude-code-router.pid      # 开发模式 PID 文件
├── config.dev.example.json      # 开发配置示例
├── nodemon.json                 # nodemon 配置文件
├── scripts/dev-start.js         # 开发模式启动脚本
├── scripts/dev-cli.js           # 本地开发 CLI 脚本
└── src/                         # 源代码目录
```

## 配置示例

开发配置文件 (`config.dev.example.json`) 示例：

```json
{
	"HOST": "127.0.0.1",
	"PORT": 3457,
	"LOG": true,
	"Providers": [
		{
			"name": "openai",
			"api_base_url": "https://api.openai.com/v1",
			"api_key": "your-openai-api-key-here",
			"models": ["gpt-4", "gpt-3.5-turbo"]
		}
	],
	"Router": {
		"default": "openai,gpt-4"
	}
}
```

## 开发工作流

1. **克隆项目**

   ```bash
   git clone <repository-url>
   cd claude-code-router
   ```

2. **安装依赖**

   ```bash
   npm install
   ```

3. **配置开发环境**

   ```bash
   cp config.dev.example.json .claude-code-router/config.json
   # 编辑配置文件，添加你的 API 密钥
   ```

4. **启动开发模式**

   ```bash
   npm run dev
   ```

5. **测试功能**

   ```bash
   # 在另一个终端中
   npm run dev:status
   npm run dev:code "Hello, World!"
   ```

6. **修改代码**
   - 编辑 `src/` 目录下的文件
   - 服务会自动重新构建和重启
   - 之前的服务会被自动关闭

## 端口配置

### 默认端口

- **生产模式**: 3456 (全局 `ccr` 命令)
- **开发模式**: 3457 (本地开发版本)

### 自定义端口

可以在 `.claude-code-router/config.json` 中修改 `PORT` 字段：

```json
{
	"PORT": 3458
	// ... 其他配置
}
```

## 注意事项

### Git 忽略

- `.claude-code-router/` 目录已添加到 `.gitignore`
- 开发配置文件不会被提交到版本控制

### 环境变量

- 开发模式通过 `NODE_ENV=development` 环境变量启用
- 可以在 `nodemon.json` 中看到这个设置

### 端口冲突

- 开发模式默认使用端口 3457
- 如果端口被占用，可以在配置文件中修改 `PORT` 字段
- 服务重启时会自动关闭之前的服务，避免端口冲突

### 日志文件

- 开发模式的日志文件存储在项目目录中
- 可以通过设置 `LOG: true` 启用详细日志

### 重要提醒

- **不要使用全局 `ccr` 命令**: 全局命令会使用生产环境配置（端口 3456）
- **使用本地开发版本**: 使用 `npm run dev:*` 脚本或 `node scripts/dev-cli.js`
- **配置隔离**: 开发配置与生产配置完全分离

## 故障排除

### 服务无法启动

1. 检查配置文件是否正确
2. 确认 API 密钥有效
3. 检查端口是否被占用
4. 确认之前的服务已正确关闭

### 热重载不工作

1. 确认 `nodemon` 已安装
2. 检查 `nodemon.json` 配置是否正确
3. 查看终端输出是否有错误信息

### 配置不生效

1. 确认配置文件在正确的目录中
2. 检查 JSON 格式是否正确
3. 重启开发服务

### 端口冲突

1. 检查是否有其他服务占用端口 3457
2. 在配置文件中修改端口
3. 使用 `npm run dev:stop` 停止所有相关服务

### 使用了错误的命令

1. 确认使用的是本地开发版本，不是全局 `ccr`
2. 使用 `npm run dev:status` 检查状态
3. 使用 `npm run dev:code` 执行代码命令

## 贡献指南

当为项目贡献代码时：

1. 使用开发模式进行本地测试
2. 确保代码在开发模式下正常工作
3. 测试生产模式和开发模式的兼容性
4. 更新相关文档

## 相关文件

- `src/constants.ts` - 开发模式常量定义
- `src/utils/index.ts` - 开发模式路径处理
- `src/utils/processCheck.ts` - 开发模式进程管理
- `src/utils/status.ts` - 开发模式状态显示
- `package.json` - 开发脚本配置
- `nodemon.json` - nodemon 配置文件
- `scripts/dev-start.js` - 开发模式启动脚本
- `scripts/dev-cli.js` - 本地开发 CLI 脚本
- `config.dev.example.json` - 开发配置示例
