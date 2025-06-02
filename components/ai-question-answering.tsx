'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent } from './ui/card';
import { 
  Send, 
  ExternalLink, 
  User, 
  FileText, 
  Copy, 
  Brain,
  Maximize2,
  Minimize2,
  CheckCircle,
  Info,
  MessageSquare,
  Clock,
  Activity,
  BarChart,
  Users,
  Target,
  Shield,
  Database,
  Search
} from 'lucide-react';
import { workspaceService } from '@/lib/supabase/workspace';

interface AIQuestionAnsweringProps {
  workspaceId: string;
  onPageClick?: (pageId: string) => void;
}

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  sources?: {
    pageId: string;
    title: string;
    relevantContent: string;
  }[];
  confidence?: number;
  isStreaming?: boolean;
}

const quickPrompts = [
  {
    icon: BarChart,
    title: "Performance Metrics",
    prompt: "What are our key performance indicators and current metrics?",
    description: "Analyze metrics and KPIs"
  },
  {
    icon: Users,
    title: "User Research", 
    prompt: "What insights do we have from user research and feedback?",
    description: "User research findings"
  },
  {
    icon: Shield,
    title: "Security Overview",
    prompt: "What are our security measures and privacy policies?",
    description: "Security and compliance"
  },
  {
    icon: Database,
    title: "Technical Architecture",
    prompt: "How is our system architected and what technologies do we use?",
    description: "Technical architecture details"
  },
  {
    icon: Target,
    title: "Product Strategy",
    prompt: "What is our product roadmap and strategic vision?",
    description: "Strategic planning insights"
  },
  {
    icon: Activity,
    title: "Innovation Focus",
    prompt: "What are our latest innovations and R&D initiatives?",
    description: "Innovation and development"
  }
];

