"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const BinaryTree_1 = require("./BinaryTree");
const _ = require("lodash");
class ParsePostfix {
    constructor(postfix) {
        this.cell_position = new Map();
        this._postfix = postfix;
        this._pos = 1;
    }
    postfixToBinaryTree() {
        let ao = [];
        let io = [];
        let pile = [];
        let i = 0;
        while (i < this._postfix.length) {
            if (this._postfix[i] === "IO") {
                let size = parseInt(this._postfix[i + 1]);
                if (pile.length >= size) {
                    for (let j = 0; j < size; j++) {
                        io.unshift(pile.pop() || new BinaryTree_1.BinaryTree("", null, null));
                    }
                }
                pile.push(this.evaluateIO(io));
                io = [];
                i = i + 2;
            }
            else if (this._postfix[i] === "AO") {
                let size = parseInt(this._postfix[i + 1]);
                if (pile.length >= size) {
                    for (let j = 0; j < size; j++) {
                        ao.unshift(pile.pop() || new BinaryTree_1.BinaryTree("", null, null));
                    }
                }
                pile.push(this.evaluateAO(ao));
                ao = [];
                i = i + 2;
            }
            else if (this._postfix[i] === "OP_1") {
                pile.push(this.evaluateOP(pile.pop() || new BinaryTree_1.BinaryTree("", null, null)));
                i++;
            }
            else {
                const leaf = new BinaryTree_1.BinaryTree(this._postfix[i], null, null);
                leaf.position = this._pos;
                this.cell_position.set(leaf.position, leaf.op);
                leaf.setAllInfo();
                this._pos++;
                pile.push(leaf);
                i++;
            }
        }
        return pile.pop() || new BinaryTree_1.BinaryTree("", null, null);
    }
    evaluateIO(io) {
        let tree = new BinaryTree_1.BinaryTree('dot', null, null);
        tree.setAllInfo();
        if (io.length > 1) {
            tree.right = io.pop() || null;
            tree.left = io.pop() || null;
            tree.setAllInfo();
        }
        while (io.length != 0) {
            const tree_left = io.pop() || null;
            tree = new BinaryTree_1.BinaryTree('dot', tree_left, tree);
            tree.setAllInfo();
        }
        return tree;
    }
    evaluateOP(op) {
        const tree_right = new BinaryTree_1.BinaryTree("E", null, null);
        tree_right.position = this._pos++;
        this.cell_position.set(tree_right.position, tree_right.op);
        tree_right.setAllInfo();
        const tree = new BinaryTree_1.BinaryTree('+', op, tree_right);
        tree.setAllInfo();
        return tree;
    }
    evaluateAO(ao) {
        const all_permut = [...this.permutation(ao)];
        const tree_right = this.evaluateIO(all_permut.pop() || []);
        let next_permut = this.permuts(all_permut.pop());
        let tree_left = this.evaluateIO(next_permut || []);
        let tree = new BinaryTree_1.BinaryTree('+', tree_left, tree_right);
        tree.setAllInfo();
        all_permut.forEach(value => {
            next_permut = this.permuts(value);
            tree_left = this.evaluateIO(next_permut || []);
            tree = new BinaryTree_1.BinaryTree('+', tree_left, tree);
            tree.setAllInfo();
        });
        return tree;
    }
    permuts(permuts) {
        if (permuts) {
            for (let i = 0; i < permuts.length; i++) {
                permuts[i] = _.cloneDeep(permuts[i]);
                permuts[i] = this.modifySetAllInfoTree(permuts[i]);
            }
        }
        return permuts;
    }
    //be careful recursive function
    modifySetAllInfoTree(tree) {
        let regex = /C(?<number>\d+)/;
        if (tree) {
            if (tree.left)
                this.modifySetAllInfoTree(tree.left);
            if (tree.right)
                this.modifySetAllInfoTree(tree.right);
            if (tree.op.search(regex) == 0 || tree.op === "E") {
                tree.op = tree.op;
                tree.position = this._pos++;
                this.cell_position.set(tree.position, tree.op);
                tree.setAllInfo();
            }
            if (tree.op.search("dot") == 0) {
                tree.setAllInfo();
            }
            if (tree.op === '+') {
                tree.setAllInfo();
            }
        }
        return tree;
    }
    *permutation(array, n = array.length) {
        if (n <= 1) {
            yield array.slice();
        }
        else {
            for (let i = 0; i < n; i++) {
                yield* this.permutation(array, n - 1);
                const j = n % 2 ? 0 : i;
                [array[n - 1], array[j]] = [array[j], array[n - 1]];
            }
        }
    }
}
exports.ParsePostfix = ParsePostfix;
