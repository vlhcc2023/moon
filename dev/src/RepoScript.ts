import { InputDialog, showDialog, Dialog } from '@jupyterlab/apputils';
import { INotebookTracker } from '@jupyterlab/notebook';

export default class RepoScript {
    private _tracker : INotebookTracker
    private _currentScript: string|undefined;

    constructor(tracker: INotebookTracker) {
        this._tracker = tracker;
        this.runScriptSavedInNotebook();
        this._tracker.currentChanged.connect(this.runScriptSavedInNotebook);
    }

    public getScript(): string|undefined {
        return this._currentScript ? `( ${this._currentScript} )` : undefined;
    }

    public editScript(): void {
        this.displayInputDialog().then(value => {
            if (value) {
                this._tracker.currentWidget?.model?.metadata.set('moon-script', value);
                this._currentScript = value;
            }
        });
    }

    public saveScript(script: string): void {
        this._tracker.currentWidget?.model?.metadata.set('moon-script', script);
        this._currentScript = script;
    }

    public displayCurrentScript(): void {
        const currentScript = this._currentScript ? this._currentScript : 'There is no script.';

        showDialog({
            body: currentScript,
            buttons: [Dialog.okButton()],
        }).then();
    }

    private runScriptSavedInNotebook = (): void => {
        setTimeout(() => {
            this._currentScript = this._tracker.currentWidget?.model?.metadata.get('moon-script')?.toString();
            this._tracker.currentWidget?.model?.metadata.set('full-user-track-cell', "");
            this._tracker.currentWidget?.model?.metadata.set('full-user-track-date', "");
        }, 1000);
    }

    private async displayInputDialog(): Promise<string|null> {
        const value = await InputDialog.getText({
            title: `Input your script : `,
            text: this._currentScript,
            placeholder: 'Your script',
        });

        return value.value;
    }
}
