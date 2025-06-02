'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import TextAlign from '@tiptap/extension-text-align';
import Highlight from '@tiptap/extension-highlight';
import Underline from '@tiptap/extension-underline';
import Subscript from '@tiptap/extension-subscript';
import Superscript from '@tiptap/extension-superscript';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import { Extension } from '@tiptap/core';
import { Button } from './ui/button';
import { 
  Bold, 
  Italic, 
  List, 
  ListOrdered, 
  Quote, 
  Heading1, 
  Heading2, 
  Heading3,
  Link as LinkIcon,
  Unlink,
  Sparkles,
  Underline as UnderlineIcon,
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Highlighter,
  Code,
  CodeSquare,
  Table as TableIcon,
  Undo,
  Redo,
  Type,
  Palette,
  Subscript as SubscriptIcon,
  Superscript as SuperscriptIcon,
  CheckSquare,
  Image as ImageIcon,
  MoreHorizontal,
  FileText,
  Calendar,
  Hash,
  Minus,
  Download,
  Upload,
  Play,
  Zap,
  ChevronDown,
  Search,
  Command,
  ArrowRight
} from 'lucide-react';
import { workspaceService } from '@/lib/supabase/workspace';

interface RichTextEditorProps {
  content: any;
  onChange: (content: any) => void;
  pageId?: string;
  workspaceId?: string;
  placeholder?: string;
  className?: string;
}

interface LinkSuggestion {
  pageId: string;
  title: string;
  confidence: number;
  reason: string;
}

interface SlashCommand {
  id: string;
  title: string;
  description: string;
  icon: any;
  command: () => void;
  category: 'text' | 'media' | 'advanced' | 'ai';
  keywords: string[];
}

// Custom extension for slash command
const SlashCommand = Extension.create({
  name: 'slashCommand',
  
  addKeyboardShortcuts() {
    return {
      '/': ({ editor }) => {
        const { selection } = editor.state;
        const { $from } = selection;
        
        // Only trigger at the start of a line or after whitespace
        const textBefore = $from.nodeBefore?.textContent || '';
        const isAtLineStart = $from.parentOffset === 0;
        const afterWhitespace = textBefore.endsWith(' ') || textBefore.endsWith('\n');
        
        if (isAtLineStart || afterWhitespace) {
          // Insert the / and trigger the command menu
          editor.commands.insertContent('/');
          return true;
        }
        
        return false;
      }
    };
  }
});

