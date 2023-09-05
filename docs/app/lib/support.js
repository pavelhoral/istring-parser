/**
 * Convert number to 4 bytes hex string.
 */
function hex4(number) {
    var hex = (+number).toString(16).toUpperCase();
    return '000000'.substring(0, 8 - hex.length) + hex;
}
export { hex4 };

var defaultDecoder = new TextDecoder();
function readString(sourceArray, startOffset) {
    for (var stopOffset = startOffset; stopOffset < sourceArray.length; stopOffset++) {
      if (sourceArray[stopOffset] === 0) {
          break;
      }
  }
  return defaultDecoder.decode(sourceArray.subarray(startOffset, stopOffset));
}
export { readString };

function readChar4(sourceArray, offset) {
    return String.fromCharCode(sourceArray[offset], sourceArray[offset + 1],
            sourceArray[offset + 2], sourceArray[offset + 3]);
}
export { readChar4 };
