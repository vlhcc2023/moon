import { JupyterFrontEnd, JupyterFrontEndPlugin } from '@jupyterlab/application';
import { ISettingRegistry } from '@jupyterlab/settingregistry';
import { ICommandPalette} from '@jupyterlab/apputils';
import { INotebookTracker } from '@jupyterlab/notebook';

import ButtonMoon from './ButtonMoon';
import MonitorFrontEnd from './monitorFrontEnd';
import RepoScript from './RepoScript';

namespace CommandIDs {
    export const menu_start = 'start';
    //export const menu_start_control = 'startControl';
    export const menu_script = 'edit_script';
    export const menu_show_number_cells = 'show_number_cells';
    export const menu_update_script = 'update_script';
    export const menu_lock = 'lock';
    export const menu_unlock = 'unlock';
    export const menu_run_all = 'run_all';
    export const menu_run_above = 'run_above';
    export const menu_backtracking = 'backtracking';
    export const menu_undo = 'undo';
}

const PLUGIN_ID = '@MOON/settings:main_menu_moon';

/**
 * Initialization data for the MOON extension.
 */
const moon_extension: JupyterFrontEndPlugin<void> = {
    id: PLUGIN_ID,
    autoStart: true,
    requires: [ICommandPalette, INotebookTracker, ISettingRegistry],
    activate: (app: JupyterFrontEnd, palette: ICommandPalette, tracker: INotebookTracker) => {
        //const manager = app.serviceManager;
        const { commands } = app;

        let flag_backtracking = false;
        let flag_lock = true;
        let front = new MonitorFrontEnd(app, tracker);
        app.docRegistry.addWidgetExtension('Notebook', new ButtonMoon(front));
        const repoScript = new RepoScript(tracker);

        console.log('MOON is activated my coconut !');

        commands.addCommand(CommandIDs.menu_start, {
            label: 'Start script',
            caption: 'Start',
            execute: () => {
                const currentScript = repoScript.getScript();
                if (currentScript) {
                    console.log(`MOON script : ${currentScript}`);
                    front.initScenario(currentScript);
                }
            }
        });

        /* commands.addCommand(CommandIDs.menu_start_control, {
            label: 'Start Without Script',
            caption: 'Start Control',
            execute: () => {
                const currentScript = repoScript.getScript();
                if (currentScript) {
                    console.log(`MOON control`);
                    front.initControlScenario(currentScript);
                }
            }
        }); */

        commands.addCommand(CommandIDs.menu_script, {
            label: 'Edit script',
            caption: 'Edit',
            execute: () => {
                repoScript.editScript();
            }
        });

        commands.addCommand(CommandIDs.menu_show_number_cells, {
            label: 'Show Number Cells',
            caption: 'Current',
            execute: () => {
                front.displayNumberCellForScript();
            }
        });

        commands.addCommand(CommandIDs.menu_update_script, {
            label: 'Update script',
            caption: 'Update',
            execute: () => {
                let script = front.updateScriptWithCurrentNotebook();
                if(script){
                    repoScript.saveScript(script);
                    app.commands.execute('docmanager:save');
                }
            }
        });

        commands.addCommand(CommandIDs.menu_lock, {
            label: "Lock Script's Cells",
            caption: 'lock',
            isToggled:() => flag_lock,
            execute: () => {
                if (flag_lock === false){
                    front.lockScriptCells(true);
                }
                flag_lock = !flag_lock;
            }
        });

        commands.addCommand(CommandIDs.menu_unlock, {
            label: "Unlock Script's Cells",
            caption: 'unlock',
            isToggled:() => !flag_lock,
            execute: () => {
                if (flag_lock === true){
                    front.lockScriptCells(false);
                }
                flag_lock = !flag_lock;
            }
        });

        commands.addCommand(CommandIDs.menu_run_all, {
            label: 'Run All Script',
            caption: 'Run All',
            execute: () => {
               front.runAllScript();
            }
        });

        commands.addCommand(CommandIDs.menu_run_above, {
            label: 'Run Above Selected Cell',
            caption: 'Run Above',
            execute: () => {
                let script = front.updateScriptWithCurrentNotebook();
                if(script){
                }
            }
        });

        commands.addCommand(CommandIDs.menu_backtracking, {
            label: 'Automatic Backtracking',
            caption: 'backtracking',
            isToggled:() => flag_backtracking,
            execute: () => {
                (flag_backtracking === false) ? 
                front.automaticBacktracking(true) : 
                front.automaticBacktracking(false);
                flag_backtracking = !flag_backtracking;
            }
        });

        commands.addCommand(CommandIDs.menu_undo, {
            label: 'Undo (Ctrl+Z)',
            caption: 'State',
            execute: () => {
                front.previousStates();
            }
        });
    }
};

export default moon_extension;
