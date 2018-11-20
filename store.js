// const log = require('monocycle/utilities/log').Log('Store')
const pipe = require('ramda/src/pipe')
const always = require('ramda/src/always')
const { ensurePlainObj } = require('monocycle/utilities/ensurePlainObj')
const isFunction = require('ramda-adjunct/lib/isFunction').default
const isBoolean = require('ramda-adjunct/lib/isBoolean').default
const isNotEmpty = require('ramda-adjunct/lib/isNotEmpty').default
const isFalsy = require('ramda-adjunct/lib/isFalsy').default
const over = require('ramda/src/over')
const lensProp = require('ramda/src/lensProp')
const unless = require('ramda/src/unless')
const both = require('ramda/src/both')
const when = require('ramda/src/when')
const apply = require('ramda/src/apply')
const prop = require('ramda/src/prop')
const applyTo = require('ramda/src/applyTo')
const __ = require('ramda/src/__')


const Store = pipe(
  ensurePlainObj,
  over(lensProp('assert'), unless(isFunction, always(void 0))),
  over(lensProp('guard'), unless(isFunction, always(always(true)))),
  over(lensProp('data'), ensurePlainObj),
  ({ data, guard, assert }) => {

    const _get = pipe(
      prop,
      applyTo(data),
    )


    const store = {
      get: (key, ...args) => pipe(
        prop,
        applyTo(data),
        when(
          both(isFunction, always(isNotEmpty(args))),
          apply(__, args)
        ),
        when(both(always(assert), isFalsy), () => void assert(key)),
      )(key),
      has: pipe(_get, Boolean),
      set: (key, value, ...rest) => {

        const returned = guard(key, value, ...rest)

        if (returned)
          data[key] = returned === true
            ? value
            : returned
      },
      hasStore: true
    }

    return store
  }
)

module.exports = {
  default: Store,
  Store
}

