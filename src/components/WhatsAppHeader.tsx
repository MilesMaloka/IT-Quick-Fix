import React from 'react';
import { 
  Bot, 
  CheckCircle2, 
  MoreVertical, 
  Search, 
  Phone, 
  Video, 
  Info, 
  Trash2, 
  Smartphone, 
  Monitor,
  Sparkles
} from 'lucide-react';

interface WhatsAppHeaderProps {
  isTyping: boolean;
  statusText?: string;
  onClearChat: () => void;
  onOpenInfo: () => void;
  isMobileView: boolean;
  onToggleMobileView: () => void;
  activeContact: {
    name: string;
    avatarBg: string;
    initials: string;
    isBot?: boolean;
    status: string;
    isOnline: boolean;
  };
}

export const WhatsAppHeader: React.FC<WhatsAppHeaderProps> = ({
  isTyping,
  statusText,
  onClearChat,
  onOpenInfo,
  isMobileView,
  onToggleMobileView,
  activeContact,
}) => {
  const [showMenu, setShowMenu] = React.useState(false);

  return (
    <header
      id="whatsapp-header"
      className="relative flex items-center justify-between px-3.5 sm:px-4 py-2.5 bg-[#F0F2F5] border-b border-gray-300 z-20 select-none text-gray-800 shadow-2xs"
    >
      {/* Left: Avatar + Details */}
      <div 
        className="flex items-center gap-3 cursor-pointer group"
        onClick={onOpenInfo}
        title={activeContact.isBot ? "View Business Profile" : "View Contact Info"}
      >
        <div className="relative">
          <div className={`w-10 h-10 rounded-full ${activeContact.avatarBg} flex items-center justify-center text-white font-bold shadow-xs ring-1 ring-emerald-500/20`}>
            {activeContact.isBot ? <Bot className="w-5 h-5 text-white" /> : activeContact.initials}
          </div>
          {activeContact.isOnline && (
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-[#00a884] rounded-full ring-2 ring-[#F0F2F5]" />
          )}
        </div>

        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <h1 className="text-[15px] font-semibold text-gray-900 tracking-tight group-hover:text-[#00a884] transition-colors">
              {activeContact.name}
            </h1>
            {activeContact.isBot && (
              <span title="Verified Business Account" className="inline-flex text-[#00a884]">
                <CheckCircle2 className="w-4 h-4 fill-[#00a884] text-white" />
              </span>
            )}
          </div>
          <p className="text-[12px] text-gray-500 flex items-center gap-1">
            {isTyping && activeContact.isBot ? (
              <span className="text-[#00a884] font-medium flex items-center gap-1 animate-pulse">
                <Sparkles className="w-3 h-3 animate-spin text-[#00a884]" />
                {statusText || "typing quick fix..."}
              </span>
            ) : (
              <span>{activeContact.status}</span>
            )}
          </p>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-1 sm:gap-1.5 text-gray-600">
        {/* Toggle Device View (Mobile / Desktop) */}
        <button
          type="button"
          onClick={onToggleMobileView}
          title={isMobileView ? "Switch to Full WhatsApp Web View" : "Switch to Mobile Phone Simulation"}
          className="p-2 rounded-full hover:bg-gray-200/80 text-gray-600 hover:text-gray-900 transition-colors cursor-pointer"
        >
          {isMobileView ? <Monitor className="w-4 h-4" /> : <Smartphone className="w-4 h-4" />}
        </button>

        {/* Video Call Simulation */}
        <button
          type="button"
          onClick={onOpenInfo}
          title="Simulated Support Line"
          className="p-2 rounded-full hover:bg-gray-200/80 text-gray-600 hover:text-gray-900 transition-colors cursor-pointer hidden sm:block"
        >
          <Video className="w-4 h-4" />
        </button>

        {/* Audio Call Simulation */}
        <button
          type="button"
          onClick={onOpenInfo}
          title="Simulated Audio Help"
          className="p-2 rounded-full hover:bg-gray-200/80 text-gray-600 hover:text-gray-900 transition-colors cursor-pointer hidden sm:block"
        >
          <Phone className="w-4 h-4" />
        </button>

        {/* Info button */}
        <button
          type="button"
          onClick={onOpenInfo}
          title="Bot Details & Guidelines"
          className="p-2 rounded-full hover:bg-gray-200/80 text-gray-600 hover:text-gray-900 transition-colors cursor-pointer"
        >
          <Info className="w-4 h-4" />
        </button>

        {/* Menu Toggle */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowMenu(!showMenu)}
            title="More Options"
            className="p-2 rounded-full hover:bg-gray-200/80 text-gray-600 hover:text-gray-900 transition-colors cursor-pointer"
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {showMenu && (
            <>
              <div 
                className="fixed inset-0 z-30" 
                onClick={() => setShowMenu(false)} 
              />
              <div className="absolute right-0 top-full mt-1 w-52 rounded-xl bg-white shadow-xl border border-gray-200 py-1.5 z-40 text-[13.5px] text-gray-700">
                <button
                  type="button"
                  onClick={() => {
                    setShowMenu(false);
                    onOpenInfo();
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2.5 transition-colors cursor-pointer"
                >
                  <Info className="w-4 h-4 text-[#00a884]" />
                  <span>Business Info</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowMenu(false);
                    onToggleMobileView();
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2.5 transition-colors cursor-pointer"
                >
                  {isMobileView ? <Monitor className="w-4 h-4 text-[#027eb5]" /> : <Smartphone className="w-4 h-4 text-[#027eb5]" />}
                  <span>{isMobileView ? 'Full Web View' : 'Phone Bezel View'}</span>
                </button>
                <div className="h-px bg-gray-100 my-1" />
                <button
                  type="button"
                  onClick={() => {
                    setShowMenu(false);
                    onClearChat();
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-red-50 text-red-600 flex items-center gap-2.5 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Clear Conversation</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
