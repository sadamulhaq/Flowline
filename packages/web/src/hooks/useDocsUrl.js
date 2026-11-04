import useFlowlineInfo from 'hooks/useFlowlineInfo';

const appendTrailingSlash = (url) => {
  if (!url) {
    return undefined;
  }

  if (!url.endsWith('/')) {
    return `${url}/`;
  }

  return url;
};

/**
 * Per instance, there may be different documentation. However, the paths are assumed the same.
 * The given DOCS_URL is made sure to have a trailing slash to have relative paths work as expected.
 */
export default function useDocsUrl(path) {
  const { data: flowlineInfo } = useFlowlineInfo();
  const docsUrlWithTrailingSlash = appendTrailingSlash(
    flowlineInfo?.docsUrl,
  );
  const docsUrl = docsUrlWithTrailingSlash || 'https://automatisch.io/docs/';

  const absoluteUrl = new window.URL(path, docsUrl).toString();

  return absoluteUrl;
}
