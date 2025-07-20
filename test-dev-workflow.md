# 开发模式工作流程测试

## 测试步骤

### 1. 构建项目

```bash
npm run build
```

### 2. 配置开发环境

```bash
mkdir -p .claude-code-router
cp config.dev.example.json .claude-code-router/config.json
# 编辑配置文件，添加你的 API 密钥
```

### 3. 测试开发模式 CLI

```bash
# 检查状态（应该显示开发模式）
node scripts/dev-cli.js status

# 检查帮助信息
node scripts/dev-cli.js help
```

### 4. 启动开发模式

```bash
npm run dev
```

### 5. 在另一个终端测试功能

```bash
# 检查状态
npm run dev:status

# 执行代码命令
npm run dev:code "Hello, World!"
```

### 6. 停止服务

```bash
npm run dev:stop
```

## 预期结果

- ✅ 开发模式 CLI 正确显示开发模式标识
- ✅ 使用端口 3457（不是生产模式的 3456）
- ✅ 配置文件存储在项目目录 `.claude-code-router/`
- ✅ 服务重启时自动关闭之前的服务
- ✅ 热重载正常工作

## 关键改进

1. **端口隔离**: 开发模式使用 3457，生产模式使用 3456
2. **智能服务管理**: 自动关闭之前的服务
3. **本地开发 CLI**: 专门的开发模式命令
4. **配置隔离**: 开发配置与生产配置完全分离
