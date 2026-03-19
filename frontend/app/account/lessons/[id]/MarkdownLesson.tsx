"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function MarkdownLesson({ content }: { content: string }) {
  return (
    <article className="markdown-content rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <h1 className="mb-4 text-2xl font-bold text-slate-900">{children}</h1>
          ),
          h2: ({ children }) => (
            <h2 className="mb-3 mt-6 text-xl font-bold text-slate-900">{children}</h2>
          ),
          h3: ({ children }) => (
            <h3 className="mb-2 mt-4 text-lg font-semibold text-slate-900">{children}</h3>
          ),
          p: ({ children }) => (
            <p className="mb-3 leading-relaxed text-slate-700">{children}</p>
          ),
          ul: ({ children }) => (
            <ul className="mb-4 list-disc space-y-1 pl-6 text-slate-700">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="mb-4 list-decimal space-y-1 pl-6 text-slate-700">{children}</ol>
          ),
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline hover:no-underline"
            >
              {children}
            </a>
          ),
          code: ({ children }) => (
            <code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-sm text-slate-800">
              {children}
            </code>
          ),
          pre: ({ children }) => (
            <pre className="mb-4 overflow-x-auto rounded-lg bg-slate-900 p-4 text-sm text-slate-100">
              {children}
            </pre>
          ),
          table: ({ children }) => (
            <div className="mb-4 overflow-x-auto">
              <table className="min-w-full border-collapse border border-slate-200">{children}</table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-slate-100">{children}</thead>
          ),
          th: ({ children }) => (
            <th className="border border-slate-200 px-4 py-2 text-left font-semibold text-slate-800">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="border border-slate-200 px-4 py-2 text-slate-700">
              {children}
            </td>
          ),
          tr: ({ children }) => (
            <tr className="border-b border-slate-200">{children}</tr>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </article>
  );
}
