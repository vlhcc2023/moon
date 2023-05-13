import { IDisposable, DisposableDelegate } from '@lumino/disposable';
import { ToolbarButton } from '@jupyterlab/apputils';
import { DocumentRegistry } from '@jupyterlab/docregistry';
import { jupyterIcon, undoIcon } from '@jupyterlab/ui-components';
import {
    NotebookActions,
    NotebookPanel,
    INotebookModel,
  } from '@jupyterlab/notebook';
import MonitorFrontEnd from './monitorFrontEnd';

export default class ButtonMoon
  implements DocumentRegistry.IWidgetExtension<NotebookPanel, INotebookModel>
{
  /**
   * Create a new extension for the notebook panel widget.
   *
   * @param panel Notebook panel
   * @param context Notebook context
   * @returns Disposable on the added button
   */

  private _front: MonitorFrontEnd;

  constructor(front: MonitorFrontEnd){
    this._front = front;
  }

  createNew(
    panel: NotebookPanel,
    context: DocumentRegistry.IContext<INotebookModel>
  ): IDisposable {
    const undo = () => {
      this._front.previousStates();
    };

    const undo_button = new ToolbarButton({
      className: 'undo-moon',
      onClick: undo,
      icon: undoIcon,
      tooltip: 'Undo Moon',
    });

    const moon_button = new ToolbarButton({
        className: 'moon',
        label: 'Moon : ',
        tooltip: 'Moon extension buttons',
      });

    panel.toolbar.insertItem(10, 'moon', moon_button);
    panel.toolbar.insertItem(11, 'undo_moon', undo_button);
    
    return new DisposableDelegate(() => {
      moon_button.dispose();
      undo_button.dispose();
    });
  }
}