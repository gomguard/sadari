"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { addPost } from "@/lib/firestore";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

type Category = "자유" | "질문" | "종목토론" | "수익인증";
const categories: Category[] = ["자유", "질문", "종목토론", "수익인증"];

export default function WritePage() {
  const router = useRouter();
  const [nickname, setNickname] = useState("");
  const [category, setCategory] = useState<Category>("자유");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) return;
    setSubmitting(true);
    try {
      const finalNickname =
        nickname.trim() || `익명${Math.floor(Math.random() * 9000) + 1000}`;
      await addPost({
        nickname: finalNickname,
        title: title.trim(),
        content: content.trim(),
        category,
      });
      router.push("/community");
    } catch (err) {
      console.error(err);
      setSubmitting(false);
    }
  };

  return (
    <main className="pb-20">
      {/* Header */}
      <header className="flex items-center gap-3 px-4 pt-12 pb-4">
        <Link
          href="/community"
          className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-600" />
        </Link>
        <h1 className="text-lg font-bold text-gray-900">글쓰기</h1>
        <button
          onClick={handleSubmit}
          disabled={submitting || !title.trim() || !content.trim()}
          className="ml-auto rounded-full bg-primary-600 px-4 py-1.5 text-xs font-semibold text-white transition-opacity disabled:opacity-40"
        >
          {submitting ? "등록 중..." : "등록"}
        </button>
      </header>

      <div className="space-y-4 px-5">
        {/* Nickname */}
        <input
          type="text"
          placeholder="닉네임 (미입력시 익명)"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:border-primary-300 focus:ring-2 focus:ring-primary-100"
        />

        {/* Category */}
        <div className="flex gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${
                category === cat
                  ? "bg-gray-900 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Title */}
        <input
          type="text"
          placeholder="제목을 입력하세요"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-semibold text-gray-900 placeholder:text-gray-400 outline-none focus:border-primary-300 focus:ring-2 focus:ring-primary-100"
        />

        {/* Content */}
        <textarea
          placeholder="내용을 입력하세요"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={10}
          className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm leading-relaxed text-gray-900 placeholder:text-gray-400 outline-none focus:border-primary-300 focus:ring-2 focus:ring-primary-100"
        />
      </div>
    </main>
  );
}
