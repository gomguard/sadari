"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, X, Save, Send } from "lucide-react";
import {
  getSignals,
  addSignal,
  updateSignal,
  deleteSignal,
} from "@/lib/firestore";

interface AdminSignal {
  id: string;
  stockName: string;
  ticker: string;
  sector: string;
  entryPrice: number;
  targetPrice: number;
  stopLoss: number;
  currentPrice: number;
  status: "active" | "hit_target" | "hit_stoploss" | "holding";
  memo: string;
  date: string;
}

const EMPTY_SIGNAL: Omit<AdminSignal, "id" | "date"> = {
  stockName: "",
  ticker: "",
  sector: "",
  entryPrice: 0,
  targetPrice: 0,
  stopLoss: 0,
  currentPrice: 0,
  status: "active",
  memo: "",
};

const STATUS_OPTIONS: { value: AdminSignal["status"]; label: string }[] = [
  { value: "active", label: "진행중" },
  { value: "holding", label: "홀딩" },
  { value: "hit_target", label: "목표 달성" },
  { value: "hit_stoploss", label: "손절" },
];

const SECTOR_PRESETS = [
  "반도체",
  "바이오",
  "2차전지",
  "방산",
  "로봇",
  "화장품",
  "조선",
  "자동차",
  "엔터",
  "기타",
];

const statusColors: Record<string, string> = {
  active: "bg-blue-100 text-blue-700",
  hit_target: "bg-emerald-100 text-emerald-700",
  hit_stoploss: "bg-red-100 text-red-700",
  holding: "bg-amber-100 text-amber-700",
};

