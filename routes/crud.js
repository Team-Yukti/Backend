// insert data in dynamo db
const express = require('express');
const router = express.Router();



function insertItem(db1)
{
    const docRef = db1.collection('users');

docRef.set({
  first: 'dcsf',
  last: 'Lovelace',
  born: 1815
});
}
module.exports = { insertItem};