import { NextRequest, NextResponse } from 'next/server';

const YOUTUBE_API_BASE = 'https://www.googleapis.com/youtube/v3';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const action = searchParams.get('action');
  const apiKey = process.env.YOUTUBE_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: 'YouTube API key not configured. Please set YOUTUBE_API_KEY in .env.local' },
      { status: 500 }
    );
  }

  try {
    if (action === 'searchChannel') {
      const query = searchParams.get('query');
      if (!query) {
        return NextResponse.json(
          { error: 'Query is required' },
          { status: 400 }
        );
      }

      // Check if it's a direct channel ID (starts with UC)
      if (query.startsWith('UC') && query.length === 24) {
        // Try to get channel by ID first
        const channelResponse = await fetch(
          `${YOUTUBE_API_BASE}/channels?part=snippet&id=${query}&key=${apiKey}`
        );

        if (channelResponse.ok) {
          const channelData = await channelResponse.json();
          if (channelData.items && channelData.items.length > 0) {
            const channel = channelData.items[0];
            return NextResponse.json({
              channels: [{
                id: channel.id,
                name: channel.snippet.title,
                thumbnail: channel.snippet.thumbnails?.medium?.url || channel.snippet.thumbnails?.default?.url,
              }]
            });
          }
        }
      }

      // Search for channel by name or handle
      const searchResponse = await fetch(
        `${YOUTUBE_API_BASE}/search?part=snippet&type=channel&q=${encodeURIComponent(query)}&maxResults=5&key=${apiKey}`
      );

      if (!searchResponse.ok) {
        const error = await searchResponse.json();
        return NextResponse.json(
          { error: error.error?.message || 'Failed to search channels' },
          { status: searchResponse.status }
        );
      }

      const searchData = await searchResponse.json();
      const channels = searchData.items.map((item: any) => ({
        id: item.snippet.channelId,
        name: item.snippet.title,
        thumbnail: item.snippet.thumbnails?.medium?.url || item.snippet.thumbnails?.default?.url,
      }));

      return NextResponse.json({ channels });
    }

    if (action === 'getChannelById') {
      const channelId = searchParams.get('channelId');
      if (!channelId) {
        return NextResponse.json(
          { error: 'Channel ID is required' },
          { status: 400 }
        );
      }

      // Get channel by ID
      const channelResponse = await fetch(
        `${YOUTUBE_API_BASE}/channels?part=snippet&id=${channelId}&key=${apiKey}`
      );

      if (!channelResponse.ok) {
        const error = await channelResponse.json();
        return NextResponse.json(
          { error: error.error?.message || 'Failed to get channel' },
          { status: channelResponse.status }
        );
      }

      const channelData = await channelResponse.json();
      if (channelData.items.length === 0) {
        return NextResponse.json(
          { error: 'Channel not found' },
          { status: 404 }
        );
      }

      const channel = channelData.items[0];
      return NextResponse.json({
        id: channel.id,
        name: channel.snippet.title,
        thumbnail: channel.snippet.thumbnails?.medium?.url || channel.snippet.thumbnails?.default?.url,
      });
    }

    if (action === 'getVideos') {
      const channelIds = searchParams.get('channelIds');
      if (!channelIds) {
        return NextResponse.json(
          { error: 'Channel IDs are required' },
          { status: 400 }
        );
      }

      const channelIdArray = channelIds.split(',');
      const allVideos: any[] = [];

      // Fetch videos for each channel
      for (const channelId of channelIdArray) {
        const videosResponse = await fetch(
          `${YOUTUBE_API_BASE}/search?part=snippet&channelId=${channelId}&type=video&order=date&maxResults=10&key=${apiKey}`
        );

        if (videosResponse.ok) {
          const videosData = await videosResponse.json();
          const videos = videosData.items.map((item: any) => ({
            id: item.id.videoId,
            title: item.snippet.title,
            description: item.snippet.description,
            thumbnail: item.snippet.thumbnails?.medium?.url || item.snippet.thumbnails?.default?.url,
            channelId: item.snippet.channelId,
            channelTitle: item.snippet.channelTitle,
            publishedAt: item.snippet.publishedAt,
            url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
          }));
          allVideos.push(...videos);
        }
      }

      // Sort by published date (newest first)
      allVideos.sort((a, b) => 
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
      );

      return NextResponse.json({ videos: allVideos });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

