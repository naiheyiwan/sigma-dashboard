// Netlify Functions - API 代理
// 解决明道云 API 的 CORS 问题

exports.handler = async (event, context) => {
  // 获取目标 URL（从查询参数中获取）
  let targetUrl;
  
  if (event.queryStringParameters && event.queryStringParameters.url) {
    // 从查询参数获取完整 URL
    targetUrl = decodeURIComponent(event.queryStringParameters.url);
  } else {
    // 从路径获取（兼容旧方式）
    let path = event.path.replace('/.netlify/functions/proxy', '');
    
    if (path.startsWith('/https://')) {
      targetUrl = path.substring(1);
    } else if (path.startsWith('https://')) {
      targetUrl = path;
    } else {
      targetUrl = `https://api.mingdao-info.com${path}`;
    }
  }
  
  // 获取 token
  const token = event.headers.token || event.headers.Token || '';
  
  console.log('[Proxy] Target URL:', targetUrl);
  console.log('[Proxy] Token:', token ? 'present' : 'missing');
  
  if (!targetUrl || targetUrl === 'https://api.mingdao-info.com') {
    return {
      statusCode: 400,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ error: 'Missing url parameter' })
    };
  }
  
  try {
    const response = await fetch(targetUrl, {
      method: event.httpMethod || 'GET',
      headers: {
        'Content-Type': 'application/json',
        'token': token,
        'Accept': 'application/json'
      }
    });
    
    const data = await response.text();
    console.log('[Proxy] Response status:', response.status);
    
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, token, Authorization',
        'Content-Type': 'application/json'
      },
      body: data
    };
  } catch (error) {
    console.error('[Proxy] Error:', error.message);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ error: error.message })
    };
  }
};
