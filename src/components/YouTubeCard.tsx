import React, { useState } from 'react';
import { Play, ExternalLink, Youtube, ShieldCheck } from 'lucide-react';

interface YouTubeCardProps {
  title: string;
  url: string;
  videoId?: string;
  onPlay?: (videoId: string, title: string) => void;
}

export const YouTubeCard: React.FC<YouTubeCardProps> = ({ title, url, videoId, onPlay }) => {
  const [thumbError, setThumbError] = useState(false);

  const thumbUrl = videoId && !thumbError
    ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
    : null;

  return (
    <div
      id={`youtube-card-${videoId || 'generic'}`}
      className="mt-2.5 rounded-xl overflow-hidden border border-emerald-400/40 bg-white shadow-xs transition-all hover:border-emerald-500 hover:shadow-sm"
    >
      {/* Video Header badge */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-emerald-50/80 border-b border-emerald-100 text-[11px] text-gray-600">
        <div className="flex items-center gap-1.5 font-semibold text-[#008069]">
          <Youtube className="w-3.5 h-3.5 text-red-600" />
          <span>Recommended Video Tutorial</span>
        </div>
        <div className="flex items-center gap-1 text-[10px] text-gray-500">
          <ShieldCheck className="w-3 h-3 text-[#008069]" />
          <span>Verified Search</span>
        </div>
      </div>

      {/* Media Thumbnail or Banner */}
      {videoId ? (
        <div
          className="relative aspect-video w-full bg-black/80 overflow-hidden cursor-pointer group"
          onClick={() => onPlay?.(videoId, title)}
        >
          {thumbUrl ? (
            <img
              src={thumbUrl}
              alt={title}
              onError={() => setThumbError(true)}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-900 text-gray-400">
              <Youtube className="w-12 h-12 text-red-500/80" />
            </div>
          )}

          {/* Dark gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

          {/* Central Play Button */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-red-600/95 text-white flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:bg-red-500 transition-all duration-200">
              <Play className="w-5 h-5 fill-white ml-0.5" />
            </div>
          </div>

          <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between pointer-events-none">
            <span className="text-[11px] font-medium text-white/95 truncate bg-black/60 px-2 py-0.5 rounded backdrop-blur-xs">
              Click to preview tutorial
            </span>
          </div>
        </div>
      ) : null}

      {/* Info & External Link Bar */}
      <div className="p-3 bg-white">
        <h4 className="text-[13px] font-semibold text-gray-900 line-clamp-2 leading-snug">
          {title || "Step-by-Step IT Troubleshooting Video"}
        </h4>

        <div className="mt-2.5 flex items-center gap-2 pt-2 border-t border-gray-100">
          {videoId && onPlay && (
            <button
              type="button"
              onClick={() => onPlay(videoId, title)}
              className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-lg bg-[#00A884] hover:bg-[#018b6d] text-white text-[12px] font-medium transition-colors cursor-pointer shadow-2xs"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Watch Here</span>
            </button>
          )}

          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-[#008069] text-[12px] font-medium transition-colors border border-gray-200"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Open YouTube</span>
          </a>
        </div>
      </div>
    </div>
  );
};
