angular.module('bethparser', []).

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
                var result = '[' + record.type + ']';
                if (record.type === 'GRUP') {
                    result += ' [' + record.label + ']';
                    record.records.forEach(function(subrecord) {
                        result += '\n' + renderRecord(indent + '    ', subrecord);
                    });
                } else {
                    result += ' [' + hex4(record.id) + ']';
                }
                return indent + result;
            };
            this.data.records.forEach(angular.bind(this, function(record) {
                this.data.$content += renderRecord('', record) + '\n';
            }));
        };

    });
