import { ARTICLE, FETCH_MULTIPLYER } from "./constants";

export const getScreenWidth = () => {
  return window.innerWidth;
};
export const getApiLimit = (apiName: string, width: number) => {
  if (width < 640) {
    if (apiName === ARTICLE) {
      return 3 * FETCH_MULTIPLYER;
    }
  } else if (width < 1024) {
    if (apiName === ARTICLE) {
      return 8 * FETCH_MULTIPLYER;
    }
  } else if (width < 1536) {
    if (apiName === ARTICLE) {
      return 9 * FETCH_MULTIPLYER;
    }
  }
  return 12 * FETCH_MULTIPLYER;
};
