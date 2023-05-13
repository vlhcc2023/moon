import { Cell } from '@jupyterlab/cells';
import { NotebookActions, INotebookTracker, Notebook} from '@jupyterlab/notebook';
//import { ServiceManager } from '@jupyterlab/services';
import { JupyterFrontEnd } from '@jupyterlab/application';

import { DFA } from './DFA';
import UserPath from './userPath';

type MoonCell = Cell & {
    moonId?: number;
    moonText?: number;
};

const LIGHT_GREY = '#eeebeb';
const LIGHT_ORANGE = 'rgb(255, 160, 0)';
const LIGHT_GREEN = 'rgb(226, 247, 199)';
const GREEN = 'rgb(190, 233, 135)';
const LIGHT_RED = 'rgb(244, 147, 147)';
const WHITE = 'rgb(255,255,255)';
const width_prompt = '100px';

export default class MonitorFrontEnd {
    private _app: JupyterFrontEnd;
    private _script: DFA|null = null;
    private _tracker: INotebookTracker;
    private _scenario: string|undefined = undefined;
    private _userCellExecuted: number[] = [];
    private _scenarioCellExecuted : number[] = [];
    private _userPath: UserPath | undefined;
    private _fullUserTrackCell: string[] = [];
    private _fullUserTrackDate: string[] = [];
    private _linkCellTextCode: Map<string, string[]> = new Map();
    private _backtrack = false;
    private _controlGroup = true;
    private _numberLastCellExecuted = -1;

    private _btn: HTMLButtonElement[] = [];
    private _paragraph = document.createElement("p");

    constructor(app: JupyterFrontEnd, tracker: INotebookTracker) {
        this._app = app;
        this._tracker = tracker;
        NotebookActions.executed.connect(this.executed);
        this._tracker.activeCellChanged.connect(this.focused);
    }

    public displayNumberCellForScript() {
        if (this._tracker.currentWidget?.content) {
            const numberOfCells = this._tracker.currentWidget.content.widgets.length;
            this.modifyPrompt(width_prompt);

            for (let i = 0; i < numberOfCells; i++) {
                const cell: MoonCell = this._tracker.currentWidget.content.widgets[i];
                if (cell.model.type === 'code') {
                    this.updatePromptCellContent(cell, 'NONE', `C${i}`);
                } else {
                    this.updatePromptCellContent(cell, 'NONE', `T${i}`);
                }
            }
        }
    }

    public initScenario(script: string|undefined): void {
        this._controlGroup = false;
        if (script) {
            this._scenario = script;
            this._script = new DFA(this._scenario);
            this.displayNumberCellForScript();
            this.detectMoonCell();
            this.lockScriptCells(false);
            this._linkCellTextCode = this._script.linkCellCodeAndText;
            this.modifyPrompt(width_prompt);
            this._userCellExecuted = [];
            this._scenarioCellExecuted = [];
            this._userPath = new UserPath();
            this._fullUserTrackCell.push("r");
            this._fullUserTrackDate.push("s");
            this.refresh();
        }
    }

    public initControlScenario(script: string|undefined): void{
        this._controlGroup = true;
        if (script) {
            this._scenario = script;
            this._script = new DFA(this._scenario);
            this.detectMoonCell();
            this._fullUserTrackCell.push("rc")
            this._fullUserTrackDate.push("sc");
        }
    }

    private testMetadata(maxi: number){
        this._fullUserTrackCell = []
        for(let i=0; i < maxi; i++){
            this._fullUserTrackCell.push(`C${i} `)
        }
        this._tracker.currentWidget?.model?.metadata.set('full-user-track-cell', this._fullUserTrackCell.join(" "));
    }

