const expect = require('expect');
const request = require('supertest');
const {ObjectID} = require('mongodb');

const {app} = require('./../server');
const {Todo} = require('./../models/todo');

const todos = [{
  _id: new ObjectID,
  text: 'First test todo',
},{
  _id: new ObjectID,
  text: 'Second test todo',
  completed: true,
}];

beforeEach((done) => {
  Todo.remove({}).then(() => {
    return Todo.insertMany(todos);
  }).then(() => done());
});

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