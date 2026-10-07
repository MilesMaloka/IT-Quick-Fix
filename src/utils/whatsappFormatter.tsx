import React from 'react';
import { Play } from 'lucide-react';

/**
 * Extracts YouTube Video ID from common YouTube URL formats:
 * - https://www.youtube.com/watch?v=VIDEO_ID
 * - https://youtu.be/VIDEO_ID
 * - https://www.youtube.com/embed/VIDEO_ID
 * - https://youtube.com/shorts/VIDEO_ID
 */
export function extractYouTubeVideoId(url: string): string | null {
  if (!url) return null;
  const regExp = /(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?|shorts)\/|.*[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
  const match = url.match(regExp);
  return match ? match[1] : null;
}

/**
 * Extracts YouTube tutorial title and URL from text matching pattern:
 * [Title](URL) or plain URL
 */
export function extractYouTubeDetails(text: string): { title: string; url: string; videoId?: string } | null {
  // Try markdown link syntax: [Title](URL)
  const markdownRegex = /\[(.*?)\]\((https?:\/\/(?:www\.)?(?:youtube\.com|youtu\.be)\/[^\s\)]+)\)/i;
  const mdMatch = text.match(markdownRegex);
  if (mdMatch) {
    const title = mdMatch[1].trim();
    const url = mdMatch[2].trim();
    const videoId = extractYouTubeVideoId(url) || undefined;
    return { title, url, videoId };
  }

  // Fallback: search for direct youtube link in text
  const urlRegex = /(https?:\/\/(?:www\.)?(?:youtube\.com\/watch\?v=[a-zA-Z0-9_-]+|youtu\.be\/[a-zA-Z0-9_-]+)[^\s]*)/i;
  const urlMatch = text.match(urlRegex);
  if (urlMatch) {
    const url = urlMatch[1].replace(/[.,;:!?)]+$/, '');
    const videoId = extractYouTubeVideoId(url) || undefined;
    return {
      title: 'YouTube Video Tutorial',
      url,
      videoId,
    };
  }

  return null;
}

/**
 * Parses WhatsApp text formatting into React nodes:
 * - *bold*
 * - _italics_
 * - ~strike~
 * - `code`
 * - Markdown links [text](url)
 * - Plain URLs
 */
export function formatWhatsAppMessage(text: string, onPlayVideo?: (videoId: string, title: string) => void): React.ReactNode[] {
  if (!text) return [];

  const cleanText = text
    .replace(/\p{Extended_Pictographic}/gu, '')
    .replace(/[\u{FE00}-\u{FE0F}🎥🛠️🔄✅❌⚠️📶💻🖨️🔊⚡⌨️🖱️]/gu, '');

  const lines = cleanText.split('\n');

  return lines.map((line, lineIdx) => {
    // Process single line formatting
    const formattedLine = parseLineFormatting(line, onPlayVideo);
    return (
      <React.Fragment key={lineIdx}>
        {formattedLine}
        {lineIdx < lines.length - 1 && <br />}
      </React.Fragment>
    );
  });
}

function parseLineFormatting(line: string, onPlayVideo?: (videoId: string, title: string) => void): React.ReactNode[] {
  // Regex to match formatting tokens
  // 1. Markdown link: [text](url)
  // 2. Code block: `code`
  // 3. Bold: *text* (bounded by non-alphanumeric or space)
  // 4. Italics: _text_
  // 5. Strike: ~text~
  // 6. Direct URL: https?://...

  const tokenRegex = /(\[(?:[^\]]+)\]\((?:https?:\/\/[^\s\)]+)\)|`[^`]+`|\*[^*\n]+\*|_[^_\n]+_|~[^~\n]+~|https?:\/\/[^\s]+)/g;

  const parts = line.split(tokenRegex);
  return parts.map((part, idx) => {
    if (!part) return null;

    // 1. Markdown link [Title](URL)
    const linkMatch = part.match(/^\[([^\]]+)\]\((https?:\/\/[^\s\)]+)\)$/);
    if (linkMatch) {
      const title = linkMatch[1];
      const url = linkMatch[2];
      const videoId = extractYouTubeVideoId(url);

      if (videoId && onPlayVideo) {
        return (
          <button
            key={idx}
            type="button"
            onClick={(e) => {
              e.preventDefault();
              onPlayVideo(videoId, title);
            }}
            className="inline-flex items-center gap-1.5 text-[#027eb5] hover:text-[#015d86] underline font-medium cursor-pointer transition-colors"
          >
            <span>{title}</span>
            <span className="text-xs bg-[#027eb5]/10 px-1.5 py-0.5 rounded text-[#027eb5] font-semibold inline-flex items-center gap-1">
              <Play className="w-2.5 h-2.5 fill-current" />
              <span>Play</span>
            </span>
          </button>
        );
      }

      return (
        <a
          key={idx}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#027eb5] hover:text-[#015d86] underline break-all font-medium transition-colors"
        >
          {title}
        </a>
      );
    }

    // 2. Inline Code `cmd`
    if (part.startsWith('`') && part.endsWith('`') && part.length >= 2) {
      const code = part.slice(1, -1);
      return (
        <code
          key={idx}
          className="bg-black/5 text-gray-900 px-1.5 py-0.5 rounded font-mono text-[0.88em] border border-gray-300 font-medium"
        >
          {code}
        </code>
      );
    }

    // 3. Bold *text*
    if (part.startsWith('*') && part.endsWith('*') && part.length >= 2) {
      const content = part.slice(1, -1);
      return (
        <strong key={idx} className="font-semibold text-gray-900">
          {content}
        </strong>
      );
    }

    // 4. Italics _text_
    if (part.startsWith('_') && part.endsWith('_') && part.length >= 2) {
      const content = part.slice(1, -1);
      return (
        <em key={idx} className="italic text-gray-700">
          {content}
        </em>
      );
    }

    // 5. Strike ~text~
    if (part.startsWith('~') && part.endsWith('~') && part.length >= 2) {
      const content = part.slice(1, -1);
      return (
        <span key={idx} className="line-through text-gray-400">
          {content}
        </span>
      );
    }

    // 6. Plain URL
    if (part.match(/^https?:\/\//)) {
      const cleanUrl = part.replace(/[.,;:!?)]+$/, '');
      const trailing = part.slice(cleanUrl.length);
      const videoId = extractYouTubeVideoId(cleanUrl);

      return (
        <React.Fragment key={idx}>
          {videoId && onPlayVideo ? (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                onPlayVideo(videoId, 'YouTube Tutorial');
              }}
              className="text-[#027eb5] hover:text-[#015d86] underline break-all font-medium inline-flex items-center gap-1 cursor-pointer"
            >
              <span>{cleanUrl}</span>
              <span className="text-[10px] bg-[#027eb5]/10 p-0.5 rounded text-[#027eb5] inline-flex items-center">
                <Play className="w-2.5 h-2.5 fill-current" />
              </span>
            </button>
          ) : (
            <a
              href={cleanUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#027eb5] hover:text-[#015d86] underline break-all font-medium"
            >
              {cleanUrl}
            </a>
          )}
          {trailing}
        </React.Fragment>
      );
    }

    return <span key={idx}>{part}</span>;
  });
}
