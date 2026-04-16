import { Clock } from "lucide-react";

export interface Article {
  id: string;
  title: string;
  description: string;
  category: string;
  date: string;
  thumbnailUrl?: string;
  isPremium?: boolean;
}

export default function ArticleCard({ article }: { article: Article }) {
  return (
    <div className="flex gap-4 rounded-xl border border-gray-100 bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
      {/* Text */}
      <div className="flex min-w-0 flex-1 flex-col justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-primary-50 px-2 py-0.5 text-[11px] font-medium text-primary-600">
              {article.category}
            </span>
            {article.isPremium && (
              <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-600">
                PRO
              </span>
            )}
          </div>
          <h3 className="mt-1.5 text-sm font-semibold leading-snug text-gray-900 line-clamp-2">
            {article.title}
          </h3>
          <p className="mt-1 text-xs leading-relaxed text-gray-500 line-clamp-2">
            {article.description}
          </p>
        </div>
        <div className="mt-2 flex items-center gap-1 text-[11px] text-gray-400">
          <Clock className="h-3 w-3" />
          {article.date}
        </div>
      </div>

      {/* Thumbnail */}
      {article.thumbnailUrl && (
        <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
          <img
            src={article.thumbnailUrl}
            alt={article.title}
            className="h-full w-full object-cover"
          />
        </div>
      )}
    </div>
  );
}
