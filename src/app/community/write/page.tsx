"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { addPost } from "@/lib/firestore";
import { ArrowLeft } from "lucide-react";

type Category = "자유" | "질문" | "종목토론" | "수익인증";
const categories: Category[] = ["자유", "질문", "종목토론", "수익인증"];

function getProfileColor(nickname: string): string {
  const colors = [
    "bg-rose-500", "bg-blue-500", "bg-emerald-500", "bg-amber-500",
    "bg-violet-500", "bg-pink-500", "bg-teal-500", "bg-indigo-500",
    "bg-orange-500", "bg-cyan-500",
  ];
  let hash = 0;
  for (let i = 0; i < nickname.length; i++) {
    hash = nickname.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

export default function WritePage() {
  const router = useRouter();
  const [nickname, setNickname] = useState("");
  const [category, setCategory] = useState<Category>("자유");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const displayNickname = nickname.trim() || "익명";
  const profileColor = getProfileColor(displayNickname);
  const initial = displayNickname.charAt(0);
  const canSubmit = title.trim().length > 0 && content.trim().length > 0 && !submitting;

  const handleSubmit = async () => {
    if (!canSubmit) return;
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
    <main className="min-h-screen">
      {/* Header */}
      <header className="flex items-center justify-between px-4 pt-12 pb-3 border-b border-gray-100">
        <button
          onClick={() => router.back()}
          className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-gray-900" />
        </button>
        <h1 className="text-[15px] font-semibold text-gray-900">새 스레드</h1>
        <button
          onClick={handleSubmit}
          disabled={!canSubmit}
          className="rounded-full bg-gray-900 px-4 py-1.5 text-[13px] font-semibold text-white transition-opacity disabled:opacity-30"
        >
          {submitting ? "게시 중..." : "게시"}
        </button>
      </header>

      {/* Compose area */}
      <div className="px-4 pt-4">
        <div className="flex gap-3">
          {/* Profile circle */}
          <div className="flex flex-col items-center">
            <div
              className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-white text-[14px] font-bold ${profileColor}`}
            >
              {initial}
            </div>
            <div className="mt-2 w-[2px] flex-1 bg-gray-100 rounded-full" />
          </div>

          {/* Input area */}
          <div className="flex-1 pb-6">
            {/* Nickname input */}
            <input
              type="text"
              placeholder="닉네임 (미입력시 익명)"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              className="w-full text-[14px] font-semibold text-gray-900 placeholder:text-gray-400 outline-none pb-2"
            />

            {/* Title input */}
            <input
              type="text"
              placeholder="제목을 입력하세요"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-[15px] font-bold text-gray-900 placeholder:text-gray-300 outline-none pb-2"
            />

            {/* Content textarea */}
            <textarea
              placeholder="무슨 생각을 하고 계신가요?"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={8}
              className="w-full resize-none text-[14px] leading-relaxed text-gray-700 placeholder:text-gray-300 outline-none"
            />

            {/* Category pills */}
            <div className="mt-3 flex gap-2 flex-wrap">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`rounded-full px-3 py-1 text-[12px] font-medium transition-all ${
                    category === cat
                      ? "bg-gray-900 text-white"
                      : "bg-gray-100 text-gray-500 active:bg-gray-200"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
