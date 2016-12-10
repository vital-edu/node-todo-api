<!-- vscode-markdown-toc -->
* 1. [Dependencies](#Dependencies)
* 2. [Managing Dependencies](#ManagingDependencies)
* 3. [Environment Configurations](#EnvironmentConfigurations)
* 4. [Running Application](#RunningApplication)
* 5. [Running Tests](#RunningTests)

<!-- /vscode-markdown-toc -->

# Node Todo Api

Simple API made with [Node.js](http://nodejs.org) and [Express.js](http://expressjs.com/).

##  1. <a name='Dependencies'></a>Dependencies

- Node v6.9.1 (recommend use [nvm](https://github.com/creationix/nvm#install-script))

##  2. <a name='ManagingDependencies'></a>Managing Dependencies

To install all node dependencies, execute the command:

```
$ npm install
```


##  3. <a name='EnvironmentConfigurations'></a>Environment Configurations

The environment configurations are managed by the file server/config.json.

The file is not tracked by the git because contains sensitive informations. There is a template named server/config.json.template that can be used. Remember that it is highly recommend that the JWT_SECRET is randomly used and diferent in each environment.

You can generate the secret the way you want or simple execute the script that uses the package crypto-extra to generate a random string of length 64:

```
$ npm run generate:secret
```

##  4. <a name='RunningApplication'></a>Running Application

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

The APP has the following routes:

| Method | Route           | Description                            |
|--------|-----------------|----------------------------------------|
| POST   | /users          | Register an user and return auth token |
| POST   | /users/login    | Login                                  |
| GET    | /users/me       | Get information about logged user      |
| DELETE | /users/me/token | Logout                                 |
| GET    | /todos          | Get all the tasks of the logged user   |
| GET    | /todos/:id      | Get a specific task of the logged user |
| POST   | /todos          | Create a task by logged user           |
| PATCH  | /todos/:id      | Update task of logged user             |

##  5. <a name='RunningTests'></a>Running Tests

To run the tests just once, execute the command:

```
$ npm test
```

If you prefer that the tests run automatically when changes happens, execute the command:

```
$ npm run test-watch
```