    private detectMoonCell() {
        if (this._tracker.currentWidget?.content) {
            const numberOfCells = this._tracker.currentWidget.content.widgets.length;
            for (let i = 0; i < numberOfCells; i++) {
                const cell: MoonCell = this._tracker.currentWidget.content.widgets[i];
                cell.moonId = undefined;
                cell.moonText = undefined;
                if(cell.model.type === 'code' && this._script?.allCellsCodeInScript.includes(i)) {
                    cell.moonId = i;
                }
                if(cell.model.type === 'markdown' && this._script?.allCellsTextInScript.includes(i)) {
                    cell.moonText = i;
                }    
            }
        }
    }

    public lockScriptCells(lock: boolean): void{
        console.log(`lock script cells: ${lock}`)
        if (this._tracker.currentWidget?.content) {
            const numberOfCells = this._tracker.currentWidget.content.widgets.length;
            for (let i = 0; i < numberOfCells; i++) {
                const cell: MoonCell = this._tracker.currentWidget.content.widgets[i];
                //if(cell.moonId != undefined || cell.moonText != undefined){   
                    console.log(`lock script cells: ${lock}`)
                    cell.model.metadata.set("deletable", !lock);
                 //}
            }
        }
    }


    private inlightTextCell(textCell: string[]|undefined, nextCells: number[]): void{
        if (this._tracker.currentWidget?.content.activeCell) {
            const numberOfCells = this._tracker.currentWidget.content.widgets.length;
            for (let i = 0; i < numberOfCells; i++) {
                let cell :MoonCell = this._tracker.currentWidget?.content.widgets[i];
                if (cell?.model.type === 'markdown') {
                    let target = cell.node.querySelector('div.jp-RenderedHTMLCommon')
                    this.updatePromptCellContent(cell, 'NONE', `T${i}`);
                    if(target && target instanceof HTMLElement){
                        target.style.border = 'none';
                    }
                    nextCells?.forEach(idCell =>{
                        if(this._linkCellTextCode.get(`C${idCell}`)?.includes(`T${cell.moonText}`)){
                            
                            let text = this._linkCellTextCode.get(`C${idCell}`);
                            const sep = text?.map((c: string, i:number) => c === "+" ? i : -1).filter(index => index !== -1);
                            let countExecutedCell = 0+this._scenarioCellExecuted.filter(c => c===idCell).length;
                            if(text !== undefined && sep !== undefined){ 
                                textCell = text.slice(sep[countExecutedCell]+1, sep[countExecutedCell+1]);
                                if(textCell.includes(`T${cell.moonText}`) && target && target instanceof HTMLElement){
                                    target.style.border = `solid ${GREEN}`;
                                }
                            }
                        }
                    });
                }
            }
            
        }
    }

    private modifyPrompt(width: string): void {
        let r: any = document.querySelector(':root');
        if (r) {
            r.style.setProperty('--jp-cell-prompt-width', width);
        }
    }

    private getNextCellNumber(): number[]{
        const nextCells = this._script?.automaton.nextPossibleEvents()?.map(transition => {
            let regex = /execute C(?<number>\d+)/;
            const labelRegex = transition.label.match(regex);
            return parseInt(labelRegex ? labelRegex[1] : '-1', 10);
        });

        return [...new Set(nextCells)];
    }

    public async runAllScript(){
        const timer = (ms: number | undefined) => new Promise(res => setTimeout(res, ms))
        let code_cells = this._script?.getCellsScript
        console.log(this._script?.getCellsScript);
        let notebook = this._tracker.currentWidget?.content;
        return new Promise(async (resolve, reject) => {
            if(notebook && code_cells){
                try{
                    for(let i = 0; i < code_cells.length; i++){
                        console.log(code_cells[i]);
                        notebook.activeCellIndex = code_cells[i];
                        await timer(1000);
                        await this._app.commands.execute('notebook:run-cell');
                        //await NotebookActions.run(notebook);
                    }
                    
                } catch(error){
                    console.log("error")
                    reject(error);
                } 
            }
        }); 
    }

