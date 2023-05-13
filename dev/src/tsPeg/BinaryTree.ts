export class BinaryTree {
    public op: string;
    public left: BinaryTree | null;
    public right: BinaryTree | null;
    public position: number;
    public firstPosition: Set<number>;
    public lastPosition: Set<number>;
    public nullable: boolean;

    constructor(op: string, left: BinaryTree | null, right: BinaryTree | null) {
        this.op = op;
        this.left = left;
        this.right = right;
        this.position = -1;
        this.firstPosition = new Set();
        this.lastPosition = new Set();
        this.nullable = false;
    }

    public isLeaf(): boolean {
        return !this.left && !this.right;
    }

    public followPos(followPos: Map<number, Set<number>> = new Map()): Map<number, Set<number>> {
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

    public setAllInfo() {
        this.nullable = this.isNullable();
        this.firstPosition = this.firstPos();
        this.lastPosition = this.lastPos();
    }

    private isNullable(): boolean {
        if (this.op === "E") {
            return true;
        } else if (this.op === '+') {
            return Boolean(this.left?.isNullable() || this.right?.isNullable());
        } else if (this.op === 'dot') {
            return Boolean(this.left?.isNullable() && this.right?.isNullable());
        }
        return false;
    }

    private firstPos(): Set<number> {
        if (this.isLeaf() && !this.isNullable()) {
            return new Set([this.position]);
        }
        if (this.op === 'dot' && this.left && this.right) {
            if (this.left.isNullable()) {
                return new Set([...this.left.firstPosition, ...this.right.firstPosition]);
            } else {
                return this.left.firstPosition;
            }
        }
        if (this.op === '+' && this.left && this.right) {
            return new Set([...this.left.firstPosition, ...this.right.firstPosition]);
        }
        return new Set();
    }

    private lastPos(): Set<number> {
        if (this.isLeaf() && !this.isNullable()) {
            return new Set([this.position]);
        }
        if (this.op === 'dot' && this.left && this.right) {
            if (this.right.isNullable()) {
                return new Set([...this.left.lastPosition, ...this.right.lastPosition]);
            } else {
                return this.right.lastPosition;
            }
        }
        if (this.op === '+' && this.left && this.right) {
            if(this.right.isNullable()){
                return new Set([...this.left.lastPosition]);    
            }
            return new Set([...this.left.lastPosition, ...this.right.lastPosition]);
        }
        return new Set();
    }
}
