"use client";

import { useMemo, useRef } from "react";
import { useEditor, EditorContent, useEditorState } from "@tiptap/react";
import type { Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { resolvePasteHtml } from "@/lib/html-paste";
import { cn } from "@/lib/utils";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  List,
  ListOrdered,
  Link2,
  Undo2,
  Redo2,
} from "lucide-react";

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  error?: string;
  maxPlainLength?: number;
}

function getPlainTextLength(html: string): number {
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim().length;
}

type ToolbarState = {
  isParagraph: boolean;
  isH1: boolean;
  isH2: boolean;
  isH3: boolean;
  isBold: boolean;
  isItalic: boolean;
  isUnderline: boolean;
  isBulletList: boolean;
  isOrderedList: boolean;
  isLink: boolean;
};

const DEFAULT_TOOLBAR: ToolbarState = {
  isParagraph: true,
  isH1: false,
  isH2: false,
  isH3: false,
  isBold: false,
  isItalic: false,
  isUnderline: false,
  isBulletList: false,
  isOrderedList: false,
  isLink: false,
};

function getToolbarState(ed: Editor): ToolbarState {
  const isH1 = ed.isActive("heading", { level: 1 });
  const isH2 = ed.isActive("heading", { level: 2 });
  const isH3 = ed.isActive("heading", { level: 3 });
  const isHeading = isH1 || isH2 || isH3;

  return {
    isParagraph: !isHeading && ed.isActive("paragraph"),
    isH1,
    isH2,
    isH3,
    isBold: ed.isActive("bold"),
    isItalic: ed.isActive("italic"),
    isUnderline: ed.isActive("underline"),
    isBulletList: ed.isActive("bulletList"),
    isOrderedList: ed.isActive("orderedList"),
    isLink: ed.isActive("link"),
  };
}

