"use client";

import { useState, useEffect } from "react";
import {
  Zap,
  MessageCircle,
  Target,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Plus,
  Trash2,
  CheckCircle,
  Send,
  Loader2,
} from "lucide-react";
import { addDaily, addSignal, getSignals, getLatestDaily } from "@/lib/firestore";
import type { FirestoreSignal } from "@/lib/firestore";

type Mood = "bullish" | "neutral" | "bearish";
type ActionType = "watch" | "buy" | "caution" | "target";

interface ActionItem {
  type: ActionType;
  content: string;
}

interface Indicator {
  label: string;
  value: string;
  up: boolean;
}

interface TodaySignal {
  id: string;
  stockName: string;
  ticker: string;
  entryPrice: number;
  targetPrice: number;
  stopLoss: number;
  sector: string;
  memo: string;
}

const actionTypeConfig: Record<ActionType, { label: string; color: string }> = {
  watch: { label: "관찰", color: "bg-blue-100 text-blue-700 border-blue-200" },
  buy: { label: "매수", color: "bg-green-100 text-green-700 border-green-200" },
  caution: { label: "주의", color: "bg-orange-100 text-orange-700 border-orange-200" },
  target: { label: "타점", color: "bg-purple-100 text-purple-700 border-purple-200" },
};

function getToday(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export default function QuickPostPage() {
  // ---------- 상태 ----------
  const today = getToday();

  // 섹션 1: 오늘의 한마디
  const [mood, setMood] = useState<Mood | null>(null);
  const [comment, setComment] = useState("");

  // 섹션 2: 액션 가이드
  const [actions, setActions] = useState<ActionItem[]>([
    { type: "watch", content: "" },
  ]);

  // 섹션 3: 세줄요약 + 지표
  const [summary, setSummary] = useState<[string, string, string]>(["", "", ""]);
  const [indicators, setIndicators] = useState<Indicator[]>([
    { label: "", value: "", up: true },
  ]);

  // 섹션 4: 시그널
  const [signalForm, setSignalForm] = useState({
    stockName: "",
    ticker: "",
    entryPrice: "",
    targetPrice: "",
    stopLoss: "",
    sector: "",
    memo: "",
  });
  const [todaySignals, setTodaySignals] = useState<TodaySignal[]>([]);

  // 공통
  const [dailyPublished, setDailyPublished] = useState(false);
  const [savingDaily, setSavingDaily] = useState(false);
  const [savingSignal, setSavingSignal] = useState(false);
  const [savingAll, setSavingAll] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // ---------- 초기 로드 ----------
  useEffect(() => {
    (async () => {
      try {
        const latest = await getLatestDaily();
        if (latest && latest.date === today) {
          setDailyPublished(true);
        }
      } catch {
        /* ignore */
      }
      try {
        const sigs = await getSignals();
        const todaySigs = sigs
          .filter((s) => s.date === today)
          .map((s) => ({
            id: s.id!,
            stockName: s.stockName,
            ticker: s.ticker,
            entryPrice: s.entryPrice,
            targetPrice: s.targetPrice,
            stopLoss: s.stopLoss,
            sector: s.sector,
            memo: s.memo || "",
          }));
        setTodaySignals(todaySigs);
      } catch {
        /* ignore */
      }
    })();
  }, [today]);

  // ---------- 토스트 ----------
  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }

  // ---------- 데일리 저장 ----------
  async function handleSaveDaily() {
    if (!mood) {
      showToast("시장 심리를 선택해 주세요.");
      return;
    }
    if (!comment.trim()) {
      showToast("한마디를 입력해 주세요.");
      return;
    }
    setSavingDaily(true);
    try {
      await addDaily({
        date: today,
        mood,
        haseulComment: comment.trim(),
        summary: summary.map((s) => s.trim()),
        indicators: indicators.filter((i) => i.label.trim()),
        actions: actions.filter((a) => a.content.trim()),
      });
      setDailyPublished(true);
      showToast("데일리가 발행되었습니다!");
    } catch (e: any) {
      showToast("저장 실패: " + (e?.message || "알 수 없는 오류"));
    } finally {
      setSavingDaily(false);
    }
  }

  // ---------- 시그널 저장 ----------
  async function handleSaveSignal() {
    const { stockName, ticker, entryPrice, targetPrice, stopLoss, sector } = signalForm;
    if (!stockName.trim() || !ticker.trim()) {
      showToast("종목명과 종목코드를 입력해 주세요.");
      return;
    }
    setSavingSignal(true);
    try {
      const id = await addSignal({
        stockName: stockName.trim(),
        ticker: ticker.trim(),
        entryPrice: Number(entryPrice) || 0,
        targetPrice: Number(targetPrice) || 0,
        stopLoss: Number(stopLoss) || 0,
        status: "active",
        sector: sector.trim(),
        date: today,
        memo: signalForm.memo.trim(),
      });
      setTodaySignals((prev) => [
        {
          id,
          stockName: stockName.trim(),
          ticker: ticker.trim(),
          entryPrice: Number(entryPrice) || 0,
          targetPrice: Number(targetPrice) || 0,
          stopLoss: Number(stopLoss) || 0,
          sector: sector.trim(),
          memo: signalForm.memo.trim(),
        },
        ...prev,
      ]);
      setSignalForm({ stockName: "", ticker: "", entryPrice: "", targetPrice: "", stopLoss: "", sector: "", memo: "" });
      showToast("시그널이 등록되었습니다!");
    } catch (e: any) {
      showToast("시그널 저장 실패: " + (e?.message || "알 수 없는 오류"));
    } finally {
      setSavingSignal(false);
    }
  }

  // ---------- 전체 발행 ----------
  async function handlePublishAll() {
    setSavingAll(true);
    try {
      // 데일리 발행
      if (mood && comment.trim()) {
        await addDaily({
          date: today,
          mood,
          haseulComment: comment.trim(),
          summary: summary.map((s) => s.trim()),
          indicators: indicators.filter((i) => i.label.trim()),
          actions: actions.filter((a) => a.content.trim()),
        });
        setDailyPublished(true);
      }
      showToast("전체 발행이 완료되었습니다!");
    } catch (e: any) {
      showToast("전체 발행 실패: " + (e?.message || "알 수 없는 오류"));
    } finally {
      setSavingAll(false);
    }
  }

  // ---------- 액션 핸들러 ----------
  function addAction() {
    setActions((prev) => [...prev, { type: "watch", content: "" }]);
  }
  function removeAction(idx: number) {
    setActions((prev) => prev.filter((_, i) => i !== idx));
  }
  function updateAction(idx: number, field: keyof ActionItem, value: string) {
    setActions((prev) =>
      prev.map((a, i) => (i === idx ? { ...a, [field]: value } : a))
    );
  }

  // ---------- 지표 핸들러 ----------
  function addIndicator() {
    setIndicators((prev) => [...prev, { label: "", value: "", up: true }]);
  }
  function removeIndicator(idx: number) {
    setIndicators((prev) => prev.filter((_, i) => i !== idx));
  }
  function updateIndicator(idx: number, field: string, value: string | boolean) {
    setIndicators((prev) =>
      prev.map((ind, i) => (i === idx ? { ...ind, [field]: value } : ind))
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 pb-24">
      {/* 토스트 */}
      {toast && (
        <div className="fixed right-6 top-6 z-[100] flex items-center gap-2 rounded-xl bg-gray-900 px-5 py-3 text-sm font-medium text-white shadow-lg animate-in slide-in-from-top-2">
          <CheckCircle className="h-4 w-4 text-green-400" />
          {toast}
        </div>
      )}

      {/* 헤더 */}
      <div>
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-yellow-400 to-orange-500">
            <Zap className="h-4 w-4 text-white" />
          </div>
          <h1 className="text-xl font-bold text-gray-900">빠른 발행</h1>
        </div>
        <p className="mt-1 text-sm text-gray-500">
          하슬이 전용 &mdash; 데일리 + 시그널을 한 곳에서 빠르게 입력
        </p>
      </div>

      {/* 오늘 발행 현황 */}
      <div className="flex flex-wrap gap-3">
        <div
          className={`flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-semibold ${
            dailyPublished
              ? "border-green-200 bg-green-50 text-green-700"
              : "border-gray-200 bg-gray-50 text-gray-500"
          }`}
        >
          <span className={`h-2 w-2 rounded-full ${dailyPublished ? "bg-green-500" : "bg-gray-300"}`} />
          데일리 {dailyPublished ? "발행 완료" : "미발행"}
        </div>
        <div className="flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-4 py-1.5 text-xs font-semibold text-gray-600">
          <BarChart3 className="h-3 w-3" />
          오늘 시그널 {todaySignals.length}건
        </div>
        <div className="ml-auto text-xs text-gray-400">{today}</div>
      </div>

      {/* ===== 섹션 1: 오늘의 한마디 ===== */}
      <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <MessageCircle className="h-4 w-4 text-primary-500" />
          <h2 className="text-sm font-bold text-gray-900">오늘의 한마디</h2>
        </div>

        {/* 시장 심리 */}
        <label className="mb-2 block text-xs font-medium text-gray-500">시장 심리</label>
        <div className="mb-4 grid grid-cols-3 gap-3">
          {([
            { value: "bullish" as Mood, emoji: "\uD83D\uDFE2", label: "긍정" },
            { value: "neutral" as Mood, emoji: "\uD83D\uDFE1", label: "관망" },
            { value: "bearish" as Mood, emoji: "\uD83D\uDD34", label: "조심" },
          ]).map((m) => (
            <button
              key={m.value}
              onClick={() => setMood(m.value)}
              className={`flex items-center justify-center gap-2 rounded-xl border-2 py-3 text-sm font-bold transition-all ${
                mood === m.value
                  ? "border-primary-500 bg-primary-50 text-primary-700 shadow-sm"
                  : "border-gray-200 bg-gray-50 text-gray-600 hover:border-gray-300"
              }`}
            >
              <span className="text-lg">{m.emoji}</span>
              {m.label}
            </button>
          ))}
        </div>

        {/* 한마디 */}
        <label className="mb-2 block text-xs font-medium text-gray-500">한마디</label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="오늘 시장에 대한 한마디를 적어주세요..."
          rows={4}
          className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:border-primary-400 focus:bg-white focus:ring-2 focus:ring-primary-100"
        />
        <p className="mt-1 text-xs text-gray-400">즉시 홈 화면에 반영됩니다</p>
      </section>

      {/* ===== 섹션 2: 오늘의 액션 가이드 ===== */}
      <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <Target className="h-4 w-4 text-orange-500" />
          <h2 className="text-sm font-bold text-gray-900">오늘의 액션 가이드</h2>
          <span className="text-xs text-gray-400">섹션 1과 함께 저장</span>
        </div>

        <div className="space-y-3">
          {actions.map((action, idx) => (
            <div key={idx} className="flex items-start gap-2">
              {/* type selector pills */}
              <div className="flex shrink-0 flex-wrap gap-1">
                {(Object.keys(actionTypeConfig) as ActionType[]).map((t) => (
                  <button
                    key={t}
                    onClick={() => updateAction(idx, "type", t)}
                    className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold transition ${
                      action.type === t
                        ? actionTypeConfig[t].color
                        : "border-gray-200 bg-white text-gray-400 hover:border-gray-300"
                    }`}
                  >
                    {actionTypeConfig[t].label}
                  </button>
                ))}
              </div>
              <input
                value={action.content}
                onChange={(e) => updateAction(idx, "content", e.target.value)}
                placeholder="내용 입력..."
                className="flex-1 rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-sm text-gray-900 outline-none focus:border-primary-400 focus:bg-white"
              />
              <button
                onClick={() => removeAction(idx)}
                className="shrink-0 rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
        <button
          onClick={addAction}
          className="mt-3 flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium text-primary-600 hover:bg-primary-50"
        >
          <Plus className="h-3.5 w-3.5" />
          항목 추가
        </button>
      </section>

      {/* ===== 섹션 3: 매크로 데일리 세줄요약 ===== */}
      <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-blue-500" />
          <h2 className="text-sm font-bold text-gray-900">매크로 데일리 세줄요약</h2>
          <span className="text-xs text-gray-400">섹션 1과 함께 저장</span>
        </div>

        {/* 세줄요약 */}
        <label className="mb-2 block text-xs font-medium text-gray-500">세줄요약</label>
        <div className="mb-5 space-y-2">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gray-100 text-[10px] font-bold text-gray-500">
                {i + 1}
              </span>
              <input
                value={summary[i]}
                onChange={(e) => {
                  const next = [...summary] as [string, string, string];
                  next[i] = e.target.value;
                  setSummary(next);
                }}
                placeholder={`요약 ${i + 1}`}
                className="flex-1 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 outline-none focus:border-primary-400 focus:bg-white"
              />
            </div>
          ))}
        </div>

        {/* 시장 지표 */}
        <label className="mb-2 block text-xs font-medium text-gray-500">시장 지표</label>
        <div className="space-y-2">
          {indicators.map((ind, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <input
                value={ind.label}
                onChange={(e) => updateIndicator(idx, "label", e.target.value)}
                placeholder="지표명"
                className="w-28 rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-sm outline-none focus:border-primary-400 focus:bg-white"
              />
              <input
                value={ind.value}
                onChange={(e) => updateIndicator(idx, "value", e.target.value)}
                placeholder="값"
                className="w-24 rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-sm outline-none focus:border-primary-400 focus:bg-white"
              />
              <button
                onClick={() => updateIndicator(idx, "up", !ind.up)}
                className={`flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition ${
                  ind.up
                    ? "border-green-200 bg-green-50 text-green-600"
                    : "border-red-200 bg-red-50 text-red-600"
                }`}
              >
                {ind.up ? (
                  <TrendingUp className="h-3.5 w-3.5" />
                ) : (
                  <TrendingDown className="h-3.5 w-3.5" />
                )}
                {ind.up ? "상승" : "하락"}
              </button>
              <button
                onClick={() => removeIndicator(idx)}
                className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
        <button
          onClick={addIndicator}
          className="mt-3 flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium text-primary-600 hover:bg-primary-50"
        >
          <Plus className="h-3.5 w-3.5" />
          지표 추가
        </button>

        {/* 데일리 발행 버튼 */}
        <div className="mt-5 border-t border-gray-100 pt-4">
          <button
            onClick={handleSaveDaily}
            disabled={savingDaily}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary-600 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-primary-700 disabled:opacity-50"
          >
            {savingDaily ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            데일리 발행 (한마디 + 액션 + 세줄요약)
          </button>
        </div>
      </section>

      {/* ===== 섹션 4: 시그널 빠른 등록 ===== */}
      <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-green-500" />
          <h2 className="text-sm font-bold text-gray-900">시그널 빠른 등록</h2>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <input
            value={signalForm.stockName}
            onChange={(e) => setSignalForm((p) => ({ ...p, stockName: e.target.value }))}
            placeholder="종목명"
            className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm outline-none focus:border-primary-400 focus:bg-white"
          />
          <input
            value={signalForm.ticker}
            onChange={(e) => setSignalForm((p) => ({ ...p, ticker: e.target.value }))}
            placeholder="종목코드"
            className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm outline-none focus:border-primary-400 focus:bg-white"
          />
          <input
            value={signalForm.entryPrice}
            onChange={(e) => setSignalForm((p) => ({ ...p, entryPrice: e.target.value }))}
            placeholder="진입가"
            type="number"
            className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm outline-none focus:border-primary-400 focus:bg-white"
          />
          <input
            value={signalForm.targetPrice}
            onChange={(e) => setSignalForm((p) => ({ ...p, targetPrice: e.target.value }))}
            placeholder="목표가"
            type="number"
            className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm outline-none focus:border-primary-400 focus:bg-white"
          />
          <input
            value={signalForm.stopLoss}
            onChange={(e) => setSignalForm((p) => ({ ...p, stopLoss: e.target.value }))}
            placeholder="손절가"
            type="number"
            className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm outline-none focus:border-primary-400 focus:bg-white"
          />
          <input
            value={signalForm.sector}
            onChange={(e) => setSignalForm((p) => ({ ...p, sector: e.target.value }))}
            placeholder="섹터"
            className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm outline-none focus:border-primary-400 focus:bg-white"
          />
          <input
            value={signalForm.memo}
            onChange={(e) => setSignalForm((p) => ({ ...p, memo: e.target.value }))}
            placeholder="메모"
            className="col-span-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm outline-none focus:border-primary-400 focus:bg-white"
          />
        </div>
        <button
          onClick={handleSaveSignal}
          disabled={savingSignal}
          className="mt-3 flex items-center gap-2 rounded-xl bg-green-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-green-700 disabled:opacity-50"
        >
          {savingSignal ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Plus className="h-4 w-4" />
          )}
          시그널 등록
        </button>

        {/* 오늘 등록한 시그널 */}
        {todaySignals.length > 0 && (
          <div className="mt-4 border-t border-gray-100 pt-4">
            <h3 className="mb-2 text-xs font-semibold text-gray-500">오늘 등록한 시그널</h3>
            <div className="space-y-2">
              {todaySignals.map((s) => (
                <div
                  key={s.id}
                  className="flex items-center gap-3 rounded-lg border border-gray-100 bg-gray-50 px-3 py-2 text-sm"
                >
                  <span className="font-semibold text-gray-900">{s.stockName}</span>
                  <span className="text-xs text-gray-400">{s.ticker}</span>
                  <span className="ml-auto text-xs text-gray-500">
                    {s.entryPrice.toLocaleString()}
                  </span>
                  <span className="text-xs text-green-600">
                    &rarr; {s.targetPrice.toLocaleString()}
                  </span>
                  <span className="text-xs text-red-500">
                    / {s.stopLoss.toLocaleString()}
                  </span>
                  {s.sector && (
                    <span className="rounded bg-gray-200 px-1.5 py-0.5 text-[10px] text-gray-600">
                      {s.sector}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* ===== 전체 발행 버튼 ===== */}
      <div className="sticky bottom-4 z-30">
        <button
          onClick={handlePublishAll}
          disabled={savingAll}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-primary-600 to-primary-700 py-4 text-base font-bold text-white shadow-lg transition hover:from-primary-700 hover:to-primary-800 disabled:opacity-50"
        >
          {savingAll ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Zap className="h-5 w-5" />
          )}
          전체 발행
        </button>
      </div>
    </div>
  );
}
