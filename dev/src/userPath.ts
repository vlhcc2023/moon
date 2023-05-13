import { State } from './automaton/State';

class Step {
    constructor(
    public cellMoonId: number,
    public cellMoonState: State[] | undefined
    ){}
}

export default class UserPath{

    private path: Step[];

    constructor(){
        this.path = [];
    }

    public addState(id: number, state: State[]|undefined){
        let step = new Step(id, state)
        this.path.push(step);
    }

    get getPreviousState(): Step|undefined{
        return this.path.pop();
    }
}