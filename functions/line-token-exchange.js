
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
    const { code, redirectUri, clientId, clientSecret } = requestBody;

    console.log('LINE token exchange request received:', {
      hasCode: !!code,
      redirectUri,
      hasClientId: !!clientId,
      hasClientSecret: !!clientSecret
    });

    if (!code) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Authorization code is required' })
      };
    }

    if (!clientId || !clientSecret) {
      console.error('Missing LINE credentials in request body');
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Client ID and Client Secret are required' })
      };
    }

    console.log(`Exchanging code for token with redirect URI: ${redirectUri}`);

    // Exchange code for token using the official LINE API endpoint
    const tokenResponse = await axios.post('https://api.line.me/oauth2/v2.1/token', 
      new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
        client_id: clientId,
        client_secret: clientSecret
      }).toString(),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    console.log('Received token response:', JSON.stringify(tokenResponse.data));

    // Get user profile with the access token
    const accessToken = tokenResponse.data.access_token;
    const profileResponse = await axios.get('https://api.line.me/v2/profile', {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });

    console.log('Received profile response:', JSON.stringify(profileResponse.data));

    // Return both token and profile information
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        ...tokenResponse.data,
        profile: profileResponse.data
      })
    };
  } catch (error) {
    console.error('LINE token exchange error:', error.response?.data || error.message);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Failed to exchange token',
        details: error.response?.data || error.message
      })
    };
  }
};
