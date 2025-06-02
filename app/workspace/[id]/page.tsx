"use client";

import React, { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  workspaceService,
  type Workspace,
  type Page,
} from "@/lib/supabase/workspace";
import { RichTextEditor } from "@/components/rich-text-editor";
import { KnowledgeGraph } from "@/components/knowledge-graph";
import { AIQuestionAnswering } from "@/components/ai-question-answering";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Search,
  FileText,
  Trash2,
  Edit3,
  Save,
  X,
  Sparkles,
  Network,
  Brain,
  Tag,
  PanelLeft,
  PanelRight,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Clock,
  Eye,
  Settings,
  Star,
  Archive,
  Share2,
  Download,
  Folder,
  Home,
  ArrowLeft,
  BookOpen,
  Layers,
  Filter,
  SortDesc,
  Grid3x3,
  List,
  Maximize2,
  Minimize2,
  RefreshCw,
  Zap,
  TrendingUp,
  BarChart3,
  Users,
  Calendar,
  MessageSquare,
  Bell,
  Menu,
  Sidebar,
  Layout,
  Workflow,
  Target,
  Focus,
  Lightbulb,
  Code2,
  Database,
  GitBranch,
  History,
  Timer,
  Activity,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function WorkspacePage() {
  const params = useParams();
  const router = useRouter();
  const workspaceId = params.id as string;

  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [pages, setPages] = useState<Page[]>([]);
  const [selectedPage, setSelectedPage] = useState<Page | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState<any>(null);
  const [editedTitle, setEditedTitle] = useState("");
  const [activeTab, setActiveTab] = useState<"editor" | "graph" | "ai">(
    "editor"
  );
  const [suggestedTags, setSuggestedTags] = useState<any[]>([]);

  // Enhanced panel states
  const [leftPanelCollapsed, setLeftPanelCollapsed] = useState(false);
  const [rightPanelCollapsed, setRightPanelCollapsed] = useState(false);
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [sortBy, setSortBy] = useState<"recent" | "name" | "created">("recent");
  const [pageStats, setPageStats] = useState<{
    words: number;
    characters: number;
    readTime: number;
  }>({ words: 0, characters: 0, readTime: 0 });
  const [isFullscreen, setIsFullscreen] = useState(false);

  // New enhanced sidebar states
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(
    new Set(["recent", "favorites"])
  );
  const [favoritePages, setFavoritePages] = useState<Set<string>>(new Set());
  const [draggedPage, setDraggedPage] = useState<string | null>(null);
  const [sidebarSection, setSidebarSection] = useState<
    "pages" | "tags" | "recent"
  >("pages");
  const [pageHierarchy, setPageHierarchy] = useState<{
    [key: string]: string[];
  }>({});
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);

  // Refs for preventing unnecessary reloads and redirects
  const authCheckRef = useRef<NodeJS.Timeout | null>(null);
  const lastFocusTime = useRef<number>(Date.now());
  const hasLoadedOnce = useRef(false);

  const supabase = createClient();

  useEffect(() => {
    if (!hasLoadedOnce.current) {
      loadWorkspace();
      hasLoadedOnce.current = true;
    }

    // Enhanced visibility change handling to prevent redirects
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        lastFocusTime.current = Date.now();
        // Clear any pending auth checks
        if (authCheckRef.current) {
          clearTimeout(authCheckRef.current);
        }

        // Only check auth if we've been away for more than 10 minutes
        authCheckRef.current = setTimeout(() => {
          if (workspace && pages.length > 0) {
            const timeSinceLastFocus = Date.now() - lastFocusTime.current;
            if (timeSinceLastFocus > 600000) {
              // 10 minutes
              checkAuthStatus();
            }
          }
        }, 10000); // Wait 10 seconds before checking
      }
    };

    const handleBeforeUnload = () => {
      // Clear timeouts when leaving page
      if (authCheckRef.current) {
        clearTimeout(authCheckRef.current);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("beforeunload", handleBeforeUnload);
      if (authCheckRef.current) clearTimeout(authCheckRef.current);
    };
  }, [workspaceId]);

  const checkAuthStatus = async () => {
    try {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();
      if (error || !user) {
        console.log(
          "Auth check failed, but staying on page to prevent unnecessary redirects"
        );
        // Don't redirect automatically - let user manually navigate if needed
      }
    } catch (error) {
      console.error("Auth check error:", error);
      // Network errors shouldn't cause redirects
    }
  };

  useEffect(() => {
    if (selectedPage) {
      setEditedContent(selectedPage.content);
      setEditedTitle(selectedPage.title);
      loadSuggestedTags(selectedPage.id);
      calculatePageStats(selectedPage.content);
    }
  }, [selectedPage]);

  // Enhanced keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        (e.target as any)?.isContentEditable
      ) {
        return;
      }

      if (
        (e.metaKey || e.ctrlKey) &&
        e.key === "e" &&
        selectedPage &&
        activeTab === "editor"
      ) {
        e.preventDefault();
        setIsEditing(!isEditing);
      }

      if ((e.metaKey || e.ctrlKey) && e.key === "s" && isEditing) {
        e.preventDefault();
        savePage();
      }

      if ((e.metaKey || e.ctrlKey) && e.key === "[") {
        e.preventDefault();
        setLeftPanelCollapsed(!leftPanelCollapsed);
      }

      if ((e.metaKey || e.ctrlKey) && e.key === "]") {
        e.preventDefault();
        setRightPanelCollapsed(!rightPanelCollapsed);
      }

      if (e.key === "1" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setActiveTab("editor");
      }
      if (e.key === "2" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setActiveTab("graph");
      }
      if (e.key === "3" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setActiveTab("ai");
      }

      if (e.key === "Escape") {
        if (showKeyboardShortcuts) {
          setShowKeyboardShortcuts(false);
        } else if (isEditing) {
          setIsEditing(false);
          setEditedContent(selectedPage?.content);
          setEditedTitle(selectedPage?.title || "");
        }
      }

      // Enhanced shortcuts
      if (e.key === "F11") {
        e.preventDefault();
        setIsFullscreen(!isFullscreen);
      }

      if ((e.metaKey || e.ctrlKey) && e.key === "n") {
        e.preventDefault();
        createNewPage();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    selectedPage,
    activeTab,
    isEditing,
    leftPanelCollapsed,
    rightPanelCollapsed,
    showKeyboardShortcuts,
    isFullscreen,
  ]);

  // Click outside handler for shortcuts tooltip
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        showKeyboardShortcuts &&
        !(e.target as Element).closest(".shortcuts-tooltip")
      ) {
        setShowKeyboardShortcuts(false);
      }
    };

    if (showKeyboardShortcuts) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showKeyboardShortcuts]);

  const calculatePageStats = (content: any) => {
    if (!content) return;

    const text = extractTextFromContent(content);
    const words = text.split(/\s+/).filter((word) => word.length > 0).length;
    const characters = text.length;
    const readTime = Math.ceil(words / 200); // Average reading speed

    setPageStats({ words, characters, readTime });
  };

  const extractTextFromContent = (content: any): string => {
    if (!content || !content.content) return "";

    return content.content
      .map((node: any) => {
        if (node.type === "text") return node.text || "";
        if (node.content) return extractTextFromContent(node);
        return "";
      })
      .join(" ");
  };

  const loadWorkspace = async () => {
    try {
      setIsLoading(true);
      const [workspaceData, pagesData] = await Promise.all([
        workspaceService.getWorkspace(workspaceId),
        workspaceService.getPages(workspaceId),
      ]);

      if (!workspaceData) {
        // Instead of automatic redirect, show an error state
        // This prevents unwanted redirections when there are temporary issues
        console.warn(`Workspace ${workspaceId} not found or access denied`);
        setIsLoading(false);
        return;
      }

      setWorkspace(workspaceData);
      setPages(pagesData);

      if (pagesData.length > 0 && !selectedPage) {
        setSelectedPage(pagesData[0]);
      }
    } catch (error) {
      console.error("Error loading workspace:", error);
      // Don't redirect on error - could be temporary network issue
    } finally {
      setIsLoading(false);
    }
  };

  const loadSuggestedTags = async (pageId: string) => {
    try {
      const tags = await workspaceService.generateTags(pageId);
      setSuggestedTags(tags);
    } catch (error) {
      console.error("Error loading suggested tags:", error);
    }
  };

  const createNewPage = async () => {
    try {
      const newPage = await workspaceService.createPage(
        workspaceId,
        "Untitled"
      );
      setPages((prev) => [newPage, ...prev]);
      setSelectedPage(newPage);
      setIsEditing(true);
    } catch (error) {
      console.error("Error creating page:", error);
    }
  };

  const savePage = async () => {
    if (!selectedPage) return;

    try {
      const updatedPage = await workspaceService.updatePage(selectedPage.id, {
        title: editedTitle,
        content: editedContent,
      });

      setPages((prev) =>
        prev.map((p) => (p.id === updatedPage.id ? updatedPage : p))
      );
      setSelectedPage(updatedPage);
      setIsEditing(false);

      loadSuggestedTags(updatedPage.id);
      calculatePageStats(updatedPage.content);
    } catch (error) {
      console.error("Error saving page:", error);
    }
  };

  const deletePage = async (pageId: string) => {
    if (!confirm("Are you sure you want to delete this page?")) return;

    try {
      await workspaceService.deletePage(pageId);
      setPages((prev) => prev.filter((p) => p.id !== pageId));

      if (selectedPage?.id === pageId) {
        const remainingPages = pages.filter((p) => p.id !== pageId);
        setSelectedPage(remainingPages.length > 0 ? remainingPages[0] : null);
      }
    } catch (error) {
      console.error("Error deleting page:", error);
    }
  };

  const searchPages = async () => {
    if (!searchQuery.trim()) {
      loadWorkspace();
      return;
    }

    try {
      const results = await workspaceService.searchPages(
        workspaceId,
        searchQuery
      );
      setPages(results);
    } catch (error) {
      console.error("Error searching pages:", error);
    }
  };

  const applyTag = async (tag: string) => {
    if (!selectedPage) return;

    try {
      const updatedTags = [...(selectedPage.tags || []), tag];
      const updatedPage = await workspaceService.updatePage(selectedPage.id, {
        tags: updatedTags,
      });

      setPages((prev) =>
        prev.map((p) => (p.id === updatedPage.id ? updatedPage : p))
      );
      setSelectedPage(updatedPage);
      setSuggestedTags((prev) => prev.filter((t) => t.tag !== tag));
    } catch (error) {
      console.error("Error applying tag:", error);
    }
  };

  const filteredAndSortedPages = () => {
    let filtered = [...pages];

    switch (sortBy) {
      case "name":
        filtered.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case "created":
        filtered.sort(
          (a, b) =>
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );
        break;
      case "recent":
      default:
        filtered.sort(
          (a, b) =>
            new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
        );
        break;
    }

    return filtered;
  };

  const toggleFolder = (folderId: string) => {
    setExpandedFolders((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(folderId)) {
        newSet.delete(folderId);
      } else {
        newSet.add(folderId);
      }
      return newSet;
    });
  };

  const toggleFavorite = (pageId: string) => {
    setFavoritePages((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(pageId)) {
        newSet.delete(pageId);
      } else {
        newSet.add(pageId);
      }
      return newSet;
    });
  };

  const getPagesByCategory = () => {
    const categorized = {
      favorites: pages.filter((page) => favoritePages.has(page.id)),
      recent: [...pages]
        .sort(
          (a, b) =>
            new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
        )
        .slice(0, 5),
      byTag: {} as { [tag: string]: Page[] },
      orphaned: pages.filter((page) => !page.tags || page.tags.length === 0),
    };

    // Group by tags
    pages.forEach((page) => {
      if (page.tags && page.tags.length > 0) {
        page.tags.forEach((tag) => {
          if (!categorized.byTag[tag]) {
            categorized.byTag[tag] = [];
          }
          categorized.byTag[tag].push(page);
        });
      }
    });

    return categorized;
  };

  const renderNestedPageItem = (page: Page, level = 0) => (
    <div
      key={page.id}
      className={`group transition-all duration-200 ${
        level > 0 ? "ml-6 border-l border-slate-200 pl-4" : ""
      }`}
      draggable
      onDragStart={() => setDraggedPage(page.id)}
      onDragEnd={() => setDraggedPage(null)}
    >
      <div
        onClick={() => setSelectedPage(page)}
        className={`cursor-pointer p-3 rounded-xl transition-all duration-200 flex items-center gap-3 ${
          selectedPage?.id === page.id
            ? "bg-gradient-to-r from-violet-50 to-purple-50 border border-violet-200/60 shadow-sm"
            : "hover:bg-slate-50 hover:shadow-sm"
        }`}
      >
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <FileText
            className={`h-4 w-4 flex-shrink-0 ${
              selectedPage?.id === page.id
                ? "text-violet-600"
                : "text-slate-400"
            }`}
          />
          <span
            className={`text-sm truncate ${
              selectedPage?.id === page.id
                ? "text-violet-900 font-medium"
                : "text-slate-700"
            }`}
          >
            {page.title}
          </span>
          {favoritePages.has(page.id) && (
            <Star className="h-3 w-3 text-amber-500 fill-current flex-shrink-0" />
          )}
        </div>

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              toggleFavorite(page.id);
            }}
            className="h-6 w-6 p-0 text-slate-400 hover:text-amber-500"
            title={
              favoritePages.has(page.id)
                ? "Remove from favorites"
                : "Add to favorites"
            }
          >
            <Star
              className={`h-3 w-3 ${
                favoritePages.has(page.id) ? "fill-current text-amber-500" : ""
              }`}
            />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              deletePage(page.id);
            }}
            className="h-6 w-6 p-0 text-slate-400 hover:text-red-500"
            title="Delete page"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </div>
  );

  const renderFolderSection = (
    title: string,
    icon: any,
    folderId: string,
    pages: Page[],
    color = "slate"
  ) => {
    const isExpanded = expandedFolders.has(folderId);
    const colorClasses = {
      violet: "text-violet-600 bg-violet-50 border-violet-200",
      amber: "text-amber-600 bg-amber-50 border-amber-200",
      emerald: "text-emerald-600 bg-emerald-50 border-emerald-200",
      blue: "text-blue-600 bg-blue-50 border-blue-200",
      slate: "text-slate-600 bg-slate-50 border-slate-200",
    };

    // Ensure the color exists in colorClasses, fallback to 'slate' if not
    const safeColor = color in colorClasses ? color : "slate";
    const colorClass = colorClasses[safeColor as keyof typeof colorClasses];

    return (
      <div className="mb-4">
        <button
          onClick={() => toggleFolder(folderId)}
          className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200 ${
            isExpanded ? `${colorClass} shadow-sm` : "hover:bg-slate-50"
          }`}
        >
          <div
            className={`p-1.5 rounded-lg ${
              isExpanded ? "bg-white shadow-sm" : "bg-slate-100"
            }`}
          >
            {React.createElement(icon, {
              className: `h-4 w-4 ${
                isExpanded ? colorClass.split(" ")[0] : "text-slate-500"
              }`,
            })}
          </div>
          <span
            className={`font-medium text-sm flex-1 text-left ${
              isExpanded ? "text-slate-900" : "text-slate-700"
            }`}
          >
            {title}
          </span>
          <span
            className={`text-xs ${
              isExpanded ? "text-slate-600" : "text-slate-500"
            }`}
          >
            {pages.length}
          </span>
          <ChevronRight
            className={`h-4 w-4 transition-transform duration-200 ${
              isExpanded ? "rotate-90" : ""
            } ${isExpanded ? "text-slate-600" : "text-slate-400"}`}
          />
        </button>

        {isExpanded && (
          <div className="mt-2 space-y-1 animate-in slide-in-from-top-2 duration-200">
            {pages.length > 0 ? (
              pages.map((page) => renderNestedPageItem(page, 0))
            ) : (
              <div className="p-4 text-center text-slate-500 text-sm">
                No pages in this section
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-slate-300 border-t-slate-600 rounded-full animate-spin mx-auto mb-6"></div>
          <h2 className="text-xl font-semibold text-slate-700 mb-2">
            Loading workspace
          </h2>
          <p className="text-slate-500">
            Please wait while we fetch your content...
          </p>
        </div>
      </div>
    );
  }

  if (!workspace) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-6">
            <Folder className="w-8 h-8 text-slate-400" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-3">
            Workspace not found
          </h1>
          <p className="text-slate-600 mb-6">
            The workspace you're looking for doesn't exist or you don't have
            access to it.
          </p>
          <Button
            onClick={() => router.push("/dashboard")}
            className="bg-slate-600 hover:bg-slate-700"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen ${
        isFullscreen ? "h-screen overflow-hidden" : ""
      } bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100`}
    >
      {/* Enhanced Top Navigation Bar */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-lg border-b border-slate-200/60 shadow-lg ">
        <div className="flex items-center justify-between h-16 px-8">
          {/* Left Section */}
          <div className="flex items-center gap-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/dashboard")}
              className="text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 transition-all duration-200"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Dashboard
            </Button>
            <div className="w-px h-6 bg-slate-300/60" />
            <div>
              <h1 className="font-semibold text-slate-900 text-lg">
                {workspace?.name}
              </h1>
              <p className="text-sm text-slate-500 hidden sm:block">
                {workspace?.description}
              </p>
            </div>
          </div>

          {/* Center - Tab Navigation */}
          <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center bg-slate-100/50 rounded-lg p-1 border border-slate-200/60">
            <Button
              variant={activeTab === "editor" ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveTab("editor")}
              className={`transition-all duration-200 ${
                activeTab === "editor"
                  ? "bg-white shadow-md text-slate-900"
                  : "text-slate-600 hover:text-slate-800 hover:bg-slate-50/80"
              }`}
            >
              <FileText className="h-4 w-4 mr-2" />
              Editor
            </Button>
            <Button
              variant={activeTab === "graph" ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveTab("graph")}
              className={`transition-all duration-200 ${
                activeTab === "graph"
                  ? "bg-white shadow-md text-slate-900"
                  : "text-slate-600 hover:text-slate-800 hover:bg-slate-50/80"
              }`}
            >
              <Network className="h-4 w-4 mr-2" />
              Graph
            </Button>
            <Button
              variant={activeTab === "ai" ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveTab("ai")}
              className={`transition-all duration-200 ${
                activeTab === "ai"
                  ? "bg-white shadow-md text-slate-900"
                  : "text-slate-600 hover:text-slate-800 hover:bg-slate-50/80"
              }`}
            >
              <Brain className="h-4 w-4 mr-2" />
              AI Assistant
            </Button>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-3">
            {selectedPage && activeTab === "editor" && (
              <>
                {isEditing ? (
                  <>
                    <Button
                      size="sm"
                      onClick={savePage}
                      className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white shadow-sm transition-all duration-200"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setIsEditing(false);
                        if (selectedPage) {
                          setEditedContent(selectedPage.content);
                          setEditedTitle(selectedPage.title);
                        }
                      }}
                      className="border-slate-300 text-slate-600 hover:bg-slate-50 transition-all duration-200"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                  </>
                ) : (
                  <Button
                    size="sm"
                    onClick={() => setIsEditing(true)}
                    variant="outline"
                    className="border-slate-300 text-slate-600 hover:bg-slate-50 hover:text-slate-800 transition-all duration-200"
                  >
                    <Edit3 className="h-4 w-4 mr-2" />
                    Edit Page
                  </Button>
                )}
              </>
            )}

            {/* Fullscreen Toggle */}

            {/* Help/Shortcuts Button */}
            <div className="relative">
              {showKeyboardShortcuts && (
                <div className="shortcuts-tooltip absolute right-0 top-full mt-3 w-80 bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl border border-slate-200/60 p-6 z-50">
                  <h3 className="font-semibold text-slate-900 mb-4 text-lg">
                    Keyboard Shortcuts
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">New Page</span>
                      <kbd className="px-3 py-1.5 bg-slate-100 rounded-lg text-xs font-mono">
                        Cmd+N
                      </kbd>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">Toggle Edit Mode</span>
                      <kbd className="px-3 py-1.5 bg-slate-100 rounded-lg text-xs font-mono">
                        Cmd+E
                      </kbd>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">Save Page</span>
                      <kbd className="px-3 py-1.5 bg-slate-100 rounded-lg text-xs font-mono">
                        Cmd+S
                      </kbd>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">Toggle Left Panel</span>
                      <kbd className="px-3 py-1.5 bg-slate-100 rounded-lg text-xs font-mono">
                        Cmd+[
                      </kbd>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">Toggle Right Panel</span>
                      <kbd className="px-3 py-1.5 bg-slate-100 rounded-lg text-xs font-mono">
                        Cmd+]
                      </kbd>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">Switch to Editor</span>
                      <kbd className="px-3 py-1.5 bg-slate-100 rounded-lg text-xs font-mono">
                        Cmd+1
                      </kbd>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">Switch to Graph</span>
                      <kbd className="px-3 py-1.5 bg-slate-100 rounded-lg text-xs font-mono">
                        Cmd+2
                      </kbd>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">Switch to AI</span>
                      <kbd className="px-3 py-1.5 bg-slate-100 rounded-lg text-xs font-mono">
                        Cmd+3
                      </kbd>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">Fullscreen Mode</span>
                      <kbd className="px-3 py-1.5 bg-slate-100 rounded-lg text-xs font-mono">
                        F11
                      </kbd>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">Cancel Edit</span>
                      <kbd className="px-3 py-1.5 bg-slate-100 rounded-lg text-xs font-mono">
                        Esc
                      </kbd>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <div
        className={`flex h-[calc(100vh-4rem)] ${
          isFullscreen ? "h-screen" : ""
        }`}
      >
        {/* Enhanced Left Sidebar - Pages List */}
        <div
          className={`${
            leftPanelCollapsed ? "w-0" : "w-80"
          } transition-all duration-300 overflow-hidden bg-white/95 backdrop-blur-sm border-r border-slate-200/50 shadow-sm`}
        >
          <div className="h-full flex flex-col">
            {/* Clean Header */}
            <div className="p-4 border-b border-slate-200/60 bg-gradient-to-r from-white to-slate-50/30">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-semibold text-slate-900 text-lg">Pages</h2>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setLeftPanelCollapsed(true)}
                    className="text-slate-500 hover:text-slate-700 h-7 w-7 p-0 rounded-md"
                  >
                    <Sidebar className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Enhanced Search */}
              <div className="space-y-3">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      placeholder="Search pages..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && searchPages()}
                      className="pl-9 h-8 border-slate-200 focus:border-slate-400 bg-white/80 text-sm"
                    />
                  </div>
                  <Button
                    size="sm"
                    onClick={searchPages}
                    variant="outline"
                    className="h-8 w-8 p-0 border-slate-200"
                  >
                    <Search className="h-3 w-3" />
                  </Button>
                </div>

                 <div className="grid grid-cols-2 gap-2 mb-4">
                  <Button
                    size="sm"
                    onClick={createNewPage}
                    className="h-8 text-xs bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    New Page
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setActiveTab("ai")}
                    className="h-8 text-xs border-slate-200"
                  >
                    <Sparkles className="h-3 w-3 mr-1" />
                    AI Help
                  </Button>
                </div>
                {/* Workspace Stats */}
              </div>
            </div>

            {/* Enhanced Pages List with Nested Views */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-4">
                {/* Navigation Tabs */}

                {/* Quick Actions */}
             

                {/* Content based on selected section */}
                {sidebarSection === "pages" &&
                  (() => {
                    const categorized = getPagesByCategory();
                    return (
                      <div className="space-y-2">
                        {/* Favorites Section */}
                        {categorized.favorites.length > 0 &&
                          renderFolderSection(
                            "Favorites",
                            Star,
                            "favorites",
                            categorized.favorites,
                            "amber"
                          )}

                        {/* Recent Section */}
                        {renderFolderSection(
                          "Recent",
                          Clock,
                          "recent",
                          categorized.recent,
                          "blue"
                        )}

                        {/* Pages by Tags */}
                        {Object.entries(categorized.byTag).map(
                          ([tag, tagPages]) =>
                            React.cloneElement(
                              renderFolderSection(
                                tag,
                                Tag,
                                `tag-${tag}`,
                                tagPages,
                                "emerald"
                              ),
                              { key: tag }
                            )
                        )}

                        {/* Orphaned Pages */}
                        {categorized.orphaned.length > 0 &&
                          renderFolderSection(
                            "Untagged",
                            FileText,
                            "orphaned",
                            categorized.orphaned,
                            "slate"
                          )}

                        {/* All Pages Fallback */}
                        {Object.keys(categorized.byTag).length === 0 &&
                          categorized.orphaned.length === 0 &&
                          categorized.favorites.length === 0 &&
                          renderFolderSection(
                            "All Pages",
                            Folder,
                            "all",
                            pages,
                            "slate"
                          )}
                      </div>
                    );
                  })()}

                {sidebarSection === "recent" && (
                  <div className="space-y-2">
                    <div className="mb-3">
                      <h3 className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">
                        Recent Activity
                      </h3>
                    </div>
                    {[...pages]
                      .sort(
                        (a, b) =>
                          new Date(b.updated_at).getTime() -
                          new Date(a.updated_at).getTime()
                      )
                      .map((page) => renderNestedPageItem(page))}
                  </div>
                )}

                {sidebarSection === "tags" &&
                  (() => {
                    const allTags = [
                      ...new Set(pages.flatMap((p) => p.tags || [])),
                    ];
                    return (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                            Tags
                          </h3>
                          <span className="text-xs text-slate-400">
                            {allTags.length} total
                          </span>
                        </div>
                        {allTags.map((tag) => {
                          const tagPages = pages.filter((p) =>
                            p.tags?.includes(tag)
                          );
                          return (
                            <div
                              key={tag}
                              className="bg-white/60 rounded-lg border border-slate-200/60 overflow-hidden"
                            >
                              <div className="p-3 border-b border-slate-200/40 bg-emerald-50/50">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                                    <span className="font-medium text-sm text-slate-900">
                                      {tag}
                                    </span>
                                  </div>
                                  <span className="text-xs text-slate-500">
                                    {tagPages.length}
                                  </span>
                                </div>
                              </div>
                              <div className="p-2 space-y-1">
                                {tagPages.map((page) => (
                                  <div
                                    key={page.id}
                                    onClick={() => setSelectedPage(page)}
                                    className={`cursor-pointer p-2 rounded transition-colors text-sm ${
                                      selectedPage?.id === page.id
                                        ? "bg-emerald-100 text-emerald-900"
                                        : "hover:bg-slate-50 text-slate-700"
                                    }`}
                                  >
                                    <div className="flex items-center gap-2">
                                      <FileText className="h-3 w-3 text-slate-400" />
                                      <span className="truncate">
                                        {page.title}
                                      </span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                        {allTags.length === 0 && (
                          <div className="text-center py-8">
                            <Tag className="h-8 w-8 text-slate-300 mx-auto mb-3" />
                            <p className="text-sm text-slate-500">
                              No tagged pages yet
                            </p>
                            <p className="text-xs text-slate-400 mt-1">
                              Tags will appear here as you add them
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })()}

                {/* Enhanced Workspace Insights */}
                <div className="mt-6 space-y-3">
                  <h4 className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                    Workspace Insights
                  </h4>

                  {/* Activity Chart */}
                  <div className="bg-white/60 rounded-lg p-3 border border-slate-200/60">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-slate-900">
                        Activity
                      </span>
                      <BarChart3 className="h-4 w-4 text-slate-400" />
                    </div>
                    <div className="text-xs text-slate-600">
                      {
                        pages.filter((p) => {
                          const dayAgo = new Date(
                            Date.now() - 24 * 60 * 60 * 1000
                          );
                          return new Date(p.updated_at) > dayAgo;
                        }).length
                      }{" "}
                      pages updated today
                    </div>
                  </div>

                  {/* Word Count Stats */}
                  <div className="bg-white/60 rounded-lg p-3 border border-slate-200/60">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-slate-900">
                        Content
                      </span>
                      <FileText className="h-4 w-4 text-slate-400" />
                    </div>
                    <div className="space-y-1 text-xs text-slate-600">
                      <div className="flex justify-between">
                        <span>Total words</span>
                        <span>
                          {pages.reduce(
                            (acc, p) =>
                              acc +
                              extractTextFromContent(p.content).split(/\s+/)
                                .length,
                            0
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Avg per page</span>
                        <span>
                          {Math.round(
                            pages.reduce(
                              (acc, p) =>
                                acc +
                                extractTextFromContent(p.content).split(/\s+/)
                                  .length,
                              0
                            ) / (pages.length || 1)
                          )}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Recent Tags */}
                  {(() => {
                    const recentTags = [
                      ...new Set(
                        pages
                          .sort(
                            (a, b) =>
                              new Date(b.updated_at).getTime() -
                              new Date(a.updated_at).getTime()
                          )
                          .slice(0, 10)
                          .flatMap((p) => p.tags || [])
                      ),
                    ].slice(0, 5);

                    if (recentTags.length > 0) {
                      return (
                        <div className="bg-white/60 rounded-lg p-3 border border-slate-200/60">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-slate-900">
                              Recent Tags
                            </span>
                            <Tag className="h-4 w-4 text-slate-400" />
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {recentTags.map((tag) => (
                              <span
                                key={tag}
                                className="inline-block px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      );
                    }
                    return null;
                  })()}

                  {/* Quick Stats Grid */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-white/60 rounded-lg p-3 border border-slate-200/60 text-center">
                      <div className="text-sm font-semibold text-slate-900">
                        {Math.round(
                          pages.reduce(
                            (acc, p) =>
                              acc +
                              extractTextFromContent(p.content).split(/\s+/)
                                .length,
                            0
                          ) / 200
                        )}
                      </div>
                      <div className="text-xs text-slate-500">
                        Hours of content
                      </div>
                    </div>
                    <div className="bg-white/60 rounded-lg p-3 border border-slate-200/60 text-center">
                      <div className="text-sm font-semibold text-slate-900">
                        {Math.round(
                          (pages.filter(
                            (p) =>
                              new Date(p.updated_at) >
                              new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                          ).length /
                            pages.length) *
                            100
                        ) || 0}
                        %
                      </div>
                      <div className="text-xs text-slate-500">
                        Active this week
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {activeTab === "editor" && selectedPage && (
            <div className="h-full flex">
              <div className="flex-1 overflow-y-auto">
                <div className="max-w-4xl mx-auto p-8">
                  {isEditing ? (
                    <div className="space-y-6">
                      <Input
                        value={editedTitle}
                        onChange={(e) => setEditedTitle(e.target.value)}
                        className="text-3xl font-bold border-none p-0 focus:ring-0 bg-transparent placeholder:text-slate-400"
                        placeholder="Enter page title..."
                      />
                      <div className="bg-white rounded-xl shadow-sm border border-slate-200">
                        <RichTextEditor
                          content={editedContent}
                          onChange={setEditedContent}
                          pageId={selectedPage.id}
                          workspaceId={workspaceId}
                          placeholder="Start writing your content..."
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h1 className="text-4xl font-bold text-slate-900 mb-4">
                            {selectedPage.title}
                          </h1>
                          {selectedPage.tags &&
                            selectedPage.tags.length > 0 && (
                              <div className="flex flex-wrap gap-2 mb-6">
                                {selectedPage.tags.map((tag) => (
                                  <Badge
                                    key={tag}
                                    className="bg-slate-100 text-slate-700 hover:bg-slate-200"
                                  >
                                    <Tag className="h-3 w-3 mr-1" />
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          <div className="flex items-center gap-4 text-sm text-slate-600 ">
                            <span className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              Updated{" "}
                              {new Date(
                                selectedPage.updated_at
                              ).toLocaleDateString()}
                            </span>
                          
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-slate-500 hover:text-slate-700"
                          >
                            <Star className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-slate-500 hover:text-slate-700"
                          >
                            <Share2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-slate-500 hover:text-slate-700"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="prose prose-lg max-w-none p-8">
                          <RichTextEditor
                            content={selectedPage.content}
                            onChange={() => {}}
                            className="border-none"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === "graph" && (
            <div className="h-full p-8">
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 h-full overflow-hidden">
                <div className="p-6 border-b border-slate-200">
                  <h2 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
                    <Network className="h-5 w-5 text-slate-600" />
                    Knowledge Graph
                  </h2>
                  <p className="text-slate-600 mt-1">
                    Explore connections between your pages
                  </p>
                </div>
                <KnowledgeGraph
                  workspaceId={workspaceId}
                  onNodeClick={(nodeId) => {
                    const page = pages.find((p) => p.id === nodeId);
                    if (page) {
                      setSelectedPage(page);
                      setActiveTab("editor");
                    }
                  }}
                  className="h-[calc(100%-5rem)]"
                />
              </div>
            </div>
          )}

          {activeTab === "ai" && (
            <div className="h-full flex flex-col overflow-hidden">
              <AIQuestionAnswering
                workspaceId={workspaceId}
                onPageClick={(pageId) => {
                  const page = pages.find((p) => p.id === pageId);
                  if (page) {
                    setSelectedPage(page);
                    setActiveTab("editor");
                  }
                }}
              />
            </div>
          )}

          {!selectedPage && activeTab === "editor" && (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center max-w-md">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <FileText className="h-8 w-8 text-slate-400" />
                </div>
                <h2 className="text-2xl font-semibold text-slate-900 mb-3">
                  No page selected
                </h2>
                <p className="text-slate-600 mb-6">
                  Select a page from the sidebar or create a new one to get
                  started
                </p>
                <Button
                  onClick={createNewPage}
                  className="bg-slate-600 hover:bg-slate-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create New Page
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Enhanced Right Sidebar - AI Suggestions & Tools */}
        {activeTab === "editor" && (
          <div
            className={`${
              rightPanelCollapsed ? "w-0" : "w-80"
            } transition-all duration-300 overflow-hidden bg-white border-l border-slate-200/60 shadow-sm`}
          >
            <div className="h-full flex flex-col">
              {/* Enhanced Header with Internal Controls */}
              <div className="p-6 border-b border-slate-200/60 bg-gradient-to-r from-white/80 to-slate-50/80">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-slate-900 text-lg flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-amber-500" />
                    AI Tools
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setRightPanelCollapsed(true)}
                    className="text-slate-500 hover:text-slate-700 hover:bg-slate-100/80 transition-all duration-200"
                    title="Collapse Panel"
                  >
                    <Sidebar className="h-4 w-4 rotate-180" />
                  </Button>
                </div>
                <p className="text-sm text-slate-500">
                  AI-powered suggestions and insights
                </p>
              </div>

              <div className="flex-1 overflow-y-auto">
                {selectedPage &&
                activeTab === "editor" &&
                suggestedTags.length > 0 ? (
                  <div className="p-4 space-y-4">
                    {/* Tag Suggestions */}
                    <div>
                      <h4 className="font-medium text-slate-900 mb-3 flex items-center gap-2">
                        <Tag className="h-4 w-4 text-slate-600" />
                        Suggested Tags
                      </h4>
                      <div className="space-y-3">
                        {suggestedTags.map((suggestion, index) => (
                          <Card
                            key={index}
                            className="border-slate-200 hover:shadow-md transition-shadow"
                          >
                            <CardContent className="p-4">
                              <div className="space-y-3">
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <div className="font-medium text-sm text-slate-900 mb-1">
                                      {suggestion.tag}
                                    </div>
                                    <div className="text-xs text-slate-600 mb-2">
                                      {suggestion.reason}
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <div className="flex-1 bg-slate-100 rounded-full h-1.5">
                                    <div
                                      className="bg-gradient-to-r from-emerald-500 to-emerald-600 h-1.5 rounded-full transition-all duration-300"
                                      style={{
                                        width: `${suggestion.confidence * 100}%`,
                                      }}
                                    />
                                  </div>
                                  <span className="text-xs font-medium text-emerald-600">
                                    {Math.round(suggestion.confidence * 100)}%
                                  </span>
                                </div>
                                <Button
                                  size="sm"
                                  onClick={() => applyTag(suggestion.tag)}
                                  className="w-full bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white"
                                >
                                  <Tag className="h-3 w-3 mr-2" />
                                  Apply Tag
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>

                    {/* AI Insights */}
                    <div className="pt-4 border-t border-slate-200">
                      <h4 className="font-medium text-slate-900 mb-3 flex items-center gap-2">
                        <Lightbulb className="h-4 w-4 text-amber-500" />
                        Content Insights
                      </h4>
                      <div className="space-y-3">
                        <Card className="border-slate-200">
                          <CardContent className="p-4">
                            <div className="text-sm text-slate-700">
                              This page has <strong>{pageStats.words}</strong>{" "}
                              words and takes approximately{" "}
                              <strong>{pageStats.readTime} minutes</strong> to
                              read.
                            </div>
                          </CardContent>
                        </Card>

                        {selectedPage.tags && selectedPage.tags.length > 0 && (
                          <Card className="border-slate-200">
                            <CardContent className="p-4">
                              <div className="text-sm text-slate-700">
                                Related topics:{" "}
                                <strong>{selectedPage.tags.join(", ")}</strong>
                              </div>
                            </CardContent>
                          </Card>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-6 text-center">
                    <div className="space-y-6">
                      <div>
                        <Sparkles className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                        <h4 className="font-medium text-slate-900 mb-2">
                          AI Assistant Ready
                        </h4>
                        <p className="text-sm text-slate-500">
                          Select a page and start editing to see AI-powered
                          suggestions
                        </p>
                      </div>

                      {/* Quick Actions */}
                      <div className="space-y-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setActiveTab("ai")}
                          className="w-full border-slate-200 text-slate-600 hover:bg-slate-50"
                        >
                          <Brain className="h-4 w-4 mr-2" />
                          Open AI Chat
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setActiveTab("graph")}
                          className="w-full border-slate-200 text-slate-600 hover:bg-slate-50"
                        >
                          <Network className="h-4 w-4 mr-2" />
                          View Knowledge Graph
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Floating Collapse Controls (only show when panels are collapsed) */}
        {leftPanelCollapsed && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLeftPanelCollapsed(false)}
            className="fixed left-2 top-1/2 transform -translate-y-1/2 z-40 bg-white shadow-lg border border-slate-200 hover:bg-slate-50 rounded-lg p-2"
            title="Show Pages Panel"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        )}

        {(rightPanelCollapsed === true && activeTab === "editor") && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setRightPanelCollapsed(false)}
            className="fixed right-2 top-1/2 transform -translate-y-1/2 z-40 bg-white shadow-lg border border-slate-200 hover:bg-slate-50 rounded-lg p-2"
            title="Show AI Panel"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
