// Copyright (c) Gleb Panteleev. All rights reserved. Licensed under the MIT license.

/**
 * Набор хуков для Preact
 * @remarks
 * @packageDocumentation
 */

// @ts-ignore
import { useCallback, useEffect, useState } from 'preact/hooks'

export function useAtom<T>(atom: IAtom<T>): T {
  const [state, fx] = useState(atom.value)

  // @ts-ignore
  useEffect(() => (atom.up(fx), () => atom.down(fx)))
  return state
}


