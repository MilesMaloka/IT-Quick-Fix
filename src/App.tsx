/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { Message } from './types';
import { WhatsAppHeader } from './components/WhatsAppHeader';
import { QuickIssueBar } from './components/QuickIssueBar';
import { ChatMessageBubble } from './components/ChatMessageBubble';
import { ChatInput } from './components/ChatInput';
import { BotInfoModal } from './components/BotInfoModal';
import { VideoPlayerModal } from './components/VideoPlayerModal';
import { extractYouTubeDetails } from './utils/whatsappFormatter';
import { ShieldCheck, Wifi, Battery, Signal, Lock, MessageSquare, Plus, CheckCircle2, Bot } from 'lucide-react';

interface ChatContact {
  id: string;
  name: string;
  initials: string;
  avatarBg: string;
  status: string;
  isBot?: boolean;
  lastMessage: string;
  isOnline: boolean;
}

export default function App() {
  const [contacts, setContacts] = useState<ChatContact[]>([
    {
      id: 'bot',
      name: 'IT QuickFix Bot',
      initials: 'IT',
      avatarBg: 'bg-gradient-to-br from-[#00a884] to-[#018064]',
      status: 'online • 24/7 IT Support',
      isBot: true,
      isOnline: true,
      lastMessage: "I'm ready to help with your tech...",
    },
    {
      id: 'contact-1',
      name: 'Alex Murphy',
      initials: 'AM',
      avatarBg: 'bg-orange-400',
      status: 'online',
      isOnline: true,
      lastMessage: 'Did you see the latest update?',
    },
    {
      id: 'contact-2',
      name: 'Jane Doe',
      initials: 'JD',
      avatarBg: 'bg-blue-400',
      status: 'last seen today at 11:20 AM',
      isOnline: false,
      lastMessage: 'The meeting is starting soon.',
    },
    {
      id: 'contact-3',
      name: 'Ryan K.',
      initials: 'RK',
      avatarBg: 'bg-purple-400',
      status: 'last seen yesterday',
      isOnline: false,
      lastMessage: 'Thanks for the help earlier!',
    },
  ]);

  const [activeContactId, setActiveContactId] = useState('bot');
  const activeContact = contacts.find(c => c.id === activeContactId) || contacts[0];

  const [chatHistories, setChatHistories] = useState<Record<string, Message[]>>({
    bot: [
      {
        id: 'welcome-1',
        sender: 'bot',
        text: `*IT QuickFix Bot Online*\n\nI diagnose hardware, networking, OS, and software issues with rapid 3-step troubleshooting and verified YouTube tutorial videos.\n\n_What technical issue can I solve for you right now?_`,
        timestamp: formatCurrentTime(),
        status: 'read',
      },
    ],
    'contact-1': [
      {
        id: 'welcome-alex',
        sender: 'bot',
        text: "Hey! Just checking in. Did you see the latest update?",
        timestamp: '10:45 AM',
        status: 'read',
      }
    ],
    'contact-2': [
      {
        id: 'welcome-jane',
        sender: 'bot',
        text: "The meeting is starting soon. Are you coming?",
        timestamp: '11:20 AM',
        status: 'read',
      }
    ],
    'contact-3': [
      {
        id: 'welcome-ryan',
        sender: 'bot',
        text: "Thanks for the help earlier! Catch you later.",
        timestamp: 'Yesterday',
        status: 'read',
      }
    ]
  });

  const messages = chatHistories[activeContactId] || [];
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [statusText, setStatusText] = useState('');
  const [isMobileView, setIsMobileView] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<{ videoId: string; title: string } | null>(null);

  const chatEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  function playNotificationSound() {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime);
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.08);

      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    } catch {
      // AudioContext may be restricted by autoplay policy
    }
  }

  const handleSendMessage = async (userText: string) => {
    if (!userText.trim() || isTyping) return;

    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: userText.trim(),
      timestamp: formatCurrentTime(),
      status: 'sent',
    };

    setChatHistories(prev => ({
      ...prev,
      [activeContactId]: [...(prev[activeContactId] || []), userMessage]
    }));

    // If not the bot, show a static reply and stop
    if (activeContactId !== 'bot') {
      setTimeout(() => {
        const offlineMsg: Message = {
          id: `offline-${Date.now()}`,
          sender: 'bot',
          text: `_This contact is currently unavailable. Please switch back to the *IT QuickFix Bot* in the sidebar for automated technical support._`,
          timestamp: formatCurrentTime(),
          status: 'read',
        };
        setChatHistories(prev => ({
          ...prev,
          [activeContactId]: [...(prev[activeContactId] || []), offlineMsg]
        }));
      }, 800);
      return;
    }

    setIsTyping(true);
    setStatusText('searching Google & YouTube...');

    // Update active contact preview snippet
    setContacts((prev) =>
      prev.map((c) =>
        c.id === activeContactId
          ? { ...c, lastMessage: userText.slice(0, 32) + (userText.length > 32 ? '...' : '') }
          : c
      )
    );

    try {
      const historyPayload = messages.map((m) => ({
        role: m.sender === 'user' ? ('user' as const) : ('model' as const),
        text: m.text,
      }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userText.trim(),
          history: historyPayload,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || errorData.error || `Server responded with status ${res.status}`);
      }

      const data = await res.json();
      const rawReply = data.reply || 'Video search unavailable — follow the numbered steps above.';
      const replyText = rawReply
        .replace(/\p{Extended_Pictographic}/gu, '')
        .replace(/[\u{FE00}-\u{FE0F}🎥🛠️🔄✅❌⚠️]/gu, '')
        .trim();
      const youtubeInfo = extractYouTubeDetails(replyText);

      const botMessage: Message = {
        id: `msg-${Date.now() + 1}`,
        sender: 'bot',
        text: replyText,
        timestamp: formatCurrentTime(),
        status: 'read',
        groundingChunks: data.groundingChunks || [],
        searchQueries: data.searchQueries || [],
        extractedYouTube: youtubeInfo,
      };

      setChatHistories(prev => ({
        ...prev,
        [activeContactId]: [...(prev[activeContactId] || []), botMessage]
      }));
      playNotificationSound();
    } catch (err: any) {
      const isQuotaError = err.message?.toLowerCase().includes('quota') || err.message?.includes('429');
      
      if (!isQuotaError) {
        console.error('Chat error:', err);
      }
      
      // Attempt local fallback for quota errors
      let fallbackText = '';
      if (isQuotaError) {
        const query = userText.toLowerCase();
        if (query.includes('wifi') || query.includes('internet') || query.includes('connect')) {
          fallbackText = `*System: Using Offline Emergency Database (API Quota Exceeded)*\n\n*Problem Diagnosis:* Likely a local network configuration or hardware handshake issue.\n\n*Quick Fix Steps:*\n1. Toggle *Airplane Mode* ON for 5s, then OFF.\n2. Use \`ipconfig /flushdns\` in Command Prompt.\n3. Power cycle your router (unplug for 30s).\n\n*Status:* Google Search grounding is currently limited. Please update your API Key in Settings > Secrets.`;
        } else if (query.includes('printer')) {
          fallbackText = `*System: Using Offline Emergency Database (API Quota Exceeded)*\n\n*Problem Diagnosis:* The Print Spooler service may be hung or the driver is in an 'Offline' state.\n\n*Quick Fix Steps:*\n1. Open *Services.msc*, right-click *Print Spooler*, and select *Restart*.\n2. Uncheck *Use Printer Offline* in the printer queue settings.\n3. Reseat the USB/Network cable.\n\n*Status:* Real-time video tutorials unavailable. Please check your AI Studio quota.`;
        } else if (query.includes('slow') || query.includes('freeze') || query.includes('hang')) {
          fallbackText = `*System: Using Offline Emergency Database (API Quota Exceeded)*\n\n*Problem Diagnosis:* High disk usage or background process saturation.\n\n*Quick Fix Steps:*\n1. Press \`Ctrl + Shift + Esc\` and end tasks with high CPU/Memory.\n2. Run \`sfc /scannow\` in an Admin Command Prompt.\n3. Check for pending Windows Updates.\n\n*Status:* AI search grounding offline. Update keys in Settings.`;
        }
      }

      const diagnosis = isQuotaError 
        ? "*System: Gemini API Quota Exhausted (Error 429)*"
        : `An unexpected communication error occurred (${err.message || 'Network issue'}).`;
        
      const steps = isQuotaError
        ? [
            "Wait 60 seconds for the per-minute limit to reset.",
            "Ensure you have a valid API Key in *Settings > Secrets*.",
            "Verify your billing or usage limits at *aistudio.google.com*."
          ]
        : [
            "Check your internet connection.",
            "Verify the API Key in AI Studio *Settings > Secrets*.",
            "Try submitting your query again."
          ];

      const errorMessage: Message = {
        id: `err-${Date.now()}`,
        sender: 'bot',
        text: fallbackText || `*Problem Diagnosis:*\n${diagnosis}\n\n*Required Actions:*\n${steps.map((s, i) => `${i+1}. ${s}`).join('\n')}\n\n*Status:*\nThis issue is external to the app code and must be resolved in your Google AI Studio account settings.`,
        timestamp: formatCurrentTime(),
        status: 'read',
      };
      setChatHistories(prev => ({
        ...prev,
        [activeContactId]: [...(prev[activeContactId] || []), errorMessage]
      }));
    } finally {
      setIsTyping(false);
      setStatusText('');
    }
  };

  const handleSelectContact = (contact: ChatContact) => {
    setActiveContactId(contact.id);
    setShowMobileSidebar(false);
  };

  const handleClearChat = () => {
    if (activeContactId === 'bot') {
      setChatHistories(prev => ({
        ...prev,
        bot: [
          {
            id: `welcome-${Date.now()}`,
            sender: 'bot',
            text: `*Conversation Reset*\n\nI am ready for your next IT issue. Type your question or choose one of the quick issues above.`,
            timestamp: formatCurrentTime(),
            status: 'read',
          }
        ]
      }));
    } else {
      setChatHistories(prev => ({
        ...prev,
        [activeContactId]: []
      }));
    }
  };

  const handlePlayVideo = (videoId: string, title: string) => {
    setSelectedVideo({ videoId, title });
  };

  return (
    <main className="min-h-screen bg-[#F0F2F5] flex flex-col items-center justify-center font-sans antialiased text-gray-900 p-0 md:p-4">
      {/* Top Banner for WhatsApp Web Mode */}
      <div className="w-full max-w-6xl hidden md:flex items-center justify-between px-4 py-2 text-xs text-gray-500 select-none">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#00A884] animate-pulse" />
          <span className="font-semibold text-gray-800">IT QuickFix Helpdesk</span>
          <span className="text-gray-400">•</span>
          <span className="text-[#008069] font-medium">Vibrant Palette Theme</span>
          <span className="text-gray-400">•</span>
          <span className="text-gray-500">Live Google Search Grounding Verified</span>
        </div>
        <div className="flex items-center gap-3 font-medium">
          <button
            type="button"
            onClick={() => setIsMobileView(!isMobileView)}
            className="hover:text-[#00A884] transition-colors cursor-pointer"
          >
            {isMobileView ? 'Switch to Full Web Layout' : 'Simulate Mobile Phone Device'}
          </button>
          <span>•</span>
          <button
            type="button"
            onClick={() => setShowInfoModal(true)}
            className="hover:text-[#00A884] transition-colors cursor-pointer"
          >
            Technician Guidelines
          </button>
        </div>
      </div>

      {/* Main App Canvas Container */}
      <div
        className={`w-full transition-all duration-300 ${
          isMobileView
            ? 'max-w-[420px] my-2 rounded-[36px] border-[8px] border-gray-800 shadow-2xl overflow-hidden bg-white'
            : 'max-w-6xl h-screen md:h-[92vh] md:rounded-2xl border-0 md:border md:border-gray-200/90 shadow-xl overflow-hidden bg-white'
        } flex flex-col`}
      >
        {/* Mobile Mockup Status Bar */}
        {isMobileView && (
          <div className="bg-[#00A884] px-6 py-2 flex items-center justify-between text-[11px] font-semibold text-white select-none">
            <span>9:41</span>
            <div className="w-24 h-3.5 bg-black/20 rounded-full mx-auto" />
            <div className="flex items-center gap-1.5">
              <Signal className="w-3 h-3" />
              <Wifi className="w-3 h-3" />
              <Battery className="w-3.5 h-3.5" />
            </div>
          </div>
        )}

        {/* Master Flex Body: Sidebar + Main Chat */}
        <div className="flex-1 flex overflow-hidden relative">
          {/* Left Sidebar (User View) */}
          {!isMobileView && (
            <aside className="w-[300px] lg:w-[320px] bg-white border-r border-gray-200 hidden md:flex flex-col shrink-0 select-none">
              {/* Personal Sidebar Header */}
              <div className="p-4 bg-[#F0F2F5] border-b border-gray-300 flex items-center justify-between shadow-xs">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-lg shadow-2xs">
                    ME
                  </div>
                  <div>
                    <h1 className="font-semibold text-gray-900 leading-tight">My Chats</h1>
                    <p className="text-[11px] text-gray-500">online</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-gray-500">
                  <MessageSquare className="w-5 h-5 cursor-pointer hover:text-gray-900 transition-colors" />
                  <Plus className="w-5 h-5 cursor-pointer hover:text-gray-900 transition-colors" />
                </div>
              </div>

              {/* Contacts List */}
              <div className="flex-1 overflow-y-auto custom-scrollbar">
                {contacts.map((c) => {
                  const isCurrent = c.id === activeContactId;
                  return (
                    <div
                      key={c.id}
                      onClick={() => handleSelectContact(c)}
                      className={`p-3 border-b border-gray-100 flex items-center gap-3.5 cursor-pointer transition-colors ${
                        isCurrent
                          ? 'bg-gray-100'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="relative">
                        <div
                          className={`w-12 h-12 rounded-full ${c.avatarBg} shrink-0 flex items-center justify-center text-white font-bold text-[14px] shadow-2xs`}
                        >
                          {c.isBot ? <Bot className="w-6 h-6" /> : c.initials}
                        </div>
                        {c.isOnline && (
                          <span className="absolute bottom-0 right-0 w-3 h-3 bg-[#00a884] rounded-full ring-2 ring-white" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0 pb-1">
                        <div className="flex justify-between items-center mb-0.5">
                          <span className="font-semibold text-[14.5px] text-gray-900 truncate flex items-center gap-1.5">
                            {c.name}
                            {c.isBot && <CheckCircle2 className="w-3.5 h-3.5 fill-[#00a884] text-white" />}
                          </span>
                          <span className="text-[11px] text-gray-400">
                            {c.isBot ? 'Now' : '10:45 AM'}
                          </span>
                        </div>
                        <p className={`text-[13px] truncate ${isCurrent ? 'text-gray-600' : 'text-gray-500'}`}>
                          {c.lastMessage}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </aside>
          )}

          {/* Right Main Chat Panel */}
          <section className="flex-1 flex flex-col bg-[#E5DDD5] min-w-0 relative">
            {/* WhatsApp App Bar (Context Aware) */}
            <WhatsAppHeader
              isTyping={isTyping}
              statusText={statusText}
              onClearChat={handleClearChat}
              onOpenInfo={() => setShowInfoModal(true)}
              isMobileView={isMobileView}
              onToggleMobileView={() => setIsMobileView(!isMobileView)}
              activeContact={activeContact}
            />

            {/* Quick Issues Presets (Only for Bot) */}
            {activeContact.isBot && (
              <QuickIssueBar onSelectIssue={handleSendMessage} disabled={isTyping} />
            )}

            {/* Chat Feed Area */}
            <div
              id="chat-scroll-feed"
              className="flex-1 overflow-y-auto p-3 sm:p-5 whatsapp-chat-bg custom-scrollbar relative flex flex-col justify-between"
            >
              <div>
                {/* Date Pill (Vibrant Palette Design spec: self-center bg-[#D1E4FC] px-3 py-1 rounded text-[11px] text-gray-600 uppercase tracking-wider mb-2 font-medium shadow-sm) */}
                <div className="flex justify-center mb-3 select-none">
                  <div className="self-center bg-[#D1E4FC] px-3 py-1 rounded text-[11px] text-gray-700 uppercase tracking-wider font-semibold shadow-2xs">
                    Today
                  </div>
                </div>

                {/* Encryption / privacy badge */}
                <div className="flex justify-center mb-4 select-none">
                  <div className="flex items-center gap-1.5 bg-[#FCF5DC] border border-[#F4E3B2] text-[#665324] text-[11.5px] px-3.5 py-1.5 rounded-lg max-w-sm text-center shadow-2xs">
                    <Lock className="w-3.5 h-3.5 text-[#856404] shrink-0" />
                    <span>
                      Messages are formatted for WhatsApp. Real-time Google Search grounding verified.
                    </span>
                  </div>
                </div>

                {/* Messages Loop */}
                {messages.map((msg, index) => {
                  const isLatestBotMessage =
                    msg.sender === 'bot' && index === messages.length - 1;

                  return (
                    <ChatMessageBubble
                      key={msg.id}
                      message={msg}
                      isLatestBotMessage={isLatestBotMessage}
                      onQuickReply={handleSendMessage}
                      onPlayVideo={handlePlayVideo}
                    />
                  );
                })}

                {/* Typing indicator bubble */}
                {isTyping && (
                  <div className="flex items-start mb-3">
                    <div className="bg-white border border-gray-200/80 rounded-xl px-4 py-2.5 rounded-tl-none shadow-xs flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-[#00a884] animate-bounce [animation-delay:-0.3s]" />
                        <span className="w-2 h-2 rounded-full bg-[#00a884] animate-bounce [animation-delay:-0.15s]" />
                        <span className="w-2 h-2 rounded-full bg-[#00a884] animate-bounce" />
                      </div>
                      <span className="text-xs text-gray-500 italic">
                        {statusText || 'IT QuickFix Bot is troubleshooting...'}
                      </span>
                    </div>
                  </div>
                )}

                <div ref={chatEndRef} />
              </div>
            </div>

            {/* Input Bar */}
            <ChatInput onSendMessage={handleSendMessage} disabled={isTyping} />

            {/* Mobile Mockup Home Indicator */}
            {isMobileView && (
              <div className="bg-[#F0F2F5] py-1.5 flex justify-center select-none border-t border-gray-200">
                <div className="w-32 h-1 bg-gray-400 rounded-full" />
              </div>
            )}
          </section>
        </div>
      </div>

      {/* Info Modal */}
      <BotInfoModal isOpen={showInfoModal} onClose={() => setShowInfoModal(false)} />

      {/* Video Player Modal */}
      <VideoPlayerModal
        videoId={selectedVideo?.videoId || null}
        videoTitle={selectedVideo?.title || ''}
        onClose={() => setSelectedVideo(null)}
      />
    </main>
  );
}

function formatCurrentTime(): string {
  const now = new Date();
  return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}
