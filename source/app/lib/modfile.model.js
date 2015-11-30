class ModNode {

    constructor(type, parent) {
        this.$parent = parent;
        this.$type = type;
    }

}
export { ModNode };

class ModGroup extends ModNode {

    constructor(type, parent) {
        super(type, parent);
        this.$children = [];
    }

}
export { ModGroup };

class ModRecord extends ModNode {

    constructor(type, parent) {
        super(type, parent);
        this.$fields = [];
    }

}
export { ModRecord };

class ModField extends ModNode {

}
export { ModField };
