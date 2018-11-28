const test = require('ava')
const jsc = require('jsverify')
const { Store } = require('./store')
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


const thruthyArb = jsc.oneof(
  jsc.number.smap(when(isFalsy, always(42)), identity),
  jsc.fn,
  jsc.dict,
  jsc.nearray,
  jsc.nestring,
  jsc.json.smap(when(either(isFalsy, isTrue), always({ a: 1 })), identity),
)

test('gets, sets values', t => {

  const store = Store()

  t.deepEqual(
    keys(store),
    ['get', 'has', 'set', 'hasStore']
  )

  t.true(isFunction(store.get))
  t.true(isFunction(store.has))
  t.true(isFunction(store.set))
  t.true(store.hasStore)

  const gaSymbol = Symbol('ga')

  t.false(store.has('bu'))
  t.is(store.get('bu'), void 0)
  t.is(store.get(gaSymbol), void 0)

  t.is(store.set(gaSymbol), void 0)
  t.is(store.get(gaSymbol), void 0)
  t.false(store.has(gaSymbol))

  t.is(store.set(gaSymbol, 42), void 0)
  t.is(store.get(gaSymbol), 42)
  t.true(store.has(gaSymbol))

  t.is(store.set(gaSymbol, 'zo'), void 0)
  t.is(store.get(gaSymbol), 'zo')
  t.true(store.has(gaSymbol))

  t.is(store.set(gaSymbol), void 0)
  t.is(store.get(gaSymbol), void 0)
  t.false(store.has(gaSymbol))
})

test('gets, sets a value (with default data)', t => {

  const store = Store({
    data: { bu: 41 },
  })

  t.is(store.get('bu'), 41)
  t.is(store.set('bu', 42))
  t.is(store.get('bu'), 42)
})

test('guard allows setting value', t => {

  t.plan(5)

  const store = Store({
    data: { bu: 41 },
    guard: (...args) => {

      t.is(args.length, 4)
      t.deepEqual(args, ['bu', 42, 43, 44])

      return true
    }
  })

  t.is(store.get('bu'), 41)
  t.is(store.set('bu', 42, 43, 44))
  t.is(store.get('bu'), 42)
})

test('guard prevents setting value', t => {

  t.plan(400)
  const property = jsc.forall(jsc.falsy, a => {

    const store = Store({
      guard: always(a)
    })

    t.is(store.get('bu'), void 0)
    t.is(store.set('bu', 42), void 0)
    t.is(store.set('bu', 43), void 0)
    t.is(store.get('bu'), void 0)

    return true
  })

  jsc.assert(property, {
    tests: 100,
    size: 100
  })
})

test('guard allows setting overriden value (non-true)', t => {

  t.plan(500)
  const property = jsc.forall(thruthyArb, a => {

    const store = Store({
      data: { bu: 41 },
      guard: (...args) => {

        t.is(args.length, 4)
        t.deepEqual(args, ['bu', 42, 43, 44])

        return a
      }
    })

    t.is(store.get('bu'), 41)
    t.is(store.set('bu', 42, 43, 44))
    t.is(store.get('bu'), a)

    return true
  })

  jsc.assert(property, {
    tests: 100,
    size: 100
  })
})

test(`auto apply a function 'value' when arguments`, t => {

  const property = jsc.forall(jsc.nearray(thruthyArb), jsc.nearray(thruthyArb), (argsA, argsB) => {

    const store = Store()
    const calls = []

    const f = (...args) => {

      calls.push(args)
      return args
    }

    store.set('zo', f)

    t.is(store.get('zo'), f)

    const zoA = store.get('zo', ...argsA)

    t.deepEqual(zoA, argsA)
    t.deepEqual(calls, [argsA])

    const zoB = store.get('zo', ...argsB)

    t.deepEqual(zoB, argsB)
    t.deepEqual(calls, [argsA, argsB])

    return true
  })

  jsc.assert(property, {
    tests: 100,
  })
})

test('calls assert when asked item is not found', t => {

  const calls = []

  const store = Store({
    assert: (...args) => {

      calls.push(args)
    }
  })

  store.get('ga')
  store.get('bu')
  store.get('zo', {})

  t.deepEqual(
    calls,
    [
      ['ga'],
      ['bu'],
      ['zo'],
    ]
  )
})