const { pipe } = require('monocycle/utilities/pipe')
const log = require('monocycle/utilities/log').Log('AfterFromString')
const unless = require('ramda/src/unless')
const either = require('ramda/src/either')
const both = require('ramda/src/both')
const prop = require('ramda/src/prop')
const startsWith = require('ramda/src/startsWith')
const slice = require('ramda/src/slice')
const concat = require('ramda/src/concat')
const { makeScopedFunction } = require('./scoped')
const isString = require('ramda-adjunct/lib/isString').default

const AfterFromString = ({ dependencies }) => {

  return pipe(
    log.partial('AfterFromString0'),
    unless(isString, input => {

      throw new Error(`AfterFromStringError: 'input' must be a string (provided: ${typeof input})`)
    }),
    log.partial('AfterFromString1'),
    either(
      both(
        startsWith('return '),
        pipe(
          log.partial('AfterFromString2'),
          slice(7, Infinity),
          concat('return (sinks, sources) => '),
          makeScopedFunction({
            dependencies
          })
        )
      ),
      prop
    )
  )
}


module.exports = {
  default: AfterFromString,
  AfterFromString
}