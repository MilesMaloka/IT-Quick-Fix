import React from 'react';
import { Bot, CheckCircle2, ShieldAlert, Sparkles, Youtube, X, HelpCircle, Terminal } from 'lucide-react';

interface BotInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BotInfoModal: React.FC<BotInfoModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div 
        className="relative w-full max-w-md rounded-2xl bg-white border border-gray-200 shadow-2xl overflow-hidden text-gray-800 animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Modal Header */}
        <div className="p-4 bg-[#00A884] text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-white font-bold">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-[15px] font-semibold flex items-center gap-1.5">
                <span>IT QuickFix Bot</span>
                <CheckCircle2 className="w-4 h-4 fill-white text-[#00A884]" />
              </h3>
              <p className="text-[11px] text-white/80">WhatsApp Official IT Support Profile</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4 text-[13px] leading-relaxed max-h-[75vh] overflow-y-auto bg-[#F0F2F5]">
          {/* Mission */}
          <div className="p-3.5 rounded-xl bg-white border border-gray-200 shadow-2xs space-y-1.5">
            <h4 className="font-semibold text-[#008069] flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" />
              Role & Purpose
            </h4>
            <p className="text-gray-700">
              An automated, friendly, and practical IT support technician communicating with users in native WhatsApp format. Diagnoses tech issues, provides concise 3-step troubleshooting sequences, and shares real, verified YouTube tutorials.
            </p>
          </div>

          {/* Core Layout Structure */}
          <div className="p-3.5 rounded-xl bg-white border border-gray-200 shadow-2xs space-y-2">
            <h4 className="font-semibold text-gray-900 flex items-center gap-1.5">
              <Terminal className="w-4 h-4 text-[#027eb5]" />
              Standard Response Layout
            </h4>
            <div className="p-2.5 rounded-lg bg-gray-50 border border-gray-200 font-mono text-[11px] text-gray-600 space-y-1">
              <p className="text-[#008069] font-bold">*Problem Diagnosis:*</p>
              <p>1-2 concise sentences identifying the root cause.</p>
              <p className="text-[#008069] font-bold mt-1">*Quick Fix Steps:*</p>
              <p>1. [First simple action]</p>
              <p>2. [Second specific key combo or menu path]</p>
              <p>3. [Verification or restart step]</p>
              <p className="text-[#008069] font-bold mt-1">*Recommended Video Tutorial:*</p>
              <p>[Exact Video Title](Full verified YouTube URL)</p>
              <p className="text-[#008069] font-bold mt-1">*Next Step:*</p>
              <p>Did this resolve the problem, or should we try an alternative fix?</p>
            </div>
          </div>

          {/* Grounding & YouTube verification rules */}
          <div className="p-3.5 rounded-xl bg-white border border-gray-200 shadow-2xs space-y-1.5">
            <h4 className="font-semibold text-gray-900 flex items-center gap-1.5">
              <Youtube className="w-4 h-4 text-red-600" />
              Google Search Grounding & YouTube Videos
            </h4>
            <p className="text-gray-600">
              Every YouTube tutorial is strictly retrieved via live Google Search grounding. The bot never hallucinates fake URLs. If no active video is confirmed, it explicitly notifies you to follow the numbered steps.
            </p>
          </div>

          {/* WhatsApp constraints */}
          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-[12px] space-y-1">
            <div className="font-semibold flex items-center gap-1.5 text-amber-800">
              <ShieldAlert className="w-3.5 h-3.5" />
              WhatsApp Optimization
            </div>
            <p>
              Under 180 words, high scannability, no filler greetings. Uses WhatsApp formatting with <code className="bg-amber-100 px-1 py-0.5 rounded">*bold*</code>, <code className="bg-amber-100 px-1 py-0.5 rounded">_italics_</code>, and <code className="bg-amber-100 px-1 py-0.5 rounded">`commands`</code>.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-white border-t border-gray-200 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-[#00A884] hover:bg-[#018b6d] text-white font-medium text-xs transition-colors cursor-pointer shadow-xs"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
