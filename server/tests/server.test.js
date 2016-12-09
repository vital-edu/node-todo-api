const expect = require('expect');
const request = require('supertest');
const {ObjectID} = require('mongodb');

const {app} = require('./../server');

const {Todo} = require('./../models/todo');
const {User} = require('./../models/user');

const {populateTodos, populateUsers, todos, users} = require('./seed/seed');

beforeEach(populateTodos);
beforeEach(populateUsers);

describe('POST /todos', () => {
  it('should create a new todo', (done) => {
    let text = 'make the test pass';

    request(app)
      .post('/todos')
      .set('x-auth', users[0].tokens[0].token)
      .send({text})
      .expect(200)
      .expect((res) => {
        expect(res.body.text).toBe(text);
        expect(res.body._creator).toBe(users[0]._id.toHexString());
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        Todo.find({text}).then((todos) => {
          expect(todos.length).toBe(1);
          expect(todos[0].text).toBe(text);
          done();
        }).catch((err) => done(err));
      });
  });

  it('should not create todo with an invalid body todo', (done) => {
    request(app)
    .post('/todos')
    .set('x-auth', users[0].tokens[0].token)
    .send({})
    .expect(400)
    .end((err, res) => {
      if (err) return done(err);

      Todo.find().then((todos) => {
        expect(todos.length).toBe(2);
        done();
      }).catch((err) => done(err));
    });
  });
});

describe('GET /todos', () => {
  it('should get all todos', (done) => {
    request(app)
      .get('/todos')
      .set('x-auth', users[0].tokens[0].token)
      .expect(200)
      .expect((res) => {
        expect(res.body.todos.length).toBe(1);
        expect(res.body.todos[0]._creator).toBe(users[0]._id.toHexString());
      })
      .end((err) => {
        if (err) {
          return done(err);
        }
        done();
      });
  });
});

describe('GET /todos/:id', () => {
  it('should return note that matches given id', (done) => {
    request(app)
      .get(`/todos/${todos[0]._id}`)
      .set('x-auth', users[0].tokens[0].token)
      .expect(200)
      .expect((res) => {
        expect(res.body.todo._creator).toBe(users[0]._id.toHexString());
        expect(res.body.todo.text).toBe(todos[0].text);
      })
      .end(done);
  });

  it('should not return note created by other user', (done) => {
    request(app)
      .get(`/todos/${todos[1]._id}`)
      .set('x-auth', users[0].tokens[0].token)
      .expect(404)
      .end(done);
  });

  it('should return 404 if todo not found', (done) => {
    let hexId = new ObjectID().toHexString();

    request(app)
      .get(`/todos/${hexId}`)
      .set('x-auth', users[0].tokens[0].token)
      .expect(404)
      .end(done);
  });

  it('should return 404 if todo id is invalid', (done) => {
    request(app)
      .get('/todos/invalidID')
      .set('x-auth', users[0].tokens[0].token)
      .expect(404)
      .end(done);
  })
});

describe('DELETE /todos/:id', () => {
  it('should remove a todo', (done) => {
    let hexId = todos[0]._id.toHexString();

    request(app)
      .delete(`/todos/${hexId}`)
      .set('x-auth', users[0].tokens[0].token)
      .expect(200)
      .expect((res) => {
        expect(res.body.todo._id).toBe(hexId);
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        Todo.findById(hexId).then((todo) => {
          expect(todo).toNotExist();
          done();
        }).catch((e) => done(e));
      });
  });

  it('should not remove a todo created by othe user', (done) => {
    let hexId = todos[0]._id.toHexString();

    request(app)
      .delete(`/todos/${hexId}`)
      .set('x-auth', users[1].tokens[0].token)
      .expect(404)
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        Todo.findById(hexId).then((todo) => {
          expect(todo).toExist();
          done();
        }).catch((e) => done(e));
      });
  });

  it('should return 404 if id is not found', (done) => {
    let hexId = new ObjectID().toHexString();

    request(app)
      .delete(`/todos/${hexId}`)
      .set('x-auth', users[0].tokens[0].token)
      .expect(404)
      .end(done)
  });

  it('should return 404 if id is invalid', (done) => {
    request(app)
      .delete('/todos/delete/invalidId')
      .set('x-auth', users[0].tokens[0].token)
      .expect(404)
      .end(done);
  });
});

