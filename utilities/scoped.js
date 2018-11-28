const prop = require('ramda/src/prop')
const pipe = require('ramda/src/pipe')
const over = require('ramda/src/over')
const lensProp = require('ramda/src/lensProp')
const unless = require('ramda/src/unless')
const isPlainObj = require('ramda-adjunct/lib/isPlainObj').default
const { EmptyObject } = require('monocycle/utilities/empty')
const toPairs = require('ramda/src/toPairs')

const makeScopedFunction = (options = {}) => {

  const {
    dependencies,
    closure
  } = pipe(
    // over(lensProp('closure'), unless(isFalse, pipe(
    //   ensureArray,
    //   filter(isString),
    //   reduce((signature) => {
    //   }, '')
    // ))),
    over(lensProp('dependencies'), pipe(
      unless(isPlainObj, EmptyObject),
      toPairs,
    )),
  )(options)

  // console.log('makeScopedFunction()', {
  //   dependencies,
  //   options,
  // })

  const keys = dependencies.map(prop(0))
  const values = dependencies.map(prop(1))

  const ScopedFunction = body => {


    const func = new Function(...keys, body)
    const ret = func(...values)

    console.log('ScopedFunction()', {
      body,
      keys,
      ret: typeof ret
    })
    return ret
  }

  return ScopedFunction
}

module.exports = {
  default: makeScopedFunction,
  makeScopedFunction
}