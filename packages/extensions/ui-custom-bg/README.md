# @deepseek-ai/dsh-client-ui-custom-bg

English | [中文](README.zh.md)

A frame-wide floating control (bottom-right 🖼️ button) that sets a user-chosen image as the application background. Pick a local image file (read into a data URL through `FileReader`) or paste a remote image URL; the image is applied as a fixed full-viewport `body` background while the app surface tokens (`--dsw-alias-bg-base`, `--dsw-specific-sidebar-fill`) are made translucent through `theme.overrideTokens`, so the image shows through the workspace without replacing the theme. A visibility slider controls how much of the image shows (higher visibility = more translucent surfaces), and a reset verb restores the default surface colors. The chosen image and visibility persist to `localStorage`, so a page reload restores the same background.

## Model Experience

None: this package renders no prompt content, registers no model tool, and writes no session event. Its only surface is the floating control in the `shell.overlay` seat, which a person operates directly.

#### KV Cache effect

None: no prompt input originates here.

## Known Limitations and Deferred Work

- **Large local images may not survive a reload** — the picked image is stored in `localStorage` as a data URL, so a file large enough to exceed the storage quota falls back to a same-page-only background (the in-memory apply still works; only persistence is dropped).
- **Remote URLs may be blocked by CORS or hotlink protection** — a pasted URL renders only if the host serves the image to a plain `<img>`/CSS background (CSS backgrounds do not require CORS, but a 403 hotlink wall still fails).
- **Translucency is applied to the two app-surface tokens only** — raised surfaces using `--dsw-alias-bg-layer-1`/`-2` stay opaque, so the image shows through the workspace base while cards and overlays remain readable.
