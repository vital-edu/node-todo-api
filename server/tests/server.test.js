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
    var text = 'make the test pass';

    request(app)
      .post('/todos')
      .send({text})
      .expect(200)
      .expect((res) => {
        expect(res.body.text).toBe(text);
      })
      .end((err, res) => {
        if (err) return done(e);

        Todo.find({text}).then((todos) => {
          expect(todos.length).toBe(1);
          expect(todos[0].text).toBe(text);
          done();
        }).catch((err) => done(err));
      });
  });

  it('should not create an invalid todo', (done) => {
    request(app)
    .post({})
    .expect(404)
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
      .expect(200)
      .expect((res) => {
        expect(res.body.todos.length).toBe(2);
      })
      .end(done);
  });
});

describe('GET /todos/:id', () => {
  it('should get note that matches given id', (done) => {
    request(app)
      .get(`/todos/${todos[0]._id}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.todo.text).toBe(todos[0].text);
      })
      .end(done);
  });

  it('should return 404 if todo not found', (done) => {
    var hexId = new ObjectID().toHexString();

    request(app)
      .get(`/todos/${hexId}`)
      .expect(404)
      .end(done);
  });

  it('should return 404 if todo id is invalid', (done) => {
    request(app)
      .get('/todos/invalidID')
      .expect(404)
      .end(done);
  })
});

describe('DELETE /todos/:id', () => {
  it('should delete the note that matched given id', (done) => {
    var hexId = todos[0]._id.toHexString();

    request(app)
      .delete(`/todos/${hexId}`)
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

  it('should return 404 if id is not found', (done) => {
    var hexId = new ObjectID().toHexString();

    request(app)
      .delete(`/todos/${hexId}`)
      .expect(404)
      .end(done)
  });

  it('should return 404 if id is invalid', (done) => {
    request(app)
      .delete('/todos/delete/invalidId')
      .expect(404)
      .end(done);
  });
});

describe('PATCH /todos/:id', () => {
  it('should update todo that matches given id', (done) => {
    var todoToUpdate = {
      _id: todos[0]._id.toHexString(),
      text: 'todo updated',
      completed: true,
    }

    request(app)
      .patch(`/todos/${todoToUpdate._id}`)
      .send(todoToUpdate)
      .expect(200)
      .expect((res) => {
        expect(res.body.todo.text).toBe(todoToUpdate.text);
        expect(res.body.todo.completed).toBe(todoToUpdate.completed);
        expect(res.body.todo.completedAt).toBeA('number');
      })
      .end(done);
  });

  it('should clear completedAt when todo is not completed', (done) => {
    var todoToUpdate = {
      _id: todos[1]._id.toHexString(),
      completed: false,
    }

    request(app)
      .patch(`/todos/${todoToUpdate._id}`)
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
        })
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