'use client';

import { useState, useEffect } from 'react';
import { Play, RefreshCw, Filter, Calendar, User } from 'lucide-react';
import { storage } from '@/lib/storage';
import { Video, Channel } from '@/lib/types';

export default function VideoList() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState<string>('all');

  useEffect(() => {
    loadVideos();
  }, [selectedFolder]);

  const loadVideos = async () => {
    const channels = storage.getChannels();
    const folders = storage.getFolders();

    let channelsToFetch: Channel[] = [];

    if (selectedFolder === 'all') {
      channelsToFetch = channels;
    } else if (selectedFolder === 'root') {
      channelsToFetch = channels.filter(c => !c.folderId);
    } else {
      channelsToFetch = channels.filter(c => c.folderId === selectedFolder);
    }

    if (channelsToFetch.length === 0) {
      setVideos([]);
      return;
    }

    setIsLoading(true);
    try {
      const channelIds = channelsToFetch.map(c => c.id).join(',');
      const response = await fetch(
        `/api/youtube?action=getVideos&channelIds=${channelIds}`
      );
      const data = await response.json();
      if (data.videos) {
        setVideos(data.videos);
      } else if (data.error) {
        console.error('Error loading videos:', data.error);
      }
    } catch (error) {
      console.error('Error loading videos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const folders = storage.getFolders();
  const channels = storage.getChannels();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Play className="h-5 w-5 text-red-600 dark:text-red-500" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Vídeos
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <select
              value={selectedFolder}
              onChange={(e) => setSelectedFolder(e.target.value)}
              className="rounded-lg border border-gray-300 bg-white pl-10 pr-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
            >
              <option value="all">Todos os canais</option>
              <option value="root">Raiz</option>
              {folders.map((folder) => (
                <option key={folder.id} value={folder.id}>
                  {folder.name}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={loadVideos}
            disabled={isLoading}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            {isLoading ? 'Carregando...' : 'Atualizar'}
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          Carregando vídeos...
        </div>
      ) : videos.length === 0 ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          Nenhum vídeo encontrado. Adicione canais primeiro.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {videos.map((video) => (
            <a
              key={video.id}
              href={video.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative rounded-xl border border-gray-200 bg-white overflow-hidden transition-all hover:shadow-xl hover:border-red-300 dark:border-gray-800 dark:bg-gray-900 dark:hover:border-red-700"
            >
              <div className="relative aspect-video w-full overflow-hidden bg-gray-100 dark:bg-gray-800">
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/20">
                  <div className="rounded-full bg-red-600 p-3 opacity-0 transition-opacity group-hover:opacity-100">
                    <Play className="h-6 w-6 text-white" fill="white" />
                  </div>
                </div>
              </div>
              <div className="p-4">
                <h3 className="mb-3 line-clamp-2 text-sm font-semibold text-gray-900 dark:text-gray-100">
                  {video.title}
                </h3>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400">
                    <User className="h-3.5 w-3.5" />
                    <span className="truncate">{video.channelTitle}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-500">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>{new Date(video.publishedAt).toLocaleDateString('pt-BR')}</span>
                  </div>
                </div>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

