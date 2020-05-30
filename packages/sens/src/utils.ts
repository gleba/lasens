export const clearObject = o => {
  Object.keys(o).forEach(n => {
    if (!primitiveExceptions[n]) delete o[n]
  })
}

export const primitiveExceptions = {
  toString: true,
  [Symbol.toStringTag]: true,
  [Symbol.toPrimitive]: true,
}
