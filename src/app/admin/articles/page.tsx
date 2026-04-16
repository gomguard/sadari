"use client";

import { useEffect, useState } from "react";
import { Save, Plus, Pencil, Trash2, X } from "lucide-react";

interface AdminArticle {
  id: string;
  title: string;
  description: string;
  category: "입문" | "차트수업" | "전략" | "섹터분석";
  content: string;
  isPremium: boolean;
  date: string;
}

const CATEGORY_OPTIONS: { value: AdminArticle["category"]; label: string }[] = [
  { value: "입문", label: "입문" },
  { value: "차트수업", label: "차트수업" },
  { value: "전략", label: "전략" },
  { value: "섹터분석", label: "섹터분석" },
];

const EMPTY_FORM = {
  title: "",
  description: "",
  category: "입문" as AdminArticle["category"],
  content: "",
  isPremium: false,
};

const STORAGE_KEY = "admin_articles";

export default function ArticlesAdmin() {
  const [articles, setArticles] = useState<AdminArticle[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // TODO: Replace with Firestore
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) setArticles(JSON.parse(stored));
  }, []);

  function persist(updated: AdminArticle[]) {
    setArticles(updated);
    // TODO: Replace with Firestore
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  }

  function validate(): boolean {
    const errs: Record<string, string> = {};
    if (!form.title.trim()) errs.title = "제목을 입력하세요";
    if (!form.description.trim()) errs.description = "설명을 입력하세요";
    if (!form.content.trim()) errs.content = "본문을 입력하세요";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    if (editingId) {
      const updated = articles.map((a) =>
        a.id === editingId ? { ...a, ...form } : a
      );
      persist(updated);
    } else {
      const newArticle: AdminArticle = {
        ...form,
        id: crypto.randomUUID(),
        date: new Date().toLocaleDateString("ko-KR", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        }),
      };
      persist([...articles, newArticle]);
    }

    resetForm();
  }

  function handleEdit(article: AdminArticle) {
    setEditingId(article.id);
    setForm({
      title: article.title,
      description: article.description,
      category: article.category,
      content: article.content,
      isPremium: article.isPremium,
    });
    setShowForm(true);
    setErrors({});
  }

  function handleDelete(id: string) {
    if (!confirm("정말 삭제하시겠습니까?")) return;
    persist(articles.filter((a) => a.id !== id));
  }

  function resetForm() {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setShowForm(false);
    setErrors({});
  }

  function setField<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: "" }));
  }

  if (!mounted) return null;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">웹진 아티클</h1>
          <p className="mt-1 text-sm text-gray-500">
            교육 콘텐츠와 분석 아티클을 관리합니다.
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
            새 아티클
          </button>
        )}
      </div>

      {/* Form */}
      {showForm && (
        <div className="mb-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-bold text-gray-900">
              {editingId ? "아티클 수정" : "새 아티클 작성"}
            </h2>
            <button
              onClick={resetForm}
              className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Title */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                제목 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setField("title", e.target.value)}
                placeholder="아티클 제목을 입력하세요"
                className={`w-full rounded-lg border px-3 py-2 text-sm outline-none transition-colors focus:border-primary-400 focus:ring-2 focus:ring-primary-100 ${
                  errors.title ? "border-red-300" : "border-gray-200"
                }`}
              />
              {errors.title && (
                <p className="mt-1 text-xs text-red-500">{errors.title}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                설명 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.description}
                onChange={(e) => setField("description", e.target.value)}
                placeholder="리스트에 표시될 짧은 설명"
                className={`w-full rounded-lg border px-3 py-2 text-sm outline-none transition-colors focus:border-primary-400 focus:ring-2 focus:ring-primary-100 ${
                  errors.description ? "border-red-300" : "border-gray-200"
                }`}
              />
              {errors.description && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.description}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {/* Category */}
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  카테고리
                </label>
                <select
                  value={form.category}
                  onChange={(e) =>
                    setField(
                      "category",
                      e.target.value as AdminArticle["category"]
                    )
                  }
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none transition-colors focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
                >
                  {CATEGORY_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Premium */}
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  프리미엄
                </label>
                <div className="flex h-[38px] items-center">
                  <label className="flex cursor-pointer items-center gap-2">
                    <input
                      type="checkbox"
                      checked={form.isPremium}
                      onChange={(e) => setField("isPremium", e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-sm text-gray-600">
                      PRO 콘텐츠로 설정 (향후 유료화)
                    </span>
                  </label>
                </div>
              </div>
            </div>

            {/* Content */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                본문 <span className="text-red-500">*</span>
              </label>
              <textarea
                value={form.content}
                onChange={(e) => setField("content", e.target.value)}
                rows={12}
                placeholder="아티클 본문을 작성하세요 (추후 마크다운 지원 예정)"
                className={`w-full resize-y rounded-lg border px-3 py-2 text-sm leading-relaxed outline-none transition-colors focus:border-primary-400 focus:ring-2 focus:ring-primary-100 ${
                  errors.content ? "border-red-300" : "border-gray-200"
                }`}
              />
              {errors.content && (
                <p className="mt-1 text-xs text-red-500">{errors.content}</p>
              )}
              <p className="mt-1 text-xs text-gray-400">
                {/* TODO: Add markdown preview */}
                마크다운 지원은 추후 업데이트 예정입니다.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                className="flex items-center gap-1.5 rounded-lg bg-primary-600 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-700"
              >
                <Save className="h-4 w-4" />
                {editingId ? "수정 완료" : "아티클 등록"}
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

      {/* Article list */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-100 px-5 py-3">
          <h2 className="text-sm font-bold text-gray-900">
            등록된 아티클 ({articles.length})
          </h2>
        </div>

        {articles.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <p className="text-sm text-gray-400">
              아직 등록된 아티클이 없습니다.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {[...articles].reverse().map((article) => (
              <div
                key={article.id}
                className="px-5 py-4 transition-colors hover:bg-gray-50"
              >
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-primary-50 px-2 py-0.5 text-[10px] font-medium text-primary-600">
                        {article.category}
                      </span>
                      {article.isPremium && (
                        <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-medium text-amber-600">
                          PRO
                        </span>
                      )}
                      <span className="text-[10px] text-gray-400">
                        {article.date}
                      </span>
                    </div>
                    <h3 className="mt-1 text-sm font-semibold text-gray-900">
                      {article.title}
                    </h3>
                    <p className="mt-0.5 text-xs text-gray-500 line-clamp-1">
                      {article.description}
                    </p>
                  </div>
                  <div className="ml-4 flex items-center gap-1">
                    <button
                      onClick={() => handleEdit(article)}
                      className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(article.id)}
                      className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