    public refresh(): void {
        console.log("user cell executed: ", this._userCellExecuted);
        let nextCells = this.getNextCellNumber();
        let textCell: string[] = [];

        if (this._tracker.currentWidget?.content.activeCell) {
            const numberOfCells = this._tracker.currentWidget.content.widgets.length;

            for (let i = 0; i < numberOfCells; i++) {
                let cell: MoonCell = this._tracker.currentWidget.content.widgets[i];
                if (cell.model.type === 'code' && cell.moonId !== undefined) {
                    if (this._userCellExecuted.includes(cell.moonId) && 
                        //this._userCellExecuted.indexOf(cell.moonId) <= this._userCellExecuted.lastIndexOf(this._numberLastCellExecuted) &&
                        cell.promptNode.style.background !== LIGHT_RED){
                        this.updatePromptCellContent(cell, 'DONE', `C${i}`);
                    } else {
                        this.updatePromptCellContent(cell, 'NO', `C${i}`);
                    }
                    
                    if (nextCells.includes(cell.moonId)) {
                        if (cell.promptNode.style.background === LIGHT_GREEN && this._userCellExecuted.includes(cell.moonId)) {
                            this.updatePromptCellContent(cell, 'DONE', `C${i}`);
                        } else {
                            this.updatePromptCellContent(cell, 'YES', `C${i}`);
                        }
                    }
                }
            }

            this.inlightTextCell(textCell, nextCells);
        }
    }

    private focused = (_: unknown, cell: Cell|null): void => {
        if(!this._controlGroup){
            if (this._scenario) {
                this.refresh();
            } else {
                this.displayNumberCellForScript();
            }
        }
    };

    private executed = (_: unknown, event: { notebook: Notebook, cell: Cell }): void => {

        let cell: MoonCell = event.cell;
        if(cell.moonId !== undefined) {
            this._numberLastCellExecuted = cell.moonId;
            if(this.getNextCellNumber().includes(cell.moonId)){
                let transition = `execute C${cell.moonId}`;
                let current_state = this._script?.automaton.getCurrentStates;
                this._userPath?.addState(cell.moonId, current_state);
                this._script?.automaton.fire(transition);
                this._scenarioCellExecuted.push(cell.moonId);
                this._userCellExecuted.push(cell.moonId);
                if(!this._controlGroup){
                    this.refresh();
                }
            }
            else{
                if(this._backtrack === true){
                    this.updateStatesWithAutomaticBacktraking(cell);
                }
            }
            this._fullUserTrackCell.push(`C${cell.moonId}`);
            
            this._fullUserTrackDate.push(this.getDateExecute());
            this._tracker.currentWidget?.model?.metadata.set('full-user-track-cell', this._fullUserTrackCell.join(" "));
            this._tracker.currentWidget?.model?.metadata.set('full-user-track-date', this._fullUserTrackDate.join(" "));          
        }
        this._app.commands.execute('docmanager:save');
        this.addScrollTo(cell);
    };

    private addScrollTo(cell: Cell){
        this._paragraph.textContent = "";
        for(let i = 0; i < this._btn.length; i++){
            this._btn[i].remove();
        }
        this._btn = [];
        let rootElement = cell.parent?.node;
        //console.log(`cell height : ${cell.node.clientHeight}`);
        //console.log(`offset top : ${cell.node.offsetTop}`);
        for(let i = 0; i < this.getNextCellNumber().length; i++){
            this._btn.push(document.createElement("button"));
        }
        this._btn.forEach(btn => {
            btn.onclick = ()=>{
                let next_position = this.getPixelPositionNextCell(this.getNextCellNumber()[this._btn.indexOf(btn)]);
                rootElement?.scrollTo({
                    top: next_position,
                    behavior: "smooth"
                });   
            };
            btn.innerHTML = `C${this.getNextCellNumber()[this._btn.indexOf(btn)]}`;
            this._paragraph.append(btn)
            //cell.node.appendChild();
            
        });
        //let next_position = this.getPixelPositionNextCell(this.getNextCellNumber()[0]);
        //console.log(`next position : ${next_position}`);
        cell.node.appendChild(this._paragraph);
    }

