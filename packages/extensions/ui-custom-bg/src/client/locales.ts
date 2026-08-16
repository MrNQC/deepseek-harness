/** `customBg` namespace dictionaries (the floating background control's copy). */

/** Simplified Chinese dictionary (the key-set source of truth). */
export const zh = {
  'control.title': '自定义背景图片',
  'control.aria': '自定义背景图片',
  'control.pick': '选择 / 替换图片',
  'control.url.placeholder': '或粘贴图片 URL…',
  'control.url.apply': '应用',
  'control.visible': '透出',
  'control.reset': '恢复默认背景',
  'control.preview': '背景预览',
} satisfies Record<string, string>

/** The `customBg` namespace key union. */
export type CustomBgKey = keyof typeof zh

/** English dictionary, checked complete against the zh key set. */
export const en = {
  'control.title': 'Custom background image',
  'control.aria': 'Custom background image',
  'control.pick': 'Choose / replace image',
  'control.url.placeholder': 'or paste an image URL…',
  'control.url.apply': 'Apply',
  'control.visible': 'Visibility',
  'control.reset': 'Restore default background',
  'control.preview': 'Background preview',
} satisfies Record<CustomBgKey, string>

/** Namespace owning this feature's copy. */
export const NS = 'customBg'
