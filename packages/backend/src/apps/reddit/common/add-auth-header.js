import appConfig from '../../../config/app.js';

const addAuthHeader = ($, requestConfig) => {
  const screenName = $.auth.data?.screenName;
  if (screenName) {
    requestConfig.headers[
      'User-Agent'
    ] = `web:flowline:${appConfig.version} (by /u/${screenName})`;
  } else {
    requestConfig.headers[
      'User-Agent'
    ] = `web:flowline:${appConfig.version}`;
  }

  if (
    !requestConfig.additionalProperties?.skipAddingAuthHeader &&
    $.auth.data?.accessToken
  ) {
    requestConfig.headers.Authorization = `${$.auth.data.tokenType} ${$.auth.data.accessToken}`;
  }

  return requestConfig;
};

export default addAuthHeader;
