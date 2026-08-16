# @deepseek-ai/dsh-client-ui-custom-bg

[English](README.md) | 中文

一个全窗口浮动控件（右下角 🖼️ 按钮），可把用户选择的图片设为应用背景。选择本地图片文件（通过 `FileReader` 读成 data URL）或粘贴远程图片 URL；图片以固定全视口 `body` 背景应用，同时通过 `theme.overrideTokens` 把应用表面 token（`--dsw-alias-bg-base`、`--dsw-specific-sidebar-fill`）调成半透明，让图片从工作区透出而不替换主题。透出度滑块控制图片可见程度（越高 = 表面越透明），一键"恢复默认背景"还原默认表面颜色。

## Model Experience

无：本包不渲染任何提示内容、不注册模型工具、不写入任何会话事件。唯一表面是 `shell.overlay` 席位中的浮动控件，由人直接操作。

#### KV Cache effect

无：这里不产生任何提示输入。

## Known Limitations and Deferred Work

- **背景是逐标签页、逐插件运行的** —— 已应用的图片与透出度保存在组件状态中，刷新页面或重启插件即恢复默认。跨刷新持久化选择是后续工作。
- **远程 URL 可能被 CORS 或防盗链拦截** —— 只有主机把图片作为普通 `<img>`/CSS 背景提供时粘贴的 URL 才能渲染（CSS 背景不需要 CORS，但 403 防盗链仍会失败）。
- **仅对两个应用表面 token 应用透明** —— 使用 `--dsw-alias-bg-layer-1`/`-2` 的凸起表面保持不透明，因此图片从工作区底色透出，而卡片与浮层保持可读。
