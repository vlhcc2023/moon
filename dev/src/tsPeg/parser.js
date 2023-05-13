"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ASTKinds;
(function (ASTKinds) {
    ASTKinds["EXP_1"] = "EXP_1";
    ASTKinds["EXP_2"] = "EXP_2";
    ASTKinds["EXP_3"] = "EXP_3";
    ASTKinds["EXP_4"] = "EXP_4";
    ASTKinds["IO"] = "IO";
    ASTKinds["AO"] = "AO";
    ASTKinds["OP_1"] = "OP_1";
    ASTKinds["OP_2"] = "OP_2";
    ASTKinds["SEQ_1"] = "SEQ_1";
    ASTKinds["SEQ_2"] = "SEQ_2";
    ASTKinds["_"] = "_";
    ASTKinds["CELL"] = "CELL";
})(ASTKinds = exports.ASTKinds || (exports.ASTKinds = {}));
class Parser {
    constructor(input) {
        this.negating = false;
        this.memoSafe = true;
        this.$scope$EXP$memo = new Map();
        this.pos = { overallPos: 0, line: 1, offset: 0 };
        this.input = input;
    }
    reset(pos) {
        this.pos = pos;
    }
    finished() {
        return this.pos.overallPos === this.input.length;
    }
    clearMemos() {
        this.$scope$EXP$memo.clear();
    }
    matchEXP($$dpth, $$cr) {
        const fn = () => {
            return this.choice([
                () => this.matchEXP_1($$dpth + 1, $$cr),
                () => this.matchEXP_2($$dpth + 1, $$cr),
                () => this.matchEXP_3($$dpth + 1, $$cr),
                () => this.matchEXP_4($$dpth + 1, $$cr),
            ]);
        };
        const $scope$pos = this.mark();
        const memo = this.$scope$EXP$memo.get($scope$pos.overallPos);
        if (memo !== undefined) {
            this.reset(memo[1]);
            return memo[0];
        }
        const $scope$oldMemoSafe = this.memoSafe;
        this.memoSafe = false;
        this.$scope$EXP$memo.set($scope$pos.overallPos, [null, $scope$pos]);
        let lastRes = null;
        let lastPos = $scope$pos;
        for (;;) {
            this.reset($scope$pos);
            const res = fn();
            const end = this.mark();
            if (end.overallPos <= lastPos.overallPos)
                break;
            lastRes = res;
            lastPos = end;
            this.$scope$EXP$memo.set($scope$pos.overallPos, [lastRes, lastPos]);
        }
        this.reset(lastPos);
        this.memoSafe = $scope$oldMemoSafe;
        return lastRes;
    }
    matchEXP_1($$dpth, $$cr) {
        return this.matchIO($$dpth + 1, $$cr);
    }
    matchEXP_2($$dpth, $$cr) {
        return this.matchAO($$dpth + 1, $$cr);
    }
    matchEXP_3($$dpth, $$cr) {
        return this.matchOP($$dpth + 1, $$cr);
    }
    matchEXP_4($$dpth, $$cr) {
        return this.run($$dpth, () => {
            let $scope$cell;
            let $$res = null;
            if (true
                && ($scope$cell = this.matchCELL($$dpth + 1, $$cr)) !== null) {
                $$res = { kind: ASTKinds.EXP_4, cell: $scope$cell };
            }
            return $$res;
        });
    }
    matchIO($$dpth, $$cr) {
        return this.run($$dpth, () => {
            let $scope$content;
            let $$res = null;
            if (true
                && this.regexAccept(String.raw `(?:\()`, $$dpth + 1, $$cr) !== null
                && this.match_($$dpth + 1, $$cr) !== null
                && ($scope$content = this.matchSEQ($$dpth + 1, $$cr)) !== null
                && this.regexAccept(String.raw `(?:\))`, $$dpth + 1, $$cr) !== null) {
                $$res = { kind: ASTKinds.IO, content: $scope$content };
            }
            return $$res;
        });
    }
    matchAO($$dpth, $$cr) {
        return this.run($$dpth, () => {
            let $scope$content;
            let $$res = null;
            if (true
                && this.regexAccept(String.raw `(?:\[)`, $$dpth + 1, $$cr) !== null
                && this.match_($$dpth + 1, $$cr) !== null
                && ($scope$content = this.matchSEQ($$dpth + 1, $$cr)) !== null
                && this.regexAccept(String.raw `(?:\])`, $$dpth + 1, $$cr) !== null) {
                $$res = { kind: ASTKinds.AO, content: $scope$content };
            }
            return $$res;
        });
    }
    matchOP($$dpth, $$cr) {
        return this.choice([
            () => this.matchOP_1($$dpth + 1, $$cr),
            () => this.matchOP_2($$dpth + 1, $$cr),
        ]);
    }
    matchOP_1($$dpth, $$cr) {
        return this.run($$dpth, () => {
            let $scope$content;
            let $$res = null;
            if (true
                && this.regexAccept(String.raw `(?:\?)`, $$dpth + 1, $$cr) !== null
                && this.match_($$dpth + 1, $$cr) !== null
                && ($scope$content = this.matchEXP($$dpth + 1, $$cr)) !== null) {
                $$res = { kind: ASTKinds.OP_1, content: $scope$content };
            }
            return $$res;
        });
    }
    matchOP_2($$dpth, $$cr) {
        return this.run($$dpth, () => {
            let $scope$content;
            let $$res = null;
            if (true
                && ($scope$content = this.matchEXP($$dpth + 1, $$cr)) !== null
                && this.match_($$dpth + 1, $$cr) !== null
                && this.regexAccept(String.raw `(?:!)`, $$dpth + 1, $$cr) !== null) {
                $$res = { kind: ASTKinds.OP_2, content: $scope$content };
            }
            return $$res;
        });
    }
    matchSEQ($$dpth, $$cr) {
        return this.choice([
            () => this.matchSEQ_1($$dpth + 1, $$cr),
            () => this.matchSEQ_2($$dpth + 1, $$cr),
        ]);
    }
    matchSEQ_1($$dpth, $$cr) {
        return this.run($$dpth, () => {
            let $scope$left;
            let $scope$right;
            let $$res = null;
            if (true
                && ($scope$left = this.matchEXP($$dpth + 1, $$cr)) !== null
                && this.match_($$dpth + 1, $$cr) !== null
                && ($scope$right = this.matchSEQ($$dpth + 1, $$cr)) !== null) {
                $$res = { kind: ASTKinds.SEQ_1, left: $scope$left, right: $scope$right };
            }
            return $$res;
        });
    }
    matchSEQ_2($$dpth, $$cr) {
        return this.run($$dpth, () => {
            let $scope$content;
            let $$res = null;
            if (true
                && ($scope$content = this.matchEXP($$dpth + 1, $$cr)) !== null
                && this.match_($$dpth + 1, $$cr) !== null) {
                $$res = { kind: ASTKinds.SEQ_2, content: $scope$content };
            }
            return $$res;
        });
    }
    match_($$dpth, $$cr) {
        return this.regexAccept(String.raw `(?:\s*)`, $$dpth + 1, $$cr);
    }
    matchCELL($$dpth, $$cr) {
        return this.regexAccept(String.raw `(?:C[\d]+(\s*T[\d]+)*)`, $$dpth + 1, $$cr);
    }
    test() {
        const mrk = this.mark();
        const res = this.matchEXP(0);
        const ans = res !== null;
        this.reset(mrk);
        return ans;
    }
    parse() {
        const mrk = this.mark();
        const res = this.matchEXP(0);
        if (res)
            return { ast: res, errs: [] };
        this.reset(mrk);
        const rec = new ErrorTracker();
        this.clearMemos();
        this.matchEXP(0, rec);
        const err = rec.getErr();
        return { ast: res, errs: err !== null ? [err] : [] };
    }
    mark() {
        return this.pos;
    }
    loop(func, star = false) {
        const mrk = this.mark();
        const res = [];
        for (;;) {
            const t = func();
            if (t === null) {
                break;
            }
            res.push(t);
        }
        if (star || res.length > 0) {
            return res;
        }
        this.reset(mrk);
        return null;
    }
    run($$dpth, fn) {
        const mrk = this.mark();
        const res = fn();
        if (res !== null)
            return res;
        this.reset(mrk);
        return null;
    }
    choice(fns) {
        for (const f of fns) {
            const res = f();
            if (res !== null) {
                return res;
            }
        }
        return null;
    }
    regexAccept(match, dpth, cr) {
        return this.run(dpth, () => {
            const reg = new RegExp(match, "y");
            const mrk = this.mark();
            reg.lastIndex = mrk.overallPos;
            const res = this.tryConsume(reg);
            if (cr) {
                cr.record(mrk, res, {
                    kind: "RegexMatch",
                    // We substring from 3 to len - 1 to strip off the
                    // non-capture group syntax added as a WebKit workaround
                    literal: match.substring(3, match.length - 1),
                    negated: this.negating,
                });
            }
            return res;
        });
    }
    tryConsume(reg) {
        const res = reg.exec(this.input);
        if (res) {
            let lineJmp = 0;
            let lind = -1;
            for (let i = 0; i < res[0].length; ++i) {
                if (res[0][i] === "\n") {
                    ++lineJmp;
                    lind = i;
                }
            }
            this.pos = {
                overallPos: reg.lastIndex,
                line: this.pos.line + lineJmp,
                offset: lind === -1 ? this.pos.offset + res[0].length : (res[0].length - lind - 1)
            };
            return res[0];
        }
        return null;
    }
    noConsume(fn) {
        const mrk = this.mark();
        const res = fn();
        this.reset(mrk);
        return res;
    }
    negate(fn) {
        const mrk = this.mark();
        const oneg = this.negating;
        this.negating = !oneg;
        const res = fn();
        this.negating = oneg;
        this.reset(mrk);
        return res === null ? true : null;
    }
    memoise(rule, memo) {
        const $scope$pos = this.mark();
        const $scope$memoRes = memo.get($scope$pos.overallPos);
        if (this.memoSafe && $scope$memoRes !== undefined) {
            this.reset($scope$memoRes[1]);
            return $scope$memoRes[0];
        }
        const $scope$result = rule();
        if (this.memoSafe)
            memo.set($scope$pos.overallPos, [$scope$result, this.mark()]);
        return $scope$result;
    }
}
exports.Parser = Parser;
function parse(s) {
    const p = new Parser(s);
    return p.parse();
}
exports.parse = parse;
class SyntaxErr {
    constructor(pos, expmatches) {
        this.pos = pos;
        this.expmatches = [...expmatches];
    }
    toString() {
        return `Syntax Error at line ${this.pos.line}:${this.pos.offset}. Expected one of ${this.expmatches.map(x => x.kind === "EOF" ? " EOF" : ` ${x.negated ? 'not ' : ''}'${x.literal}'`)}`;
    }
}
exports.SyntaxErr = SyntaxErr;
class ErrorTracker {
    constructor() {
        this.mxpos = { overallPos: -1, line: -1, offset: -1 };
        this.regexset = new Set();
        this.pmatches = [];
    }
    record(pos, result, att) {
        if ((result === null) === att.negated)
            return;
        if (pos.overallPos > this.mxpos.overallPos) {
            this.mxpos = pos;
            this.pmatches = [];
            this.regexset.clear();
        }
        if (this.mxpos.overallPos === pos.overallPos) {
            if (att.kind === "RegexMatch") {
                if (!this.regexset.has(att.literal))
                    this.pmatches.push(att);
                this.regexset.add(att.literal);
            }
            else {
                this.pmatches.push(att);
            }
        }
    }
    getErr() {
        if (this.mxpos.overallPos !== -1)
            return new SyntaxErr(this.mxpos, this.pmatches);
        return null;
    }
}
