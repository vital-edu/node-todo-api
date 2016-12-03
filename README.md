<!-- vscode-markdown-toc -->
1. [Dependencies](#Dependencies)
2. [Install](#Install)
3. [Running Application](#RunningApplication)
4. [Testing](#Testing)
<!-- /vscode-markdown-toc -->

# Node Todo Api

Simple API made with [Node.js](http://nodejs.org) and [Express.js](http://expressjs.com/).

##  1. <a name='Dependencies'></a>Dependencies

- Node v6.9.1 (recommend use [nvm](https://github.com/creationix/nvm#install-script))

##  2. <a name='Install'></a>Install

To install all node dependencies, execute the command:

```
$ npm install
```

##  3. <a name='RunningApplication'></a>Running Application

The application provides a simple API that manages a TODO list.

To use the application, execute the command:

```
$ npm start
```

If you prefer that the server restarts automatically when changes happens, execute the command:

```
$ npm run autostart
```

After the server start, access the site at http://localhost:3000/

##  4. <a name='Testing'></a>Testing

To run the tests just once, execute the command:

```
$ npm test
```

If you prefer that the tests run automatically when changes happens, execute the command:

```
$ npm run test-watch
```