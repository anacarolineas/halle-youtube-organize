'use client';

import { useState, useEffect } from 'react';
import { Search, Plus, Folder as FolderIcon, FolderOpen, X, Trash2, Move, Youtube } from 'lucide-react';
import { storage } from '@/lib/storage';
import { Channel, Folder } from '@/lib/types';

interface ChannelManagerProps {
  onChannelsChange: () => void;
}

export default function ChannelManager({ onChannelsChange }: ChannelManagerProps) {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [newFolderName, setNewFolderName] = useState('');
  const [showAddFolder, setShowAddFolder] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState<string>('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setChannels(storage.getChannels());
    setFolders(storage.getFolders());
  };

  const searchChannels = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      let query = searchQuery.trim();
      
      // Extract channel ID from URL
      if (query.includes('youtube.com/channel/')) {
        query = query.split('youtube.com/channel/')[1].split('/')[0].split('?')[0];
      } else if (query.includes('youtube.com/c/')) {
        query = query.split('youtube.com/c/')[1].split('/')[0].split('?')[0];
      } else if (query.includes('youtube.com/@')) {
        query = query.split('youtube.com/@')[1].split('/')[0].split('?')[0];
      } else if (query.includes('youtu.be/')) {
        // This is usually a video URL, but we'll try to search anyway
        query = searchQuery;
      }

      const response = await fetch(`/api/youtube?action=searchChannel&query=${encodeURIComponent(query)}`);
      const data = await response.json();
      if (data.channels) {
        setSearchResults(data.channels);
      } else if (data.error) {
        alert(data.error);
      }
    } catch (error) {
      console.error('Error searching channels:', error);
      alert('Erro ao buscar canais');
    } finally {
      setIsSearching(false);
    }
  };

  const addChannel = (channel: any) => {
    const newChannel: Channel = {
      id: channel.id,
      name: channel.name,
      thumbnail: channel.thumbnail,
      folderId: selectedFolder || undefined,
    };
    storage.addChannel(newChannel);
    loadData();
    onChannelsChange();
    setSearchQuery('');
    setSearchResults([]);
    setSelectedFolder('');
  };

  const removeChannel = (channelId: string) => {
    if (confirm('Tem certeza que deseja remover este canal?')) {
      storage.removeChannel(channelId);
      loadData();
      onChannelsChange();
    }
  };

  const createFolder = () => {
    if (!newFolderName.trim()) return;
    const newFolder: Folder = {
      id: Date.now().toString(),
      name: newFolderName.trim(),
    };
    storage.addFolder(newFolder);
    setFolders([...folders, newFolder]);
    setNewFolderName('');
    setShowAddFolder(false);
  };

  const removeFolder = (folderId: string) => {
    if (confirm('Tem certeza que deseja remover esta pasta? Os canais serão movidos para a raiz.')) {
      storage.removeFolder(folderId);
      loadData();
      onChannelsChange();
    }
  };

  const moveChannelToFolder = (channelId: string, folderId: string | undefined) => {
    storage.updateChannel(channelId, { folderId });
    loadData();
    onChannelsChange();
  };

  const getChannelsByFolder = (folderId?: string) => {
    return channels.filter(c => c.folderId === folderId);
  };

  const rootChannels = getChannelsByFolder(undefined);

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="mb-4 flex items-center gap-2">
          <Youtube className="h-5 w-5 text-red-600 dark:text-red-500" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Adicionar Canal
          </h2>
        </div>
        <div className="mb-4 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && searchChannels()}
              placeholder="Nome do canal ou URL"
              className="w-full rounded-lg border border-gray-300 bg-white pl-10 pr-3 py-2.5 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
            />
          </div>
          <button
            onClick={searchChannels}
            disabled={isSearching || !searchQuery.trim()}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Search className="h-4 w-4" />
            {isSearching ? 'Buscando...' : 'Buscar'}
          </button>
        </div>

        {searchResults.length > 0 && (
          <div className="mb-4">
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Adicionar à pasta (opcional):
            </label>
            <select
              value={selectedFolder}
              onChange={(e) => setSelectedFolder(e.target.value)}
              className="mb-2 w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
            >
              <option value="">Sem pasta</option>
              {folders.map((folder) => (
                <option key={folder.id} value={folder.id}>
                  {folder.name}
                </option>
              ))}
            </select>
            <div className="space-y-2">
              {searchResults.map((channel) => (
                <div
                  key={channel.id}
                  className="flex items-center gap-3 rounded border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800"
                >
                  {channel.thumbnail && (
                    <img
                      src={channel.thumbnail}
                      alt={channel.name}
                      className="h-10 w-10 rounded-full"
                    />
                  )}
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {channel.name}
                    </p>
                  </div>
                  <button
                    onClick={() => addChannel(channel)}
                    className="flex items-center gap-1.5 rounded-lg bg-green-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-green-700"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Adicionar
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FolderIcon className="h-5 w-5 text-blue-600 dark:text-blue-500" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Pastas
            </h2>
          </div>
          <button
            onClick={() => setShowAddFolder(!showAddFolder)}
            className="flex items-center gap-1.5 rounded-lg bg-gray-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-gray-700"
          >
            {showAddFolder ? (
              <>
                <X className="h-3.5 w-3.5" />
                Cancelar
              </>
            ) : (
              <>
                <Plus className="h-3.5 w-3.5" />
                Nova Pasta
              </>
            )}
          </button>
        </div>

        {showAddFolder && (
          <div className="mb-4 flex gap-2">
            <input
              type="text"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && createFolder()}
              placeholder="Nome da pasta"
              className="flex-1 rounded border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
            />
            <button
              onClick={createFolder}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700"
            >
              <Plus className="h-4 w-4" />
              Criar
            </button>
          </div>
        )}

        <div className="space-y-4">
          {folders.map((folder) => {
            const folderChannels = getChannelsByFolder(folder.id);
            return (
              <div
                key={folder.id}
                className="rounded border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800"
              >
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FolderOpen className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <h3 className="font-medium text-gray-900 dark:text-gray-100">
                      {folder.name}
                    </h3>
                  </div>
                  <button
                    onClick={() => removeFolder(folder.id)}
                    className="flex items-center gap-1 text-xs text-red-600 transition-colors hover:text-red-700 dark:text-red-400"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Remover
                  </button>
                </div>
                {folderChannels.length === 0 ? (
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Nenhum canal nesta pasta
                  </p>
                ) : (
                  <div className="space-y-2">
                    {folderChannels.map((channel) => (
                      <div
                        key={channel.id}
                        className="flex items-center gap-2 rounded bg-white p-2 dark:bg-gray-900"
                      >
                        {channel.thumbnail && (
                          <img
                            src={channel.thumbnail}
                            alt={channel.name}
                            className="h-8 w-8 rounded-full"
                          />
                        )}
                        <span className="flex-1 text-sm text-gray-900 dark:text-gray-100">
                          {channel.name}
                        </span>
                        <button
                          onClick={() => moveChannelToFolder(channel.id, undefined)}
                          className="flex items-center gap-1 text-xs text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-400"
                          title="Mover para raiz"
                        >
                          <Move className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => removeChannel(channel.id)}
                          className="flex items-center gap-1 text-xs text-red-600 transition-colors hover:text-red-700 dark:text-red-400"
                          title="Remover canal"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          {rootChannels.length > 0 && (
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800">
              <div className="mb-2 flex items-center gap-2">
                <FolderIcon className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                <h3 className="font-medium text-gray-900 dark:text-gray-100">
                  Raiz
                </h3>
              </div>
              <div className="space-y-2">
                {rootChannels.map((channel) => (
                  <div
                    key={channel.id}
                    className="flex items-center gap-2 rounded bg-white p-2 dark:bg-gray-900"
                  >
                    {channel.thumbnail && (
                      <img
                        src={channel.thumbnail}
                        alt={channel.name}
                        className="h-8 w-8 rounded-full"
                      />
                    )}
                    <span className="flex-1 text-sm text-gray-900 dark:text-gray-100">
                      {channel.name}
                    </span>
                    {folders.length > 0 && (
                      <select
                        value=""
                        onChange={(e) => moveChannelToFolder(channel.id, e.target.value || undefined)}
                        className="mr-2 rounded border border-gray-300 bg-white px-2 py-1 text-xs dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                      >
                        <option value="">Mover para...</option>
                        {folders.map((folder) => (
                          <option key={folder.id} value={folder.id}>
                            {folder.name}
                          </option>
                        ))}
                      </select>
                    )}
                    <button
                      onClick={() => removeChannel(channel.id)}
                      className="flex items-center gap-1 text-xs text-red-600 transition-colors hover:text-red-700 dark:text-red-400"
                      title="Remover canal"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {channels.length === 0 && (
            <p className="text-center text-sm text-gray-500 dark:text-gray-400">
              Nenhum canal adicionado ainda
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

