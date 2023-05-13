import { State } from './State';

export class Transition {
    constructor(public from: State, public to: State, public label: string) {}
}
