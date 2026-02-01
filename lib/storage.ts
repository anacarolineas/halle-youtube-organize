import { Channel, Folder } from './types';

const CHANNELS_KEY = 'youtube_channels';
const FOLDERS_KEY = 'youtube_folders';

export const storage = {
  // Channels
  getChannels(): Channel[] {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(CHANNELS_KEY);
    return data ? JSON.parse(data) : [];
  },

  saveChannels(channels: Channel[]): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(CHANNELS_KEY, JSON.stringify(channels));
  },

  addChannel(channel: Channel): void {
    const channels = this.getChannels();
    if (!channels.find(c => c.id === channel.id)) {
      channels.push(channel);
      this.saveChannels(channels);
    }
  },

  removeChannel(channelId: string): void {
    const channels = this.getChannels();
    this.saveChannels(channels.filter(c => c.id !== channelId));
  },

  updateChannel(channelId: string, updates: Partial<Channel>): void {
    const channels = this.getChannels();
    const index = channels.findIndex(c => c.id === channelId);
    if (index !== -1) {
      channels[index] = { ...channels[index], ...updates };
      this.saveChannels(channels);
    }
  },

  // Folders
  getFolders(): Folder[] {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(FOLDERS_KEY);
    return data ? JSON.parse(data) : [];
  },

  saveFolders(folders: Folder[]): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(FOLDERS_KEY, JSON.stringify(folders));
  },

  addFolder(folder: Folder): void {
    const folders = this.getFolders();
    if (!folders.find(f => f.id === folder.id)) {
      folders.push(folder);
      this.saveFolders(folders);
    }
  },

  removeFolder(folderId: string): void {
    const folders = this.getFolders();
    // Remove folder and move its channels to root
    const channels = this.getChannels();
    channels.forEach(channel => {
      if (channel.folderId === folderId) {
        channel.folderId = undefined;
      }
    });
    this.saveChannels(channels);
    this.saveFolders(folders.filter(f => f.id !== folderId));
  },
};

