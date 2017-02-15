'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

exports.default = blockBreakoutPlugin;

var _draftJs = require('draft-js');

var _immutable = require('immutable');

/**
 * Default set of blocks to "break out" of.
 * @type {Object}
 */
var defaults = {
  breakoutBlockType: 'unstyled',
  breakoutBlocks: ['header-one', 'header-two', 'header-three', 'header-four', 'header-five', 'header-six']
};

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
 * @param {Array} options.breakoutBlocks An array containing the names of the
 * various block-types to break out from.
 *
 * @return {Object} Object defining the draft-js API methods
 */
function blockBreakoutPlugin() {
  var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];


  var breakoutBlockType = options.breakoutBlockType || defaults.breakoutBlockType;
  var breakoutBlocks = options.breakoutBlocks || defaults.breakoutBlocks;

  return {
    handleReturn: function handleReturn(e, _ref) {
      var getEditorState = _ref.getEditorState;
      var setEditorState = _ref.setEditorState;

      var editorState = getEditorState();
      var currentBlockType = _draftJs.RichUtils.getCurrentBlockType(editorState);

      // Does the current block type match a type we care about?
      if (breakoutBlocks.indexOf(currentBlockType) > -1) {
        var selection = editorState.getSelection();

        // Check if the selection is collapsed
        if (selection.isCollapsed()) {
          var _ret = function () {
            var contentState = editorState.getCurrentContent();
            var currentBlock = contentState.getBlockForKey(selection.getEndKey());
            var endOffset = selection.getEndOffset();
            var atEndOfBlock = endOffset === currentBlock.getLength();
            var atStartOfBlock = endOffset === 0;

            // Check we’re at the start/end of the current block
            if (atEndOfBlock || atStartOfBlock) {
              var emptyBlockKey = (0, _draftJs.genKey)();
              var emptyBlock = new _draftJs.ContentBlock({
                key: emptyBlockKey,
                text: '',
                type: breakoutBlockType,
                characterList: (0, _immutable.List)(),
                depth: 0
              });
              var blockMap = contentState.getBlockMap();
              // Split the blocks
              var blocksBefore = blockMap.toSeq().takeUntil(function (v) {
                return v === currentBlock;
              });
              var blocksAfter = blockMap.toSeq().skipUntil(function (v) {
                return v === currentBlock;
              }).rest();

              var augmentedBlocks = void 0;
              var focusKey = void 0;
              // Choose which order to apply the augmented blocks in depending
              // on whether we’re at the start or the end
              if (atEndOfBlock) {
                // Current first, empty block afterwards
                augmentedBlocks = [[currentBlock.getKey(), currentBlock], [emptyBlockKey, emptyBlock]];
                focusKey = emptyBlockKey;
              } else {
                // Empty first, current block afterwards
                augmentedBlocks = [[emptyBlockKey, emptyBlock], [currentBlock.getKey(), currentBlock]];
                focusKey = currentBlock.getKey();
              }
              // Join back together with the current + new block
              var newBlocks = blocksBefore.concat(augmentedBlocks, blocksAfter).toOrderedMap();
              var newContentState = contentState.merge({
                blockMap: newBlocks,
                selectionBefore: selection,
                selectionAfter: selection.merge({
                  anchorKey: focusKey,
                  anchorOffset: 0,
                  focusKey: focusKey,
                  focusOffset: 0,
                  isBackward: false
                })
              });
              // Set the state
              setEditorState(_draftJs.EditorState.push(editorState, newContentState, 'split-block'));
              return {
                v: 'handled'
              };
            }
          }();

          if ((typeof _ret === 'undefined' ? 'undefined' : _typeof(_ret)) === "object") return _ret.v;
        }
      }
      return 'not-handled';
    }
  };
}