describe('PATCH /todos/:id', () => {
  it('should update the todo', (done) => {
    let todoToUpdate = {
      _id: todos[0]._id.toHexString(),
      text: 'todo updated',
      completed: true,
    }

    request(app)
      .patch(`/todos/${todoToUpdate._id}`)
      .set('x-auth', users[0].tokens[0].token)
      .send(todoToUpdate)
      .expect(200)
      .expect((res) => {
        expect(res.body.todo.text).toBe(todoToUpdate.text);
        expect(res.body.todo.completed).toBe(todoToUpdate.completed);
        expect(res.body.todo.completedAt).toBeA('number');
      })
      .end(done);
  });

  it('should not update the todo created by other user', (done) => {
    let todoToUpdate = {
      _id: todos[0]._id.toHexString(),
      text: 'todo updated',
      completed: true,
    }

    request(app)
      .patch(`/todos/${todoToUpdate._id}`)
      .set('x-auth', users[1].tokens[0].token)
      .send(todoToUpdate)
      .expect(404)
      .expect((res) => {
        expect(res.body.todo.text).toBe(todoToUpdate.text);
        expect(res.body.todo.completed).toBe(todoToUpdate.completed);
        expect(res.body.todo.completedAt).toBeA('number');
      })
      .end((err, res) => {
        Todo.findById(todos[0]._id.toHexString()).then((todo) => {
          expect(todo).toExist();
          expect(todo.text).toNotBe(todoToUpdate.text);
          expect(todo.completed).toNotBe(todoToUpdate.completed);
          done();
        }).catch((err) => done(err));
      });
  });

  it('should clear completedAt when todo is not completed', (done) => {
    let todoToUpdate = {
      _id: todos[1]._id.toHexString(),
      completed: false,
    }

    request(app)
      .patch(`/todos/${todoToUpdate._id}`)
      .set('x-auth', users[1].tokens[0].token)
      .send(todoToUpdate)
      .expect(200)
      .expect((res) => {
        expect(res.body.todo.completed).toBe(todoToUpdate.completed);
        expect(res.body.todo.completedAt).toNotExist();
      })
      .end(done);
  });
});

describe('GET /users/me', () => {
  it('should return user if authenticated', (done) => {
    request(app)
      .get('/users/me')
      .set('x-auth', users[0].tokens[0].token)
      .expect(200)
      .expect((res) => {
        expect(res.body._id).toBe(users[0]._id.toHexString());
        expect(res.body.email).toBe(users[0].email);
      })
      .end(done);
  });

  it('should return 401 if not authenticated', (done) => {
    request(app)
      .get('/users/me')
      .expect(401)
      .expect((res) => {
        expect(res.body).toEqual({});
      })
      .end(done);
  });
});

describe('POST /users', () => {
  it('should create a user', (done) => {
    let user = {
      email: 'user@test.com',
      password: '123abc123'
    }

    request(app)
      .post('/users')
      .send(user)
      .expect(200)
      .expect((res) => {
        expect(res.headers['x-auth']).toExist();
        expect(res.body._id).toExist();
        expect(res.body.email).toBe(user.email);
      })
      .end((err) => {
        if (err) {
          return done(err);
        }

        User.find({email: user.email}).then((doc) => {
          expect(doc).toExist();
          expect(doc.password).toNotBe(user.password);
          done();
        }).catch((err) => done(err));
      });
  });

  it('should return validation erros if request invalid', (done) => {
    let user = {
      email: '',
      password: '123abc123'
    }

    request(app)
      .post('/users')
      .send(user)
      .expect(400)
      .end(done);
  });

  it('should create user if email is in use', (done) => {
    request(app)
      .post('/users')
      .send(users[0])
      .expect(400)
      .end(done);
  });
});

describe('POST /users/login', () => {
  it('should login user and return auth token', (done) => {
    request(app)
      .post('/users/login')
      .send({
        email: users[1].email,
        password: users[1].password,
      })
      .expect(200)
      .expect((res) => {
        expect(res.headers['x-auth']).toExist();
      })
      .end((err, res) => {
        if (err) {
          done(err);
        }

        User.findById(users[1]._id).then((doc) => {
          expect(doc.tokens[1]).toInclude({
            access: 'auth',
            token: res.headers['x-auth']
          });
          done();
        }).catch((err) => done(err));
      });
  });

  it('should reject invalid login', (done) => {
    request(app)
      .post('/users/login')
      .send({
        email: users[1].email,
        password: users[1].password + '1'
      })
      .expect(400)
      .expect((res) => {
        expect(res.headers['x-auth']).toNotExist();
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        User.findById(users[1]._id).then((doc) => {
          expect(doc.tokens.length).toBe(1);
          done();
        }).catch((err) => {
          done(err);
        })
      });
  });
});

describe('DELETE /users/me/token', () => {
  it('should remove auth token on logout', (done) => {
    request(app)
      .delete('/users/me/token')
      .set('x-auth', users[0].tokens[0].token)
      .expect(200)
      .end((err, res) => {
        if (err) {
          done(err);
        }

        User.findById(users[0]._id).then((user) => {
          expect(user.tokens.length).toBe(0);
          done();
        }).catch((err) => {
          done(err);
        })
      })
  });
});