import { app, angular } from 'app/app';
import { hex4 } from 'app/lib/support';
import { ModFileMapper } from 'app/lib/modfile.mapper';
import { ModRecord, ModField, ModGroup } from 'app/lib/modfile.model';

class WalkerController {

    constructor() {
        this.node = null;
        this.buffer = null;
        this.path = null;
    }

    renderPath() {
        var node = this.node,
            path = [];
        while (node !== null) {
            path.unshift(node);
            node = node.$parent;
        }
        return path;
    }

    cleanupPath(oldPath) {
        var index = -1;
        while (++index < oldPath.length) {
            if (this.path.length < index || this.path[index] !== oldPath[index]) {
                delete oldPath[index].$filter;
                if (oldPath[index].$fields) {
                    oldPath[index].$fields = [];
                }
            }
        }
    }

    enterNode(node) {
        var oldPath = this.path;
        if (this.node === node) {
            return;
        }
        this.node = node;
        this.path = this.renderPath();
        // Lazy load record fields
        if (node instanceof ModRecord && !node.$fields.length) {
            new ModFileMapper().readFields(this.buffer, node);
        }
        // Cleanup path
        if (oldPath) {
            this.cleanupPath(oldPath);
        }
    }

    createFilter(text) {
        var regexp = text ? new RegExp(text.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&"), 'i') : null;
        return (node) => {
            return !regexp || (node.$type).match(regexp) ||
                    node.edid && ('' + node.edid).match(regexp) ||
                    node.id && hex4(node.id).match(regexp) ||
                    node.label && ('' + node.label).match(regexp);
        };
    }

}
app.controller('WalkerController', WalkerController);

app.directive('nodeWalker', () => {
    return {
        scope: true,
        controller: 'WalkerController as walkerCtrl',
        link: (scope, element, attrs, walker) => {
            scope.$watch(attrs.nodeWalker, (mod) => {
                walker.buffer = mod.buffer;
                walker.enterNode(mod.root);
            });
        }
    };
});

app.directive('fieldBuffer', ($window) => {
    var decoder = new TextDecoder();
    return {
        scope: true,
        link: (scope, element, attrs) => {
            scope.$watch(attrs.fieldBuffer, (node) => {
                var buffer = scope.$eval(attrs.bufferRef),
                    array = new Uint8Array(buffer, node.offset, node.size),
                    value = 0, index = 0, hexa = [], text = [];
                scope.overflow = false;
                for (index = 0; index < array.length; index++) {
                    value = array[index];
                    hexa.push((value < 16 ? '0' : '') + value.toString(16));
                    text.push(value > 31 && value < 128 ? String.fromCharCode(value) + ' ' : '. ');
                    if (index % 4 == 3) {
                        hexa.push('  ');
                        text.push('  ');
                    }
                    if (index >= 20000) {
                        scope.overflow = true;
                        break;
                    }
                }
                scope.hexa = hexa.join('');
                scope.text = text.join('');
            });
        }
    };
});
