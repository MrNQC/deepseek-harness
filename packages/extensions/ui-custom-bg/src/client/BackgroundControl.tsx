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

/**
 * Frame-wide floating background control (bottom-right). Picking a local file
 * reads it through FileReader into a data URL; the URL input applies remote
 * images directly. Every change re-applies the image through the injected
 * face, whose effects are owned by the plugin fiber and cleaned up on unload.
 */
export function BackgroundControl({ applyImage, t }: BackgroundControlProps) {
  const [open, setOpen] = useState(false)
  const [image, setImage] = useState<AppliedImage | null>(null)
  const [visible, setVisible] = useState(25)
  const [urlText, setUrlText] = useState('')

  // Re-apply whenever the image or the visibility changes; the initial run
  // with `null` is a no-op (nothing applied yet).
  useEffect(() => {
    applyImage(image?.url ?? null, 1 - visible / 100)
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
