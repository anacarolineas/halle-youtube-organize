'use client';

import { useState } from 'react';
import ChannelManager from '@/components/ChannelManager';
import VideoList from '@/components/VideoList';
import Logo from '@/components/Logo';

export default function Home() {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleChannelsChange = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <header className="mb-8">
          <Logo />
          <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">
            Organize e acompanhe vídeos dos seus canais favoritos do YouTube
          </p>
        </header>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <ChannelManager onChannelsChange={handleChannelsChange} />
          </div>
          <div className="lg:col-span-2">
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
              <VideoList key={refreshKey} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