export default function SignalsAdmin() {
  const [signals, setSignals] = useState<AdminSignal[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_SIGNAL);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sendingKakao, setSendingKakao] = useState<string | null>(null);
  const [kakaoResult, setKakaoResult] = useState<{
    id: string;
    success: boolean;
    message: string;
  } | null>(null);

  useEffect(() => {
    loadSignals();
  }, []);

  async function loadSignals() {
    try {
      setLoading(true);
      setError(null);
      const data = await getSignals();
      setSignals(data as unknown as AdminSignal[]);
    } catch (err) {
      console.error("Failed to load signals:", err);
      setError("시그널 데이터를 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  }

  function validate(): boolean {
    const errs: Record<string, string> = {};
    if (!form.stockName.trim()) errs.stockName = "종목명을 입력하세요";
    if (!form.sector.trim()) errs.sector = "섹터를 선택하세요";
    if (form.entryPrice <= 0) errs.entryPrice = "진입가를 입력하세요";
    if (form.targetPrice <= 0) errs.targetPrice = "목표가를 입력하세요";
    if (form.stopLoss <= 0) errs.stopLoss = "손절가를 입력하세요";
    if (form.targetPrice <= form.entryPrice)
      errs.targetPrice = "목표가는 진입가보다 높아야 합니다";
    if (form.stopLoss >= form.entryPrice)
      errs.stopLoss = "손절가는 진입가보다 낮아야 합니다";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    try {
      setSaving(true);
      setError(null);

      if (editingId) {
        await updateSignal(editingId, form);
      } else {
        const newSignalData = {
          ...form,
          ticker: form.ticker || "",
          date: new Date().toLocaleDateString("ko-KR", {
            month: "2-digit",
            day: "2-digit",
          }),
        };
        await addSignal(newSignalData as any);
      }

      await loadSignals();
      resetForm();
    } catch (err) {
      console.error("Failed to save signal:", err);
      setError("시그널 저장에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setSaving(false);
    }
  }

  function handleEdit(signal: AdminSignal) {
    setEditingId(signal.id);
    setForm({
      stockName: signal.stockName,
      ticker: signal.ticker || "",
      sector: signal.sector,
      entryPrice: signal.entryPrice,
      targetPrice: signal.targetPrice,
      stopLoss: signal.stopLoss,
      currentPrice: signal.currentPrice,
      status: signal.status,
      memo: signal.memo,
    });
    setShowForm(true);
    setErrors({});
  }

  async function handleDelete(id: string) {
    if (!confirm("정말 삭제하시겠습니까?")) return;

    try {
      setError(null);
      await deleteSignal(id);
      setSignals((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      console.error("Failed to delete signal:", err);
      setError("시그널 삭제에 실패했습니다. 다시 시도해주세요.");
    }
  }

  function resetForm() {
    setForm(EMPTY_SIGNAL);
    setEditingId(null);
    setShowForm(false);
    setErrors({});
  }

  function setField<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: "" }));
  }

  async function handleSendKakao(signal: AdminSignal) {
    if (sendingKakao) return;
    if (
      !confirm(
        `"${signal.stockName}" 시그널을 카카오톡으로 발송하시겠습니까?\n\n알림 수신 동의한 회원들에게 알림톡이 전송됩니다.`
      )
    )
      return;

    setSendingKakao(signal.id);
    setKakaoResult(null);

    try {
      const response = await fetch("/api/kakao/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "signal",
          data: {
            stockName: signal.stockName,
            sector: signal.sector,
            entryPrice: signal.entryPrice,
            targetPrice: signal.targetPrice,
            stopLoss: signal.stopLoss,
            currentPrice: signal.currentPrice,
            status: signal.status,
            memo: signal.memo,
            date: signal.date,
          },
        }),
      });

      const result = await response.json();
      setKakaoResult({
        id: signal.id,
        success: result.success,
        message: result.success
          ? result.message || "알림톡 발송 완료"
          : result.error || "알림톡 발송 실패",
      });
    } catch {
      setKakaoResult({
        id: signal.id,
        success: false,
        message: "네트워크 오류: 알림톡 발송에 실패했습니다.",
      });
    } finally {
      setSendingKakao(null);
      // 3초 후 결과 메시지 자동 숨김
      setTimeout(() => setKakaoResult(null), 5000);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-primary-600" />
          <p className="mt-3 text-sm text-gray-500">시그널 데이터를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">시그널 관리</h1>
          <p className="mt-1 text-sm text-gray-500">
            종목 시그널을 등록하고 관리합니다.
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
            새 시그널
          </button>
        )}
      </div>

      {/* Error message */}
      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Form */}
      {showForm && (
        <div className="mb-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-bold text-gray-900">
              {editingId ? "시그널 수정" : "새 시그널 등록"}
            </h2>
            <button
              onClick={resetForm}
              className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {/* Stock name */}
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  종목명 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.stockName}
                  onChange={(e) => setField("stockName", e.target.value)}
                  placeholder="예: 대봉엘에스"
                  className={`w-full rounded-lg border px-3 py-2 text-sm outline-none transition-colors focus:border-primary-400 focus:ring-2 focus:ring-primary-100 ${
                    errors.stockName ? "border-red-300" : "border-gray-200"
                  }`}
                />
                {errors.stockName && (
                  <p className="mt-1 text-xs text-red-500">{errors.stockName}</p>
                )}
              </div>

              {/* Ticker */}
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  종목코드 (6자리)
                </label>
                <input
                  type="text"
                  value={form.ticker}
                  onChange={(e) => setField("ticker", e.target.value)}
                  placeholder="예: 005930"
                  maxLength={6}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none transition-colors focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {/* Sector */}
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  섹터 <span className="text-red-500">*</span>
                </label>
                <select
                  value={form.sector}
                  onChange={(e) => setField("sector", e.target.value)}
                  className={`w-full rounded-lg border px-3 py-2 text-sm outline-none transition-colors focus:border-primary-400 focus:ring-2 focus:ring-primary-100 ${
                    errors.sector ? "border-red-300" : "border-gray-200"
                  }`}
                >
                  <option value="">섹터 선택</option>
                  {SECTOR_PRESETS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                {errors.sector && (
                  <p className="mt-1 text-xs text-red-500">{errors.sector}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {/* Entry price */}
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  진입가 <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={form.entryPrice || ""}
                  onChange={(e) =>
                    setField("entryPrice", Number(e.target.value))
                  }
                  placeholder="0"
                  className={`w-full rounded-lg border px-3 py-2 text-sm outline-none transition-colors focus:border-primary-400 focus:ring-2 focus:ring-primary-100 ${
                    errors.entryPrice ? "border-red-300" : "border-gray-200"
                  }`}
                />
                {errors.entryPrice && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.entryPrice}
                  </p>
                )}
              </div>

              {/* Target price */}
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  목표가 <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={form.targetPrice || ""}
                  onChange={(e) =>
                    setField("targetPrice", Number(e.target.value))
                  }
                  placeholder="0"
                  className={`w-full rounded-lg border px-3 py-2 text-sm outline-none transition-colors focus:border-primary-400 focus:ring-2 focus:ring-primary-100 ${
                    errors.targetPrice ? "border-red-300" : "border-gray-200"
                  }`}
                />
                {errors.targetPrice && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.targetPrice}
                  </p>
                )}
              </div>

              {/* Stop loss */}
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  손절가 <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={form.stopLoss || ""}
                  onChange={(e) =>
                    setField("stopLoss", Number(e.target.value))
                  }
                  placeholder="0"
                  className={`w-full rounded-lg border px-3 py-2 text-sm outline-none transition-colors focus:border-primary-400 focus:ring-2 focus:ring-primary-100 ${
                    errors.stopLoss ? "border-red-300" : "border-gray-200"
                  }`}
                />
                {errors.stopLoss && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.stopLoss}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {/* Current price */}
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  현재가
                </label>
                <input
                  type="number"
                  value={form.currentPrice || ""}
                  onChange={(e) =>
                    setField("currentPrice", Number(e.target.value))
                  }
                  placeholder="입력 안 하면 진입가로 설정"
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none transition-colors focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
                />
              </div>

              {/* Status */}
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  상태
                </label>
                <select
                  value={form.status}
                  onChange={(e) =>
                    setField(
                      "status",
                      e.target.value as AdminSignal["status"]
                    )
                  }
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none transition-colors focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
                >
                  {STATUS_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Memo */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                메모 / 코멘터리
              </label>
              <textarea
                value={form.memo}
                onChange={(e) => setField("memo", e.target.value)}
                rows={3}
                placeholder="시그널에 대한 설명이나 메모를 작성하세요"
                className="w-full resize-none rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none transition-colors focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
              />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-1.5 rounded-lg bg-primary-600 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-700 disabled:opacity-50"
              >
                <Save className="h-4 w-4" />
                {saving
                  ? "저장 중..."
                  : editingId
                    ? "수정 완료"
                    : "시그널 등록"}
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

      {/* Signal list */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-100 px-5 py-3">
          <h2 className="text-sm font-bold text-gray-900">
            등록된 시그널 ({signals.length})
          </h2>
        </div>

        {signals.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <p className="text-sm text-gray-400">
              아직 등록된 시그널이 없습니다.
            </p>
            <p className="mt-1 text-xs text-gray-300">
              위의 &quot;새 시그널&quot; 버튼을 눌러 시작하세요.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {[...signals].reverse().map((signal) => (
              <div
                key={signal.id}
                className="relative flex items-center justify-between px-5 py-3 transition-colors hover:bg-gray-50"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-900">
                      {signal.stockName}
                    </span>
                    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] text-gray-500">
                      {signal.sector}
                    </span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                        statusColors[signal.status]
                      }`}
                    >
                      {STATUS_OPTIONS.find((o) => o.value === signal.status)
                        ?.label}
                    </span>
                  </div>
                  <div className="mt-1 flex items-center gap-3 text-xs text-gray-400">
                    <span>
                      진입 {signal.entryPrice.toLocaleString()}원
                    </span>
                    <span>
                      목표 {signal.targetPrice.toLocaleString()}원
                    </span>
                    <span>
                      손절 {signal.stopLoss.toLocaleString()}원
                    </span>
                    <span>
                      현재 {signal.currentPrice.toLocaleString()}원
                    </span>
                    <span>{signal.date}</span>
                  </div>
                  {signal.memo && (
                    <p className="mt-1 text-xs text-gray-400 line-clamp-1">
                      {signal.memo}
                    </p>
                  )}
                </div>
                <div className="ml-4 flex items-center gap-1">
                  <button
                    onClick={() => handleSendKakao(signal)}
                    disabled={sendingKakao === signal.id}
                    title="카카오톡 알림 보내기"
                    className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-yellow-50 hover:text-yellow-600 disabled:opacity-50"
                  >
                    <Send className={`h-4 w-4 ${sendingKakao === signal.id ? "animate-pulse" : ""}`} />
                  </button>
                  <button
                    onClick={() => handleEdit(signal)}
                    className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(signal.id)}
                    className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                {/* 카카오톡 발송 결과 메시지 */}
                {kakaoResult && kakaoResult.id === signal.id && (
                  <div
                    className={`absolute right-4 top-full z-10 mt-1 rounded-lg px-3 py-1.5 text-xs font-medium shadow-lg ${
                      kakaoResult.success
                        ? "bg-emerald-500 text-white"
                        : "bg-red-500 text-white"
                    }`}
                  >
                    {kakaoResult.message}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