export function AIQuestionAnswering({ workspaceId, onPageClick }: AIQuestionAnsweringProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showQuickPrompts, setShowQuickPrompts] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const [stats, setStats] = useState({
    totalQuestions: 0,
    averageConfidence: 0,
    totalSources: 0,
    sessionTime: 0
  });

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingText]);

  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{
        id: '1',
        type: 'ai',
        content: `Hello! I'm your AI assistant. I can help you explore your workspace content and answer questions about your projects, analyze data, and provide insights. What would you like to know?`,
        timestamp: new Date(),
        confidence: 1.0
      }]);
    }
  }, [messages.length]);

  useEffect(() => {
    const timer = setInterval(() => {
      setStats(prev => ({ ...prev, sessionTime: prev.sessionTime + 1 }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const simulateStreaming = (text: string, callback: (text: string) => void) => {
    const words = text.split(' ');
    let currentText = '';
    let index = 0;
    
    const interval = setInterval(() => {
      if (index < words.length) {
        currentText += (index > 0 ? ' ' : '') + words[index];
        setStreamingText(currentText);
        index++;
      } else {
        clearInterval(interval);
        setStreamingText('');
        callback(text);
      }
    }, 50);
  };

  const handleSubmit = async (question?: string) => {
    const prompt = question || input.trim();
    if (!prompt || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: prompt,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setShowQuickPrompts(false);
    inputRef.current?.focus();

    try {
      const result = await workspaceService.answerQuestion(workspaceId, prompt);

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: '',
        timestamp: new Date(),
        sources: result.sources,
        confidence: result.confidence,
        isStreaming: true
      };

      setMessages(prev => [...prev, aiMessage]);
      
      simulateStreaming(result.answer, (finalText) => {
        setMessages(prev => prev.map(msg => 
          msg.id === aiMessage.id 
            ? { ...msg, content: finalText, isStreaming: false }
            : msg
        ));
      });
      
      setStats(prev => ({
        totalQuestions: prev.totalQuestions + 1,
        averageConfidence: prev.totalQuestions === 0 
          ? result.confidence 
          : (prev.averageConfidence * prev.totalQuestions + result.confidence) / (prev.totalQuestions + 1),
        totalSources: prev.totalSources + (result.sources?.length || 0),
        sessionTime: prev.sessionTime
      }));

    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: 'I encountered an issue processing your request. Please try rephrasing your question.',
        timestamp: new Date(),
        confidence: 0
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-700 bg-green-50 border-green-200';
    if (confidence >= 0.6) return 'text-amber-700 bg-amber-50 border-amber-200';
    return 'text-red-700 bg-red-50 border-red-200';
  };

  const getConfidenceIcon = (confidence: number) => {
    if (confidence >= 0.8) return CheckCircle;
    return Info;
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatSessionTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const MessageBubble = ({ message }: { message: Message }) => {
    const ConfidenceIcon = message.confidence ? getConfidenceIcon(message.confidence) : Info;
    const isStreaming = message.isStreaming && message.id === messages[messages.length - 1]?.id;
    const displayContent = isStreaming ? streamingText : message.content;
    
    return (
      <div className={`flex gap-4 mb-6 ${message.type === 'user' ? 'flex-row-reverse' : 'flex-row'} group`}>
        {/* Avatar */}
        <div className={`flex-shrink-0 ${message.type === 'user' ? 'order-2' : 'order-1'}`}>
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
            message.type === 'user' 
              ? 'bg-slate-900 text-white' 
              : 'bg-slate-100 text-slate-600'
          }`}>
            {message.type === 'user' ? (
              <User className="w-5 h-5" />
            ) : (
              <Brain className="w-5 h-5" />
            )}
          </div>
        </div>

        {/* Message Content */}
        <div className={`flex-1 max-w-[80%] ${message.type === 'user' ? 'order-1' : 'order-2'}`}>
          <div className={`p-4 rounded-lg border ${
            message.type === 'user'
              ? 'bg-slate-900 text-white border-slate-800 ml-8'
              : 'bg-white text-slate-900 border-slate-200 mr-8'
          }`}>
            
            {/* Message Text */}
            <div className="prose prose-sm max-w-none">
              <div className={`whitespace-pre-wrap leading-relaxed ${
                message.type === 'user' ? 'text-white' : 'text-slate-700'
              }`}>
                {displayContent}
                {isStreaming && (
                  <span className="inline-block w-0.5 h-4 bg-current ml-1 animate-pulse"></span>
                )}
              </div>
            </div>

            {/* Confidence Badge */}
            {message.type === 'ai' && message.confidence !== undefined && (
              <div className={`inline-flex items-center gap-2 mt-3 px-2 py-1 rounded text-xs font-medium border ${getConfidenceColor(message.confidence)}`}>
                <ConfidenceIcon className="w-3 h-3" />
                <span>
                  {Math.round(message.confidence * 100)}% confidence
                </span>
              </div>
            )}

            {/* Message Actions */}
            {message.type === 'ai' && !isStreaming && (
              <div className="flex items-center gap-2 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(message.content)}
                  className="h-7 px-2 text-xs text-slate-500 hover:text-slate-700 hover:bg-slate-100"
                >
                  <Copy className="w-3 h-3 mr-1" />
                  Copy
                </Button>
              </div>
            )}
          </div>

          {/* Sources */}
          {message.sources && message.sources.length > 0 && !isStreaming && (
            <div className="mt-3 space-y-2">
              <div className="text-xs font-medium text-slate-600 flex items-center gap-2 px-1">
                <FileText className="w-3 h-3" />
                <span>Sources ({message.sources.length})</span>
              </div>
              <div className="space-y-2">
                {message.sources.map((source, index) => (
                  <Card key={index} className="border-slate-200">
                    <CardContent className="p-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h6 className="font-medium text-sm text-slate-900 mb-1 truncate">
                            {source.title}
                          </h6>
                          <p className="text-xs text-slate-600 line-clamp-2">
                            {source.relevantContent}
                          </p>
                        </div>
                        {onPageClick && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onPageClick(source.pageId)}
                            className="ml-2 h-6 w-6 p-0 text-slate-400 hover:text-slate-600"
                          >
                            <ExternalLink className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Timestamp */}
          <div className="text-xs text-slate-400 mt-2 px-1">
            {formatTime(message.timestamp)}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`${isFullscreen ? 'fixed inset-0 z-50' : 'h-full'} bg-gray-50 flex flex-col`}>
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center">
                <Brain className="w-6 h-6 text-slate-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-slate-900">
                  AI Assistant
                </h2>
                <p className="text-sm text-slate-600">Ask questions about your workspace</p>
              </div>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="text-slate-500 hover:text-slate-700"
            >
              {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </Button>
          </div>

          {/* Stats */}
          
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto">
          {/* Quick Prompts */}
          {showQuickPrompts && messages.length <= 1 && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">
                Quick Start
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {quickPrompts.map((prompt, index) => (
                  <Card 
                    key={index} 
                    className="cursor-pointer hover:shadow-md transition-shadow border-slate-200"
                    onClick={() => handleSubmit(prompt.prompt)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                          <prompt.icon className="h-5 w-5 text-slate-600" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-slate-900 mb-1">{prompt.title}</h4>
                          <p className="text-sm text-slate-600 line-clamp-2">{prompt.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Messages */}
          {messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))}
          
          {/* Loading indicator */}
          {isLoading && (
            <div className="flex gap-4 mb-6">
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                <Brain className="w-5 h-5 text-slate-600" />
              </div>
              <div className="flex-1 max-w-[80%]">
                <div className="bg-white p-4 rounded-lg border border-slate-200">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                    <span className="text-sm text-slate-600">Thinking...</span>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="bg-white border-t border-slate-200 p-6">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  ref={inputRef}
                  placeholder="Ask anything about your workspace..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  disabled={isLoading}
                  className="pl-10 border-slate-200 focus:border-slate-400 focus:ring-slate-400"
                />
              </div>
              <Button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="bg-slate-900 hover:bg-slate-800 text-white"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </form>
          
          <div className="flex items-center justify-between mt-3 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <Brain className="h-3 w-3" />
              AI Assistant
            </span>
            <span>Press Enter to send</span>
          </div>
        </div>
      </div>
    </div>
  );
} 