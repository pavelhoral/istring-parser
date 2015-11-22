angular.module('bethparser', []).

    factory('hex4', function() {
        return function(number) {
            var hex = (+number).toString(16).toUpperCase();
            return '000000'.substring(0, 6 - hex.length) + hex;
        };
    }).

    filter('hex4', function(hex4) {
        return hex4;
    }).

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
    }).

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
    }).

    controller('MainController', function($scope, $q, istringParse, hex4, modParse) {

        this.name = null;

        this.data = null;

        this.loadStringFile = function(file) {
            var fileReader = new FileReader();
            fileReader.onload = angular.bind(this, function() {
                this.name = file.name;
                this.data = istringParse(fileReader.result, file.name.indexOf('.STRINGS') < 0);
                this.data.$type = 'STRINGS';
                $scope.$apply();
            });
            fileReader.readAsArrayBuffer(file);
        };

        this.renderStrings = function() {
            var content = '';
            this.data.stringIds.forEach(angular.bind(this, function(stringId) {
                var recordId = this.data.strings[stringId];
                content += '[' + hex4(stringId) + ']' + '[' + hex4(recordId) + '] ' + this.data.records[recordId] + '\n';
            }));
            this.data.$content = content;
        };

        this.loadModFile = function(file) {
            var fileReader = new FileReader();
            fileReader.onload = angular.bind(this, function() {
                this.name = file.name;
                this.data = modParse(fileReader.result);
                this.data.$type = 'MOD';
                $scope.$apply();
            });
            fileReader.readAsArrayBuffer(file);
        };

        this.renderMod = function() {
            this.data.$content = '';
            var renderRecord = function(indent, record) {
                var result = '[' + record.type + '] ' + '[' + hex4(record.id) + ']';
                if (record.type === 'GRUP') {
                    result += ' [' + record.data.type + ']';
                    record.data.records.forEach(function(subrecord) {
                        result += '\n' + renderRecord(indent + '    ', subrecord);
                    });
                }
                return indent + result;
            };
            this.data.records.forEach(angular.bind(this, function(record) {
                this.data.$content += renderRecord('', record) + '\n';
            }));
        };

    });
