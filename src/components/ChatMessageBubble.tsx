import React, { useState } from 'react';
import { CheckCheck, Copy, Check, Search, ExternalLink, X, AlertTriangle, Video } from 'lucide-react';
import { Message } from '../types';
import { formatWhatsAppMessage, extractYouTubeDetails } from '../utils/whatsappFormatter';
import { YouTubeCard } from './YouTubeCard';

interface ChatMessageBubbleProps {
  message: Message;
  isLatestBotMessage?: boolean;
  onQuickReply?: (reply: string) => void;
  onPlayVideo?: (videoId: string, title: string) => void;
}

export const ChatMessageBubble: React.FC<ChatMessageBubbleProps> = ({
  message,
  isLatestBotMessage,
  onQuickReply,
  onPlayVideo,
}) => {
  const [copied, setCopied] = useState(false);
  const [showGrounding, setShowGrounding] = useState(false);

  const isUser = message.sender === 'user';
  const youtubeDetails = !isUser
    ? message.extractedYouTube || extractYouTubeDetails(message.text)
    : null;

  const handleCopy = () => {
    navigator.clipboard.writeText(message.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      id={`message-${message.id}`}
      className={`flex flex-col mb-3 group ${isUser ? 'items-end' : 'items-start'}`}
    >
      <div
        className={`relative max-w-[92%] sm:max-w-[82%] md:max-w-[74%] rounded-xl px-3.5 py-2.5 text-[14px] leading-relaxed shadow-xs transition-all ${
          isUser
            ? 'bg-white text-gray-800 rounded-tr-none border border-gray-200/80'
            : 'bg-[#DCF8C6] text-gray-900 rounded-tl-none border-l-4 border-[#00A884] shadow-xs'
        }`}
      >
        {/* Copy button on hover */}
        <button
          type="button"
          onClick={handleCopy}
          title="Copy message"
          className="absolute top-2 right-2 p-1 rounded-md bg-white/80 hover:bg-white text-gray-500 hover:text-gray-900 border border-gray-200 opacity-0 group-hover:opacity-100 transition-opacity z-10 cursor-pointer shadow-2xs"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-[#00A884]" /> : <Copy className="w-3.5 h-3.5" />}
        </button>

        {/* Sender badge for bot */}
        {!isUser && (
          <div className="flex items-center gap-1.5 pb-1 mb-1 border-b border-black/5 text-[11px] font-semibold text-[#008069]">
            <span>IT QuickFix Bot</span>
            <span className="text-[10px] bg-[#00A884]/15 text-[#008069] px-1.5 py-0.2 rounded font-medium">
              Verified Technician
            </span>
          </div>
        )}

        {/* Formatted Text Content */}
        <div className="break-words space-y-1 text-gray-900">
          {formatWhatsAppMessage(message.text, onPlayVideo)}
        </div>

        {/* YouTube Card Preview if present */}
        {youtubeDetails && (
          <YouTubeCard
            title={youtubeDetails.title}
            url={youtubeDetails.url}
            videoId={youtubeDetails.videoId}
            onPlay={onPlayVideo}
          />
        )}

        {/* Grounding Source Info Pill (for bot responses grounded in search) */}
        {!isUser && message.searchQueries && message.searchQueries.length > 0 && (
          <div className="mt-2 pt-1.5 border-t border-black/5 text-[11px]">
            <button
              type="button"
              onClick={() => setShowGrounding(!showGrounding)}
              className="inline-flex items-center gap-1 text-gray-600 hover:text-[#00A884] transition-colors cursor-pointer font-medium"
            >
              <Search className="w-3 h-3 text-[#00A884]" />
              <span>{showGrounding ? 'Hide search source' : 'Grounding sources verified'}</span>
            </button>

            {showGrounding && (
              <div className="mt-1.5 p-2 rounded-lg bg-white/70 border border-black/5 space-y-1.5 text-[11px] text-gray-600 shadow-2xs">
                <div>
                  <span className="font-semibold text-gray-800">Search Query: </span>
                  <code className="text-[10.5px] bg-black/5 px-1 py-0.5 rounded text-gray-900 font-medium">
                    {message.searchQueries.join(', ')}
                  </code>
                </div>
                {message.groundingChunks && message.groundingChunks.length > 0 && (
                  <div className="space-y-1 mt-1">
                    <span className="font-semibold text-gray-800">Referenced Sources:</span>
                    <ul className="space-y-0.5 max-h-24 overflow-y-auto pr-1">
                      {message.groundingChunks.map((chunk, idx) => (
                        <li key={idx} className="truncate">
                          {chunk.web?.uri ? (
                            <a
                              href={chunk.web.uri}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[#027eb5] hover:underline inline-flex items-center gap-1 font-medium"
                            >
                              <ExternalLink className="w-2.5 h-2.5 inline" />
                              <span>{chunk.web.title || chunk.web.uri}</span>
                            </a>
                          ) : null}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Timestamp & Read ticks */}
        <div className="flex items-center justify-end gap-1 mt-1 text-[10.5px] text-gray-500 select-none">
          <span>{message.timestamp}</span>
          {isUser ? (
            <CheckCheck className="w-3.5 h-3.5 text-blue-500" />
          ) : (
            <CheckCheck className="w-3.5 h-3.5 text-blue-500" />
          )}
        </div>
      </div>

      {/* Suggested Quick Reply Chips for Latest Bot Message */}
      {!isUser && isLatestBotMessage && onQuickReply && (
        <div className="flex flex-wrap gap-1.5 mt-2 ml-1 max-w-[85%]">
          <button
            type="button"
            onClick={() => onQuickReply("Yes, this resolved the problem! Thank you.")}
            className="inline-flex items-center gap-1.5 text-[12px] px-3 py-1 rounded-full bg-white hover:bg-emerald-50 border border-emerald-300 text-emerald-700 font-medium transition-colors shadow-2xs cursor-pointer"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Yes, it worked!</span>
          </button>
          <button
            type="button"
            onClick={() => onQuickReply("That didn't resolve the problem, let's try an alternative fix.")}
            className="inline-flex items-center gap-1.5 text-[12px] px-3 py-1 rounded-full bg-white hover:bg-amber-50 border border-amber-300 text-amber-800 font-medium transition-colors shadow-2xs cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
            <span>Didn't work, next fix</span>
          </button>
          <button
            type="button"
            onClick={() => onQuickReply("I encountered an error message during the step.")}
            className="inline-flex items-center gap-1.5 text-[12px] px-3 py-1 rounded-full bg-white hover:bg-red-50 border border-red-300 text-red-700 font-medium transition-colors shadow-2xs cursor-pointer"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Got an error message</span>
          </button>
          <button
            type="button"
            onClick={() => onQuickReply("Can you provide another video tutorial for this?")}
            className="inline-flex items-center gap-1.5 text-[12px] px-3 py-1 rounded-full bg-white hover:bg-sky-50 border border-sky-300 text-[#027eb5] font-medium transition-colors shadow-2xs cursor-pointer"
          >
            <Video className="w-3.5 h-3.5" />
            <span>Find another video</span>
          </button>
        </div>
      )}
    </div>
  );
};