export function RichTextEditor({
  value,
  onChange,
  error,
  maxPlainLength = 2000,
}: RichTextEditorProps) {
  const editorRef = useRef<Editor | null>(null);

  const extensions = useMemo(
    () => [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
        codeBlock: false,
        code: false,
        link: {
          openOnClick: false,
          HTMLAttributes: {
            rel: "noopener noreferrer",
            target: "_blank",
            class: "text-meranti-sky underline",
          },
        },
        underline: {},
      }),
      Placeholder.configure({
        placeholder:
          "Tuliskan saran, aspirasi, keluhan, atau pujian Anda di sini...",
      }),
    ],
    [],
  );

  const editor = useEditor({
    extensions,
    content: value,
    immediatelyRender: false,
    onCreate: ({ editor: ed }) => {
      editorRef.current = ed;
    },
    onDestroy: () => {
      editorRef.current = null;
    },
    editorProps: {
      attributes: {
        class:
          "prose-meranti min-h-[140px] w-full px-3 py-3 text-sm text-meranti-forest focus:outline-none sm:px-4",
      },
      handlePaste: (_view, event) => {
        const plainText = event.clipboardData?.getData("text/plain") ?? "";
        const htmlText = event.clipboardData?.getData("text/html") ?? "";
        const parsedHtml = resolvePasteHtml(plainText, htmlText);

        if (!parsedHtml || !editorRef.current) {
          return false;
        }

        event.preventDefault();
        editorRef.current.chain().focus().insertContent(parsedHtml).run();
        return true;
      },
    },
    onUpdate: ({ editor: ed }) => {
      onChange(ed.getHTML());
    },
  });

  const toolbar = useEditorState({
    editor,
    selector: ({ editor: ed }) => {
      if (!ed) return DEFAULT_TOOLBAR;
      return {
        ...getToolbarState(ed),
        // Pastikan re-render saat kursor/selection berubah
        _tick: ed.state.selection.from + ed.state.selection.to,
      };
    },
  }) as (ToolbarState & { _tick?: number }) | null;

  const t = toolbar ?? DEFAULT_TOOLBAR;
  const plainLength = getPlainTextLength(value);

  const setLink = () => {
    if (!editor) return;
    const previousUrl = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("URL tautan", previousUrl ?? "https://");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  if (!editor) {
    return (
      <div className="h-48 animate-pulse rounded-2xl bg-meranti-mist/60" />
    );
  }

  const toolbarBtnBase =
    "flex shrink-0 cursor-pointer items-center justify-center transition-colors touch-manipulation " +
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-meranti-gold " +
    "[-webkit-tap-highlight-color:transparent]";

  const toolbarBtnState = (active: boolean) =>
    active
      ? "bg-meranti-forest text-white shadow-sm hover:bg-meranti-forest-light active:bg-meranti-forest active:scale-95"
      : "bg-transparent text-meranti-forest/70 hover:bg-meranti-mist hover:text-meranti-forest active:bg-meranti-forest/15 active:text-meranti-forest active:scale-95";

  const iconBtn = (
    label: string,
    action: () => void,
    active: boolean,
    Icon: React.ComponentType<{ className?: string }>,
  ) => (
    <button
      key={label}
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={active}
      onMouseDown={(e) => e.preventDefault()}
      onClick={action}
      className={cn(
        toolbarBtnBase,
        "h-10 w-10 rounded-xl sm:h-9 sm:w-9",
        toolbarBtnState(active),
      )}
    >
      <Icon className="h-4 w-4 shrink-0" />
    </button>
  );

  const textBtn = (
    label: string,
    display: string,
    action: () => void,
    active: boolean,
  ) => (
    <button
      key={label}
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={active}
      onMouseDown={(e) => e.preventDefault()}
      onClick={action}
      className={cn(
        toolbarBtnBase,
        "h-10 min-w-10 rounded-lg px-2 text-xs font-bold tracking-tight sm:h-9 sm:min-w-11",
        toolbarBtnState(active),
      )}
    >
      {display}
    </button>
  );

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-meranti-forest">Isi Pesan</label>

      <div
        className={cn(
          "overflow-hidden rounded-2xl border-2 border-meranti-mist bg-white transition-colors",
          "focus-within:border-meranti-forest/30 focus-within:ring-2 focus-within:ring-meranti-gold/30",
          error &&
            "border-red-300 focus-within:border-red-400 focus-within:ring-red-200",
        )}
      >
        <div className="border-b border-meranti-mist bg-meranti-sage/60">
          <div className="flex gap-1 overflow-x-auto p-2 [-webkit-overflow-scrolling:touch]">
            <div className="flex shrink-0 gap-0.5 rounded-xl border border-meranti-mist/80 bg-white/70 p-0.5">
              {textBtn("Paragraf", "P", () => {
                editor.chain().focus().setParagraph().run();
              }, t.isParagraph)}
              {textBtn("Heading 1", "H1", () => {
                editor.chain().focus().setHeading({ level: 1 }).run();
              }, t.isH1)}
              {textBtn("Heading 2", "H2", () => {
                editor.chain().focus().setHeading({ level: 2 }).run();
              }, t.isH2)}
              {textBtn("Heading 3", "H3", () => {
                editor.chain().focus().setHeading({ level: 3 }).run();
              }, t.isH3)}
            </div>

            <div className="mx-0.5 w-px shrink-0 self-stretch bg-meranti-mist" />

            <div className="flex shrink-0 gap-0.5">
              {iconBtn("Tebal", () => editor.chain().focus().toggleBold().run(), t.isBold, Bold)}
              {iconBtn("Miring", () => editor.chain().focus().toggleItalic().run(), t.isItalic, Italic)}
              {iconBtn("Garis bawah", () => editor.chain().focus().toggleUnderline().run(), t.isUnderline, UnderlineIcon)}
            </div>

            <div className="mx-0.5 w-px shrink-0 self-stretch bg-meranti-mist" />

            <div className="flex shrink-0 gap-0.5">
              {iconBtn("Daftar bullet", () => editor.chain().focus().toggleBulletList().run(), t.isBulletList, List)}
              {iconBtn("Daftar nomor", () => editor.chain().focus().toggleOrderedList().run(), t.isOrderedList, ListOrdered)}
              {iconBtn("Tautan", setLink, t.isLink, Link2)}
              {iconBtn("Undo", () => editor.chain().focus().undo().run(), false, Undo2)}
              {iconBtn("Redo", () => editor.chain().focus().redo().run(), false, Redo2)}
            </div>
          </div>
        </div>

        <EditorContent editor={editor} />
      </div>

      <div className="flex items-center justify-between gap-2">
        {error ? (
          <p className="text-xs text-red-600">{error}</p>
        ) : (
          <p className="text-xs text-meranti-forest/40">
            Geser toolbar ke samping di layar kecil
          </p>
        )}
        <p
          className={cn(
            "shrink-0 text-xs text-meranti-forest/50",
            plainLength > maxPlainLength * 0.9 && "text-amber-600",
            plainLength > maxPlainLength && "text-red-600",
          )}
        >
          {plainLength}/{maxPlainLength}
        </p>
      </div>
    </div>
  );
}
