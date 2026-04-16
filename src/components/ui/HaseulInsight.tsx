import { MessageCircle } from "lucide-react";

export interface Insight {
  id: string;
  content: string;
  date: string;
  mood: "bullish" | "bearish" | "neutral";
}

const moodConfig = {
  bullish: {
    emoji: "🟢",
    label: "긍정적",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    text: "text-emerald-700",
  },
  bearish: {
    emoji: "🔴",
    label: "조심",
    bg: "bg-red-50",
    border: "border-red-200",
    text: "text-red-700",
  },
  neutral: {
    emoji: "🟡",
    label: "관망",
    bg: "bg-amber-50",
    border: "border-amber-200",
    text: "text-amber-700",
  },
};

export default function HaseulInsight({ insight }: { insight: Insight }) {
  const mood = moodConfig[insight.mood];

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border ${mood.border} ${mood.bg} p-4`}
    >
      {/* 배경 데코 */}
      <div className="absolute -right-3 -top-3 text-6xl opacity-10">💬</div>

      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-sm">
          <MessageCircle className="h-4 w-4 text-gray-700" />
        </div>
        <div>
          <p className="text-xs font-bold text-gray-900">하슬님의 한마디</p>
          <div className="flex items-center gap-1">
            <span className="text-[10px]">{mood.emoji}</span>
            <span className={`text-[10px] font-medium ${mood.text}`}>
              {mood.label}
            </span>
            <span className="text-[10px] text-gray-400">· {insight.date}</span>
          </div>
        </div>
      </div>

      <p className="mt-3 text-sm leading-relaxed text-gray-800">
        {insight.content}
      </p>
    </div>
  );
}
