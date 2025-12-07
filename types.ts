export type MessageType = 'text' | 'voice' | 'image' | 'location';

export interface Message {
  id: string;
  text: string; // Used for text content or fallback/descriptions
  mediaUrl?: string; // Used for blob URLs (audio/image)
  type: MessageType;
  senderId: 'user' | 'blade' | 'head';
  timestamp: number;
  expiresAt: number; // The timestamp when the message will be deleted
}

export interface UserProfile {
  id: 'user' | 'blade' | 'head';
  name: string;
  avatarChar: string; // The single character displayed in the avatar (e.g., '刀')
  color: string; // Tailwind color class for background
}

export enum Tab {
  FEED = 'FEED',
  CHAT = 'CHAT',
  PROFILE = 'PROFILE', // Kept for Discover
  CONTACTS = 'CONTACTS'
}