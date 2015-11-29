class ModNode {

    constructor(type, parent) {
        this.$parent = parent;
        this.$type = type;
        this.$children = [];
    }

}
export { ModNode };

class ModRoot extends ModNode {

}

class ModGroup extends ModNode {

}
export { ModGroup };

class ModRecord extends ModNode {

}
export { ModRecord };

class ModField extends ModNode {

}
export { ModField };