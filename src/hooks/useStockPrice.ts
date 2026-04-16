/**
 * 주식 시세 조회 React Hook
 *
 * 클라이언트에서 주식 현재가를 주기적으로 폴링합니다.
 * 컴포넌트 언마운트 시 자동으로 폴링을 중지합니다.
 *
 * @example
 * ```tsx
 * // 단일 종목 조회 (삼성전자)
 * const { price, change, changeRate, loading, error } = useStockPrice("005930");
 *
 * // 복수 종목 조회
 * const { prices, loading, error } = useMultipleStockPrices(["005930", "000660"]);
 *
 * // 폴링 간격 변경 (10초)
 * const data = useStockPrice("005930", { intervalMs: 10000 });
 * ```
 */

"use client";

import { useState, useEffect, useRef, useCallback } from "react";

// ============================================================
// 타입 정의
// ============================================================

/** 주식 시세 데이터 (API 응답에서 가져오는 데이터) */
interface StockPriceData {
  ticker: string;
  price: number;
  change: number;
  changeRate: number;
  changeSign: string;
  volume: number;
  tradingValue: number;
  open: number;
  high: number;
  low: number;
  upperLimit: number;
  lowerLimit: number;
  per: number;
  pbr: number;
  marketCap: number;
  timestamp: number;
}

/** 단일 종목 Hook 반환 타입 */
interface UseStockPriceReturn {
  /** 현재가 */
  price: number | null;
  /** 전일 대비 (원) */
  change: number | null;
  /** 전일 대비율 (%) */
  changeRate: number | null;
  /** 등락 부호 */
  changeSign: string | null;
  /** 거래량 */
  volume: number | null;
  /** 거래대금 */
  tradingValue: number | null;
  /** 전체 데이터 */
  data: StockPriceData | null;
  /** 로딩 상태 */
  loading: boolean;
  /** 에러 */
  error: string | null;
  /** 마지막 업데이트 시각 */
  lastUpdated: number | null;
  /** 수동 새로고침 */
  refresh: () => void;
}

/** 복수 종목 Hook 반환 타입 */
interface UseMultipleStockPricesReturn {
  /** 종목코드별 시세 데이터 맵 */
  prices: Record<string, StockPriceData>;
  /** 로딩 상태 */
  loading: boolean;
  /** 에러 */
  error: string | null;
  /** 마지막 업데이트 시각 */
  lastUpdated: number | null;
  /** 수동 새로고침 */
  refresh: () => void;
}

/** Hook 옵션 */
interface UseStockPriceOptions {
  /** 폴링 간격 (밀리초, 기본값: 30000 = 30초) */
  intervalMs?: number;
  /** 자동 폴링 활성화 (기본값: true) */
  enabled?: boolean;
}

// ============================================================
// 단일 종목 시세 Hook
// ============================================================

/**
 * 단일 종목의 현재가를 주기적으로 조회하는 Hook
 *
 * @param ticker - 종목코드 (예: "005930")
 * @param options - 폴링 옵션
 * @returns 시세 데이터 및 상태
 */
export function useStockPrice(
  ticker: string,
  options: UseStockPriceOptions = {}
): UseStockPriceReturn {
  const { intervalMs = 30000, enabled = true } = options;

  const [data, setData] = useState<StockPriceData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isMountedRef = useRef<boolean>(true);

  // 시세 조회 함수
  const fetchPrice = useCallback(async () => {
    if (!ticker || !enabled) return;

    try {
      // 첫 로딩 시에만 loading 표시 (이후 폴링은 백그라운드)
      if (!data) setLoading(true);

      const response = await fetch(`/api/stock/price?ticker=${ticker}`);
      const result = await response.json();

      // 컴포넌트가 언마운트된 경우 상태 업데이트 중단
      if (!isMountedRef.current) return;

      if (result.success) {
        setData(result.data);
        setError(null);
        setLastUpdated(Date.now());
      } else {
        setError(result.error || "시세 조회에 실패했습니다.");
      }
    } catch (err) {
      if (!isMountedRef.current) return;
      setError(
        err instanceof Error ? err.message : "네트워크 오류가 발생했습니다."
      );
    } finally {
      if (isMountedRef.current) setLoading(false);
    }
  }, [ticker, enabled, data]);

  // 수동 새로고침
  const refresh = useCallback(() => {
    fetchPrice();
  }, [fetchPrice]);

  // 폴링 설정 및 정리
  useEffect(() => {
    isMountedRef.current = true;

    if (!enabled || !ticker) {
      setLoading(false);
      return;
    }

    // 즉시 1회 호출
    fetchPrice();

    // 주기적 폴링 시작
    intervalRef.current = setInterval(fetchPrice, intervalMs);

    return () => {
      // 컴포넌트 언마운트 시 정리
      isMountedRef.current = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ticker, intervalMs, enabled]);

  return {
    price: data?.price ?? null,
    change: data?.change ?? null,
    changeRate: data?.changeRate ?? null,
    changeSign: data?.changeSign ?? null,
    volume: data?.volume ?? null,
    tradingValue: data?.tradingValue ?? null,
    data,
    loading,
    error,
    lastUpdated,
    refresh,
  };
}

// ============================================================
// 복수 종목 시세 Hook
// ============================================================

/**
 * 복수 종목의 현재가를 주기적으로 조회하는 Hook
 *
 * @param tickers - 종목코드 배열 (예: ["005930", "000660"])
 * @param options - 폴링 옵션
 * @returns 종목별 시세 데이터 맵 및 상태
 */
export function useMultipleStockPrices(
  tickers: string[],
  options: UseStockPriceOptions = {}
): UseMultipleStockPricesReturn {
  const { intervalMs = 30000, enabled = true } = options;

  const [prices, setPrices] = useState<Record<string, StockPriceData>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isMountedRef = useRef<boolean>(true);

  // tickers 배열을 문자열로 직렬화하여 의존성 비교에 사용
  const tickersKey = tickers.sort().join(",");

  const fetchPrices = useCallback(async () => {
    if (!tickers.length || !enabled) return;

    try {
      const isFirstLoad = Object.keys(prices).length === 0;
      if (isFirstLoad) setLoading(true);

      const response = await fetch(
        `/api/stock/price?tickers=${tickers.join(",")}`
      );
      const result = await response.json();

      if (!isMountedRef.current) return;

      if (result.success) {
        setPrices(result.data);
        setError(null);
        setLastUpdated(Date.now());
      } else {
        setError(result.error || "시세 조회에 실패했습니다.");
      }
    } catch (err) {
      if (!isMountedRef.current) return;
      setError(
        err instanceof Error ? err.message : "네트워크 오류가 발생했습니다."
      );
    } finally {
      if (isMountedRef.current) setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tickersKey, enabled]);

  const refresh = useCallback(() => {
    fetchPrices();
  }, [fetchPrices]);

  useEffect(() => {
    isMountedRef.current = true;

    if (!enabled || !tickers.length) {
      setLoading(false);
      return;
    }

    fetchPrices();

    intervalRef.current = setInterval(fetchPrices, intervalMs);

    return () => {
      isMountedRef.current = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tickersKey, intervalMs, enabled]);

  return { prices, loading, error, lastUpdated, refresh };
}

export default useStockPrice;
