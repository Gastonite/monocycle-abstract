// const { makeComponent: _makeComponent } = require('../component')
const pipe = require('ramda/src/pipe')
const assert = require('assert')
const { withSymbols } = require('./symbols')
// const { makeComponent } = require('./component')

// const { Stream: $ } = require('xstream')
const jsc = require('jsverify')
const identity = require('ramda/src/identity')
const when = require('ramda/src/when')
const either = require('ramda/src/either')
const isFalsy = require('ramda-adjunct/lib/isFalsy').default
const isNull = require('ramda-adjunct/lib/isNull').default

const always = require('ramda/src/always')
const identical = require('ramda/src/identical')
const equals = require('ramda/src/equals')
const keys = require('ramda/src/keys')
const noop = require('ramda-adjunct/lib/noop').default
const isUndefined = require('ramda-adjunct/lib/isUndefined').default
const isFunction = require('ramda-adjunct/lib/isFunction').default
const isPlainObj = require('ramda-adjunct/lib/isPlainObj').default
const ensureArray = require('ramda-adjunct/lib/ensureArray').default
const { EmptyObject } = require('monocycle/utilities/empty')
const isTrue = require('ramda-adjunct/lib/isTrue').default


suite('withSymbols', () => {

  const testSymbols = (name, args, defineOtherTest) => {

    args = ensureArray(args)

    const makeComponent = withSymbols()

    const With42 = always(always(42))

    const WithGa = ({ myOption } = {}) => (component = noop) => sources => ({
      ...component(sources),
      ga: myOption || 42
    })

    const WithZo = always((component = noop) => sources => ({
      ...component(sources),
      zo: 43
    }))

    const MyComponent = sources => ({ bu: 123 })

    suite('Symbols: ' + name, () => {

      let Component

      beforeEach(() => {

        Component = makeComponent(...args)

        assert(isFunction(Component))

        assert.deepStrictEqual(keys(Component),
          ['Empty', 'coerce', 'get', 'has', 'set', 'hasStore', 'hasSymbols']
        )

        assert(isTrue(Component.hasStore))
        assert(isTrue(Component.hasSymbols))
      })

      suite('defines a behavior factory', () => {

        let Component
        beforeEach(() => {

          Component = makeComponent()

          assert(isFunction(Component))

          assert.deepStrictEqual(keys(Component),
            ['Empty', 'coerce', 'get', 'has', 'set', 'hasStore', 'hasSymbols']
          )

          assert(isTrue(Component.hasStore))
          assert(isTrue(Component.hasSymbols))
        })

        Component
        test('with no default options', () => {

          Component.set('ga', WithGa)
          Component.set('zo', WithZo)

          const withGa = Component.get('ga')()
          const withZo = Component.get('zo')()

          const Ga = withGa()
          const Zo = withZo()

          assert.deepStrictEqual(Ga(), { ga: 42 })
          assert.deepStrictEqual(Zo(), { zo: 43 })

          const MySuperComponent = pipe(
            withGa,
            withZo
          )(MyComponent)

          assert(equals(MySuperComponent(), { bu: 123, ga: 42, zo: 43 }))
        })

        test('with default options', () => {

          Component.set('ga', WithGa, {
            myOption: 49
          })

          const withGa = Component.get('ga')()

          const Ga = withGa()

          assert.deepStrictEqual(
            Ga(),
            { ga: 49 }
          )
        })

        suite('from another behavior factory', () => {

          test('with no default options', () => {

            Component.set('zo', WithZo)

            Component.set('ga', 'zo')

            const withGa = Component.get('ga')()

            const Ga = withGa()

            assert.deepStrictEqual(
              Ga(),
              { zo: 43 }
            )
          })

          test('with default options', () => {

            Component.set('ga', WithGa)

            Component.set('zo', 'ga', {
              myOption: 'bu'
            })

            const withZo = Component.get('zo')()

            const Zo = withZo()

            assert.deepStrictEqual(
              Zo(),
              { ga: 'bu' }
            )
          })
        })
      })

      suite('make method', () => {

        test('creates a component via make method', () => {

          Component.set('ga', With42)

          assert(identical(Component.get('ga').make(), 42))
        })
      })

      isFunction(defineOtherTest) && test('other test', () => defineOtherTest(Component))
    })
  }

  testSymbols('with no arguments', [], Component => {

    assert.throws(
      () => Component.get('ga'),
      {
        message: `Unknown 'ga' symbol`
      }
    )
  })

  testSymbols('with strict mode', { strict: false }, Component => {

    assert.doesNotThrow(
      () => Component.get('ga')
    )

    assert.strictEqual(
      Component.get('ga'),
      void 0
    )
  })

})