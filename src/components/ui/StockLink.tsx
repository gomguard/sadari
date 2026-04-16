import Link from "next/link";
import { BarChart3 } from "lucide-react";

interface StockLinkProps {
  stockName: string;
  ticker: string;
  className?: string;
}

export default function StockLink({ stockName, ticker, className = "" }: StockLinkProps) {
  return (
    <Link
      href={`/stock/${ticker}`}
      className={`inline-flex items-center gap-1 font-bold text-gray-900 transition-colors hover:text-primary-600 hover:underline underline-offset-2 ${className}`}
    >
      {stockName}
      <BarChart3 className="h-3.5 w-3.5 text-gray-300 transition-colors group-hover:text-primary-400" />
    </Link>
  );
}
