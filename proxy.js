// Netlify Functions - API 代理
// 解决明道云 API 的 CORS 问题

exports.handler = async (event, context) => {
  // 获取原始路径
  const path = event.path.replace('/.netlify/functions/proxy', '');
  let targetUrl = `https://api.mingdao-info.com${path}`;
  
  // 如果有查询参数
  if (event.queryStringParameters) {
    const params = new URLSearchParams(event.queryStringParameters);
    targetUrl += '?' + params.toString();
  }
  
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
