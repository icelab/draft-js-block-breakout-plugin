import {
  genKey,
  ContentBlock,
  EditorState,
  RichUtils,
} from 'draft-js'
import {List} from 'immutable'

/**
 * Default set of blocks to "break out" of.
 * @type {Object}
 */
const defaults = {
  defaultBlockType: 'unstyled',
  breakoutBlockTypes: [
    'header-one',
    'header-two',
    'header-three',
    'header-four',
    'header-five',
    'header-six',
  ],
}

/**
 * Block Breakout Plugin
 *
 * By default draft carries the current block type over to the next line when
 * you press return, which is an undesired behaviour for _some_ of the default
 * block types (headers mostly).
 *
 * This plugin adds behaviour to the editor to "break out" of certain block
 * types if the user presses `return` at the start or end of the block.
 *
 * @param {Array} options.breakoutBlockTypes An array containing the names of the
 * various block-types to break out from.
 *
 * @return {Object} Object defining the draft-js API methods
 */
export default function blockBreakoutPlugin (options = {}) {
  const defaultBlockType = options.defaultBlockType || defaults.defaultBlockType
  const breakoutBlockTypes = options.breakoutBlockTypes || defaults.breakoutBlockTypes

  return {
    handleReturn (e, { getEditorState, setEditorState }) {
      const editorState = getEditorState()
      const currentBlockType = RichUtils.getCurrentBlockType(editorState)

      // Does the current block type match a type we care about?
      if (breakoutBlockTypes.indexOf(currentBlockType) > -1) {
        const selection = editorState.getSelection()

        // Check if the selection is collapsed
        if (selection.isCollapsed()) {
          const contentState = editorState.getCurrentContent()
          const currentBlock = contentState.getBlockForKey(selection.getEndKey())
          const endOffset = selection.getEndOffset()
          const atEndOfBlock = (endOffset === currentBlock.getCharacterList().count())
          const atStartOfBlock = (endOffset === 0)

          // Check we’re at the start/end of the current block
          if (atEndOfBlock || atStartOfBlock) {
            const emptyBlockKey = genKey()
            const emptyBlock = new ContentBlock({
              key: emptyBlockKey,
              text: '',
              type: defaultBlockType,
              characterList: List(),
              depth: 0,
            })
            const blockMap = contentState.getBlockMap()
            // Split the blocks
            const blocksBefore = blockMap.toSeq().takeUntil(function (v) {
              return v === currentBlock
            })
            const blocksAfter = blockMap.toSeq().skipUntil(function (v) {
              return v === currentBlock
            }).rest()

            let augmentedBlocks
            // Choose which order to apply the augmented blocks in depending
            // on whether we’re at the start or the end
            if (atEndOfBlock) {
              // Current first, empty block afterwards
              augmentedBlocks = [
                [currentBlock.getKey(), currentBlock],
                [emptyBlockKey, emptyBlock],
              ]
            } else {
              // Empty first, current block afterwards
              augmentedBlocks = [
                [emptyBlockKey, emptyBlock],
                [currentBlock.getKey(), currentBlock],
              ]
            }
            // Join back together with the current + new block
            const newBlocks = blocksBefore.concat(augmentedBlocks, blocksAfter).toOrderedMap()
            const newContentState = contentState.merge({
              blockMap: newBlocks,
              selectionBefore: selection,
              selectionAfter: selection.merge({
                anchorKey: emptyBlockKey,
                anchorOffset: 0,
                focusKey: emptyBlockKey,
                focusOffset: 0,
                isBackward: false,
              }),
            })
            // Set the state
            setEditorState(
              EditorState.push(editorState, newContentState, 'split-block')
            )
            return true
          }
        }
      }
      return false
    },
  }
}
