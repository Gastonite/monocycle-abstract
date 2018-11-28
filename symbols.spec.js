const test = require('ava')
const keys = require('ramda/src/keys')
const { makeComponent } = require('monocycle')
const { WithSymbols } = require('./symbols')
const always = require('ramda/src/always')
const noop = require('ramda-adjunct/lib/noop').default
const isFunction = require('ramda-adjunct/lib/isFunction').default
const pipe = require('ramda/src/pipe')

const buComponent = sources => ({ bu: 123 })

const WithGa = ({ myOption } = {}) => (component = noop) => sources => ({
  ...component(sources),
  ga: myOption || 42
})

const WithZo = always((component = noop) => sources => ({
  ...component(sources),
  zo: 43
}))

test.beforeEach('adds a symbol store to Component', t => {

  const Component = makeComponent()

  const defaultKeys = keys(Component)

  WithSymbols()(Component)

  t.deepEqual(
    keys(Component),
    [...defaultKeys, 'get', 'has', 'set', 'hasStore', 'hasSymbols']
  )

  t.context = {
    Component
  }
})

test('throw when behavior is not found', t => {

  const { Component } = t.context

  t.throws(() => Component.get('ga'), {
    message: `Unknown 'ga' symbol`
  })
})

test('with no default options', t => {

  const { Component } = t.context

  Component.set('ga', WithGa)
  Component.set('zo', WithZo)

  const withGa = Component.get('ga')()
  const withZo = Component.get('zo')()

  const bugazoComponent = pipe(
    withGa,
    withZo
  )(buComponent)

  t.deepEqual(
    bugazoComponent(),
    { bu: 123, ga: 42, zo: 43 }
  )
})

test('with default options', t => {

  const { Component } = t.context

  Component.set('ga', WithGa, {
    myOption: 49
  })

  const withGa = Component.get('ga')()

  const ga = withGa()

  t.deepEqual(
    ga(),
    { ga: 49 }
  )
})

test('from another behavior', t => {

  const { Component } = t.context

  Component.set('zo', WithZo)
  Component.set('ga', 'zo')

  const withGa = Component.get('ga')()

  const ga = withGa()

  t.deepEqual(
    ga(),
    { zo: 43 }
  )
})

test('from another behavior with overriden options', t => {

  const { Component } = t.context

  Component.set('ga', WithGa)
  Component.set('zo', 'ga', {
    myOption: 'bu'
  })

  const withGa = Component.get('ga')()
  const withZo = Component.get('zo')()

  const ga = withGa()
  const zo = withZo()

  t.deepEqual(
    ga(),
    { ga: 42 }
  )

  t.deepEqual(
    zo(),
    { ga: 'bu' }
  )
})

test('add a make method', t => {

  const { Component } = t.context

  Component.set('ga', WithGa)

  t.deepEqual(keys(WithGa), [])
  t.deepEqual(keys(Component.get('ga')), ['make'])
  t.true(isFunction(Component.get('ga').make))

  const ga = Component.get('ga').make()

  t.deepEqual(
    ga(),
    { ga: 42 }
  )

})