import PostForm from "@/components/community/PostForm";
import Link from "next/link";

export default function CreatePostPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <div className="mb-6">
        <Link
          href="/community"
          className="text-sm text-blue-600 hover:text-blue-700"
        >
          ← Quay lại cộng đồng
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-gray-900">Tạo bài viết mới</h1>
      </div>
      <PostForm />
    </div>
  );
}
