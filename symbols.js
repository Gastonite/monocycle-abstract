const { Store } = require('./store')
const { pipe } = require('monocycle/utilities/pipe')
const { makeComponent } = require('monocycle/component')
const isFunction = require('ramda-adjunct/lib/isFunction').default
const isBoolean = require('ramda-adjunct/lib/isBoolean').default
const isPlainObj = require('ramda-adjunct/lib/isPlainObj').default
const isString = require('ramda-adjunct/lib/isString').default
const merge = require('ramda/src/merge')
const unless = require('ramda/src/unless')
const always = require('ramda/src/always')
const assoc = require('ramda/src/assoc')
const over = require('ramda/src/over')
const lensProp = require('ramda/src/lensProp')
const { ensurePlainObj } = require('monocycle/utilities/ensurePlainObj')
const { coerce } = require('monocycle/utilities/coerce')
const log = require('monocycle/utilities/log').Log('Symbols')

const WithSymbols = pipe(
  // log.partial(1),
  ensurePlainObj,
  over(lensProp('strict'), unless(isBoolean, always(true))),
  over(lensProp('mergeOptions'), unless(isFunction, always(merge))),
  ({ mergeOptions, strict }) => {

    const assert = !strict
      ? void 0
      : key => {
        throw new Error(`Unknown '${key}' symbol`)
      }

    return Component => {

      const BehaviorFactory = (factory, defaultOptions) => {

        defaultOptions = ensurePlainObj(defaultOptions)

        console.log('BehaviorFactory()', {
          factory,
          defaultOptions
        })

        const makeBehavior = pipe(
          // log.partial(1),
          coerce,
          mergeOptions.bind(void 0, defaultOptions),
          assoc('Component', Component),
          // log.partial(2),
          factory
        )

        makeBehavior.make = options => makeBehavior(options)()

        return makeBehavior
      }

      const guard = (key, value, options) => pipe(
        ensurePlainObj,
        options => {

          if (isString(value))
            value = Component.get(value)

          if (isFunction(value) && !Component.has(key))
            return BehaviorFactory(value, options)
        }
      )(options)

      return Object.assign(
        Component,
        Store({
          guard,
          assert
        }),
        {
          hasSymbols: true
        }
      )
    }
  }
)

module.exports = {
  default: WithSymbols,
  WithSymbols,
}