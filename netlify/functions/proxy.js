// Netlify Functions - API 代理
// 解决明道云 API 的 CORS 问题

exports.handler = async (event, context) => {
  // 获取原始路径（重定向后格式：/.netlify/functions/proxy/https://...)
  let path = event.path.replace('/.netlify/functions/proxy', '');
  
  // 如果路径以 /https:// 开头，说明是完整 URL，需要提取
  let targetUrl;
  if (path.startsWith('/https://')) {
    targetUrl = path.substring(1); // 去掉开头的 /
  } else if (path.startsWith('https://')) {
    targetUrl = path;
  } else {
    targetUrl = `https://api.mingdao-info.com${path}`;
  }
  
  // 如果有查询参数，添加到目标URL
  if (event.queryStringParameters && Object.keys(event.queryStringParameters).length > 0) {
    const params = new URLSearchParams(event.queryStringParameters);
    targetUrl += (targetUrl.includes('?') ? '&' : '?') + params.toString();
  }
  
  console.log('[代理] 目标URL:', targetUrl);
  
  // 获取 token
  const token = event.headers.token || event.headers.Token || '';
  
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
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};
