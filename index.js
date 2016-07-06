'use strict'

var EventEmitter = require('events')
var util = require('util')

var debug = require('debug')('sqs-pull')

var SQS = function (sqsClient) {
  if (!(this instanceof SQS)) {
    return new SQS(sqsClient)
  }

  EventEmitter.call(this)

  this._sqsClient = sqsClient
}

util.inherits(SQS, EventEmitter)

SQS.prototype._doneCallback = function (queueName) {
  return function (err) {
    if (err) {
      debug('done called with an error as argument, not removing the message (queue_name="%s")', queueName)
      return
    }

    debug('done called without error as argument, removing the message (queue_name="%s")', queueName)
  }
}

SQS.prototype.pull = function (queueName) {
  var self = this
  debug('pull queue (queue_name="%s")', queueName)

  setInterval(function () {
    self.emit('message', queueName, {foo: 'bar'}, self._doneCallback(queueName))
  }, 1000)
}

module.exports = SQS
