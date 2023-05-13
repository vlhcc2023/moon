import { Automaton } from './automaton/Automaton';
import { BinaryTree } from './tsPeg/BinaryTree';
import { UserRegExp } from './tsPeg/UserRegExp';
import { State } from './automaton/State';

export class DFA {
    public readonly automaton: Automaton;

    private readonly _all_follow_pos: Map<number, Set<number>>;
    private readonly _exp: UserRegExp;
    private readonly _root: Set<number>;
    private readonly _start_state: State;
    private readonly _tree: BinaryTree;

    private _states: State[];

    constructor(user_script: string) {
        //regular expression tree
        this._exp = new UserRegExp(user_script);
        this._tree = this._exp.to_binary_tree;
        this._all_follow_pos = this._tree.followPos();

        //AFD
        this._root = this._tree.firstPosition;
        this.automaton = new Automaton();
        this._start_state = this.automaton.startState;
        this._states = this.createStates();
        this.build();
    }

    private build(): void {
        this._root.forEach(value => {
            const cell = this._exp.cellPosition.get(value);
            this.automaton.createTransition(this._start_state, this._states[value], `execute ${cell}`);
        });
        this._all_follow_pos.forEach((value, key) => {
            value.forEach(next => {
                const cell = this._exp.cellPosition.get(next);
                this.automaton.createTransition(this._states[key], this._states[next], `execute ${cell}`);
            });
        });
    }

    private createStates(): State[] {
        const states: State[] = [];
        states.push(this._start_state);

        this._exp.cellPosition.forEach(() => {
            states.push(this.automaton.createState());
        });
        return states;
    }

    get states(): State[] {
        return this._states;
    }

    get getCellPosition(): Map<number, string>{
        return this._exp.cellPosition;
    }

    get linkCellCodeAndText(): Map <string, string[]>{
        return this._exp.link_cell_code_text;
    }

    get allCellsCodeInScript(): Array<number>{
        return this._exp.allCellsCodeInScript;
    }

    get allCellsTextInScript(): Array<number>{
        return this._exp.allCellsTextInScript;
    }

    get getCellsScript(): Array<number>{
        return this._exp.cellsScript;
    }
}
