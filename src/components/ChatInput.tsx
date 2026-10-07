import React, { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, Mic, Image, FileText, MonitorCheck } from 'lucide-react';

interface ChatInputProps {
  onSendMessage: (text: string) => void;
  disabled?: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, disabled }) => {
  const [text, setText] = useState('');
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [text]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!text.trim() || disabled) return;

    onSendMessage(text.trim());
    setText('');
    setShowAttachmentMenu(false);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const sampleAttachments = [
    {
      title: 'Windows BSOD Code',
      icon: <MonitorCheck className="w-4 h-4 text-blue-400" />,
      text: 'Error Code: CRITICAL_PROCESS_DIED. Windows 11 restart loop.',
    },
    {
      title: 'Network Diagnostic',
      icon: <FileText className="w-4 h-4 text-emerald-400" />,
      text: 'ipconfig /all shows Default Gateway 0.0.0.0 and 169.254.x.x APIPA address.',
    },
    {
      title: 'Printer Error Log',
      icon: <Image className="w-4 h-4 text-amber-400" />,
      text: 'Printer status: 0x0000011b network printing error after cumulative update.',
    },
  ];

  return (
    <div id="chat-input-container" className="relative p-2.5 sm:px-4 bg-[#F0F2F5] border-t border-gray-300/80 z-20">
      {/* Attachment popover */}
      {showAttachmentMenu && (
        <>
          <div className="fixed inset-0 z-20" onClick={() => setShowAttachmentMenu(false)} />
          <div className="absolute bottom-full left-4 mb-2 p-2 rounded-xl bg-white border border-gray-200 shadow-xl z-30 w-72 space-y-1 text-sm text-gray-800 animate-in fade-in zoom-in-95 duration-150">
            <div className="text-[11px] font-semibold text-gray-500 px-2 py-1 uppercase tracking-wider">
              Insert Diagnostic Sample
            </div>
            {sampleAttachments.map((item, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setText(item.text);
                  setShowAttachmentMenu(false);
                  textareaRef.current?.focus();
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors text-left cursor-pointer"
              >
                {item.icon}
                <div className="flex flex-col">
                  <span className="font-semibold text-[13px] text-gray-800">{item.title}</span>
                  <span className="text-[11px] text-gray-500 truncate">{item.text}</span>
                </div>
              </button>
            ))}
          </div>
        </>
      )}

      {/* Input controls form */}
      <form onSubmit={handleSubmit} className="flex items-end gap-2 max-w-4xl mx-auto">
        {/* Left Icons */}
        <div className="flex items-center gap-1 text-gray-500 pb-1.5">
          <button
            type="button"
            onClick={() => setShowAttachmentMenu(!showAttachmentMenu)}
            title="Attach Diagnostic Sample"
            className="p-1.5 rounded-full hover:bg-gray-200/80 hover:text-gray-800 transition-colors cursor-pointer"
          >
            <Paperclip className="w-5 h-5" />
          </button>
        </div>

        {/* Text Field Capsule */}
        <div className="flex-1 bg-white rounded-2xl px-3.5 py-1.5 flex items-center border border-gray-300 shadow-2xs focus-within:border-[#00A884] focus-within:ring-1 focus-within:ring-[#00A884]/30 transition-all">
          <textarea
            ref={textareaRef}
            rows={1}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            placeholder="Type your tech issue (e.g. Printer offline, WiFi no internet)..."
            className="w-full bg-transparent resize-none text-[14.5px] text-gray-800 placeholder-gray-400 focus:outline-none max-h-28 overflow-y-auto leading-relaxed"
          />
        </div>

        {/* Right Button: Send or Voice */}
        <div className="pb-0.5">
          {text.trim() ? (
            <button
              type="submit"
              disabled={disabled}
              title="Send Message (Enter)"
              className="w-10 h-10 rounded-full bg-[#00A884] hover:bg-[#018b6d] active:scale-95 text-white flex items-center justify-center shadow-md transition-all disabled:opacity-50 cursor-pointer"
            >
              <Send className="w-4 h-4 ml-0.5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                setText("My laptop screen is flickering black intermittently.");
                textareaRef.current?.focus();
              }}
              title="Quick voice sample prompt"
              className="w-10 h-10 rounded-full bg-white hover:bg-gray-100 text-gray-500 hover:text-gray-800 border border-gray-300 flex items-center justify-center shadow-2xs transition-colors cursor-pointer"
            >
              <Mic className="w-5 h-5" />
            </button>
          )}
        </div>
      </form>
    </div>
  );
};
