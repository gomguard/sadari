export interface SectorData {
  name: string;
  status: "hot" | "warm" | "neutral" | "cool" | "cold";
  change: string;
  note: string;
}

const statusConfig = {
  hot: {
    bg: "bg-red-500",
    text: "text-white",
    label: "🔥",
  },
  warm: {
    bg: "bg-orange-400",
    text: "text-white",
    label: "📈",
  },
  neutral: {
    bg: "bg-gray-300",
    text: "text-gray-800",
    label: "➡️",
  },
  cool: {
    bg: "bg-blue-400",
    text: "text-white",
    label: "📉",
  },
  cold: {
    bg: "bg-blue-600",
    text: "text-white",
    label: "🧊",
  },
};

export default function SectorHeatmap({
  sectors,
}: {
  sectors: SectorData[];
}) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-gray-900">섹터 온도계</h3>
        <div className="flex items-center gap-1 text-[10px] text-gray-400">
          <span className="h-2 w-2 rounded-full bg-red-500" />
          뜨거움
          <span className="mx-0.5">—</span>
          <span className="h-2 w-2 rounded-full bg-blue-500" />
          차가움
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        {sectors.map((sector) => {
          const config = statusConfig[sector.status];
          return (
            <div
              key={sector.name}
              className={`relative overflow-hidden rounded-xl ${config.bg} p-3 ${config.text}`}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold">{sector.name}</span>
                <span className="text-base">{config.label}</span>
              </div>
              <p className="mt-0.5 text-xs font-medium opacity-90">
                {sector.change}
              </p>
              <p className="mt-1 text-[11px] leading-snug opacity-75">
                {sector.note}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
