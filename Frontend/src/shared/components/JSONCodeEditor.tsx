import React, { useRef, useEffect, useState } from 'react';

interface JSONCodeEditorProps {
    value: string;
    onChange: (val: string) => void;
    placeholder?: string;
    rows?: number;
}

export const JSONCodeEditor: React.FC<JSONCodeEditorProps> = ({ value, onChange, placeholder, rows = 6 }) => {
    const [lintError, setLintError] = useState<string | null>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const preRef = useRef<HTMLPreElement>(null);

    useEffect(() => {
        try {
            if (value.trim()) {
                JSON.parse(value);
                setLintError(null);
            } else {
                setLintError(null);
            }
        } catch (err: any) {
            setLintError(err.message);
        }
    }, [value]);

    // Handle scroll syncing
    const handleScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
        if (preRef.current) {
            preRef.current.scrollTop = e.currentTarget.scrollTop;
            preRef.current.scrollLeft = e.currentTarget.scrollLeft;
        }
    };

    // Syntax highlighting logic for light theme
    const getHighlightedHTML = (text: string) => {
        if (!text) return '';
        // Escape HTML
        let html = text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');

        // Highlight JSON structures for light theme
        // Keys: red (text-rose-600)
        html = html.replace(/(".*?")\s*:/g, '<span class="text-rose-600 font-medium">$1</span>:');
        // String values: blue (text-blue-600)
        html = html.replace(/:\s*(".*?")/g, ': <span class="text-blue-600">$1</span>');
        // Numbers, booleans, null: purple (text-violet-600)
        html = html.replace(/:\s*(true|false|null|\d+(\.\d+)?)/g, ': <span class="text-violet-600 font-bold">$1</span>');

        return html;
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        const textarea = e.currentTarget;
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const text = textarea.value;
        const char = e.key;

        // 1. Enter key formatting inside brackets/braces & auto-indent
        if (char === 'Enter') {
            e.preventDefault();
            
            // Special brace formatting case: {|} or [|]
            if (start > 0 && start < text.length && text[start - 1] === '{' && text[start] === '}') {
                const lastNewline = text.lastIndexOf('\n', start - 2);
                const lineStart = lastNewline === -1 ? 0 : lastNewline + 1;
                const currentLine = text.substring(lineStart, start - 1);
                const match = currentLine.match(/^\s*/);
                const indent = match ? match[0] : '';
                const nextIndent = indent + '  '; // Add 2 spaces
                const newValue = text.substring(0, start) + '\n' + nextIndent + '\n' + indent + text.substring(end);
                onChange(newValue);
                setTimeout(() => {
                    textarea.selectionStart = start + 1 + nextIndent.length;
                    textarea.selectionEnd = start + 1 + nextIndent.length;
                }, 0);
                return;
            }
            if (start > 0 && start < text.length && text[start - 1] === '[' && text[start] === ']') {
                const lastNewline = text.lastIndexOf('\n', start - 2);
                const lineStart = lastNewline === -1 ? 0 : lastNewline + 1;
                const currentLine = text.substring(lineStart, start - 1);
                const match = currentLine.match(/^\s*/);
                const indent = match ? match[0] : '';
                const nextIndent = indent + '  '; // Add 2 spaces
                const newValue = text.substring(0, start) + '\n' + nextIndent + '\n' + indent + text.substring(end);
                onChange(newValue);
                setTimeout(() => {
                    textarea.selectionStart = start + 1 + nextIndent.length;
                    textarea.selectionEnd = start + 1 + nextIndent.length;
                }, 0);
                return;
            }

            // General auto-indent: match the indentation of the current line
            const lastNewline = text.lastIndexOf('\n', start - 1);
            const lineStart = lastNewline === -1 ? 0 : lastNewline + 1;
            const currentLine = text.substring(lineStart, start);
            const match = currentLine.match(/^\s*/);
            const indent = match ? match[0] : '';
            
            const newValue = text.substring(0, start) + '\n' + indent + text.substring(end);
            onChange(newValue);
            setTimeout(() => {
                textarea.selectionStart = start + 1 + indent.length;
                textarea.selectionEnd = start + 1 + indent.length;
            }, 0);
            return;
        }

        // 2. Step-over behavior for closing characters
        if (['}', ']', ')', '"', "'"].includes(char) && text[start] === char) {
            e.preventDefault();
            textarea.selectionStart = start + 1;
            textarea.selectionEnd = start + 1;
            return;
        }

        // 3. Brackets/Quotes auto-completion pairs
        const pairs: Record<string, string> = {
            '{': '}',
            '[': ']',
            '"': '"',
            "'": "'",
            '(': ')'
        };
        if (pairs[char] !== undefined) {
            e.preventDefault();
            const closeChar = pairs[char];
            const newValue = text.substring(0, start) + char + closeChar + text.substring(end);
            onChange(newValue);
            setTimeout(() => {
                textarea.selectionStart = start + 1;
                textarea.selectionEnd = start + 1;
            }, 0);
        }
    };

    // Shared styling to ensure pixel-perfect overlay alignment
    const sharedStyles: React.CSSProperties = {
        fontFamily: 'JetBrains Mono, ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
        fontSize: '12px',
        lineHeight: '1.6',
        padding: '12px',
        border: '1px solid transparent', // Matches invisible boundary padding
        margin: 0,
        boxSizing: 'border-box',
        width: '100%',
        overflow: 'auto',
        whiteSpace: 'pre',
        wordWrap: 'normal'
    };

    return (
        <div className="space-y-1 w-full">
            <div className="relative border border-slate-200 rounded-xl overflow-hidden bg-white min-h-[140px] flex shadow-sm focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500">
                {/* Syntax Highlighted Backdrop */}
                <pre 
                    ref={preRef}
                    className="absolute inset-0 text-slate-800 pointer-events-none select-none scrollbar-none"
                    style={{ ...sharedStyles, zIndex: 1 }}
                    dangerouslySetInnerHTML={{ __html: getHighlightedHTML(value || placeholder || '') }}
                />
                
                {/* Overlay Textarea */}
                <textarea
                    ref={textareaRef}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    onScroll={handleScroll}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder}
                    rows={rows}
                    spellCheck="false"
                    className="w-full bg-transparent text-transparent caret-slate-800 focus:outline-none resize-none z-10 scrollbar-thin"
                    style={{ ...sharedStyles, minHeight: '140px', zIndex: 2 }}
                />
            </div>
            {lintError && (
                <div className="text-[10px] text-rose-500 font-mono leading-tight px-1 flex items-center space-x-1">
                    <span>⚠️ JSON Error:</span>
                    <span>{lintError}</span>
                </div>
            )}
        </div>
    );
};
