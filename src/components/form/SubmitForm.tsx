"use client";

import { useState, useTransition } from "react";
import { AnonymityToggle } from "@/components/form/AnonymityToggle";
import { CategorySelect } from "@/components/form/CategorySelect";
import { RichTextEditor } from "@/components/form/RichTextEditor";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { submitAspiration } from "@/lib/submit-actions";
import type { AspirationCategory } from "@/types/aspiration";
import { Send, CheckCircle2, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function SubmitForm() {
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [category, setCategory] = useState<AspirationCategory>("saran");
  const [content, setContent] = useState("<p></p>");
  const [authorName, setAuthorName] = useState("");
  const [authorAddress, setAuthorAddress] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [statusMessage, setStatusMessage] = useState("");
  const [isPending, startTransition] = useTransition();
  const [editorKey, setEditorKey] = useState(0);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});
    setStatus("idle");

    const raw = {
      content,
      category,
      is_anonymous: isAnonymous,
      author_name: authorName,
      author_address: authorAddress,
    };

    startTransition(async () => {
      const { aspirationSchema } = await import("@/lib/validators");
      const parsed = aspirationSchema.safeParse(raw);
      if (!parsed.success) {
        const fieldErrors: Record<string, string> = {};
        parsed.error.issues.forEach((issue) => {
          const field = issue.path[0]?.toString();
          if (field) fieldErrors[field] = issue.message;
        });
        setErrors(fieldErrors);
        return;
      }

      const formData = new FormData();
      formData.set("content", content);
      formData.set("category", category);
      formData.set("is_anonymous", String(isAnonymous));
      formData.set("author_name", authorName);
      formData.set("author_address", authorAddress);

      const result = await submitAspiration(formData);
      if (result.success) {
        setStatus("success");
        setStatusMessage("Aspirasi berhasil dikirim dan langsung tampil di feed!");
        setContent("<p></p>");
        setEditorKey((k) => k + 1);
        setAuthorName("");
        setAuthorAddress("");
        setIsAnonymous(true);
        setCategory("saran");
        setTimeout(() => setStatus("idle"), 5000);
      } else {
        setStatus("error");
        setStatusMessage(result.error);
      }
    });
  };

  return (
    <Card variant="elevated" id="kirim-aspirasi">
      <div className="mb-6">
        <h2 className="font-heading text-xl font-bold text-meranti-forest sm:text-2xl">
          Kirim Saran & Aspirasi
        </h2>
        <p className="mt-1 text-sm text-meranti-forest/60">
          Sampaikan ide, keluhan, atau apresiasi Anda — dengan format teks kaya
          (tebal, miring, daftar, tautan).
        </p>
      </div>

      <AnimatePresence mode="wait">
        {status !== "idle" && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className={`mb-4 flex items-center gap-3 rounded-2xl px-4 py-3 text-sm ${
              status === "success"
                ? "bg-emerald-50 text-emerald-800"
                : "bg-red-50 text-red-800"
            }`}
          >
            {status === "success" ? (
              <CheckCircle2 className="h-5 w-5 shrink-0" />
            ) : (
              <AlertCircle className="h-5 w-5 shrink-0" />
            )}
            <span>{statusMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <CategorySelect value={category} onChange={setCategory} />

        <AnonymityToggle
          isAnonymous={isAnonymous}
          onChange={setIsAnonymous}
        />

        {!isAnonymous && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="flex flex-col gap-4 overflow-hidden"
          >
            <Input
              label="Nama"
              placeholder="Contoh: Imam T H"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              error={errors.author_name}
              autoComplete="name"
            />
            <Input
              label="Alamat Rumah"
              placeholder="Contoh: CH12/NO15"
              value={authorAddress}
              onChange={(e) => setAuthorAddress(e.target.value)}
              error={errors.author_address}
              autoComplete="street-address"
            />
          </motion.div>
        )}

        <RichTextEditor
          key={editorKey}
          value={content}
          onChange={setContent}
          error={errors.content}
        />

        <Button
          type="submit"
          size="lg"
          isLoading={isPending}
          className="w-full sm:w-auto"
        >
          <Send className="h-4 w-4" />
          Kirim Aspirasi
        </Button>
      </form>
    </Card>
  );
}
