import React from 'react';
import { Wifi, VolumeX, Printer, Cpu, Bluetooth, FileSpreadsheet, MicOff, AlertTriangle } from 'lucide-react';
import { PresetIssue } from '../types';

interface QuickIssueBarProps {
  onSelectIssue: (prompt: string) => void;
  disabled?: boolean;
}

const COMMON_ISSUES: PresetIssue[] = [
  {
    label: "WiFi No Internet",
    icon: "wifi",
    prompt: "My WiFi is connected, but it says 'No Internet Access' on Windows.",
    category: "Network",
  },
  {
    label: "No Sound / Audio",
    icon: "volume",
    prompt: "I have no sound coming from my speakers or headphones after a Windows update.",
    category: "Audio",
  },
  {
    label: "Printer Offline",
    icon: "printer",
    prompt: "My HP printer says 'Offline' and won't print documents from my PC.",
    category: "Hardware",
  },
  {
    label: "High CPU / 100% Disk",
    icon: "cpu",
    prompt: "My laptop is extremely slow and Task Manager shows 100% Disk usage.",
    category: "Performance",
  },
  {
    label: "Bluetooth Won't Pair",
    icon: "bluetooth",
    prompt: "My Bluetooth headphones won't connect or pair with my laptop.",
    category: "Hardware",
  },
  {
    label: "Mic Not Working in Zoom",
    icon: "mic",
    prompt: "My microphone is not working in Zoom and no one can hear me.",
    category: "Audio",
  },
  {
    label: "Excel Frozen / Hanging",
    icon: "excel",
    prompt: "Microsoft Excel is frozen and says 'Not Responding' with unsaved data.",
    category: "Software",
  },
  {
    label: "Blue Screen Crash",
    icon: "alert",
    prompt: "My PC randomly crashes with a Blue Screen (BSOD) showing 'CRITICAL_PROCESS_DIED'.",
    category: "System",
  },
];

export const QuickIssueBar: React.FC<QuickIssueBarProps> = ({ onSelectIssue, disabled }) => {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'wifi':
        return <Wifi className="w-3.5 h-3.5 text-emerald-400" />;
      case 'volume':
        return <VolumeX className="w-3.5 h-3.5 text-amber-400" />;
      case 'printer':
        return <Printer className="w-3.5 h-3.5 text-sky-400" />;
      case 'cpu':
        return <Cpu className="w-3.5 h-3.5 text-rose-400" />;
      case 'bluetooth':
        return <Bluetooth className="w-3.5 h-3.5 text-blue-400" />;
      case 'mic':
        return <MicOff className="w-3.5 h-3.5 text-orange-400" />;
      case 'excel':
        return <FileSpreadsheet className="w-3.5 h-3.5 text-green-400" />;
      default:
        return <AlertTriangle className="w-3.5 h-3.5 text-yellow-400" />;
    }
  };

  return (
    <div className="px-3.5 py-2 bg-[#F0F2F5] border-b border-gray-300/80 select-none">
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
        <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500 shrink-0">
          Quick Issues:
        </span>
        {COMMON_ISSUES.map((issue, idx) => (
          <button
            key={idx}
            type="button"
            disabled={disabled}
            onClick={() => onSelectIssue(issue.prompt)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white hover:bg-emerald-50/60 border border-gray-300 hover:border-emerald-400 text-[12px] font-medium text-gray-700 hover:text-[#008069] shrink-0 shadow-2xs transition-all disabled:opacity-50 cursor-pointer"
          >
            {getIcon(issue.icon)}
            <span>{issue.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
