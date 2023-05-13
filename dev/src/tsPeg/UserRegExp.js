"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const parser_1 = require("./parser");
const parsePostfix_1 = require("./parsePostfix");
class UserRegExp {
    constructor(exp) {
        this.link_cell_code_text = new Map();
        this._allCellsCodeInScript = [];
        this._allCellsTextInScript = [];
        this._cellsScript = [];
        this._parser = new parser_1.Parser(exp);
        this._tree = this._parser.parse();
        this.exp_postfix = this.cleanPostfix(this.postfix());
        this._parse_postfix = new parsePostfix_1.ParsePostfix(this.exp_postfix);
        this.to_binary_tree = this._parse_postfix.postfixToBinaryTree();
    }
    get cellPosition() {
        return this._parse_postfix.cell_position;
    }
    get allCellsCodeInScript() {
        return this._allCellsCodeInScript;
    }
    get allCellsTextInScript() {
        return this._allCellsTextInScript;
    }
    get cellsScript() {
        return this._cellsScript;
    }
    addCellsCodeInScript(cell_code) {
        let regex = /([\d]+)/;
        let result = cell_code.match(regex);
        if (result) {
            let val = Number(result[0]);
            if (!this._allCellsCodeInScript.includes(val)) {
                this._allCellsCodeInScript.push(val);
            }
        }
    }
    addCellsTextInScript(cell_text) {
        cell_text.forEach(element => {
            let regex = /([\d]+)/;
            let result = element.match(regex);
            if (result) {
                let val = Number(result[0]);
                if (!this._allCellsTextInScript.includes(val)) {
                    this._allCellsTextInScript.push(val);
                }
            }
        });
    }
    cleanPostfix(postfix) {
        let clean_postfix = [];
        let cpt = 0;
        for (let i = 0; i < postfix.length; i++) {
            if (postfix[i] !== "SEQ_1" && postfix[i] !== "IO" && postfix[i] !== "AO") {
                let cell = postfix[i].split(" ");
                this._cellsScript.push(parseInt(cell[0].slice(1)));
                this.addCellsCodeInScript(cell[0]);
                this.addCellsTextInScript(cell.slice(1));
                if (cell.length > 1) {
                    if (!this.link_cell_code_text.has(cell[0])) {
                        this.link_cell_code_text.set(cell[0], ["+", ...cell.slice(1)]);
                    }
                    else {
                        let text = this.link_cell_code_text.get(cell[0]);
                        text === null || text === void 0 ? void 0 : text.push("+");
                        cell.slice(1).forEach(c => {
                            text === null || text === void 0 ? void 0 : text.push(c);
                        });
                        if (text != undefined) {
                            this.link_cell_code_text.set(cell[0], text);
                        }
                    }
                }
                clean_postfix.push(cell[0]);
            }
            else if (postfix[i] === "SEQ_1") {
                cpt++;
            }
            else if (postfix[i] === "IO" || postfix[i] === "AO") {
                clean_postfix.push(postfix[i]);
                clean_postfix.push((cpt + 1).toString());
                cpt = 0;
            }
        }
        return clean_postfix;
    }
    syntaxChecker(exp) {
        let pile = [];
        for (let i = 0; i < exp.length; i++) {
            if (exp[i] === "(" || exp[i] === "[") {
                pile.push(exp[i]);
            }
            else if (exp[i] === ")") {
                if (pile.length !== 0) {
                    if (pile.pop() !== '(') {
                        return `missing ( associated with the position ${i}`;
                    }
                }
                else {
                    return `missing ( associated with the position ${i}`;
                }
            }
            else if (exp[i] === "]") {
                if (pile.length != 0) {
                    if (pile.pop() !== '[') {
                        return `missing [ associated with the position ${i}`;
                    }
                }
                else {
                    return `missing [ associated with the position ${i}`;
                }
            }
        }
        if (pile.length != 0) {
            return `${pile.pop()} is not closed`;
        }
        else {
            return "1";
        }
    }
    postfix(object = this._tree) {
        if (UserRegExp.isParseResult(object)) {
            if (object.errs.length > 0) {
                return [];
            }
            return object.ast ? this.postfix(object.ast) : [];
        }
        if (UserRegExp.isSEQ2(object)) {
            return this.postfix(object.content);
        }
        if (UserRegExp.isOP1(object)) {
            const content = this.postfix(object.content);
            return [...content, parser_1.ASTKinds.OP_1];
        }
        if (UserRegExp.isOP2(object)) {
            const content = this.postfix(object.content);
            return [...content, parser_1.ASTKinds.OP_2];
        }
        if (UserRegExp.isEXP4(object)) {
            return [object.cell];
        }
        if (UserRegExp.isSEQ1(object)) {
            const left = this.postfix(object.left);
            const right = this.postfix(object.right);
            return [...left, ...right, parser_1.ASTKinds.SEQ_1];
        }
        if (UserRegExp.isIO(object)) {
            const content = this.postfix(object.content);
            return [...content, parser_1.ASTKinds.IO];
        }
        if (UserRegExp.isAO(object)) {
            const content = this.postfix(object.content);
            return [...content, parser_1.ASTKinds.AO];
        }
        return [];
    }
    static isParseResult(object) {
        return object.errs !== undefined && object.ast !== undefined;
    }
    static isEXP4(object) {
        return object.kind === parser_1.ASTKinds.EXP_4 && object.cell !== undefined;
    }
    static isIO(object) {
        return object.kind === parser_1.ASTKinds.IO && object.content !== undefined;
    }
    static isAO(object) {
        return object.kind === parser_1.ASTKinds.AO && object.content !== undefined;
    }
    static isOP1(object) {
        return object.kind === parser_1.ASTKinds.OP_1 && object.content !== undefined;
    }
    static isOP2(object) {
        return object.kind === parser_1.ASTKinds.OP_2 && object.content !== undefined;
    }
    static isSEQ1(object) {
        return (object.kind === parser_1.ASTKinds.SEQ_1 &&
            object.left !== undefined &&
            object.right !== undefined);
    }
    static isSEQ2(object) {
        return object.kind === parser_1.ASTKinds.SEQ_2 && object.content !== undefined;
    }
}
exports.UserRegExp = UserRegExp;
