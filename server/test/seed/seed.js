const {ObjectID} = require('mongodb');
const jwt = require('jsonwebtoken');

const {Todo} = require('./../../models/todo');
const {User} = require('./../../models/user');

var firstID = new ObjectID();
var secondID = new ObjectID();

const todos = [{
  _id: firstID,
  text: "first test todo"
}, {
  _id: secondID,
  text: "second test todo",
  completed: true,
  completedAt: 3333
}];

const fistUserID = new ObjectID();
const secondUserID = new ObjectID();

const users = [{
  _id: fistUserID,
  email: 'sssw@gmail.com',
  password: '1234567',
  tokens:[{
    access: 'auth',
    token: jwt.sign({_id: fistUserID, access: 'auth'}, 'abc123').toString()
  }]
}, {
  _id: secondUserID,
  email: 'asad@gmail.com',
  password: 1234567
}];

const populateTodos = (done) => {
  Todo.remove({}).then(() => {
    Todo.insertMany(todos);
  }).then(() => done());
};

const populateUsers = (done) => {
  User.remove({}).then(() => {
    var user1 = new User(users[0]).save();
    var user2 = new User(users[1]).save();

    return Promise.all([user1, user2])
  }).then(() => done());
};

module.exports = {todos, populateTodos, users, populateUsers}
