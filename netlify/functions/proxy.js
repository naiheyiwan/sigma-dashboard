// Netlify Functions - API 代理
// 解决明道云 API 的 CORS 问题

exports.handler = async (event, context) => {
  // 获取原始路径
  let path = event.path.replace('/.netlify/functions/proxy', '');
  
  // 构建目标 URL
  let targetUrl;
  if (path.startsWith('/https://')) {
    // 已经是完整 URL
    targetUrl = path.substring(1);
  } else if (path.startsWith('https://')) {
    targetUrl = path;
  } else {
    // 相对路径，添加 API 基础 URL
    targetUrl = `https://api.mingdao-info.com${path}`;
  }
  
  // 如果有查询参数
  if (event.queryStringParameters && Object.keys(event.queryStringParameters).length > 0) {
    const params = new URLSearchParams(event.queryStringParameters);
    targetUrl += (targetUrl.includes('?') ? '&' : '?') + params.toString();
  }
  
  // 获取 token
  const token = event.headers.token || event.headers.Token || '';
  
  console.log('[Proxy] Target URL:', targetUrl);
  console.log('[Proxy] Token:', token ? 'present' : 'missing');
  
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
      body: JSON.stringify({ error: error.message })
    };
  }
};
