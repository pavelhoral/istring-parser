angular.module('bethparser').

    factory('modParse', function() {
        var readRecord = function(sourceData, offset) {
            var	sourceView = new DataView(sourceData, offset),
                record = {
                    type: String.fromCharCode(
                            sourceView.getUint8(0), sourceView.getUint8(1),
                            sourceView.getUint8(2), sourceView.getUint8(3)),
                    size: sourceView.getUint32(4, true),
                    flags: sourceView.getUint32(8, true),
                    id: sourceView.getUint32(12, true),
                    revision: sourceView.getUint32(16, true),
                    version: sourceView.getUint16(20, true)
                };
            if (record.type === 'GRUP') {
                console.log(new TextDecoder().decode(new Uint8Array(sourceData, offset, 80)));
                record.data = readGroup(sourceData, offset + 24);
            }
            return record;
        };
        var readGroup = function(sourceData, offset) {
            var sourceView = new DataView(sourceData, offset),
                groupData = {
                    size: sourceView.getUint32(4, true),
                    type: String.fromCharCode(
                            sourceView.getUint8(0), sourceView.getUint8(1),
                            sourceView.getUint8(2), sourceView.getUint8(3)),
                    records: []
                },
                readOffset = 24;
            while (readOffset < groupData.size) {
                groupData.records.push(readRecord(sourceData, readOffset));
                readOffset += 24 + groupData.records[groupData.records.length - 1].size;
            };
            return groupData;
        };
        return function(sourceData) {
            var resultData = {
                    records: []
                },
                readOffset = 0;
            while (readOffset < sourceData.byteLength) {
                resultData.records.push(readRecord(sourceData, readOffset));
                readOffset += 24 + resultData.records[resultData.records.length - 1].size;
            }
            return resultData;
        };
    });
