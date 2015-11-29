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
        } else if (suffix === '.DLSRTINGS') {
            return '.DLSTRINGS';
        } else {
            throw new Error('Invalid file name.');
        }
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
