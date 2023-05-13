import {
    EXP,
    AO,
    IO,
    OP_1,
    OP_2,
    SEQ,
    ASTKinds,
    EXP_4,
    Parser,
    ParseResult,
    SEQ_1,
    SEQ_2
} from './parser';

import { BinaryTree } from './BinaryTree';
import { ParsePostfix } from './parsePostfix';

export class UserRegExp {
    public readonly exp_postfix: string[];
    public readonly link_cell_code_text: Map<string, string[]> = new Map();
    public readonly to_binary_tree: BinaryTree;
    private readonly _parser: Parser;
    private readonly _tree: ParseResult;
    private readonly _allCellsCodeInScript: number[] = [];
    private readonly _allCellsTextInScript: number[] = [];
    private readonly _cellsScript: number[] = [];
    private _parse_postfix: ParsePostfix;

    constructor(exp: string) {
        this._parser = new Parser(exp);
        this._tree = this._parser.parse();
        this.exp_postfix = this.cleanPostfix(this.postfix());
        this._parse_postfix = new ParsePostfix(this.exp_postfix);
        this.to_binary_tree = this._parse_postfix.postfixToBinaryTree();
    }

    get cellPosition(): Map<number, string> {
        return this._parse_postfix.cell_position;
    }

    get allCellsCodeInScript():Array<number> {
        return this._allCellsCodeInScript;
    }
    get allCellsTextInScript():Array<number> {
        return this._allCellsTextInScript;
    }
    get cellsScript():Array<number> {
        return this._cellsScript;
    }

    private addCellsCodeInScript(cell_code: string) {
        let regex = /([\d]+)/;
        let result = cell_code.match(regex);
        if (result) {
            let val = Number(result[0]);
            if (!this._allCellsCodeInScript.includes(val)) {
                this._allCellsCodeInScript.push(val);
            }
        }
    }

    private addCellsTextInScript(cell_text: string[]) {
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

    private cleanPostfix(postfix: string[]): string[] {
        let clean_postfix = [];
        let cpt = 0;
        for (let i = 0; i < postfix.length; i++) {
            if (postfix[i] !== "SEQ_1" && postfix[i] !== "IO" && postfix[i] !== "AO") {
                let cell = postfix[i].split(" ");
                this._cellsScript.push(parseInt(cell[0].slice(1,)));
                this.addCellsCodeInScript(cell[0]);
                this.addCellsTextInScript(cell.slice(1));
                if (cell.length > 1) {
                    if(!this.link_cell_code_text.has(cell[0])){
                        this.link_cell_code_text.set(cell[0], ["+", ...cell.slice(1)]);
                    }
                    else{
                        let text = this.link_cell_code_text.get(cell[0]);
                        text?.push("+")
                        cell.slice(1).forEach(c => {
                            text?.push(c);
                        });
                        if(text != undefined){
                            this.link_cell_code_text.set(cell[0], text);
                        }
                    }
                }
                clean_postfix.push(cell[0]);
            } else if (postfix[i] === "SEQ_1") {
                cpt++;
            } else if (postfix[i] === "IO" || postfix[i] === "AO") {
                clean_postfix.push(postfix[i]);
                clean_postfix.push((cpt+1).toString());
                cpt = 0;
            }
        }
        return  clean_postfix;
    }

    public syntaxChecker(exp: string): string {
        let pile: string[] = [];

        for (let i = 0; i < exp.length; i++) {
            if (exp[i] === "(" || exp[i] === "[") {
                pile.push(exp[i]);
            } else if(exp[i] === ")") {
                if (pile.length !== 0) {
                    if (pile.pop() !== '(') {
                        return `missing ( associated with the position ${i}`;
                    }
                } else {
                    return `missing ( associated with the position ${i}`;
                }
            } else if(exp[i] === "]") {
                if (pile.length != 0) {
                    if (pile.pop() !== '[') {
                        return `missing [ associated with the position ${i}`;
                    }
                } else {
                    return `missing [ associated with the position ${i}`;
                }
            }
        }

        if (pile.length != 0) {
            return `${pile.pop()} is not closed`;
        } else {
            return "1";
        }
    }

    public postfix(object: ParseResult | EXP | SEQ = this._tree): string[] {
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
            return [...content, ASTKinds.OP_1];
        }

        if (UserRegExp.isOP2(object)) {
            const content = this.postfix(object.content);
            return [...content, ASTKinds.OP_2];
        }

        if (UserRegExp.isEXP4(object)) {
            return [object.cell];
        }

        if (UserRegExp.isSEQ1(object)) {
            const left = this.postfix(object.left);
            const right = this.postfix(object.right);
            return [...left, ...right,ASTKinds.SEQ_1];
        }

        if (UserRegExp.isIO(object)) {
            const content = this.postfix(object.content);
            return [...content, ASTKinds.IO];
        }

        if (UserRegExp.isAO(object)) {
            const content = this.postfix(object.content);
            return [...content, ASTKinds.AO];
        }

        return [];
    }

    private static isParseResult(object: any): object is ParseResult {
        return (object as ParseResult).errs !== undefined && (object as ParseResult).ast !== undefined;
    }

    private static isEXP4(object: any): object is EXP_4 {
        return (object as EXP_4).kind === ASTKinds.EXP_4 && (object as EXP_4).cell !== undefined;
    }

    private static isIO(object: any): object is IO {
        return (object as IO).kind === ASTKinds.IO && (object as IO).content !== undefined;
    }

    private static isAO(object: any): object is AO {
        return (object as AO).kind === ASTKinds.AO && (object as AO).content !== undefined;
    }

    private static isOP1(object: any): object is OP_1 {
        return (object as OP_1).kind === ASTKinds.OP_1 && (object as OP_1).content !== undefined;
    }

    private static isOP2(object: any): object is OP_2 {
        return (object as OP_2).kind === ASTKinds.OP_2 && (object as OP_2).content !== undefined;
    }



    private static isSEQ1(object: any): object is SEQ_1 {
        return (
            (object as SEQ_1).kind === ASTKinds.SEQ_1 &&
            (object as SEQ_1).left !== undefined &&
            (object as SEQ_1).right !== undefined
        );
    }

    private static isSEQ2(object: any): object is SEQ_2 {
        return (object as SEQ_2).kind === ASTKinds.SEQ_2 && (object as SEQ_2).content !== undefined;
    }
}
