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


export function newRune(length:number):string {
  let charset =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
    i,
    result = ''
  if ((process as any).browser) {
    if (window.crypto && window.crypto.getRandomValues) {
      let values = new Uint32Array(length)
      window.crypto.getRandomValues(values)
      for (i = 0; i < length; i++) {
        result += charset[values[i] % charset.length]
      }
      return result
    }
    for (i = 0; i < length; i++) {
      result += charset[Math.floor(Math.random() * charset.length)]
    }
    return result
  } else {
    return Buffer.alloc(length, require('crypto').randomBytes(length)).toString('hex')
  }
}
