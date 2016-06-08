import test from 'tape'
import isFunction from 'is-function'
import createBlockBreakoutPlugin from '../src'

test('it should create a draft-js plugin', (nest) => {
  const blockBreakoutPlugin = createBlockBreakoutPlugin()

  nest.test('... with the correct exports', (assert) => {
    assert.ok(isFunction(blockBreakoutPlugin.handleReturn), 'handleReturn is a function')
    assert.end()
  })
})
