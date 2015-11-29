import { readString, readChar4 } from 'app/lib/support';
import { ModRoot, ModGroup, ModRecord, ModField } from 'app/lib/modfile.model';

class ModFileMapper {

    readMod(buffer) {
        var parser = new ModFileParser(buffer);
        return parser.parse();
    }

}
export { ModFileMapper };

class ModFileParser {

    constructor(buffer) {
        this.buffer = buffer;
        this.array = new Uint8Array(buffer);
        this.view = new DataView(buffer);
        this.offset = 0;
        this.result = null;
    }

    parse() {
        this.result = this.parseNext(null);
        if (this.result.$type !== 'TES4') {
            throw new Error('Invalid root record.');
        }
        while (this.offset < this.buffer.byteLength) {
            this.result.$children.push(this.parseNext(this.result));
        }
        return this.result;
    }

    parseNext(parent) {
        var type = readChar4(this.array, this.offset);
        if (type === 'GRUP') {
            return this.parseGroup(parent);
        } else {
            return this.parseRecord(type, parent);
        }
    }

    parseGroup(parent) {
        var view = new DataView(this.buffer, this.offset),
            group = new ModGroup('GRUP', parent),
            start = this.offset;
        group.size = view.getUint32(4, true);
        group.type = view.getInt32(12, true);
        if (group.type === 0) {
            group.label = readChar4(this.array, this.offset + 8);
        } else {
            group.label = view.getUint32(8, true);
        }
        this.offset += 24;
        while (this.offset - start < group.size) {
            group.$children.push(this.parseNext(group));
        }
        return group;
    }

    parseRecord(type, parent) {
      var view = new DataView(this.buffer, this.offset),
          record = new ModRecord(type, parent);
      record.size = view.getUint32(4, true);
      record.flags = view.getUint32(8, true);
      record.id = view.getUint32(12, true);
      record.revision = view.getUint32(16, true);
      record.version = view.getUint16(20, true);
      this.offset += 24 + record.size;
      return record;
    }

}


//angular.module('bethparser').
//
//    factory('modParse', function() {
//        /**
//         * Read record type signature.
//         */
//        var readType = function(context, offset) {
//            offset = offset || context.offset;
//            return String.fromCharCode(
//                    context.view.getUint8(offset), context.view.getUint8(offset + 1),
//                    context.view.getUint8(offset + 2), context.view.getUint8(offset + 3))
//        };
//        /**
//         * Read record of the specified type.
//         */
//        var readRecord = function(context, type) {
//            var	view = new DataView(context.source, context.offset),
//                record = {
//                    type: type,
//                    size: view.getUint32(4, true),
//                    flags: view.getUint32(8, true),
//                    id: view.getUint32(12, true),
//                    revision: view.getUint32(16, true),
//                    version: view.getUint16(20, true)
//                };
//            return record;
//        };
//        /**
//         * Read record group.
//         */
//        var readGroup = function(context) {
//            var view = new DataView(context.source, context.offset),
//                group = {
//                    type: 'GRUP',
//                    size: view.getUint32(4, true),
//                    label: null,
//                    kind: view.getInt32(12, true),
//                    records: []
//                },
//                child = angular.extend({}, context);
//            if (group.kind === 0) {
//                group.label = readType(context, context.offset + 8);
//            } else {
//                group.label = view.getUint32(8, true);
//            }
//            child.offset += 24;
//            while (child.offset <  context.offset + group.size) {
//                group.records.push(readNext(child));
//            }
//            return group;
//        };
//        /**
//         * Parse next file entry (be it record or group).
//         */
//        var readNext = function(context) {
//            var type = readType(context),
//                result = null;
//            if (type === 'GRUP') {
//                result = readGroup(context);
//                context.offset += result.size;
//            } else {
//                result = readRecord(context, type);
//                context.offset += 24 + result.size;
//            }
//            return result;
//        };
//        /**
//         * Main data parsing function.
//         */
//        return function(source) {
//            var context = {
//                    source: source,
//                    view: new DataView(source),
//                    offset: 0
//                },
//                records = [];
//            while (context.offset < context.source.byteLength) {
//                records.push(readNext(context));
//            };
//            return {
//                records: records
//            };
//            return resultData;
//        };
//    });
