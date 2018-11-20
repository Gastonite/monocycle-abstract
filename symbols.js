const { Store } = require('./store')
const { pipe } = require('monocycle/utilities/pipe')
const { makeComponent } = require('monocycle/component')
const { EmptyObject } = require('monocycle/utilities/empty')
const isFunction = require('ramda-adjunct/lib/isFunction').default
const isBoolean = require('ramda-adjunct/lib/isBoolean').default
const isPlainObj = require('ramda-adjunct/lib/isPlainObj').default
const isString = require('ramda-adjunct/lib/isString').default
const isUndefined = require('ramda-adjunct/lib/isUndefined').default
const assoc = require('ramda/src/assoc')
const merge = require('ramda/src/merge')
// const pipe = require('ramda/src/pipe')
const unless = require('ramda/src/unless')
const arrayOf = require('ramda/src/of')
const concat = require('ramda/src/concat')
const apply = require('ramda/src/apply')
const always = require('ramda/src/always')
const __ = require('ramda/src/__')
const when = require('ramda/src/when')
const over = require('ramda/src/over')
const lensProp = require('ramda/src/lensProp')
const identity = require('ramda/src/identity')
const { ensurePlainObj } = require('monocycle/utilities/ensurePlainObj')
const log = require('monocycle/utilities/log').Log('Symbols')
// const { pipe } = require('monocycle/utilities/pipe')

const { coerce } = require('monocycle/utilities/coerce')



const withSymbols = pipe(
  unless(isFunction, always(makeComponent)),
  makeComponent => pipe(
    ensurePlainObj,
    over(lensProp('strict'), unless(isBoolean, always(true))),
    over(lensProp('mergeOptions'), unless(isFunction, always(merge))),
    ({ mergeOptions, strict, ...options }) => {

      const Component = makeComponent(options)

      const BehaviorFactory = (factory, defaultOptions) => {

        defaultOptions = ensurePlainObj(defaultOptions)

        const makeBehavior = pipe(
          coerce,
          when(isPlainObj, mergeOptions.bind(void 0, defaultOptions)),
          factory
        )

        makeBehavior.make = options => makeBehavior(options)()

        return makeBehavior
      }

      const assert = !strict ? void 0 : key => {
        throw new Error(`Unknown '${key}' symbol`)
      }

      const guard = (key, value, options) => pipe(
        ensurePlainObj,
        assoc('Component', Component),
        options => {

          if (isString(value))
            value = store.get(value)

          if (isFunction(value) && !store.has(key))
            return BehaviorFactory(value, options)
        }
      )(options)

      const store = Object.assign(
        Component,
        Store({
          assert,
          guard
        }),
        {
          hasSymbols: true
        }
      )

      return store
    }
  )
)

module.exports = {
  default: withSymbols,
  withSymbols,
}