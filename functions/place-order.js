const AWS = require('aws-sdk')
const kinesis = new AWS.Kinesis()
const chance = require('chance').Chance()
const streamName = process.env.order_events_stream
const Log = require('@dazn/lambda-powertools-logger')

module.exports.handler = async (event, context) => {
  const restaurantName = JSON.parse(event.body).restaurantName

  const orderId = chance.guid()
  Log.debug('placing order...', { orderId, restaurantName})

  const data = {
    orderId,
    restaurantName,
    eventType: 'order_placed'
  }

  const req = {
    Data: JSON.stringify(data), // the SDK would base64 encode this for us
    PartitionKey: orderId,
    StreamName: streamName
  }

  await kinesis.putRecord(req).promise()

  Log.debug('published event into Kinesis', { eventType: 'order_placed '})

  const response = {
    statusCode: 200,
    body: JSON.stringify({ orderId })
  }

  return response
}
