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

export function timeAgo(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const years = now.getFullYear() - date.getFullYear();
  const months = now.getMonth() - date.getMonth();
  const days = now.getDate() - date.getDate();

  if (years > 0) {
    return years === 1 ? "1 year ago" : `${years} years ago`;
  } else if (months > 0) {
    return months === 1 ? "1 month ago" : `${months} months ago`;
  } else if (days > 0) {
    return days === 1 ? "1 day ago" : `${days} days ago`;
  } else {
    const seconds = Math.round((now.getTime() - date.getTime()) / 1000);
    const intervals = {
      week: 604800,
      hour: 3600,
      minute: 60,
      second: 1,
    };

    for (const interval in intervals) {
      const secondsInInterval = intervals[interval as keyof typeof intervals];
      const time = Math.floor(seconds / secondsInInterval);

      if (time >= 1) {
        return time === 1 ? `1 ${interval} ago` : `${time} ${interval}s ago`;
      }
    }
    return "just now";
  }
}

export function preloadImage(imageUrl: string) {
  if (imageUrl) {
      const link = document.createElement("link");
      link.rel = "preload";
      link.as = "image";
      link.href = imageUrl;
      link.imageSrcset = imageUrl;
      link.imageSizes = "auto"; 
      document.head.appendChild(link);

      return () => { 
          document.head.removeChild(link);
      };
  }
  return () => {}; 
}