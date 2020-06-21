// Copyright (c) Gleb Panteleev. All rights reserved. Licensed under the MIT license.

/**
 * Набор хуков для Preact
 * @remarks
 * @packageDocumentation
 */

// @ts-ignore
import { useMemo , useEffect, useState } from 'react'

export const UiSyncAtom = {
  add : "sync-add",
  remove : "sync-remove"
}

export function useSyncAtom<T>(atom: IAtom<T>): T {
  const [state, mutate] = useState(atom.value)
  const mutator = v => mutate(v)
  useMemo(() => {
    atom()
  }, [])
  useEffect(() => {
    let id = Math.random()
    atom.up(mutator)
    atom.dispatch(UiSyncAtom.add, id)
    return () => {
      atom.down(mutator)
      atom.dispatch(UiSyncAtom.remove, id)
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
