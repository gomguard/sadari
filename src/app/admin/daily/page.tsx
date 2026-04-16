"use client";

import { useEffect, useState } from "react";
import { Save, Plus, Trash2, Pencil, X } from "lucide-react";

interface MarketIndicator {
  label: string;
  value: string;
  up: boolean;
}

interface ActionItem {
  type: "watch" | "buy" | "caution" | "target";
  content: string;
}

interface DailyPost {
  id: string;
  date: string;
  mood: "bullish" | "bearish" | "neutral";
  haseulComment: string;
  summary: [string, string, string];
  indicators: MarketIndicator[];
  actions: ActionItem[];
}

const MOOD_OPTIONS: { value: DailyPost["mood"]; label: string; emoji: string }[] = [
  { value: "bullish", label: "긍정적", emoji: "🟢" },
  { value: "neutral", label: "관망", emoji: "🟡" },
  { value: "bearish", label: "조심", emoji: "🔴" },
];

const ACTION_TYPES: { value: ActionItem["type"]; label: string }[] = [
  { value: "watch", label: "관찰" },
  { value: "buy", label: "매수 검토" },
  { value: "caution", label: "주의" },
  { value: "target", label: "타점" },
];

const DEFAULT_INDICATORS: MarketIndicator[] = [
  { label: "K200 야간선물", value: "", up: true },
  { label: "NDF 환율", value: "", up: false },
  { label: "코스피 거래대금", value: "", up: true },
];

const STORAGE_KEY = "admin_dailies";

