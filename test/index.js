/* eslint-env mocha */
'use strict'

var should = require('should')

var sqsClient = require('./sqs-client-mock')
var SQSPull = require('../index')

describe('sqs-pull', function () {
  var sqs

  before(function () {
    sqs = SQSPull(sqsClient)
  })

  describe('#_getQueueURL', function () {
    it('should return the url of the queue', function (done) {
      sqs._getQueueURL('QUEUE_NAME', function (err, queueURL) {
        should.not.exist(err)
        should.exist(queueURL)

        queueURL.should.be.a.String
        queueURL.should.be.exactly('QUEUE_URL')

        done(err)
      })
    })
  })

  describe('#_deleteMessage', function () {
    it('should delete the message', function (done) {
      sqs._deleteMessage('QUEUE_URL', 'RECEIPT_HANDLE', function (err) {
        should.not.exist(err)

        done(err)
      })
    })
  })

  describe('#_receiveMessage long polling', function () {
    it('should receive a message using long polling', function (done) {
      sqs._receiveMessage('QUEUE_URL', function (err, messageBody, receiptHandle) {
        should.not.exist(err)

        should.exist(messageBody)
        messageBody.should.be.a.String
        messageBody.should.be.exactly('MESSAGE_BODY')

        should.exist(receiptHandle)
        receiptHandle.should.be.a.String
        receiptHandle.should.be.exactly('RECEIPT_HANDLE')

        done(err)
      })
    })
  })

  describe('#_receiveMessage short polling', function () {
    var sqsShort

    before(function () {
      sqsShort = SQSPull(sqsClient, {longPolling: false})
    })

    it('should receive a message using short polling', function (done) {
      this.timeout(100) // Ensure we are using short polling

      sqsShort._receiveMessage('QUEUE_URL', function (err, messageBody, receiptHandle) {
        should.not.exist(err)

        should.exist(messageBody)
        messageBody.should.be.a.String
        messageBody.should.be.exactly('MESSAGE_BODY')

        should.exist(receiptHandle)
        receiptHandle.should.be.a.String
        receiptHandle.should.be.exactly('RECEIPT_HANDLE')

        done(err)
      })
    })
  })
})
