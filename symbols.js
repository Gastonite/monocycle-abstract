const { Store } = require('./store')
const { pipe } = require('monocycle/utilities/pipe')
const { makeComponent } = require('monocycle/component')
const isFunction = require('ramda-adjunct/lib/isFunction').default
const isBoolean = require('ramda-adjunct/lib/isBoolean').default
const isPlainObj = require('ramda-adjunct/lib/isPlainObj').default
const ensureArray = require('ramda-adjunct/lib/ensureArray').default
const isString = require('ramda-adjunct/lib/isString').default
const isArray = require('ramda-adjunct/lib/isArray').default
const merge = require('ramda/src/merge')
const unless = require('ramda/src/unless')
const either = require('ramda/src/either')
const concat = require('ramda/src/concat')
const __ = require('ramda/src/__')
const always = require('ramda/src/always')
const assoc = require('ramda/src/assoc')
const arrayOf = require('ramda/src/of')
const objOf = require('ramda/src/objOf')
const over = require('ramda/src/over')
const lt = require('ramda/src/lt')
const map = require('ramda/src/map')
const propEq = require('ramda/src/propEq')
const ifElse = require('ramda/src/ifElse')
const prop = require('ramda/src/prop')
const defaultTo = require('ramda/src/defaultTo')
const when = require('ramda/src/when')
const filter = require('ramda/src/filter')
const both = require('ramda/src/both')
const apply = require('ramda/src/apply')
const propSatisfies = require('ramda/src/propSatisfies')
const lensProp = require('ramda/src/lensProp')
const lensIndex = require('ramda/src/lensIndex')
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
        // if (!isFunction(factory.coerce))
        //   factory.coerce = coerce

        const makeBehavior = pipe(
          // log.partial(1),
          // factory.coerce,
          coerce,
          mergeOptions.bind(void 0, defaultOptions),
          assoc('Component', Component),
          // log.partial(2),
          factory
        )

        return Object.assign(makeBehavior, {
          ...factory,
          make: options => makeBehavior(options)()
        })
      }

      const guard = (key, value, options = {}) => {

        if (Component.has(key))
          return

        return pipe(
          unless(isArray, pipe(
            arrayOf,
            concat(__, [options]),
            arrayOf
          )),
          ensureArray,
          map(pipe(
            when(both(isArray, propEq('length', 2)),
              ([factory, options]) => ({
                factory,
                options
              })
            ),
            unless(isPlainObj, objOf('factory')),
            over(lensProp('factory'), unless(isFunction, Component.get)),
            over(lensProp('options'), ensurePlainObj)
          )),
          filter(both(
            propSatisfies(isFunction, 'factory'),
            propSatisfies(isPlainObj, 'options'),
          )),
          map(({ factory, options }) => BehaviorFactory(factory, options)),
          ifElse(propSatisfies(lt(1), 'length'),
            factories => BehaviorFactory(always(component => Component([
              component,
              ...factories.map(factory => factory.make())
            ]))),
            prop(0)
          ),
        )(value)
      }

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