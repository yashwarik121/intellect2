const API_BASE_URL = 'http://localhost:3001';

export function httpPostFetch(apiUrl: string, body: any): Promise<any> {
  return new Promise(async (resolve, reject) => {
    try {
      const fullUrl = apiUrl.startsWith('http') ? apiUrl : `${API_BASE_URL}${apiUrl}`;
      const response = await fetch(fullUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      resolve(data);
    } catch (err) {
      console.warn('[HTTP POST Fail]:', apiUrl, err);
      reject(err);
    }
  });
}

export function httpGetFetch(apiUrl: string): Promise<any> {
  return new Promise(async (resolve, reject) => {
    try {
      const fullUrl = apiUrl.startsWith('http') ? apiUrl : `${API_BASE_URL}${apiUrl}`;
      const response = await fetch(fullUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      resolve(data);
    } catch (err) {
      console.warn('[HTTP GET Fail]:', apiUrl, err);
      reject(err);
    }
  });
}
