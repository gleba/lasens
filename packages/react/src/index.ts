// Copyright (c) Gleb Panteleev. All rights reserved. Licensed under the MIT license.

/**
 * Набор хуков для Preact
 * @remarks
 * @packageDocumentation
 */

// @ts-ignore
import { useMemo , useEffect, useState } from 'react'
import { A } from 'alak'

export const UiSyncAtom = {
  add : "sync-add",
  remove : "sync-remove"
}

export function useSyncAtom<T>(atom: IAtom<T>): T {
  const [state, mutate] = useState(atom.value)
  const mutator = v => mutate(v)
  useEffect(() => {
    let id = Math.random()
    atom.up(mutator)
    atom.dispatch(UiSyncAtom.add, id)
    atom.parents && atom.parents.forEach(a=>a.dispatch(UiSyncAtom.add, id))
    return () => {
      atom.down(mutator)
      atom.dispatch(UiSyncAtom.remove, id)
      atom.parents && atom.parents.forEach(a=>a.dispatch(UiSyncAtom.remove, id))
    }
  }, [atom])
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
  }, [atom])
  return state
}
