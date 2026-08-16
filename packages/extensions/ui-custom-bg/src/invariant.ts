/**
 * Package-owned invariant companion for `@deepseek-ai/dsh-client-ui-custom-bg`.
 * @module @deepseek-ai/dsh-client-ui-custom-bg/invariant
 */

/* jscpd:ignore-start */
import type { Context } from '@deepseek-ai/cordis'
import type { InvariantInstaller } from '@deepseek-ai/dsh-invariants'

const PACKAGE_NAME = '@deepseek-ai/dsh-client-ui-custom-bg'

/** Cordis companion plugin name. */
export const name = 'client-ui-custom-bg-invariant'
/** Service required before the companion can reserve package ownership. */
export const inject = ['invariants']

/**
 * No runtime invariant: the browser half is a single `shell.overlay` list
 * entry whose registration and teardown are exercised by this package, and
 * the node half emits no cordis events and holds no cross-plugin state.
 */
const install: InvariantInstaller = () => {}

/**
 * Register this package's invariant companion.
 * @param ctx - Cordis context carrying the invariant service.
 * @returns the installed registration's disposer after setup succeeds.
 */
export const apply = (ctx: Context): Promise<() => void> =>
  Promise.resolve(ctx.invariants.register(PACKAGE_NAME, install))
/* jscpd:ignore-end */
