'use strict';
const db = require("./db.js");
const env = require("./env.js");
const electron = require('electron');
const app = electron.app;  // Module to control application life.
const BrowserWindow = electron.BrowserWindow;  // Module to create native browser window.

db.connect(env.db_path);
const ipcMain = require('electron').ipcMain;
ipcMain.on('ping', function(event, arg) {
  console.log('ping',event,arg); // prints "pong"
});
// Object {data: Array[10], pageNO: 8, total: 80}
// data: Array[10]
// 0: Object
// detailURL: "http://www.alibaba.com/product-detail/modern-simple-dining-chair_1681572531.html"
// editURL: "http://hz.productposting.alibaba.com/product/edit_product.htm?id=1681572531"
// firstName: "joan"
// gmtModify: "2015-12-10"
// id: 1681572531
// imageURL: "http://i01.i.aliimg.com/photo/v0/1681572531/modern_simple_dining_chair.summ.jpg"
// isDeletedInP4P: false
// isKwSearch: "n"
// isP4PProduct: false
// isShowcase: "n"
// lastName: "zhang"
// noeffDays: 176
// sid: "e3590447335edb936ff408283cf3bbeb94d5c945b56c8595c4bea564f00939f947ca8f447f88edc8"
// subject: "modern simple dining chair"
ipcMain.on('getZeroEffectProducts', function(event, data) {
  console.log('getZeroEffectProducts\n',data);
});
// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

// Quit when all windows are closed.
app.on('window-all-closed', function() {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform != 'darwin') {
    app.quit();
  }
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
app.on('ready', function() {
  // Create the browser window.
  mainWindow = new BrowserWindow({width: 800, height: 600});

  // and load the index.html of the app.
  // mainWindow.loadURL('file://' + __dirname + '/index.html');
  // mainWindow.loadURL('http://ip138.com');
  mainWindow.loadURL('file://'+__dirname+'/browser.html');

  // Open the DevTools.
  // mainWindow.webContents.openDevTools();

  // Emitted when the window is closed.
  mainWindow.on('closed', function() {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });
});
