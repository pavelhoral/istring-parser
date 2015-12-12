import { StringTable } from 'app/lib/strings.model';

class StringsMapper {

    readStrings(buffer, type) {
        return new StringsParser(buffer, type).parse();
    }

    determineType(filename) {
        var suffix = filename.substring(filename.lastIndexOf('.')).toUpperCase();
        if (suffix === '.STRINGS') {
            return 'STRINGS';
        } else if (suffix === '.ILSTRINGS') {
            return 'ILSTRINGS';
        } else if (suffix === '.DLSTRINGS') {
            return 'DLSTRINGS';
        } else {
            throw new Error('Invalid file name ' + filename + '.');
        }
    }

    writeStrings(table) {
        return new StringsSerializer(table).serialize();
    }

}
export { StringsMapper };

class StringsParser {

    constructor(buffer, type) {
        this.buffer = buffer;
        this.view = new DataView(buffer);
        this.padding = type === 'STRINGS' ? 0 : 4;
        this.result = new StringTable(type);
        this.decoder = new TextDecoder();
    }

    parse() {
        var count = this.view.getUint32(0, true),
            dict = new Uint32Array(this.buffer, 8, 2 * count),
            array = new Uint8Array(this.buffer, 8 + 8 * count);
        for (var index = 0; index < count; index++) {
            this.parseString(2 * index, dict, array);
        }
        return this.result;
    }

    parseString(index, dict, array) {
        var id = dict[index],
            start = dict[index + 1] + this.padding;
        for (var stop = start; stop < array.length; stop++) {
            if (array[stop] === 0) {
                break;
            }
        }
        this.result.directory[id] = this.decoder.decode(array.subarray(start, stop));
    }

}

class StringsSerializer {

    constructor(table) {
        this.padding = table.$type === 'STRINGS' ? 0 : 4;
        this.encoder = new TextEncoder();
        this.table = table;
    }

    serialize() {
        var stringIds = Object.keys(this.table.directory),
            directorySize = stringIds.length * 8,
            dataSize = stringIds.length * this.padding;
        stringIds.forEach((id) => {
            dataSize += this.encoder.encode(this.table.directory[id]).length + 1;
        });
        console.log(directorySize, dataSize);
        var buffer = new ArrayBuffer(8 + directorySize + dataSize),
            view = new DataView(buffer),
            data = new Uint8Array(buffer, 8 + directorySize),
            offset = 0,
            string = null,
            index = 0;
        view.setUint32(0, stringIds.length, true);
        view.setUint32(4, dataSize, true);
        for (index = 0; index < stringIds.length; index++) {
            view.setUint32(8 + index * 8, stringIds[index], true);
            view.setUint32(8 + index * 8 + 4, offset, true);
            string = this.encoder.encode(this.table.directory[stringIds[index]]);
            if (this.padding) {
                view.setUint32(8 + directorySize + offset, string.length + 1, true);
                offset += 4;
            }
            data.set(string, offset);
            offset += string.length + 1;
        }
        return buffer;
    }

}
