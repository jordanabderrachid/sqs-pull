### Usage

```js
var aws = require('aws-sdk')
var sqsClient = new aws.SQS()

var sqsPull = require('sqs-pull')(sqsClient)

var queueName = 'QUEUE_NAME'
sqsPull.pull(queueName)

sqsPull.on('message', function (queueName, messageBody, done) {
  console.log(queueName) // => 'QUEUE_NAME'
  console.log(messageBody)   // => 'MESSAGE_BODY'

  // Do some work here.

  done(err)
  /*
    If done is called with an error, the message won't be deleted
    from the queue.
  */
})
```

##### This library is still WIP
