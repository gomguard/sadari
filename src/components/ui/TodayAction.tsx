import { Target, AlertTriangle, Eye, ShoppingCart } from "lucide-react";

export interface ActionItem {
  type: "watch" | "buy" | "caution" | "target";
  content: string;
}

const typeConfig = {
  watch: {
    icon: Eye,
    color: "border-l-blue-400 bg-blue-50",
    iconColor: "text-blue-500",
    label: "관찰",
  },
  buy: {
    icon: ShoppingCart,
    color: "border-l-emerald-400 bg-emerald-50",
    iconColor: "text-emerald-500",
    label: "매수 검토",
  },
  caution: {
    icon: AlertTriangle,
    color: "border-l-amber-400 bg-amber-50",
    iconColor: "text-amber-500",
    label: "주의",
  },
  target: {
    icon: Target,
    color: "border-l-rose-400 bg-rose-50",
    iconColor: "text-rose-500",
    label: "타점",
  },
};

export default function TodayAction({
  actions,
}: {
  actions: ActionItem[];
}) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-primary-500 to-primary-600">
          <Target className="h-3.5 w-3.5 text-white" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-gray-900">오늘의 액션 가이드</h3>
          <p className="text-[10px] text-gray-400">
            하슬님이 제안하는 오늘의 할 일
          </p>
        </div>
      </div>

      <div className="mt-3 space-y-2">
        {actions.map((action, i) => {
          const config = typeConfig[action.type];
          const Icon = config.icon;
          return (
            <div
              key={i}
              className={`flex items-start gap-3 rounded-lg border-l-[3px] ${config.color} px-3 py-2.5`}
            >
              <Icon
                className={`mt-0.5 h-4 w-4 flex-shrink-0 ${config.iconColor}`}
              />
              <div className="min-w-0 flex-1">
                <span
                  className={`text-[10px] font-semibold uppercase ${config.iconColor}`}
                >
                  {config.label}
                </span>
                <p className="text-[13px] leading-relaxed text-gray-700">
                  {action.content}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
