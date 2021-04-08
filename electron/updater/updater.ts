const { autoUpdater } = require('electron-updater');
import { win } from '../../main';
import { ipcMain } from 'electron';

//configure log debugging
// autoUpdater.logger = require('electron-log')
// autoUpdater.logger.transports.file.level = "info";

//disable autodownloading of updates
autoUpdater.autodownload = false;

export const checkForUpdates = () => {

    ipcMain.handle('download-accept', event => {

        autoUpdater.downloadUpdate();

        return Promise.resolve("Update downloading...")
    
    });

    ipcMain.handle('install-accept', event => {

        //the first argument of quitAndInstall is whether to show
        // the installer window while updating; the second
        // argument is whether to restart the app after the installation
        // has finished
        autoUpdater.quitAndInstall(false, true);

        return Promise.resolve("Update installing...")
    
    });

    //listen for update found
    autoUpdater.on('update-available', () => {
        //prompt user to start download
        win.webContents.send('update-found');
        
    });

    //listen for update download finished
    autoUpdater.on('update-downloaded', () => {

        win.webContents.send('update-downloaded');
        
    });

    //check for new update on Github releases
    autoUpdater.checkForUpdates();

};