import { readString, readChar4 } from 'app/lib/support';
import { ModRoot, ModGroup, ModRecord, ModField } from 'app/lib/modfile.model';

class ModFileMapper {

    readMod(buffer) {
        var parser = new ModFileParser(buffer);
        parser.onfield = function(record, field) {
            if (field.$type === 'EDID') {
                record.edid = readString(this.array, field.offset);
            }
        };
        return parser.parse();
    }

    readFields(buffer, record) {
        var parser = new ModFileParser(buffer, record.offset);
        if (record.flags & 0x00040000) {
            record.$fields.push(new ModField('ZLIB', record))
            record.$fields[0].offset = record.offset;
            record.$fields[0].size = record.size;
        } else {
            parser.onfield = function(record, field) {
                record.$fields.push(field);
            };
            parser.parseFields(record, record.size);
        }
    }

}
export { ModFileMapper };

class ModFileParser {

    constructor(buffer, offset) {
        this.buffer = buffer;
        this.array = new Uint8Array(buffer);
        this.view = new DataView(buffer);
        this.offset = offset || 0;
        this.result = null;
        this.onfield = () => {};
    }

    parse() {
        this.result = new ModGroup('GRUP', null);
        this.result.label = 'ROOT';
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
        group.offset = start + 24;
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
        record.offset = this.offset + 24;
        this.offset += 24;
        if (record.flags & 0x00040000) {
            this.offset += record.size;
        } else {
            this.parseFields(record, record.size);
        }
        return record;
    }

    parseFields(parent, size) {
        var start = this.offset,
            field = null;
        while (this.offset < start + size) {
            field = this.parseField(parent);
            this.onfield(parent, field);
            if (field.$type === 'OFST') {
                break; // Stop on OFST field
            }
        }
        this.offset = start + size;
    }

    parseField(parent) {
        var field = new ModField(readChar4(this.array, this.offset), parent);
        field.size = this.view.getUint16(this.offset + 4, true);
        field.offset = this.offset + 6;
        this.offset += 6 + field.size;
        return field;
    }

}
