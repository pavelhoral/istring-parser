angular.module('istring', []).

    filter('hex4', function() {
        return function(number) {
            var hex = (+number).toString(16).toUpperCase();
            return '000000'.substring(0, 6 - hex.length) + hex;
        };
    }).

    factory('istringParse', function() {
        return function(sourceData, sizeIncluded) {
            var sourceArray = new Uint32Array(sourceData, 0, Math.floor(sourceData.byteLength / 4)),
                resultData = {
                    count: sourceArray[0],
                    dataSize: sourceArray[1],
                    directory: {},
                    data: {},
                    dataCount: 0
                },
                textDecoder = new TextDecoder();
            // Parse dictionary and strings
            var directoryIndex = 0,
                stringArray = null,
                startOffset = null,
                stringLength = null;
            for (directoryIndex = 0; directoryIndex < resultData.count; directoryIndex++) {
                // Read directory entry
                startOffset = (resultData.count + 1) * 8 + sourceArray[3 + directoryIndex * 2];
                resultData.directory[sourceArray[2 + directoryIndex * 2]] = startOffset;
                // Check if already loaded
                if (resultData.data[startOffset]) {
                    continue;
                }
                // Read the actual string
                stringArray = new Uint8Array(sourceData, startOffset + (sizeIncluded ? 4 : 0));
                for (stringLength = 0; stringLength < stringArray.length; stringLength++) {
                    if (stringArray[stringLength] === 0) {
                        break;
                    }
                }
                stringArray = new Uint8Array(sourceData, startOffset + (sizeIncluded ? 4 : 0), stringLength);
                resultData.data[startOffset] = textDecoder.decode(stringArray);
            }
            resultData.dataCount = Object.keys(resultData.data).length;
            return resultData;
        };
    }).

    controller('MainController', function($scope, $q, istringParse) {

        this.name = null;

        this.data = null;

        this.loadFile = function(file) {
            var fileReader = new FileReader();
            fileReader.onload = angular.bind(this, function() {
                this.name = file.name;
                this.data = istringParse(fileReader.result, file.name.indexOf('.STRINGS') < 0);
                $scope.$apply();
            });
            fileReader.readAsArrayBuffer(file);
        };

    });
