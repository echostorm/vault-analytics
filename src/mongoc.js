const assert = require('assert')
const MongoClient = require('mongodb').MongoClient

const mongoURL = process.env.MONGOLAB_URI
if (!mongoURL) throw new Error('MONGOLAB_URI must be set in environment')

exports.setup = (done) => {
  console.log('Connecting to Mongo at ' + mongoURL)
  MongoClient.connect(mongoURL, (err, connection) => {
    assert.equal(null, err)
    done(err, connection)
  })
}