    private getPixelPositionNextCell(id: number): number{
        if (this._tracker.currentWidget?.content.activeCell) {
            const numberOfCells = this._tracker.currentWidget.content.widgets.length;
            for (let i = 0; i < numberOfCells; i++) {
                let cell :MoonCell = this._tracker.currentWidget?.content.widgets[i];
                if(cell.moonId === id){
                    return cell.node.offsetTop;
                }
            }
        }
        return 0;
    }

    public automaticBacktracking(backtrack: boolean): void{
        this._backtrack = backtrack;
    }

    private updateStatesWithAutomaticBacktraking(cell: MoonCell): void{
        let end = this._scenarioCellExecuted.length - 1;
        if(cell.moonId !== undefined && this._scenarioCellExecuted.includes(cell.moonId)){
            while(end > 0 && this._scenarioCellExecuted[end] !== cell.moonId){
                this.previousStates();
                end--;
            }
        }
    }

    public previousStates():void{
        let previousState = this._userPath?.getPreviousState?.cellMoonState;
        if(previousState != undefined){
            this._script?.automaton.setCurrentStates(previousState);
            this._scenarioCellExecuted.pop();
            this.refresh();
            this._fullUserTrackCell.push("undo")
        }
    }

    private getDateExecute(): string{
        let d = new Date();
        let h = d.getHours();
        let m = d.getMinutes();
        let s = d.getSeconds();
        return `${h}:${m}:${s} `
    }

    public updateScriptWithCurrentNotebook(): string | undefined{
        let regex = /\s+/;
        let script = this._scenario?.split(regex).slice(1, -1);
        //console.log(`script avant: ${this._scenario}`);
        let newScript = this._scenario?.split(regex).slice(1, -1);
        if (script && newScript && this._tracker.currentWidget?.content) {
            const numberOfCells = this._tracker.currentWidget.content.widgets.length;
            for (let i = 0; i < numberOfCells; i++) {
                const cell: MoonCell = this._tracker.currentWidget.content.widgets[i];
                if(cell.moonId !== undefined || cell.moonText != undefined){
                    for(let j = 0; j < script?.length; j++){
                        
                        if(script[j].includes(`C${cell.moonId}`)){
                            newScript[j] = script[j].replace(`${cell.moonId}`, `${i}`);
                        }
                        if(script[j].includes(`T${cell.moonText}`)){
                            newScript[j] = script[j].replace(`${cell.moonText}`, `${i}`);
                        }
                    }
                }
            }
        }
        //console.log(`script après : ${newScript?.join(" ")}`)
        return newScript?.join(" ");
    }

    private updatePromptCellContent(cell: Cell, action: 'DONE' | 'YES' | 'NO' | 'NONE' | 'TEXT', cell_number: string): void {
        const endPrompt = cell.promptNode.innerText.match(/\[(\d+|\s)\]:/);
        let background = '';
        let emoji = '';

        switch (action) {
            case 'DONE':
                background = LIGHT_ORANGE;
                emoji = '✔️';
                break;
            case 'YES':
                background = LIGHT_GREEN;
                emoji = '▶️';
                break;
            case 'NONE':
                background = WHITE;
                break;
            case 'TEXT':
                background = LIGHT_GREY;
                break;
            case 'NO':
            default:
                background = LIGHT_RED;
                emoji = '❌';
                break;
        }

        cell.promptNode.style.background = background;
        if (endPrompt && endPrompt[0]) {
            cell.promptNode.innerHTML = `${emoji} ${cell_number} ${endPrompt[0]}`;
        } else {
            cell.promptNode.innerHTML = `${emoji} ${cell_number}`;
        }
    }
}
