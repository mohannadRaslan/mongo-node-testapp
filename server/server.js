const express = require('express');
const bodyParser = require('body-parser');
const {ObjectID} = require('mongodb');
const _ = require('lodash');

const {mongoose} = require('./db/mongoose');
const {User} = require('./models/user');
const {Todo} = require('./models/todo');
const {authinticate} = require('./middleware/authinticate');

var app = express ();
var port = process.env.PORT || 3000;

app.use(bodyParser.json());

app.post('/todos', authinticate, (req, res) => {
  var todo = new Todo({
    text: req.body.text,
    _creator: req.user._id
  });

  todo.save().then((doc) => {
    res.send(doc);
  }, (err) => {
    res.status(400).send(err);
  });
});

app.get('/todos', authinticate, (req, res) => {
  Todo.find({
    _creator: req.user._id
  }).then((todos) => {
    res.send({todos});
  }, (err) => {
    res.status(400).send(err);
  });
});

app.get('/todos/:id', authinticate, (req, res) => {
  var id = req.params.id;

  if(!ObjectID.isValid(id)){
    return res.status(404).send();
  }

  Todo.findOne({
    _id: id,
    _creator: req.user._id
  }).then((todo) => {
    if(!todo){
      return res.status(404).send();
    }
    res.send({todo});
  }, (err) => {
    res.status(400).send();
  });
});

app.delete('/todos/:id', authinticate, (req, res) => {
  var id = req.params.id;

  if(!ObjectID.isValid(id)){
    return res.status(404).send();
  }

  Todo.findOneAndRemove({
    _id: id,
    _creator: req.user._id
  }).then((todo) => {
    if(!todo){
      return res.status(404).send();
    }

    res.send({todo});
  }).catch((e) => res.status(400).send());
});

app.patch('/todos/:id', authinticate, (req, res) => {
  var id = req.params.id;
  var body = _.pick(req.body, ['text', 'completed']);

  if(!ObjectID.isValid(id)){
    return res.status(404).send();
  }

  if(_.isBoolean(body.completed) && body.completed){
    body.completedAt = new Date().getTime();
  }else {
    body.completedAt = null;
    body.completed = false;
  }

  Todo.findOneAndUpdate({
    _id: id,
    _creator: req.user._id
  }, {
    $set: body
  }, {
    new: true
  }).then((todo) => {
    if(!todo){
      res.status(404).send();
    }

    res.send({todo});
  }).catch((e) => res.status(400).send());
});

app.post('/users', (req, res) => {
  var body = _.pick(req.body, ['email', 'password']);
  var user = new User(body);

  user.save().then(() => {
    return user.generateAuthToken();
  }).then((token) => {
    res.header('x-auth', token).send(user);
  }).catch((e) => {
    res.status(400).send(e);
  })
});

app.get('/users/me', authinticate, (req, res) => {
  res.send(req.user);
});

app.post('/users/login', (req, res) => {
  var body = _.pick(req.body, ['email', 'password']);

  User.findByCredentials(body.email, body.password).then((user) => {
    return user.generateAuthToken().then((token) => {
      res.header('x-auth', token).send(user);
    });
  }).catch((e) => res.status(400).send());
});

app.delete('/users/me/token', authinticate, (req, res) => {
  req.user.removeToken(req.token).then(() => {
    res.status(200).send()
  }, (err) => {
    res.status(400).send();
  });
});

app.listen(port, () => {
  console.log(`Server Started at port ${port}`);
});

module.exports = {app};
