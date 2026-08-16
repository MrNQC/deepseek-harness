import { useEffect, useState } from 'react'
import type { InjectFace, PropsLocale } from '@deepseek-ai/dsh-client-ui-slots'
import type { CustomBgInjected } from './index.ts'
import css from './BackgroundControl.module.css'

/** Full floating-control component props: injected business face & the locale seat. */
export type BackgroundControlProps = InjectFace<CustomBgInjected> & PropsLocale<'customBg'>

/** One applied image: its display source and the local file name when picked. */
interface AppliedImage {
  url: string
  name: string
}

/** localStorage key owning this feature's persisted background state. */
const STORAGE_KEY = 'dsh.ui-custom-bg.v1'

/** The persisted slice: image source plus the visibility percentage. */
interface PersistedState {
  url: string
  name: string
  visible: number
}

/**
 * Read the persisted background state. A corrupt or oversized entry (a huge
 * data URL can exceed the localStorage quota and fail to write) reads as
 * `null` — persistence is best-effort, never a crash.
 */
function loadPersisted(): PersistedState | null {
  // Non-browser runs (node e2e booting the client tree) have no localStorage.
  if (typeof localStorage === 'undefined') return null
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw === null) return null
    const parsed = JSON.parse(raw) as Partial<PersistedState>
    if (typeof parsed.url !== 'string' || typeof parsed.name !== 'string') return null
    return {
      url: parsed.url,
      name: parsed.name,
      visible: typeof parsed.visible === 'number' && Number.isFinite(parsed.visible) ? parsed.visible : 25,
    }
  } catch {
    return null
  }
}

/** Write (or clear) the persisted background state; quota failures are ignored. */
function savePersisted(state: PersistedState | null): void {
  // Non-browser runs (node e2e booting the client tree) have no localStorage.
  if (typeof localStorage === 'undefined') return
  try {
    if (state === null) {
      localStorage.removeItem(STORAGE_KEY)
    } else {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    }
  } catch {
    // Quota exceeded or storage disabled: the in-memory background still
    // applies for this page, it just will not survive a reload.
  }
}

/**
 * Frame-wide floating background control (bottom-right). Picking a local file
 * reads it through FileReader into a data URL; the URL input applies remote
 * images directly. Every change re-applies the image through the injected
 * face (owned by the plugin fiber, cleaned up on unload) and persists the
 * choice to localStorage so a reload restores the same background.
 */
export function BackgroundControl({ applyImage, t }: BackgroundControlProps) {
  // Read the saved state once (lazy initializer); a fresh visit starts empty.
  const [initial] = useState(loadPersisted)
  const [open, setOpen] = useState(false)
  const [image, setImage] = useState<AppliedImage | null>(() => (
    initial === null ? null : { url: initial.url, name: initial.name }
  ))
  const [visible, setVisible] = useState(() => initial?.visible ?? 25)
  const [urlText, setUrlText] = useState('')

  // Re-apply whenever the image or the visibility changes, and persist the
  // current choice. The initial run with `null` is a no-op apply plus a
  // no-op removeItem.
  useEffect(() => {
    applyImage(image?.url ?? null, 1 - visible / 100)
    if (image === null) {
      savePersisted(null)
    } else {
      savePersisted({ url: image.url, name: image.name, visible })
    }
  }, [image, visible, applyImage])

  const onPick = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const file = event.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      setImage({ url: String(reader.result), name: file.name })
    }
    reader.readAsDataURL(file)
    // Reset the input so picking the same file again still fires `change`.
    event.target.value = ''
  }

  const onApplyUrl = (): void => {
    const text = urlText.trim()
    if (text === '') return
    setImage({ url: text, name: 'URL' })
    setUrlText('')
  }

  const onReset = (): void => {
    setImage(null)
    setVisible(25)
    setUrlText('')
  }

  const button = (
    <button
      type="button"
      className={css.button}
      aria-label={t('control.aria')}
      title={t('control.title')}
      onClick={() => setOpen(prev => !prev)}
    >
      🖼️
    </button>
  )

  if (!open) return button

  return (
    <>
      {button}
      <div className={css.panel} role="dialog" aria-label={t('control.title')}>
        <div className={css.title}>{t('control.title')}</div>

        {image !== null && (
          <>
            <img className={css.preview} src={image.url} alt={t('control.preview')} />
            <div className={css.fileName}>{image.name}</div>
          </>
        )}

        <label className={css.pick}>
          <input
            type="file"
            accept="image/*"
            onChange={onPick}
            hidden
          />
          {t('control.pick')}
        </label>

        <div className={css.urlRow}>
          <input
            className={css.urlInput}
            type="text"
            value={urlText}
            placeholder={t('control.url.placeholder')}
            onChange={event => setUrlText(event.target.value)}
          />
          <button type="button" className={css.urlApply} onClick={onApplyUrl}>
            {t('control.url.apply')}
          </button>
        </div>

        <label className={css.visibleRow}>
          <span className={css.visibleLabel}>{t('control.visible')}: {visible}%</span>
          <input
            className={css.slider}
            type="range"
            min={0}
            max={100}
            value={visible}
            onChange={event => setVisible(Number(event.target.value))}
          />
        </label>

        <button type="button" className={css.reset} onClick={onReset}>
          {t('control.reset')}
        </button>
      </div>
    </>
  )
}