export function RichTextEditor({
  content,
  onChange,
  pageId,
  workspaceId,
  placeholder = "Type '/' for commands...",
  className = ""
}: RichTextEditorProps) {
  const [linkSuggestions, setLinkSuggestions] = useState<LinkSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isGeneratingLinks, setIsGeneratingLinks] = useState(false);
  
  // Slash command state
  const [showSlashMenu, setShowSlashMenu] = useState(false);
  const [slashMenuPosition, setSlashMenuPosition] = useState({ x: 0, y: 0 });
  const [slashQuery, setSlashQuery] = useState('');
  const [selectedCommandIndex, setSelectedCommandIndex] = useState(0);
  const slashMenuRef = useRef<HTMLDivElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: {
          keepMarks: true,
          keepAttributes: false,
        },
        orderedList: {
          keepMarks: true,
          keepAttributes: false,
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 underline cursor-pointer hover:text-blue-800 transition-colors'
        }
      }),
      Placeholder.configure({
        placeholder
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Highlight.configure({
        HTMLAttributes: {
          class: 'bg-yellow-200 px-1 rounded'
        }
      }),
      Underline,
      Subscript,
      Superscript,
      Table.configure({
        resizable: true,
        HTMLAttributes: {
          class: 'border-collapse border border-slate-300 my-4 w-full'
        }
      }),
      TableRow.configure({
        HTMLAttributes: {
          class: 'border border-slate-300'
        }
      }),
      TableHeader.configure({
        HTMLAttributes: {
          class: 'border border-slate-300 bg-slate-50 p-2 font-semibold'
        }
      }),
      TableCell.configure({
        HTMLAttributes: {
          class: 'border border-slate-300 p-2'
        }
      }),
      TaskList.configure({
        HTMLAttributes: {
          class: 'not-prose',
        },
      }),
      TaskItem.configure({
        HTMLAttributes: {
          class: 'flex items-start gap-2 my-1',
        },
        nested: true,
      }),
      SlashCommand,
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getJSON());
      handleSlashCommand(editor);
    },
    editorProps: {
      attributes: {
        class: `prose prose-sm sm:prose lg:prose-lg xl:prose-xl mx-auto focus:outline-none min-h-[300px] max-w-none ${className}`
      },
      handleKeyDown: (view, event) => {
        if (showSlashMenu) {
          if (event.key === 'ArrowDown') {
            event.preventDefault();
            setSelectedCommandIndex(prev => 
              prev < filteredCommands.length - 1 ? prev + 1 : 0
            );
            return true;
          }
          if (event.key === 'ArrowUp') {
            event.preventDefault();
            setSelectedCommandIndex(prev => 
              prev > 0 ? prev - 1 : filteredCommands.length - 1
            );
            return true;
          }
          if (event.key === 'Enter') {
            event.preventDefault();
            executeSlashCommand(filteredCommands[selectedCommandIndex]);
            return true;
          }
          if (event.key === 'Escape') {
            event.preventDefault();
            hideSlashMenu();
            return true;
          }
        }
        return false;
      }
    }
  });

  // Define slash commands
  const slashCommands: SlashCommand[] = [
    // Text formatting
    {
      id: 'heading1',
      title: 'Heading 1',
      description: 'Large section heading',
      icon: Heading1,
      command: () => editor?.chain().focus().toggleHeading({ level: 1 }).run(),
      category: 'text',
      keywords: ['h1', 'title', 'big', 'large']
    },
    {
      id: 'heading2',
      title: 'Heading 2',
      description: 'Medium section heading',
      icon: Heading2,
      command: () => editor?.chain().focus().toggleHeading({ level: 2 }).run(),
      category: 'text',
      keywords: ['h2', 'subtitle', 'medium']
    },
    {
      id: 'heading3',
      title: 'Heading 3',
      description: 'Small section heading',
      icon: Heading3,
      command: () => editor?.chain().focus().toggleHeading({ level: 3 }).run(),
      category: 'text',
      keywords: ['h3', 'small', 'subsection']
    },
    {
      id: 'bulletList',
      title: 'Bullet List',
      description: 'Create a bulleted list',
      icon: List,
      command: () => editor?.chain().focus().toggleBulletList().run(),
      category: 'text',
      keywords: ['ul', 'bullets', 'list']
    },
    {
      id: 'numberedList',
      title: 'Numbered List',
      description: 'Create a numbered list',
      icon: ListOrdered,
      command: () => editor?.chain().focus().toggleOrderedList().run(),
      category: 'text',
      keywords: ['ol', 'numbers', 'ordered']
    },
    {
      id: 'taskList',
      title: 'Task List',
      description: 'Create a task list with checkboxes',
      icon: CheckSquare,
      command: () => editor?.chain().focus().toggleTaskList().run(),
      category: 'text',
      keywords: ['todo', 'checkbox', 'tasks']
    },
    {
      id: 'quote',
      title: 'Quote',
      description: 'Create a quote block',
      icon: Quote,
      command: () => editor?.chain().focus().toggleBlockquote().run(),
      category: 'text',
      keywords: ['blockquote', 'citation']
    },
    {
      id: 'codeBlock',
      title: 'Code Block',
      description: 'Create a code block',
      icon: CodeSquare,
      command: () => editor?.chain().focus().toggleCodeBlock().run(),
      category: 'text',
      keywords: ['code', 'programming', 'syntax']
    },
    {
      id: 'divider',
      title: 'Divider',
      description: 'Add a horizontal divider',
      icon: Minus,
      command: () => editor?.chain().focus().setHorizontalRule().run(),
      category: 'text',
      keywords: ['hr', 'separator', 'line']
    },
    // Advanced
    {
      id: 'table',
      title: 'Table',
      description: 'Insert a table',
      icon: TableIcon,
      command: () => editor?.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run(),
      category: 'advanced',
      keywords: ['grid', 'data', 'rows', 'columns']
    },
    // AI features
    {
      id: 'aiLinks',
      title: 'AI Smart Links',
      description: 'Generate intelligent links to other pages',
      icon: Sparkles,
      command: () => generateAILinks(),
      category: 'ai',
      keywords: ['smart', 'automatic', 'suggestions']
    }
  ];

  const filteredCommands = slashCommands.filter(command => 
    command.title.toLowerCase().includes(slashQuery.toLowerCase()) ||
    command.description.toLowerCase().includes(slashQuery.toLowerCase()) ||
    command.keywords.some(keyword => keyword.toLowerCase().includes(slashQuery.toLowerCase()))
  );

  const handleSlashCommand = (editor: any) => {
    const { selection } = editor.state;
    const { $from } = selection;
    
    // Get text before cursor
    const textBefore = $from.parent.textContent.slice(0, $from.parentOffset);
    const slashMatch = textBefore.match(/\/([a-zA-Z]*)$/);
    
    if (slashMatch) {
      const query = slashMatch[1];
      setSlashQuery(query);
      setSelectedCommandIndex(0);
      
      // Calculate position for slash menu
      const { view } = editor;
      const coords = view.coordsAtPos($from.pos);
      setSlashMenuPosition({
        x: coords.left,
        y: coords.bottom + 10
      });
      
      setShowSlashMenu(true);
    } else {
      setShowSlashMenu(false);
    }
  };

  const executeSlashCommand = (command: SlashCommand) => {
    if (!editor) return;
    
    // Remove the slash and query text
    const { selection } = editor.state;
    const { $from } = selection;
    const textBefore = $from.parent.textContent.slice(0, $from.parentOffset);
    const slashMatch = textBefore.match(/\/([a-zA-Z]*)$/);
    
    if (slashMatch) {
      const from = $from.pos - slashMatch[0].length;
      const to = $from.pos;
      editor.chain().deleteRange({ from, to }).run();
    }
    
    // Execute the command
    command.command();
    hideSlashMenu();
  };

  const hideSlashMenu = () => {
    setShowSlashMenu(false);
    setSlashQuery('');
    setSelectedCommandIndex(0);
  };

  // Close slash menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (slashMenuRef.current && !slashMenuRef.current.contains(event.target as Node)) {
        hideSlashMenu();
      }
    };

    if (showSlashMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showSlashMenu]);

  const generateAILinks = async () => {
    if (!editor || !pageId || !workspaceId) return;
    
    setIsGeneratingLinks(true);
    try {
      const suggestions = await workspaceService.getSuggestedLinks(pageId);
      setLinkSuggestions(suggestions);
      setShowSuggestions(true);
    } catch (error) {
      console.error('Error generating AI links:', error);
    } finally {
      setIsGeneratingLinks(false);
    }
  };

  const applyLink = (suggestion: LinkSuggestion) => {
    if (!editor) return;

    const { title } = suggestion;
    const text = editor.state.doc.textContent;
    
    const pos = text.toLowerCase().indexOf(title.toLowerCase());
    if (pos !== -1) {
      editor
        .chain()
        .focus()
        .setTextSelection({ from: pos, to: pos + title.length })
        .setLink({ href: `/page/${suggestion.pageId}` })
        .run();
    }
    
    setLinkSuggestions(prev => prev.filter(s => s.pageId !== suggestion.pageId));
  };

  if (!editor) {
    return null;
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'text': return Type;
      case 'media': return ImageIcon;
      case 'advanced': return CodeSquare;
      case 'ai': return Sparkles;
      default: return FileText;
    }
  };

  return (
    <div className="relative border border-slate-200/60 rounded-2xl overflow-hidden bg-white shadow-lg">
      {/* Minimal Floating Toolbar */}
      <div className="sticky top-0 z-10 border-b border-slate-200/60 bg-white/95 backdrop-blur-sm">
        <div className="p-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* Essential formatting controls */}
            <div className="flex items-center gap-1">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().toggleBold().run()}
                className={`h-8 w-8 p-0 hover:bg-slate-200/80 transition-all duration-200 ${editor.isActive('bold') ? 'bg-slate-200 text-slate-900' : 'text-slate-600'}`}
                title="Bold (Cmd+B)"
              >
                <Bold className="h-4 w-4" />
              </Button>
              
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().toggleItalic().run()}
                className={`h-8 w-8 p-0 hover:bg-slate-200/80 transition-all duration-200 ${editor.isActive('italic') ? 'bg-slate-200 text-slate-900' : 'text-slate-600'}`}
                title="Italic (Cmd+I)"
              >
                <Italic className="h-4 w-4" />
              </Button>

              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().toggleUnderline().run()}
                className={`h-8 w-8 p-0 hover:bg-slate-200/80 transition-all duration-200 ${editor.isActive('underline') ? 'bg-slate-200 text-slate-900' : 'text-slate-600'}`}
                title="Underline (Cmd+U)"
              >
                <UnderlineIcon className="h-4 w-4" />
              </Button>
            </div>

            <div className="w-px h-6 bg-slate-300/60" />

            {/* Link control */}
            <div className="flex items-center gap-1">
              {editor.isActive('link') ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => editor.chain().focus().unsetLink().run()}
                  className="h-8 w-8 p-0 hover:bg-red-100 text-red-600 transition-all duration-200"
                  title="Remove Link"
                >
                  <Unlink className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    const url = window.prompt('Enter URL:');
                    if (url) {
                      editor.chain().focus().setLink({ href: url }).run();
                    }
                  }}
                  className="h-8 w-8 p-0 hover:bg-blue-100 text-blue-600 transition-all duration-200"
                  title="Add Link"
                >
                  <LinkIcon className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="text-xs text-slate-500 bg-slate-100/80 px-3 py-1.5 rounded-full flex items-center gap-2">
              <Command className="h-3 w-3" />
              Type <kbd className="bg-white px-1 rounded">/</kbd> for commands
            </div>
            
            {/* AI Links */}
            {pageId && workspaceId && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={generateAILinks}
                disabled={isGeneratingLinks}
                className="bg-gradient-to-r from-violet-500 to-purple-600 text-white border-none hover:from-violet-600 hover:to-purple-700 transition-all duration-200 shadow-sm disabled:opacity-60 h-8"
                title="Generate AI Links"
              >
                <Sparkles className="h-3 w-3 mr-2" />
                {isGeneratingLinks ? 'Generating...' : 'AI Links'}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Slash Command Menu */}
      {showSlashMenu && (
        <div
          ref={slashMenuRef}
          className="fixed z-50 w-80 bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl border border-slate-200/60 overflow-hidden"
          style={{
            left: slashMenuPosition.x,
            top: slashMenuPosition.y,
            maxHeight: '400px'
          }}
        >
          <div className="p-4 border-b border-slate-200/60 bg-gradient-to-r from-slate-50 to-gray-50">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-gradient-to-r from-violet-500 to-purple-500">
                <Command className="h-4 w-4 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 text-sm">Quick Commands</h3>
                <p className="text-xs text-slate-500">Choose what to insert</p>
              </div>
            </div>
          </div>

          <div className="max-h-80 overflow-y-auto">
            {['text', 'advanced', 'ai'].map(category => {
              const categoryCommands = filteredCommands.filter(cmd => cmd.category === category);
              if (categoryCommands.length === 0) return null;
              
              return (
                <div key={category} className="p-2">
                  <div className="px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                    {React.createElement(getCategoryIcon(category), { className: "h-3 w-3" })}
                    {category}
                  </div>
                  {categoryCommands.map((command, index) => {
                    const globalIndex = filteredCommands.indexOf(command);
                    return (
                      <button
                        key={command.id}
                        onClick={() => executeSlashCommand(command)}
                        className={`w-full text-left p-3 rounded-xl transition-all duration-200 flex items-center gap-3 ${
                          selectedCommandIndex === globalIndex
                            ? 'bg-gradient-to-r from-violet-50 to-purple-50 border border-violet-200/60 shadow-sm'
                            : 'hover:bg-slate-50'
                        }`}
                      >
                        <div className={`p-2 rounded-lg ${
                          selectedCommandIndex === globalIndex 
                            ? 'bg-gradient-to-r from-violet-500 to-purple-500 text-white'
                            : 'bg-slate-100 text-slate-600'
                        }`}>
                          {React.createElement(command.icon, { className: "h-4 w-4" })}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm text-slate-900">{command.title}</div>
                          <div className="text-xs text-slate-500 truncate">{command.description}</div>
                        </div>
                        {selectedCommandIndex === globalIndex && (
                          <ArrowRight className="h-4 w-4 text-violet-500" />
                        )}
                      </button>
                    );
                  })}
                </div>
              );
            })}
            
            {filteredCommands.length === 0 && (
              <div className="p-6 text-center">
                <Search className="h-8 w-8 text-slate-300 mx-auto mb-3" />
                <p className="text-sm text-slate-500">No commands found for "{slashQuery}"</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Editor Content */}
      <div className="p-8 min-h-[400px] bg-gradient-to-b from-white to-slate-50/30">
        <EditorContent 
          editor={editor} 
          className="prose-headings:text-slate-900 prose-p:text-slate-700 prose-strong:text-slate-900 prose-code:text-slate-800 prose-code:bg-slate-100 prose-code:px-2 prose-code:py-1 prose-code:rounded-md prose-blockquote:border-l-slate-300 prose-blockquote:text-slate-600 prose-blockquote:bg-slate-50/50 prose-blockquote:pl-6 prose-blockquote:py-2 prose-blockquote:rounded-r-lg focus:outline-none"
        />
      </div>

      {/* AI Link Suggestions */}
      {showSuggestions && linkSuggestions.length > 0 && (
        <div className="border-t border-slate-200/60 bg-gradient-to-r from-violet-50/80 to-purple-50/80 backdrop-blur-sm">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold text-slate-900 flex items-center gap-2">
                <div className="p-1 rounded-full bg-gradient-to-r from-violet-500 to-purple-500">
                  <Sparkles className="h-3 w-3 text-white" />
                </div>
                AI Suggested Links
              </h4>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowSuggestions(false)}
                className="text-slate-500 hover:text-slate-700 hover:bg-slate-200/60 transition-all duration-200"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-4">
              {linkSuggestions.map((suggestion) => (
                <div 
                  key={suggestion.pageId}
                  className="flex items-center justify-between p-4 bg-white/80 backdrop-blur-sm rounded-xl border border-slate-200/60 shadow-sm hover:shadow-md transition-all duration-200"
                >
                  <div className="flex-1">
                    <div className="font-medium text-sm text-slate-900 mb-2">{suggestion.title}</div>
                    <div className="text-xs text-slate-600 mb-3 leading-relaxed">{suggestion.reason}</div>
                    <div className="flex items-center gap-3">
                      <div className="w-24 bg-slate-200/60 rounded-full h-2 overflow-hidden">
                        <div 
                          className="bg-gradient-to-r from-emerald-400 to-cyan-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${suggestion.confidence * 100}%` }}
                        />
                      </div>
                      <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                        {Math.round(suggestion.confidence * 100)}% match
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-3 ml-6">
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => applyLink(suggestion)}
                      className="bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white shadow-sm transition-all duration-200"
                    >
                      Apply Link
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => setLinkSuggestions(prev => 
                        prev.filter(s => s.pageId !== suggestion.pageId)
                      )}
                      className="text-slate-500 hover:text-slate-700 hover:bg-slate-200/60 transition-all duration-200"
                    >
                      Dismiss
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 