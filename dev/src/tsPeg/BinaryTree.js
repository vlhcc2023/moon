"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class BinaryTree {
    constructor(op, left, right) {
        this.op = op;
        this.left = left;
        this.right = right;
        this.position = -1;
        this.firstPosition = new Set();
        this.lastPosition = new Set();
        this.nullable = false;
    }
    isLeaf() {
        return !this.left && !this.right;
    }
    followPos(followPos = new Map()) {
        if (this.left) {
            this.left.followPos(followPos);
        }
        if (this.right) {
            this.right.followPos(followPos);
        }
        if (this.op === 'dot' && this.left && this.right) {
            this.left.lastPosition.forEach(position => {
                if (this.right) {
                    followPos.set(position, this.right.firstPosition);
                }
            });
        }
        return followPos;
    }
    setAllInfo() {
        this.nullable = this.isNullable();
        this.firstPosition = this.firstPos();
        this.lastPosition = this.lastPos();
    }
    isNullable() {
        var _a, _b, _c, _d;
        if (this.op === "E") {
            return true;
        }
        else if (this.op === '+') {
            return Boolean(((_a = this.left) === null || _a === void 0 ? void 0 : _a.isNullable()) || ((_b = this.right) === null || _b === void 0 ? void 0 : _b.isNullable()));
        }
        else if (this.op === 'dot') {
            return Boolean(((_c = this.left) === null || _c === void 0 ? void 0 : _c.isNullable()) && ((_d = this.right) === null || _d === void 0 ? void 0 : _d.isNullable()));
        }
        return false;
    }
    firstPos() {
        if (this.isLeaf() && !this.isNullable()) {
            return new Set([this.position]);
        }
        if (this.op === 'dot' && this.left && this.right) {
            if (this.left.isNullable()) {
                return new Set([...this.left.firstPosition, ...this.right.firstPosition]);
            }
            else {
                return this.left.firstPosition;
            }
        }
        if (this.op === '+' && this.left && this.right) {
            return new Set([...this.left.firstPosition, ...this.right.firstPosition]);
        }
        return new Set();
    }
    lastPos() {
        if (this.isLeaf() && !this.isNullable()) {
            return new Set([this.position]);
        }
        if (this.op === 'dot' && this.left && this.right) {
            if (this.right.isNullable()) {
                return new Set([...this.left.lastPosition, ...this.right.lastPosition]);
            }
            else {
                return this.right.lastPosition;
            }
        }
        if (this.op === '+' && this.left && this.right) {
            if (this.right.isNullable()) {
                return new Set([...this.left.lastPosition]);
            }
            return new Set([...this.left.lastPosition, ...this.right.lastPosition]);
        }
        return new Set();
    }
}
exports.BinaryTree = BinaryTree;
