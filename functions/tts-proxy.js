const fetch = require('node-fetch');

exports.handler = async function(event, context) {
  // Get query parameters
  const { text, lang, debug } = event.queryStringParameters || {};
  
  if (!text || !lang) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Missing required parameters: text and lang' }),
    };
  }
  
  // Log request details if debug mode enabled
  const isDebug = debug === 'true';
  if (isDebug) {
    console.log('TTS Request:', {
      text: text.substring(0, 100) + (text.length > 100 ? '...' : ''),
      lang,
      userAgent: event.headers['user-agent'],
      clientIp: event.headers['client-ip'],
      referer: event.headers['referer']
    });
  }
  
  try {
    // Create Google TTS URL
    const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=${lang}&client=tw-ob`;
    
    console.log(`Fetching TTS from Google: ${url.substring(0, 100)}...`);
    
    // Fetch the audio file with a browser-like user agent
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/94.0.4606.81 Safari/537.36',
        'Referer': 'https://translate.google.com/',
        'Accept': '*/*',
        'Accept-Language': 'en-US,en;q=0.9,th;q=0.8',
        'Origin': 'https://translate.google.com'
      }
    });
    
    if (!response.ok) {
      console.error(`Error from Google TTS: ${response.status} ${response.statusText}`);
      
      // Try to read error body
      const errorText = await response.text();
      console.error('Error response body:', errorText);
      
      return {
        statusCode: response.status,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          error: `Google TTS returned error: ${response.status} ${response.statusText}`,
          details: errorText,
          url: url
        }),
      };
    }
    
    // Log the content type and response headers for debugging
    console.log('Response Headers:', {
      contentType: response.headers.get('content-type'),
      contentLength: response.headers.get('content-length'),
      cacheControl: response.headers.get('cache-control')
    });
    
    // Get the buffer
    const buffer = await response.buffer();
    
    // Log buffer size
    console.log(`Response size: ${buffer.length} bytes`);
    
    // Check if the response seems valid (audio files are typically larger than 1KB)
    if (buffer.length < 1024) {
      console.warn('Warning: Response seems too small for audio data');
      
      // Try to interpret as text if it's small (may be an error message)
      const smallResponse = buffer.toString('utf8');
      console.warn('Small response content:', smallResponse);
      
      // If it still seems to be valid audio despite small size, proceed anyway
      if (!smallResponse.includes('error') && !smallResponse.includes('html')) {
        console.log('Small response appears to be valid audio data, proceeding');
      } else {
        return {
          statusCode: 422,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ 
            error: 'Google TTS returned invalid data',
            details: smallResponse
          }),
        };
      }
    }
    
    // Return the audio file with appropriate headers
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=86400', // Cache for 24 hours
        'Content-Length': buffer.length.toString()
      },
      body: buffer.toString('base64'),
      isBase64Encoded: true,
    };
  } catch (error) {
    console.error('TTS proxy error:', error);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        error: 'Failed to fetch TTS audio',
        details: error.message || String(error),
        stack: error.stack
      }),
    };
  }
};