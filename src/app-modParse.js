angular.module('bethparser').

    factory('modParse', function() {
        /**
         * Read record type signature.
         */
        var readType = function(context, offset) {
            offset = offset || context.offset;
            return String.fromCharCode(
                    context.view.getUint8(offset), context.view.getUint8(offset + 1),
                    context.view.getUint8(offset + 2), context.view.getUint8(offset + 3))
        };
        /**
         * Read record of the specified type.
         */
        var readRecord = function(context, type) {
            var	view = new DataView(context.source, context.offset),
                record = {
                    type: type,
                    size: view.getUint32(4, true),
                    flags: view.getUint32(8, true),
                    id: view.getUint32(12, true),
                    revision: view.getUint32(16, true),
                    version: view.getUint16(20, true)
                };
            return record;
        };
        /**
         * Read record group.
         */
        var readGroup = function(context) {
            var view = new DataView(context.source, context.offset),
                group = {
                    type: 'GRUP',
                    size: view.getUint32(4, true),
                    label: readType(context, context.offset + 8),
                    records: []
                },
                child = angular.extend({}, context);
            child.offset += 24;
            while (child.offset <  context.offset + group.size) {
                group.records.push(readNext(child));
            }
            return group;
        };
        /**
         * Parse next file entry (be it record or group).
         */
        var readNext = function(context) {
            var type = readType(context),
                result = null;
            if (type === 'GRUP') {
                result = readGroup(context);
                context.offset += result.size;
            } else {
                result = readRecord(context, type);
                context.offset += 24 + result.size;
            }
            return result;
        };
        /**
         * Main data parsing function.
         */
        return function(source) {
            var context = {
                    source: source,
                    view: new DataView(source),
                    offset: 0
                },
                records = [];
            while (context.offset < context.source.byteLength) {
                records.push(readNext(context));
            };
            return {
                records: records
            };
            return resultData;
        };
    });
