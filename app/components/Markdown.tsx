import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

// AI-ga jawaabtiisa markdown-ka ah (bold, lists, tables)
// si qurux badan ayaan u muujineynaa.
export default function Markdown({
  text,
}: {
  text: string;
}) {
  return (
    <div className="text-[15px] leading-7 text-gray-900">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          p: ({ children }) => (
            <p className="my-3 first:mt-0 last:mb-0">
              {children}
            </p>
          ),
          strong: ({ children }) => (
            <strong className="font-semibold text-gray-950">
              {children}
            </strong>
          ),
          h1: ({ children }) => (
            <h3 className="mb-2 mt-5 text-lg font-bold text-gray-950">
              {children}
            </h3>
          ),
          h2: ({ children }) => (
            <h3 className="mb-2 mt-5 text-base font-bold text-gray-950">
              {children}
            </h3>
          ),
          h3: ({ children }) => (
            <h4 className="mb-2 mt-4 text-[15px] font-semibold text-gray-950">
              {children}
            </h4>
          ),
          ul: ({ children }) => (
            <ul className="my-3 list-disc space-y-1 pl-6">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="my-3 list-decimal space-y-1 pl-6">
              {children}
            </ol>
          ),
          a: ({ children, href }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-gray-950 underline underline-offset-2"
            >
              {children}
            </a>
          ),
          hr: () => (
            <hr className="my-5 border-gray-100" />
          ),
          table: ({ children }) => (
            <div className="my-4 overflow-x-auto rounded-xl border border-gray-200">
              <table className="w-full text-left text-sm">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
              {children}
            </thead>
          ),
          th: ({ children }) => (
            <th className="px-4 py-2.5 font-semibold">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="border-t border-gray-100 px-4 py-2.5">
              {children}
            </td>
          ),
        }}
      >
        {text}
      </ReactMarkdown>
    </div>
  );
}
