import { constant } from './constantServices';
import { utilLog } from './utilServices';

export function httpPostFetch(apiUrl: string, body: any, hideAlert?: boolean, isHideToken?: boolean): Promise<any> {
  return new Promise(async (resolve, reject) => {
    try {
      utilLog(constant.rootUrl + apiUrl);
      const header: any = {
        'Content-Type': 'application/json',
      };
      if (!isHideToken) {
        // Placeholder for Auth token header attachment
      }
      const response = await fetch(`${constant.rootUrl}${apiUrl}`, {
        method: 'POST',
        headers: header,
        body: JSON.stringify(body),
      });
      const data = await response.json();
      resolve(data);
    } catch (err) {
      if (!hideAlert) {
        console.error('HTTP Post Error:', err);
      }
      reject(err);
    }
  });
}

export function httpGetFetch(apiUrl: string, hideAlert?: boolean, isHideToken?: boolean): Promise<any> {
  return new Promise(async (resolve, reject) => {
    try {
      utilLog(constant.rootUrl + apiUrl);
      const header: any = {
        'Content-Type': 'application/json',
      };
      if (!isHideToken) {
        // Placeholder for Auth token header attachment
      }
      const response = await fetch(`${constant.rootUrl}${apiUrl}`, {
        method: 'GET',
        headers: header,
      });
      const data = await response.json();
      resolve(data);
    } catch (err) {
      if (!hideAlert) {
        console.error('HTTP Get Error:', err);
      }
      reject(err);
    }
  });
}
