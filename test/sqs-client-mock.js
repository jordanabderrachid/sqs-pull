'use strict'

var util = require('util')

var checkParameter = function (params, parameterName, cb) {
  if (!params.hasOwnProperty(parameterName)) {
    process.nextTick(cb.bind(null, new Error(util.format('missing %s parameter', parameterName))))
    return false
  }

  return true
}

var sqsClientMock = {
  getQueueUrl: function (params, cb) {
    if (!checkParameter(params, 'QueueName', cb)) {
      return
    }

    process.nextTick(function () {
      cb(null, {
        'QueueUrl': 'QUEUE_URL'
      })
    })
  },

  deleteMessage: function (params, cb) {
    if (!checkParameter(params, 'QueueUrl', cb)) {
      return
    }

    if (!checkParameter(params, 'ReceiptHandle')) {
      return
    }

    cb()
  },

  receiveMessage: function (params, cb) {
    if (!checkParameter(params, 'QueueUrl', cb)) {
      return
    }

    process.nextTick(function () {
      var message = {
        'Body': 'MESSAGE_BODY',
        'MD5OfBody': 'MD5_OF_BODY',
        'ReceiptHandle': 'RECEIPT_HANDLE'
      }

      cb(null, {
        Messages: [message]
      })
    })
  }
}

module.exports = sqsClientMock
