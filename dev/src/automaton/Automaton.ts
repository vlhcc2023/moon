import { State } from './State';
import { Transition } from './Transition';

export class Automaton {
    private readonly _initialState: State;
    private _currentStates: State[]|undefined;
    private readonly _states: Set<State>;
    private readonly _finalStates: State[];
    

    constructor() {
        this._states = new Set<State>();
        this._finalStates = [];
        this._initialState = this.createState();
        this._currentStates = [this._initialState];
    }

    public createState(): State {
        const state = new State();
        this._states.add(state);
        return state;
    }

    public createTransition(from: State, to: State, label: string): Transition {
        const transition = new Transition(from, to, label);
        from.fromTransitions.push(transition);
        return transition;
    }

    setCurrentStates(currentStates: State[]|undefined){
        this._currentStates = currentStates;
    }

    get getCurrentStates(): State[]|undefined{
        if(this._currentStates){
            return this._currentStates;
        }
    }

    public addFinalState(state: State): void {
        this._finalStates.push(state);
    }

    public fire(event: string): void {
        if (event.startsWith('execute')) {
            const nextStates = this._currentStates?.reduce<State[]>((states, state) => {
                const correspondingTransitions = state.fromTransitions.filter(transition => transition.label == event);
                return [...states, ...correspondingTransitions.map(transition => transition.to)];
        }, []);
            if (nextStates?.length) {
                this._currentStates = nextStates;
            }
        }
    }

    public nextPossibleEvents(): Transition[]|undefined {
        if(this._currentStates){
            return this._currentStates.reduce<Transition[]>((states, state) => {
                return [...states, ...state.fromTransitions];
            }, []);
        }
    }

    get startState(): State {
        return this._initialState;
    }
}
