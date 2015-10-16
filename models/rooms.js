var db = require('../db');
var config = require('../config');

function _collection(room, callback) {
  var collectionName = 'rooms:' + room;
  var collection = db.get().createCollection(collectionName, {
    capped: true,
    size: config.mongodb.capped_size_limit,
  });

  collection.then(callback, function(err) {
    console.log(err);
  });
}

function push(room, size, message, callback) {
  _collection(room, function(collection) {
    collection.insertOne({message: message, size: size}, callback);
  });
}

function all(room, callback) {
  _collection(room, function(collection) {
    collection.find({}).toArray(function(err, items) {
      if (err) {
        callback(err, items);
      } else {
        var messageAscii = items.map(function (item) {
            return new Buffer(item.message, 'base64').toString('ascii');
        }).join('');
        var item = {
          size: items[items.length - 1].size,
          message: new Buffer(messageAscii).toString('base64'),
        };

        callback(err, item);
      }
    });
  });
}

module.exports = {
  push: push,
  all: all,
}