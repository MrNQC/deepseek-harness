/**
 * Custom background image control, browser half: registers a frame-wide
 * floating control in the `shell.overlay` seat. The control lets a person
 * pick a local image (FileReader → data URL) or paste an image URL, applies
 * it as a fixed full-viewport `body` background, and makes the app surfaces
 * translucent through `theme.overrideTokens` so the image shows through the
 * workspace; a visibility slider and a reset verb round it out. All effects
 * belong to this plugin's fiber and are removed on unload.
 */
import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client'
// Type-only: pulls the locale plugin's Context merge (ctx.locale).
import type {} from '@deepseek-ai/dsh-client-locale/client'
// Type-only: pulls the ui-theme Context merge (ctx.theme) for overrideTokens.
import type {} from '@deepseek-ai/dsh-client-ui-theme/client'
// Type-only: pulls the ui-layout SlotMap merge (the shell.overlay seat).
import type {} from '@deepseek-ai/dsh-client-ui-layout/client'
import { BackgroundControl } from './BackgroundControl.tsx'
import { en, NS, type CustomBgKey, zh } from './locales.ts'

export type { BackgroundControlProps } from './BackgroundControl.tsx'

declare module '@deepseek-ai/dsh-client-ui-slots' {
  interface LocaleNamespaceMap {
    /** The floating background control's copy. */
    customBg: CustomBgKey
  }
}

/** Business face injected into the floating control component. */
export interface CustomBgInjected {
  /**
   * Apply the background image (or clear it with `null`).
   * @param url - image data URL / remote URL, or `null` to restore the default surface colors.
   * @param alpha - surface opacity between 0 and 1; the image shows through `1 - alpha`.
   */
  applyImage(url: string | null, alpha: number): void
}

/** Required services: the overlay seat, the theme registry, and the locale registry. */
export const inject = ['slots', 'theme', 'locale']

/**
 * Client plugin body: register the floating background control.
 * @param ctx - client root context.
 */
export function apply(ctx: ClientContext): void {
  ctx.effect(() => ctx.locale.register(NS, { zh, en }), 'ui-custom-bg: dictionaries')

  // Owned style tag + token layer, recreated on every applyImage call and
  // removed together on plugin unload.
  let styleTag: HTMLStyleElement | null = null
  let disposeTokens: (() => void) | null = null

  const applyImage = (url: string | null, alpha: number): void => {
    if (styleTag !== null) {
      styleTag.remove()
      styleTag = null
    }
    if (disposeTokens !== null) {
      disposeTokens()
      disposeTokens = null
    }
    if (url === null) return
    styleTag = document.createElement('style')
    styleTag.dataset.plugin = 'custom-bg'
    styleTag.textContent = [
      'body{background-image:url("' + url + '")!important;',
      'background-size:cover!important;background-position:center!important;',
      'background-attachment:fixed!important;}',
    ].join('')
    document.head.append(styleTag)
    const a = Math.max(0.15, Math.min(1, alpha))
    const light = 'rgb(255 255 255 / ' + a + ')'
    const dark = 'rgb(15 17 21 / ' + a + ')'
    disposeTokens = ctx.theme.overrideTokens('ui-custom-bg', {
      '--dsw-alias-bg-base': { light, dark },
      '--dsw-specific-sidebar-fill': { light, dark },
    })
  }

  ctx.effect(() => () => {
    styleTag?.remove()
    disposeTokens?.()
  }, 'ui-custom-bg: background cleanup')

  ctx.slots.inject('shell.overlay', () => ctx.slots.register({
    name: 'shell.overlay',
    id: 'custom-bg-control',
    locale: NS,
    inject: (): CustomBgInjected => ({ applyImage }),
  }, BackgroundControl))
}
