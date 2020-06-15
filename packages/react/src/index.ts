// Copyright (c) Gleb Panteleev. All rights reserved. Licensed under the MIT license.

/**
 * Набор хуков для Preact
 * @remarks
 * @packageDocumentation
 */

// @ts-ignore
import { useEffect, useState } from 'react'

export function useSyncAtom<T>(atom: IAtom<T>): T {
  const [state, mutate] = useState(atom())
  useEffect(() => {
    atom.up(mutate)
    return () => atom.down(mutate)
  }, [atom])
  return state
}

export function useAtom<T>(atom: IAtom<T>): T {
  const [state, mutate] = useState(atom.value)
  useEffect(() => {
    atom.up(mutate)
    return () => atom.down(mutate)
  }, [atom])
  return state
}