export default function DailyAdmin() {
  const [posts, setPosts] = useState<DailyPost[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  // Form state
  const [date, setDate] = useState("");
  const [mood, setMood] = useState<DailyPost["mood"]>("neutral");
  const [haseulComment, setHaseulComment] = useState("");
  const [summary, setSummary] = useState<[string, string, string]>(["", "", ""]);
  const [indicators, setIndicators] = useState<MarketIndicator[]>(DEFAULT_INDICATORS);
  const [actions, setActions] = useState<ActionItem[]>([
    { type: "watch", content: "" },
  ]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    setMounted(true);
    // TODO: Replace with Firestore
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) setPosts(JSON.parse(stored));
    setDate(new Date().toISOString().split("T")[0]);
  }, []);

  function persist(updated: DailyPost[]) {
    setPosts(updated);
    // TODO: Replace with Firestore
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  }

  function validate(): boolean {
    const errs: Record<string, string> = {};
    if (!date) errs.date = "날짜를 선택하세요";
    if (!haseulComment.trim()) errs.haseulComment = "한마디를 입력하세요";
    if (summary.some((s) => !s.trim())) errs.summary = "세줄요약을 모두 입력하세요";
    if (actions.some((a) => !a.content.trim()))
      errs.actions = "빈 액션 항목이 있습니다";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    const filteredIndicators = indicators.filter((ind) => ind.value.trim());

    if (editingId) {
      const updated = posts.map((p) =>
        p.id === editingId
          ? {
              ...p,
              date,
              mood,
              haseulComment,
              summary,
              indicators: filteredIndicators,
              actions,
            }
          : p
      );
      persist(updated);
    } else {
      const newPost: DailyPost = {
        id: crypto.randomUUID(),
        date,
        mood,
        haseulComment,
        summary,
        indicators: filteredIndicators,
        actions,
      };
      persist([...posts, newPost]);
    }

    resetForm();
  }

  function handleEdit(post: DailyPost) {
    setEditingId(post.id);
    setDate(post.date);
    setMood(post.mood);
    setHaseulComment(post.haseulComment);
    setSummary(post.summary);
    setIndicators(
      post.indicators.length > 0 ? post.indicators : DEFAULT_INDICATORS
    );
    setActions(post.actions.length > 0 ? post.actions : [{ type: "watch", content: "" }]);
    setShowForm(true);
    setErrors({});
  }

  function handleDelete(id: string) {
    if (!confirm("정말 삭제하시겠습니까?")) return;
    persist(posts.filter((p) => p.id !== id));
  }

  function resetForm() {
    setEditingId(null);
    setShowForm(false);
    setDate(new Date().toISOString().split("T")[0]);
    setMood("neutral");
    setHaseulComment("");
    setSummary(["", "", ""]);
    setIndicators(DEFAULT_INDICATORS);
    setActions([{ type: "watch", content: "" }]);
    setErrors({});
  }

  function updateSummary(index: number, value: string) {
    const next = [...summary] as [string, string, string];
    next[index] = value;
    setSummary(next);
  }

  function updateIndicator(
    index: number,
    field: keyof MarketIndicator,
    value: string | boolean
  ) {
    const next = [...indicators];
    next[index] = { ...next[index], [field]: value };
    setIndicators(next);
  }

  function addIndicator() {
    setIndicators([...indicators, { label: "", value: "", up: true }]);
  }

  function removeIndicator(index: number) {
    setIndicators(indicators.filter((_, i) => i !== index));
  }

  function updateAction(
    index: number,
    field: keyof ActionItem,
    value: string
  ) {
    const next = [...actions];
    next[index] = { ...next[index], [field]: value } as ActionItem;
    setActions(next);
  }

  function addAction() {
    setActions([...actions, { type: "watch", content: "" }]);
  }

  function removeAction(index: number) {
    if (actions.length <= 1) return;
    setActions(actions.filter((_, i) => i !== index));
  }

  if (!mounted) return null;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">데일리 매크로</h1>
          <p className="mt-1 text-sm text-gray-500">
            매일의 시장 분석과 액션 가이드를 작성합니다.
          </p>
        </div>
        {!showForm && (
          <button
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
            className="flex items-center gap-1.5 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-700"
          >
            <Plus className="h-4 w-4" />
            새 데일리
          </button>
        )}
      </div>

      {/* Form */}
      {showForm && (
        <div className="mb-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-bold text-gray-900">
              {editingId ? "데일리 수정" : "새 데일리 작성"}
            </h2>
            <button
              onClick={resetForm}
              className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Date & Mood */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  날짜 <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className={`w-full rounded-lg border px-3 py-2 text-sm outline-none transition-colors focus:border-primary-400 focus:ring-2 focus:ring-primary-100 ${
                    errors.date ? "border-red-300" : "border-gray-200"
                  }`}
                />
                {errors.date && (
                  <p className="mt-1 text-xs text-red-500">{errors.date}</p>
                )}
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  시장 분위기
                </label>
                <div className="flex gap-2">
                  {MOOD_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setMood(opt.value)}
                      className={`flex-1 rounded-lg border px-3 py-2 text-sm transition-colors ${
                        mood === opt.value
                          ? "border-primary-400 bg-primary-50 font-medium text-primary-700"
                          : "border-gray-200 text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      {opt.emoji} {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Haseul comment */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                하슬님의 한마디 <span className="text-red-500">*</span>
              </label>
              <textarea
                value={haseulComment}
                onChange={(e) => {
                  setHaseulComment(e.target.value);
                  if (errors.haseulComment)
                    setErrors((prev) => ({ ...prev, haseulComment: "" }));
                }}
                rows={3}
                placeholder="오늘 시장에 대한 한마디를 작성하세요"
                className={`w-full resize-none rounded-lg border px-3 py-2 text-sm outline-none transition-colors focus:border-primary-400 focus:ring-2 focus:ring-primary-100 ${
                  errors.haseulComment ? "border-red-300" : "border-gray-200"
                }`}
              />
              {errors.haseulComment && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.haseulComment}
                </p>
              )}
            </div>

            {/* 3-line summary */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                세줄요약 <span className="text-red-500">*</span>
              </label>
              <div className="space-y-2">
                {summary.map((line, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-bold text-gray-500">
                      {i + 1}
                    </span>
                    <input
                      type="text"
                      value={line}
                      onChange={(e) => updateSummary(i, e.target.value)}
                      placeholder={`요약 ${i + 1}번째 줄`}
                      className={`w-full rounded-lg border px-3 py-2 text-sm outline-none transition-colors focus:border-primary-400 focus:ring-2 focus:ring-primary-100 ${
                        errors.summary ? "border-red-300" : "border-gray-200"
                      }`}
                    />
                  </div>
                ))}
              </div>
              {errors.summary && (
                <p className="mt-1 text-xs text-red-500">{errors.summary}</p>
              )}
            </div>

            {/* Market indicators */}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">
                  시장 지표
                </label>
                <button
                  type="button"
                  onClick={addIndicator}
                  className="flex items-center gap-1 text-xs text-primary-600 hover:underline"
                >
                  <Plus className="h-3 w-3" />
                  지표 추가
                </button>
              </div>
              <div className="space-y-2">
                {indicators.map((ind, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={ind.label}
                      onChange={(e) =>
                        updateIndicator(i, "label", e.target.value)
                      }
                      placeholder="지표명"
                      className="w-36 rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
                    />
                    <input
                      type="text"
                      value={ind.value}
                      onChange={(e) =>
                        updateIndicator(i, "value", e.target.value)
                      }
                      placeholder="값 (예: +1.07%)"
                      className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
                    />
                    <select
                      value={ind.up ? "up" : "down"}
                      onChange={(e) =>
                        updateIndicator(i, "up", e.target.value === "up")
                      }
                      className="w-20 rounded-lg border border-gray-200 px-2 py-2 text-sm outline-none focus:border-primary-400"
                    >
                      <option value="up">상승</option>
                      <option value="down">하락</option>
                    </select>
                    <button
                      type="button"
                      onClick={() => removeIndicator(i)}
                      className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-500"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Action guide */}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">
                  오늘의 액션 가이드
                </label>
                <button
                  type="button"
                  onClick={addAction}
                  className="flex items-center gap-1 text-xs text-primary-600 hover:underline"
                >
                  <Plus className="h-3 w-3" />
                  액션 추가
                </button>
              </div>
              <div className="space-y-2">
                {actions.map((action, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <select
                      value={action.type}
                      onChange={(e) =>
                        updateAction(i, "type", e.target.value)
                      }
                      className="w-28 rounded-lg border border-gray-200 px-2 py-2 text-sm outline-none focus:border-primary-400"
                    >
                      {ACTION_TYPES.map((t) => (
                        <option key={t.value} value={t.value}>
                          {t.label}
                        </option>
                      ))}
                    </select>
                    <input
                      type="text"
                      value={action.content}
                      onChange={(e) =>
                        updateAction(i, "content", e.target.value)
                      }
                      placeholder="내용을 입력하세요"
                      className={`flex-1 rounded-lg border px-3 py-2 text-sm outline-none transition-colors focus:border-primary-400 focus:ring-2 focus:ring-primary-100 ${
                        errors.actions ? "border-red-300" : "border-gray-200"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => removeAction(i)}
                      disabled={actions.length <= 1}
                      className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-500 disabled:opacity-30"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
              {errors.actions && (
                <p className="mt-1 text-xs text-red-500">{errors.actions}</p>
              )}
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                className="flex items-center gap-1.5 rounded-lg bg-primary-600 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-700"
              >
                <Save className="h-4 w-4" />
                {editingId ? "수정 완료" : "데일리 등록"}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="rounded-lg border border-gray-200 px-5 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50"
              >
                취소
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Post list */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-100 px-5 py-3">
          <h2 className="text-sm font-bold text-gray-900">
            등록된 데일리 ({posts.length})
          </h2>
        </div>

        {posts.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <p className="text-sm text-gray-400">
              아직 등록된 데일리가 없습니다.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {[...posts].reverse().map((post) => {
              const moodInfo = MOOD_OPTIONS.find((m) => m.value === post.mood);
              return (
                <div
                  key={post.id}
                  className="px-5 py-4 transition-colors hover:bg-gray-50"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-gray-900">
                        {post.date}
                      </span>
                      <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px]">
                        {moodInfo?.emoji} {moodInfo?.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleEdit(post)}
                        className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(post.id)}
                        className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <p className="mt-1 text-sm text-gray-600 line-clamp-2">
                    {post.haseulComment}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {post.actions.map((a, i) => (
                      <span
                        key={i}
                        className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] text-gray-500"
                      >
                        {ACTION_TYPES.find((t) => t.value === a.type)?.label}:{" "}
                        {a.content.slice(0, 20)}
                        {a.content.length > 20 ? "..." : ""}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
