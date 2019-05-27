const electron = require('electron');
const url = require('url');
const path = require('path');

const {app, BrowserWindow, Menu, ipcMain} = electron;

//Set Env
process.env.NODE_ENV = 'production';

let mainWindow;
let addWindow;

app.setName('ShoppingList');

// Listen for app ready
app.on('ready', () => {
    //Create new Window
    mainWindow = new BrowserWindow({
      webPreferences: {
        nodeIntegration: true
      }
    });
    //Load HTML into window
    mainWindow.loadURL(url.format({
      pathname: path.join(__dirname, 'mainWindow.html'),
      protocol: 'file:',
      slashes: true
    }));

    //Quit App when closed
    mainWindow.on('closed', () => {
      app.quit();
    });
    // Build Menu from Template
    const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
    Menu.setApplicationMenu(mainMenu);
});

//Handle create add window
function createAddWindow() {
    addWindow = new BrowserWindow({
      width: 300,
      height: 200,
      title: 'Add Shopping List Item',
      webPreferences: {
        nodeIntegration: true
      }
    });
    // Load html into window
    addWindow.loadURL(url.format({
      pathname: path.join(__dirname, 'addWindow.html'),
      protocol: 'file:',
      slashes: true
    }));
    // Garbage Collection
    addWindow.on('closed', () => {
      addWindow = null;
    })
}

// Catch item add
ipcMain.on('item:add', (e,item) => {
  mainWindow.webContents.send('item:add', item);
  addWindow.close();
})

// Create Menu Template
const mainMenuTemplate = [
  {
    label: 'File',
    submenu: [
      {
        label: 'Add Item',
        click() {
          createAddWindow();
        }
      },
      {
        label: 'Clear Items',
        click() {
          mainWindow.webContents.send('item:clear');
        }
      },
      {
        label: 'Quit',
        accelerator: process.platform == 'darwin' ? 'Command+Q' : 'Control+Q',
        click() {
          app.quit();
        }
      }
    ]
  }
];

// If Darwin add empty object to menu
if (process.platform == 'darwin') {
  mainMenuTemplate.unshift({
    label: 'ShoppingList'
  });
}

if (process.env.NODE_ENV !== 'production') {
  mainMenuTemplate.push({
    label: 'Developer Tools',
    submenu: [
      {
        label: 'Toggle Dev Tools',
        accelerator: process.platform == 'darwin' ? 'Command+I' : 'Control+I',
        click(item, focusedWindow) {
          focusedWindow.toggleDevTools();
        }
      },
      {
        role: 'reload'
      }
    ]
  });
}
