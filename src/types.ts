export interface Message {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
  status: 'sent' | 'delivered' | 'read';
  groundingChunks?: Array<{
    web?: {
      uri: string;
      title: string;
    };
  }>;
  searchQueries?: string[];
  extractedYouTube?: {
    title: string;
    url: string;
    videoId?: string;
  } | null;
}

export interface PresetIssue {
  label: string;
  icon: string;
  prompt: string;
  category: string;
}
