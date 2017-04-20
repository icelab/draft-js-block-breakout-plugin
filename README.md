# Draft.js Block Breakout plugin

*This is a plugin for the [`draft-js-plugins-editor`](https://www.draft-js-plugins.com/), a plugin system that sits on top of Draft.js.*

By default draft carries the current block type over to the next line when you press return, which is an undesired behaviour for _some_ of the default block types (headers mostly).

This plugin adds behaviour to the editor to "break out" of certain block types if the user presses `return` at the start or end of the block. Where "break out" means changing the inserted block to the default type (usually `unstyled`)

## Usage

```js
import createBlockBreakoutPlugin from 'draft-js-block-breakout-plugin'
const blockBreakoutPlugin = createBlockBreakoutPlugin()
```

This can then be passed into a `draft-js-plugins-editor` component:

```js
import createBlockBreakoutPlugin from 'draft-js-block-breakout-plugin'
const blockBreakoutPlugin = createBlockBreakoutPlugin()
import Editor from 'draft-js-plugins-editor'

const plugins = [blockBreakoutPlugin]

<Editor plugins={plugins} />
```

## Options

You can pass options to the plugin as you call it:

```js
const options = {
  breakoutBlockType: 'unordered-list-item',
  breakoutBlocks: ['header-one', 'header-two']
}
const blockBreakoutPlugin = createBlockBreakoutPlugin(options)
```

The options and their defaults are:

| Option | Type | Description | Default |
| --- | --- | --- | --- |
| `breakoutBlockType` | `String` | Block type to insert when breaking out | `'unstyled'`
| `breakoutBlocks` | `Array` | List of block types to break out from | `['header-one', 'header-two', 'header-three', 'header-four', 'header-five', 'header-six']`
| `doubleBreakoutBlocks` | `Array` | List of block types to that require return on a blank line in order to break | `['blockquote', 'unordered-list-item', 'ordered-list-item', 'code-block']`

## Developing

```
npm install
npm run test
```
