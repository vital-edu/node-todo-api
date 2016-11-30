const {MongoClient, ObejectID} = require('mongodb');

MongoClient.connect('mongodb://localhost:27017/TodoApp', (err, db) => {
  if (err) {
    return console.log('Unable to connect to MongoDB server');
  }
  console.log('Connected to MongoDB server');

  db.collection('Todos').insertOne({
    text: 'Something to do',
    completed: false
  }, (err, result) => {
    if (err) {
      return console.log('Unsable to inser todo', err);
    }

    console.log(JSON.stringify(result.ops, undefined, 2));
  });

  db.collection('Users').insertOne({
    name: 'Eduardo Vital',
    age: 25,
    location: 'Brazil'
  }, (err, results) => {
    if (err) {
      return console.log('Unable to insert user');
    }

    console.log(results.ops[0]._id.getTimestamp());
  });

  db.close();
});