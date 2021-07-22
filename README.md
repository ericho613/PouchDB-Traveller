[![Angular Logo](https://www.vectorlogo.zone/logos/angular/angular-icon.svg)](https://angular.io/) [![Electron Logo](https://www.vectorlogo.zone/logos/electronjs/electronjs-icon.svg)](https://electronjs.org/) [![PouchDB Logo](https://dbdb.io/media/logos/pouchdb.png)](https://pouchdb.com/)

## Introducing PouchDB Traveller

PouchDB Traveller is a GUI client for PouchDB, an open-source NoSQL database.

PouchDB Traveller features convenient means to perform the following:
- View documents
- Edit documents
- Delete documents
- Filter search
- Apply cryptography (AES-256-GCM-SHA512 specification)
- Create indexes
- Delete indexes
- Etc…

PouchDB Traveller was created with the 'pouchdb-node' package which uses LevelDB to store data files to disk.

Currently runs with:

- Angular v11.2.0
- Electron v11.2.3
- Electron Builder v22.9.1
- PouchDb v7.2.2

PouchDB Traveller icon made by Freepik from www.flaticon.com

The 'angular-electron' bootstrap template (https://github.com/maximegris/angular-electron) by maximegris was used as the starting code for this project.

## Getting Started

Clone this repository locally:

``` bash
git clone https://github.com/ericho613/PouchDB-Traveller.git
```

Install dependencies with npm:

``` bash
npm install
```

There is an issue with `yarn` and `node_modules` when the application is built by the packager. Please use `npm` as dependencies manager.


If you want to generate Angular components with Angular-cli , you **MUST** install `@angular/cli` in npm global context.
Please follow [Angular-cli documentation](https://github.com/angular/angular-cli) if you had installed a previous version of `angular-cli`.

``` bash
npm install -g @angular/cli
```

## To build for development

- **in a terminal window** -> npm start

Voila! You can use your Angular + Electron app in a local development environment with hot reload!

The application code is managed by `main.ts`. In this sample, the app runs with a simple Angular App (http://localhost:4200) and an Electron window.
The Angular component contains an example of Electron and NodeJS native lib import.
You can disable "Developer Tools" by commenting `win.webContents.openDevTools();` in `main.ts`.

## Use Electron / NodeJS / 3rd party libraries

This sample project runs in both modes (web and electron). To make this work, **you have to import your dependencies the right way**. Please check `providers/electron.service.ts` to watch how conditional import of libraries has to be done when using electron / NodeJS / 3rd party libraries in renderer context (i.e. Angular).

## Browser mode

Maybe you only want to execute the application in the browser with hot reload? Just run `npm run ng:serve:web`.

## Included Commands

|Command|Description|
|--|--|
|`npm run ng:serve`| Execute the app in the browser |
|`npm run build`| Build the app. Your built files are in the /dist folder. |
|`npm run build:prod`| Build the app with Angular aot. Your built files are in the /dist folder. |
|`npm run electron:local`| Builds your application and start electron
|`npm run electron:build`| Builds your application and creates an app consumable based on your operating system |

**Your application is optimised. Only /dist folder and node dependencies are included in the executable.**

## You want to use a specific lib (like rxjs) in electron main thread ?

YES! You can do it! Just by importing your library in npm dependencies section (not **devDependencies**) with `npm install --save`. It will be loaded by electron during build phase and added to your final package. Then use your library by importing it in `main.ts` file. Quite simple, isn't it?

## E2E Testing

E2E Test scripts can be found in `e2e` folder.

|Command|Description|
|--|--|
|`npm run e2e`| Execute end to end tests |

Note: To make it work behind a proxy, you can add this proxy exception in your terminal  
`export {no_proxy,NO_PROXY}="127.0.0.1,localhost"`

# Building PouchDB Traveller for Production

To build the app for production with environment variables on a Linux OS,
declare all environment variables in the terminal as in the example below, 
then run 'npm run electron:build'.

``` bash
NODE_ENV=production
GH_TOKEN=XXXXXXXXXXXXXXXXXXXXXXXXXX
CSC_KEY_PASSWORD=XXXXXXXXXXXXXXXXXXXXXXXXXX
npm run electron:build
```

*Note that for the Linux shell, you can declare the commands in a single line if you
separate the commands by a space.
``` bash
NODE_ENV=production GH_TOKEN=XXXXXXXXXXXXXXXXXXXXXXXXXX CSC_KEY_PASSWORD=XXXXXXXXXXXXXXXXXXXXXXXXXX npm run electron:build
```

To build the app for production with environment variables using the command 
prompt on the Windows OS, declare all environment variables in the terminal 
as in the example below, then run 'npm run electron:build'.

``` bash
set NODE_ENV=production
set GH_TOKEN=XXXXXXXXXXXXXXXXXXXXXXXXXX
set CSC_KEY_PASSWORD=XXXXXXXXXXXXXXXXXXXXXXXXXX
npm run electron:build
```

*Note that for Windows command prompt, you can declare the commands in a single 
line by using '&&' as a separator, but do not place a space before and after '&&'.
``` bash
set NODE_ENV=production&&set GH_TOKEN=XXXXXXXXXXXXXXXXXXXXXXXXXX&&set CSC_KEY_PASSWORD=XXXXXXXXXXXXXXXXXXXXXXXXXX&&npm run electron:build
```

To build the app for production with environment variables using PowerShell 
(VSCode default) on the Windows OS, declare all environment variables in the 
terminal as in the example below, then run 'npm run electron:build'.

``` bash
$env:NODE_ENV="production"
$env:GH_TOKEN="XXXXXXXXXXXXXXXXXXXXXXXXXX"
$env:CSC_KEY_PASSWORD="XXXXXXXXXXXXXXXXXXXXXXXXXX"
npm run electron:build
```

*Note that for Windows Powershell, you can declare the commands in a single 
line by using ';' as a separator.
``` bash
$env:NODE_ENV="production"; $env:GH_TOKEN=XXXXXXXXXXXXXXXXXXXXXXXXXX; $env:CSC_KEY_PASSWORD=XXXXXXXXXXXXXXXXXXXXXXXXXX; npm run electron:build
```