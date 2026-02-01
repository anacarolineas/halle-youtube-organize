export interface Channel {
  id: string;
  name: string;
  thumbnail?: string;
  folderId?: string;
}

export interface Folder {
  id: string;
  name: string;
  parentId?: string;
}

export interface Video {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  channelId: string;
  channelTitle: string;
  publishedAt: string;
  url: string;
}

export interface YouTubeChannelResponse {
  id: string;
  snippet: {
    title: string;
    thumbnails: {
      default: { url: string };
      medium: { url: string };
      high: { url: string };
    };
  };
}

export interface YouTubeVideoResponse {
  id: { videoId: string };
  snippet: {
    title: string;
    description: string;
    thumbnails: {
      medium: { url: string };
      high: { url: string };
    };
    channelId: string;
    channelTitle: string;
    publishedAt: string;
  };
}

