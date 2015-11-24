angular.module('bethparser').

    factory('istringParse', function() {
        return function(sourceData, sizeIncluded) {
            var sourceView = new DataView(sourceData),
                resultData = {
                    count: sourceView.getUint32(0, true),
                    size: sourceView.getUint32(4, true),
                    strings: {},
                    records: {}
                };
                sourceDict = new Uint32Array(sourceData, 8, 2 * resultData.count),
                stringArray = new Uint8Array(sourceData, 8 + 8 * resultData.count),
                textDecoder = new TextDecoder();
            // Parse dictionary and strings
            var directoryIndex = 0,
                startOffset = null,
                stopOffset = null;
            for (directoryIndex = 0; directoryIndex < sourceDict.length; directoryIndex += 2) {
                // Read directory entry
                startOffset = sourceDict[directoryIndex + 1] + (sizeIncluded ? 4 : 0);
                resultData.strings[sourceDict[directoryIndex]] = startOffset;
                // Check if already loaded
                if (resultData.records[startOffset]) {
                    continue;
                }
                // Read the actual string
                for (stopOffset = startOffset; stopOffset < stringArray.length; stopOffset++) {
                    if (stringArray[stopOffset] === 0) {
                        break;
                    }
                }
                resultData.records[startOffset] = textDecoder.decode(stringArray.subarray(startOffset, stopOffset));
            }
            resultData.stringIds = Object.keys(resultData.strings)
            resultData.recordIds = Object.keys(resultData.records);
            return resultData;
        };
    });
