
const {ObjectID} = require('mongodb');

const {mongoose} = require('./../server/db/mongoose');
const {User} = require('./../server/models/user');

var id = '583d806877cf404cf656db94';

if (!ObjectID.isValid(id)) {
  console.log('Id is invalid');
} else {
  User.findById(id).then((user) => {
    if (!user) {
      return console.log('User not found');
    }

    console.log('User: ', user);
  }, (e) => {
    console.log('Error: ', e);
  });
}


