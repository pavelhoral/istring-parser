import { app, angular } from 'app/app';
import { ModFileMapper } from 'app/lib/modfile.mapper';

class MainController {

    constructor($scope) {
        this.$scope = $scope;
        this.modFile = null;
    }

    loadMod(file) {
        var fileReader = new FileReader();
        fileReader.onload = () => {
            this.modFile = {
                name: file.name,
                data: new ModFileMapper().readMod(fileReader.result)
            };
            this.$scope.$apply();
        };
        fileReader.readAsArrayBuffer(file);
    }

    loadStrings(files) {
        var fileReader = new FileReader();
        fileReader.onload = angular.bind(this, function() {
            this.name = file.name;
            this.data = istringParse(fileReader.result, file.name.indexOf('.STRINGS') < 0);
            this.data.$type = 'STRINGS';
            $scope.$apply();
        });
        fileReader.readAsArrayBuffer(file);
    }

}


app.controller('MainController', MainController);

//        this.name = null;
//
//        this.data = null;
//
//        this.loadStringFile = function(file) {
            var fileReader = new FileReader();
            fileReader.onload = angular.bind(this, function() {
                this.name = file.name;
                this.data = istringParse(fileReader.result, file.name.indexOf('.STRINGS') < 0);
                this.data.$type = 'STRINGS';
                $scope.$apply();
            });
            fileReader.readAsArrayBuffer(file);
//        };
//
//        this.renderStrings = function() {
//            var content = '';
//            this.data.stringIds.forEach(angular.bind(this, function(stringId) {
//                var recordId = this.data.strings[stringId];
//                content += '[' + hex4(stringId) + ']' + '[' + hex4(recordId) + '] ' + this.data.records[recordId] + '\n';
//            }));
//            this.data.$content = content;
//        };
//
//        this.loadModFile = function(file) {
//            var fileReader = new FileReader();
//            fileReader.onload = angular.bind(this, function() {
//                this.name = file.name;
//                this.data = modParse(fileReader.result);
//                this.data.$type = 'MOD';
//                $scope.$apply();
//            });
//            fileReader.readAsArrayBuffer(file);
//        };
//
//        this.filterMod = function(condition) {
//            var checkChildren = function(records) {
//                var index = 0,
//                    result = false;
//                for (index = 0; index < records.length; index++) {
//                    if (checkRecord(records[index])) {
//                        result = true;
//                    }
//                }
//                return result;
//            };
//            var checkRecord = function(record) {
//                if (record.type === 'GRUP') {
//                    record.$filter = checkChildren(record.records) || condition(record);
//                } else {
//                    record.$filter = condition(record);
//                }
//                return record.$filter;
//            };
//            checkChildren(this.data.records);
//        };
//
//        this.renderMod = function() {
//            this.data.$content = '';
//            var renderRecord = function(indent, record) {
//                var result = '[' + record.type + ']';
//                if (record.type === 'GRUP') {
//                    result += ' [' + record.kind + ' ' + record.label + ']';
//                    record.records.forEach(function(subrecord) {
//                        if (subrecord.$filter) {
//                            result += '\n' + renderRecord(indent + '    ', subrecord);
//                        }
//                    });
//                } else {
//                    result += ' [' + hex4(record.id) + ']';
//                }
//                return indent + result;
//            };
//            this.data.records.forEach(angular.bind(this, function(record) {
//                if (record.$filter) {
//                    this.data.$content += renderRecord('', record) + '\n';
//                }
//            }));
//        };
//
//        this.processMod = function() {
//            this.filterMod(function(record) {
//                return record.type === 'INFO' || record.type === 'DIAL' || record.type === 'DLBR';
//            });
//            this.renderMod();
//        };
//
