// functions/line-send-notification.js
const axios = require('axios');

exports.handler = async function(event, context) {
  // Enable CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  // Handle preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  try {
    // Parse the request body
    const requestBody = JSON.parse(event.body);
    const { lineUserId, message, queueId } = requestBody;

    if (!lineUserId || !message) {
      console.error('LINE notification error: Missing lineUserId or message');
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'LINE user ID and message are required' })
      };
    }

    // LINE API credentials
    const channelAccessToken = process.env.LINE_MESSAGING_API_TOKEN;

    if (!channelAccessToken) {
      console.error('LINE messaging API token not configured');
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Server configuration error' })
      };
    }

    console.log(`Sending LINE notification to ${lineUserId} for queue ${queueId}`);
    console.log(`Message content: ${message}`);
    console.log(`LINE user ID format check: ${lineUserId.startsWith('U') ? 'Valid format (starts with U)' : 'Invalid format (does not start with U)'}`);
    
    // Send message using LINE Messaging API directly with the correct parameter names
    const response = await axios.post('https://api.line.me/v2/bot/message/push', 
      {
        to: lineUserId, // Use 'to' instead of 'lineUserId' to match LINE API requirements
        messages: [
          {
            type: 'text',
            text: message
          }
        ]
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${channelAccessToken}`
        }
      }
    );

    console.log('LINE API response:', response.status, response.statusText);
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'Notification sent successfully'
      })
    };
  } catch (error) {
    console.error('LINE notification error:', error.response?.data || error.message);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Failed to send notification',
        details: error.response?.data || error.message
      })
    };
  }
};