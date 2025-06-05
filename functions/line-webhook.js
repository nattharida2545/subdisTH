const crypto = require('crypto');

exports.handler = async function(event) {
  console.log('Received webhook event:', event.httpMethod);
  
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  // Verify signature
  const signature = event.headers['x-line-signature'];
  const body = event.body;
  const channelSecret = process.env.LINE_CHANNEL_SECRET;
  
  if (!channelSecret) {
    console.error('LINE channel secret not configured');
    return { statusCode: 500, body: JSON.stringify({ error: 'Server configuration error' }) };
  }
  
  console.log('Verifying signature:', signature);
  
  const expectedSignature = crypto
    .createHmac('SHA256', channelSecret)
    .update(body)
    .digest('base64');
  
  if (signature !== expectedSignature) {
    console.error('Invalid signature');
    return { statusCode: 401, body: JSON.stringify({ error: 'Invalid signature' }) };
  }

  try {
    const data = JSON.parse(body);
    console.log('Webhook data:', JSON.stringify(data));
    
    // Process webhook events
    const events = data.events || [];
    for (const event of events) {
      // Handle different event types
      console.log('Processing event type:', event.type);
      
      switch (event.type) {
        case 'message':
          // Handle message events
          console.log('Received message:', event.message);
          break;
        case 'follow':
          // Handle follow events
          console.log('User followed:', event.source.userId);
          break;
        // Add other event types as needed
      }
    }
    
    // LINE API requires a 200 response
    return { statusCode: 200, body: '' };
  } catch (error) {
    console.error('LINE webhook error:', error);
    return { statusCode: 500, body: JSON.stringify({ error: 'Error processing webhook' }) };
  }
};