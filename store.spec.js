// const { makeComponent: _makeComponent } = require('../component')
const pipe = require('ramda/src/pipe')
const assert = require('assert')
const { Store } = require('./store')
// const { Stream: $ } = require('xstream')
const jsc = require('jsverify')
// const { diagramArbitrary, withTime } = require('cyclejs-test-helpers')
// const assert = require('assert')
// const equals = require('ramda/src/equals')
const identity = require('ramda/src/identity')
const always = require('ramda/src/always')
const when = require('ramda/src/when')
const either = require('ramda/src/either')
const identical = require('ramda/src/identical')
const equals = require('ramda/src/equals')
const keys = require('ramda/src/keys')
const isTrue = require('ramda-adjunct/lib/isTrue').default
const isFalse = require('ramda-adjunct/lib/isFalse').default
const isFalsy = require('ramda-adjunct/lib/isFalsy').default
const isNull = require('ramda-adjunct/lib/isNull').default
const isUndefined = require('ramda-adjunct/lib/isUndefined').default
const isFunction = require('ramda-adjunct/lib/isFunction').default
const isPlainObj = require('ramda-adjunct/lib/isPlainObj').default


const anyArbitrary = jsc.oneof(
  jsc.number.smap(when(isFalsy, always(42)), identity),
  jsc.fn,
  jsc.dict,
  jsc.nearray,
  jsc.nestring,
  jsc.json.smap(when(either(isFalsy, isTrue), always({ a: 1 })), identity),
)
const notFalsyArbitrary = anyArbitrary.smap(when(isFalsy, always('yo')), identity)

suite('Store', () => {

  suite('with no args', () => {

    test('gets, sets and updates values', () => {

      const store = Store()

      assert.deepStrictEqual(
        keys(store),
        ['get', 'has', 'set', 'hasStore']
      )


      assert(isFunction(store.get))
      assert(isFunction(store.has))
      assert(isFunction(store.set))
      assert(isTrue(store.hasStore))

      const gaSymbol = Symbol('ga')

      assert(isFalse(store.has('bu')))
      assert(isUndefined(store.get('bu')))
      assert(isUndefined(store.get(gaSymbol)))

      assert(isUndefined(store.set(gaSymbol)))
      assert(isUndefined(store.get(gaSymbol)))
      assert(isFalse(store.has(gaSymbol)))

      assert(isUndefined(store.set(gaSymbol, 42)))
      assert(identical(store.get(gaSymbol), 42))
      assert(isTrue(store.has(gaSymbol)))

      assert(isUndefined(store.set(gaSymbol, 'zo')))
      assert(identical(store.get(gaSymbol), 'zo'))
      assert(isTrue(store.has(gaSymbol)))

      assert(isUndefined(store.set(gaSymbol)))
      assert(isUndefined(store.get(gaSymbol)))
      assert(isFalse(store.has(gaSymbol)))

    })

    test('auto apply a function-type value when arguments is passed', () => {

      jsc.assert(jsc.forall(jsc.nearray(anyArbitrary), jsc.nearray(anyArbitrary), (argsA, argsB) => {

        const store = Store()

        const calls = []

        const f = (...args) => {
          calls.push(args)
        }

        store.set('ga', f)

        assert(identical(store.get('ga'), f))

        store.get('ga', ...argsA)

        assert.deepEqual(calls, [argsA])

        store.get('ga', ...argsB)

        assert.deepEqual(calls, [argsA, argsB])

        return true
      }), {
          tests: 100,
          size: 200
        })
    })
  })

  suite('with default data', () => {

    test('gets, sets and updates a value', () => {

      const store = Store({
        data: { bu: 41 },
        guard: always(true)
      })

      assert(identical(store.get('bu'), 41))
      assert(isUndefined(store.set('bu', 42)))
      assert(identical(store.get('bu'), 42))
    })

  })

  suite('with a guard', () => {

    test('calls guard before setting a value', () => {

      const store = Store({
        guard: (...args) => {
          calls.push(args)
        }
      })

      const calls = []

      assert(isUndefined(store.set('bu', void 0, 'ga')))
      assert(isUndefined(store.set('bu', 42)))

      assert.deepStrictEqual(
        calls,
        [
          ['bu', void 0, 'ga'],
          ['bu', 42],
        ]
      )
    })

    test('prevents setting a value', () =>
      jsc.assertForall(jsc.falsy, a => {

        const store = Store({
          guard: always(a)
        })

        assert(isUndefined(store.get('bu')))
        assert(isUndefined(store.set('bu', 42)))
        assert(isUndefined(store.set('bu', 43)))
        assert(isUndefined(store.get('bu')))

        return true
      })
    )

    test('gets, sets and updates a value', () => {

      const store = Store({
        guard: always(true)
      })

      assert(isUndefined(store.get('bu')))
      assert(isUndefined(store.set('bu')))

      assert(isUndefined(store.set('bu', 42)))
      assert(identical(store.get('bu'), 42))

      assert(isUndefined(store.set('bu', 43)))
      assert(identical(store.get('bu'), 43))
    })


    test('overrides returned value when returning a thuthy but not true value', () => {

      const property = jsc.forall(anyArbitrary, a => {

        const store = Store({
          guard: always(a)
        })

        assert(isUndefined(store.get('bu')))
        assert(isUndefined(store.set('bu', 42)))
        assert(isUndefined(store.set('bu', 43)))
        assert(identical(store.get('bu'), a))

        return true
      })

      jsc.assert(property, {
        tests: 100,
        size: 200
      })
    })

  })

  test('calls assert when asked item is not found', () => {

    const calls = []

    const store = Store({
      assert: (...args) => {

        calls.push(args)
      }
    })
    store.get('ga')
    store.get('bu')
    store.get('zo', {})

    assert.deepStrictEqual(
      calls,
      [
        ['ga'],
        ['bu'],
        ['zo'],
      ]
    )
  })

})