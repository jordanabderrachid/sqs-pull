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

SQS.prototype._getQueueURL = function (queueName, cb) {
  debug('getting queue url (queue_name="%s")', queueName)

  var params = {
    'QueueName': queueName
  }

  this._sqsClient.getQueueUrl(params, function (err, data) {
    if (err) {
      debug('failed to get queue url (queue_name="%s")', queueName)
      cb(err)
      return
    }

    var queueURL = data.QueueUrl
    debug('got queue url (queue_name="%s", queue_url="%s")', queueName, queueURL)
    cb(null, queueURL)
  })
}

SQS.prototype._deleteMessage = function (queueURL, receiptHandle, cb) {
  debug('deleting message (queue_url="%s", receipt_handle="%s")', queueURL, receiptHandle)

  var params = {
    'QueueUrl': queueURL,
    'ReceiptHandle': receiptHandle
  }

  this._sqsClient.deleteMessage(params, function (err) {
    if (err) {
      debug('failed to delete message (queue_url="%s", receipt_handle="%s")', queueURL, receiptHandle)
      cb(err)
      return
    }

    debug('deleted message (queue_url="%s", receipt_handle="%s")', queueURL, receiptHandle)
    cb()
  })
}

SQS.prototype._receiveMessage = function (queueURL, cb) {
  debug('pulling message (queue_url="%s")', queueURL)

  // TODO: Add support of fetching several messages on the same request
  // TODO: Add support of visibility timeout parameter
  var params = {
    'QueueUrl': queueURL,
    'MaxNumberOfMessages': 1
  }

  this._sqsClient.receiveMessage(params, function (err, data) {
    if (err) {
      debug('failed to pull message (queue_url="%s")', queueURL)
      cb(err)
      return
    }

    if (data.Messages.length === 0) {
      debug('pulled messages but got no message (queue_url="%s")', queueURL)
      cb()
      return
    }

    var message = data.Messages[0]

    var messageBody = message.Body
    var messageBodyMD5 = message.MD5OfBody
    var receiptHandle = message.ReceiptHandle

    debug('pulled messages and got a response (queue_url="%s", md5="%s", receipt_handle="%s")', queueURL, messageBodyMD5, receiptHandle)
    // TODO: Check MD5
    cb(null, messageBody, receiptHandle)
  })
}

SQS.prototype.pull = function (queueName) {
  var self = this
  debug('pull queue (queue_name="%s")', queueName)

  setInterval(function () {
    self.emit('message', queueName, {foo: 'bar'}, self._doneCallback(queueName))
  }, 1000)
}

module.exports = SQS
