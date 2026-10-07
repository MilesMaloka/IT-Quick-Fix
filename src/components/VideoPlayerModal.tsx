import React from 'react';
import { X, ExternalLink, Youtube } from 'lucide-react';

interface VideoPlayerModalProps {
  videoId: string | null;
  videoTitle: string;
  onClose: () => void;
}

export const VideoPlayerModal: React.FC<VideoPlayerModalProps> = ({ videoId, videoTitle, onClose }) => {
  if (!videoId) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-2xl rounded-2xl bg-white border border-gray-200 shadow-2xl overflow-hidden text-gray-800 flex flex-col"
      >
        {/* Header */}
        <div className="p-3.5 bg-[#F0F2F5] border-b border-gray-300 flex items-center justify-between">
          <div className="flex items-center gap-2 max-w-[80%]">
            <Youtube className="w-5 h-5 text-red-600 shrink-0" />
            <h3 className="text-[13.5px] font-semibold text-gray-900 truncate">
              {videoTitle || 'Recommended Video Tutorial'}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-full text-gray-500 hover:text-gray-900 hover:bg-gray-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Video Embed Frame */}
        <div className="relative aspect-video w-full bg-black">
          <iframe
            src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`}
            title={videoTitle}
            className="w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>

        {/* Footer info & link */}
        <div className="p-3 bg-[#F0F2F5] border-t border-gray-300 flex items-center justify-between text-xs text-gray-600">
          <span>Verified YouTube IT Troubleshooting Tutorial</span>
          <a
            href={`https://www.youtube.com/watch?v=${videoId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-[#027eb5] hover:text-[#015d86] hover:underline font-semibold"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Open in YouTube App</span>
          </a>
        </div>
      </div>
    </div>
  );
};
