export const apiMockGetTo = (path, id) =>
  new Promise(done => {
    const name = path.slice(1)
    if (name === 'profile')
      setTimeout(
        () =>
          done({
            id,
            [name]: name + id,
          }),
        24
      )
    else {
      setTimeout(() => {
        let ar = Array(Math.round(1+Math.random() * 7)).fill(0)
        ar = ar.map((z, i) => i + ':' + id + '-' + name)
        done(ar)
      }, 64)
    }
  })
