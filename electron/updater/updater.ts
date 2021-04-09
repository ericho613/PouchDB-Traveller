const { autoUpdater } = require('electron-updater');
import { win } from '../../main';
import { ipcMain } from 'electron';

//configure log debugging
// autoUpdater.logger = require('electron-log')
// autoUpdater.logger.transports.file.level = "info";

//disable autodownloading of updates
autoUpdater.autoDownload = false;

ipcMain.handle('download-accept', event => {

    console.log("download accept");

    autoUpdater.downloadUpdate();

    return Promise.resolve("Update downloading...")

});

ipcMain.handle('install-accept', event => {

    console.log("install accept");

    //the first argument of quitAndInstall is whether to show
    // the installer window while updating; the second
    // argument is whether to restart the app after the installation
    // has finished
    autoUpdater.quitAndInstall(false, true);

    return Promise.resolve("Update installing...")

});

//listen for update found
autoUpdater.on('update-available', () => {

    console.log("update available");

    //prompt user to start download
    win.webContents.send('update-found');
    
});

//listen for update download finished
autoUpdater.on('update-downloaded', () => {

    console.log("update downloaded");
    win.webContents.send('update-downloaded');
    
});

//listen for update download finished
autoUpdater.on('download-progress', (progress) => {

    console.log("download progress");
    console.log(progress);
    win.webContents.send('download-progress', progress.total, progress.transferred, progress.percent);
    
});

autoUpdater.on('error', (error) => {

    console.log(error);
    
});

export const checkForUpdates = () => {

    //check for new update on Github releases
    autoUpdater.checkForUpdates();

    console.log("autoUpdate check")

};