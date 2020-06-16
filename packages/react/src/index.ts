// Copyright (c) Gleb Panteleev. All rights reserved. Licensed under the MIT license.

/**
 * Набор хуков для Preact
 * @remarks
 * @packageDocumentation
 */

// @ts-ignore
import { useMemo , useEffect, useState } from 'react'


export function useSyncAtom<T>(atom: IAtom<T>): T {
  const [state, mutate] = useState(atom.value)
  const mutator = v => mutate(v)
  useMemo(() => {
    atom()
  }, [])
  useEffect(() => {
    atom.up(mutator)
    return () => {
      atom.down(mutator)
    }
  }, [])
  return state
}
export function useAtom<T>(atom: IAtom<T>): T {
  const [state, mutate] = useState(atom.value)
  const mutator = v => mutate(v)
  useEffect(() => {
    atom.up(mutator)
    return () => {
      atom.down(mutator)
    }
  }, [])
  return state
}
