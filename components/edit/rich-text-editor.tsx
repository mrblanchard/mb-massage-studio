"use client";

import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import Underline from "@tiptap/extension-underline";
import { EditorContent, useEditor, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {
  Bold,
  Heading2,
  Heading3,
  Italic,
  Link2,
  List,
  ListOrdered,
  Quote,
  Redo2,
  Underline as UnderlineIcon,
  Undo2,
} from "lucide-react";
import { marked } from "marked";
import { useState } from "react";
import TurndownService from "turndown";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

const turndownService = new TurndownService({ headingStyle: "atx" });

function markdownToHtml(markdown: string): string {
  return marked.parse(markdown, { async: false }) as string;
}

type SourceMode = "visual" | "html" | "markdown";

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

export function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
  const [mode, setMode] = useState<SourceMode>("visual");
  const [sourceText, setSourceText] = useState("");

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3] } }),
      Underline,
      Link.configure({ openOnClick: false, autolink: true }),
      Placeholder.configure({ placeholder: placeholder ?? "Start writing..." }),
    ],
    content: value,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: {
        class: "prose dark:prose-invert max-w-none min-h-40 px-3 py-2 focus:outline-none",
      },
    },
  });

  if (!editor) {
    return (
      <div className="min-h-[12.5rem] rounded-lg border border-input bg-transparent" />
    );
  }

  const switchMode = (next: SourceMode) => {
    if (next === mode) return;

    if (next === "visual") {
      const html = mode === "markdown" ? markdownToHtml(sourceText) : sourceText;
      editor.commands.setContent(html);
      onChange(html);
    } else if (next === "html") {
      setSourceText(mode === "markdown" ? markdownToHtml(sourceText) : editor.getHTML());
    } else {
      setSourceText(mode === "html" ? turndownService.turndown(sourceText) : turndownService.turndown(editor.getHTML()));
    }

    setMode(next);
  };

  const handleSourceChange = (next: string) => {
    setSourceText(next);
    onChange(mode === "markdown" ? markdownToHtml(next) : next);
  };

  return (
    <div className="rounded-lg border border-input focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50">
      <div className="flex items-center justify-between gap-1 p-1.5">
        {mode === "visual" ? (
          <Toolbar editor={editor} />
        ) : (
          <span className="px-1.5 text-xs text-muted-foreground">
            {mode === "html" ? "Editing raw HTML" : "Editing Markdown"}
          </span>
        )}
        <ModeSwitcher mode={mode} onChange={switchMode} />
      </div>
      <Separator />
      {mode === "visual" ? (
        <EditorContent editor={editor} />
      ) : (
        <textarea
          value={sourceText}
          onChange={(e) => handleSourceChange(e.target.value)}
          spellCheck={false}
          className="min-h-40 w-full resize-y bg-transparent px-3 py-2 font-mono text-sm outline-none"
        />
      )}
    </div>
  );
}

function ModeSwitcher({ mode, onChange }: { mode: SourceMode; onChange: (mode: SourceMode) => void }) {
  const options: { value: SourceMode; label: string }[] = [
    { value: "visual", label: "Visual" },
    { value: "html", label: "HTML" },
    { value: "markdown", label: "Markdown" },
  ];

  return (
    <div className="flex shrink-0 gap-0.5 rounded-md border p-0.5">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={cn(
            "rounded px-2 py-1 text-xs font-medium transition-colors",
            mode === opt.value
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-muted",
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

function Toolbar({ editor }: { editor: Editor }) {
  return (
    <div className="flex flex-wrap items-center gap-1">
      <ToolbarButton
        label="Bold"
        active={editor.isActive("bold")}
        onClick={() => editor.chain().focus().toggleBold().run()}
      >
        <Bold />
      </ToolbarButton>
      <ToolbarButton
        label="Italic"
        active={editor.isActive("italic")}
        onClick={() => editor.chain().focus().toggleItalic().run()}
      >
        <Italic />
      </ToolbarButton>
      <ToolbarButton
        label="Underline"
        active={editor.isActive("underline")}
        onClick={() => editor.chain().focus().toggleUnderline().run()}
      >
        <UnderlineIcon />
      </ToolbarButton>
      <Separator orientation="vertical" className="h-6" />
      <ToolbarButton
        label="Heading 2"
        active={editor.isActive("heading", { level: 2 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
      >
        <Heading2 />
      </ToolbarButton>
      <ToolbarButton
        label="Heading 3"
        active={editor.isActive("heading", { level: 3 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
      >
        <Heading3 />
      </ToolbarButton>
      <Separator orientation="vertical" className="h-6" />
      <ToolbarButton
        label="Bullet list"
        active={editor.isActive("bulletList")}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
      >
        <List />
      </ToolbarButton>
      <ToolbarButton
        label="Numbered list"
        active={editor.isActive("orderedList")}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
      >
        <ListOrdered />
      </ToolbarButton>
      <ToolbarButton
        label="Quote"
        active={editor.isActive("blockquote")}
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
      >
        <Quote />
      </ToolbarButton>
      <Separator orientation="vertical" className="h-6" />
      <LinkButton editor={editor} />
      <Separator orientation="vertical" className="h-6" />
      <ToolbarButton
        label="Undo"
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
      >
        <Undo2 />
      </ToolbarButton>
      <ToolbarButton
        label="Redo"
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
      >
        <Redo2 />
      </ToolbarButton>
    </div>
  );
}

function ToolbarButton({
  label,
  active,
  disabled,
  onClick,
  children,
}: {
  label: string;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      aria-label={label}
      aria-pressed={active}
      disabled={disabled}
      className={cn(active && "bg-muted text-foreground")}
      onClick={onClick}
    >
      {children}
    </Button>
  );
}

function LinkButton({ editor }: { editor: Editor }) {
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState("");

  return (
    <Popover
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        if (nextOpen) {
          setUrl(editor.getAttributes("link").href ?? "");
        }
      }}
    >
      <PopoverTrigger
        render={
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label="Link"
            aria-pressed={editor.isActive("link")}
            className={cn(editor.isActive("link") && "bg-muted text-foreground")}
          >
            <Link2 />
          </Button>
        }
      />
      <PopoverContent className="w-64">
        <form
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (url.trim()) {
              editor.chain().focus().extendMarkRange("link").setLink({ href: url.trim() }).run();
            } else {
              editor.chain().focus().extendMarkRange("link").unsetLink().run();
            }
            setOpen(false);
          }}
        >
          <Input
            autoFocus
            placeholder="https://example.com"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
          <Button type="submit" size="sm">
            {url.trim() ? "Apply" : "Remove"}
          </Button>
        </form>
      </PopoverContent>
    </Popover>
  );
}
