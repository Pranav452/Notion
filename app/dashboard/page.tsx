"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { workspaceService, type Workspace } from "@/lib/supabase/workspace";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Plus,
  Search,
  FileText,
  Users,
  Calendar,
  ArrowRight,
  Brain,
  Settings,
  Clock,
  Zap,
  TrendingUp,
  Activity,
  SortDesc,
  Grid3x3,
  List,
  ChevronDown,
  MoreHorizontal,
  Share2,
  Download,
  Edit,
  Trash2,
  BarChart,
  Database,
  Folder,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function DashboardPage() {
  const router = useRouter();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [filteredWorkspaces, setFilteredWorkspaces] = useState<Workspace[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState("");
  const [newWorkspaceDescription, setNewWorkspaceDescription] = useState("");
  const [user, setUser] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState<"recent" | "name" | "created">("recent");

  const supabase = createClient();

  useEffect(() => {
    loadUser();
    loadWorkspaces();
  }, []);

  useEffect(() => {
    filterWorkspaces();
  }, [workspaces, searchQuery, sortBy]);

  const loadUser = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    setUser(user);
  };

  const loadWorkspaces = async () => {
    try {
      const data = await workspaceService.getWorkspaces();
      setWorkspaces(data);
    } catch (error) {
      console.error("Error loading workspaces:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterWorkspaces = () => {
    let filtered = [...workspaces];

    if (searchQuery) {
      filtered = filtered.filter(
        (workspace) =>
          workspace.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          workspace.description
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase())
      );
    }

    switch (sortBy) {
      case "name":
        filtered.sort((a, b) => a.name.localeCompare(b.name));
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

    setFilteredWorkspaces(filtered);
  };

  const createWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWorkspaceName.trim()) return;

    try {
      const workspace = await workspaceService.createWorkspace(
        newWorkspaceName,
        newWorkspaceDescription as Workspace["type"]
      );

      setWorkspaces((prev) => [workspace, ...prev]);
      setNewWorkspaceName("");
      setNewWorkspaceDescription("");
      setIsCreating(false);

      // Navigate to the new workspace
      router.push(`/workspace/${workspace.id}`);
    } catch (error) {
      console.error("Error creating workspace:", error);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  const getActivityData = () => {
    const today = new Date();
    const thisWeek = workspaces.filter(
      (w) =>
        new Date(w.updated_at) >
        new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
    ).length;
    const thisMonth = workspaces.filter(
      (w) =>
        new Date(w.updated_at) >
        new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)
    ).length;

    return { thisWeek, thisMonth };
  };

  const { thisWeek, thisMonth } = getActivityData();
  const recentWorkspaces = workspaces.slice(0, 4);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-slate-100">
      {/* Professional Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo and Navigation */}

            {/* Search Bar */}
            <div className="flex-1 max-w-xl mx-0">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search workspaces, pages, or people..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full border-slate-200 focus:border-slate-400 focus:ring-slate-400"
                />
              </div>
            </div>

            {/* User Actions */}
            <div className="flex items-center space-x-3">
              <Button
                onClick={() => setIsCreating(true)}
                className="bg-slate-900 hover:bg-slate-800 text-white border-0"
              >
                <Plus className="h-4 w-4 mr-2" />
                New Workspace
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 mb-2">
                {getGreeting()}, {user?.email?.split("@")[0] || "there"}
              </h2>
              <p className="text-slate-600">
                Manage your knowledge base and collaborate with your team
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export Data
              </Button>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </div>
          </div>

          {/* Professional Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="border-slate-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">
                      Total Workspaces
                    </p>
                    <p className="text-2xl font-bold text-slate-900">
                      {workspaces.length}
                    </p>
                    <p className="text-xs text-green-600 mt-1">
                      <TrendingUp className="inline h-3 w-3 mr-1" />
                      +12% from last month
                    </p>
                  </div>
                  <div className="h-12 w-12 bg-slate-100 rounded-lg flex items-center justify-center">
                    <Folder className="h-6 w-6 text-slate-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">
                      Active This Week
                    </p>
                    <p className="text-2xl font-bold text-slate-900">
                      {thisWeek}
                    </p>
                    <p className="text-xs text-blue-600 mt-1">
                      <Activity className="inline h-3 w-3 mr-1" />
                      {((thisWeek / workspaces.length) * 100).toFixed(0)}% of
                      total
                    </p>
                  </div>
                  <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <BarChart className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">
                      Team Members
                    </p>
                    <p className="text-2xl font-bold text-slate-900">12</p>
                    <p className="text-xs text-purple-600 mt-1">
                      <Users className="inline h-3 w-3 mr-1" />3 online now
                    </p>
                  </div>
                  <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Users className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">
                      Storage Used
                    </p>
                    <p className="text-2xl font-bold text-slate-900">2.4GB</p>
                    <p className="text-xs text-amber-600 mt-1">
                      <Database className="inline h-3 w-3 mr-1" />
                      48% of 5GB plan
                    </p>
                  </div>
                  <div className="h-12 w-12 bg-amber-100 rounded-lg flex items-center justify-center">
                    <Database className="h-6 w-6 text-amber-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mb-8">
          {/* Quick Actions */}
          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-slate-900">
                <Zap className="h-5 w-5 text-amber-500" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                onClick={() => setIsCreating(true)}
                className="w-full justify-start bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200"
                variant="ghost"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Workspace
              </Button>
              <Button
                className="w-full justify-start bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200"
                variant="ghost"
              >
                <FileText className="h-4 w-4 mr-2" />
                Import Content
              </Button>
              <Button
                className="w-full justify-start bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200"
                variant="ghost"
              >
                <Brain className="h-4 w-4 mr-2" />
                AI Assistant
              </Button>
              <Button
                className="w-full justify-start bg-green-50 hover:bg-green-100 text-green-700 border border-green-200"
                variant="ghost"
              >
                <Users className="h-4 w-4 mr-2" />
                Invite Team
              </Button>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="lg:col-span-2 border-slate-200">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-blue-500" />
                  Recent Activity
                </div>
                <Button variant="ghost" size="sm" className="text-slate-500">
                  View All
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentWorkspaces.map((workspace, index) => (
                  <div
                    key={workspace.id}
                    className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer"
                    onClick={() => router.push(`/workspace/${workspace.id}`)}
                  >
                    <div className="w-10 h-10 bg-slate-200 rounded-lg flex items-center justify-center">
                      <FileText className="h-5 w-5 text-slate-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-slate-900">
                        {workspace.name}
                      </p>
                      <p className="text-sm text-slate-500">
                        Updated{" "}
                        {new Date(workspace.updated_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="secondary"
                        className="bg-green-100 text-green-700 text-xs"
                      >
                        Active
                      </Badge>
                      <ArrowRight className="h-4 w-4 text-slate-400" />
                    </div>
                  </div>
                ))}
                {recentWorkspaces.length === 0 && (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500">No recent activity</p>
                    <p className="text-sm text-slate-400">
                      Create your first workspace to get started
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Team Overview */}
          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-slate-900">
                <Users className="h-5 w-5 text-purple-500" />
                Team
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-200 rounded-full flex items-center justify-center">
                  <span className="text-xs font-medium text-blue-700">JD</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-900">John Doe</p>
                  <p className="text-xs text-slate-500">Owner</p>
                </div>
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-purple-200 rounded-full flex items-center justify-center">
                  <span className="text-xs font-medium text-purple-700">
                    AS
                  </span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-900">
                    Alice Smith
                  </p>
                  <p className="text-xs text-slate-500">Editor</p>
                </div>
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-amber-200 rounded-full flex items-center justify-center">
                  <span className="text-xs font-medium text-amber-700">MB</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-900">
                    Mike Brown
                  </p>
                  <p className="text-xs text-slate-500">Viewer</p>
                </div>
                <div className="w-2 h-2 bg-slate-300 rounded-full"></div>
              </div>
              <Button className="w-full" variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Invite Member
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Workspace Management Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-slate-900">Workspaces</h3>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  className={
                    viewMode === "grid" ? "bg-slate-900 text-white" : ""
                  }
                >
                  <Grid3x3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className={
                    viewMode === "list" ? "bg-slate-900 text-white" : ""
                  }
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <SortDesc className="h-4 w-4 mr-2" />
                    Sort:{" "}
                    {sortBy === "recent"
                      ? "Recent"
                      : sortBy === "name"
                      ? "Name"
                      : "Created"}
                    <ChevronDown className="h-4 w-4 ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setSortBy("recent")}>
                    <Clock className="h-4 w-4 mr-2" />
                    Recently updated
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy("name")}>
                    <FileText className="h-4 w-4 mr-2" />
                    Name
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy("created")}>
                    <Calendar className="h-4 w-4 mr-2" />
                    Date created
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Enhanced Workspaces Display */}
          {filteredWorkspaces.length > 0 ? (
            viewMode === "grid" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredWorkspaces.map((workspace, index) => (
                  <Card
                    key={workspace.id}
                    className="group border-slate-200 hover:shadow-lg transition-all duration-200 cursor-pointer overflow-hidden"
                    onClick={() => router.push(`/workspace/${workspace.id}`)}
                    style={{
                      animationDelay: `${index * 100}ms`,
                      animation: "fadeInUp 0.5s ease-out both",
                    }}
                  >
                    <CardHeader className="relative pb-3">
                      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Share2 className="h-4 w-4 mr-2" />
                              Share
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Download className="h-4 w-4 mr-2" />
                              Export
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600">
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <FileText className="h-6 w-6 text-slate-600" />
                        </div>
                        <div className="flex-1">
                          <CardTitle className="text-lg mb-2 group-hover:text-slate-600 transition-colors">
                            {workspace.name}
                          </CardTitle>
                          {workspace.description && (
                            <p className="text-sm text-slate-500 line-clamp-2">
                              {workspace.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex items-center justify-between text-sm text-slate-500 mb-4">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>
                            {new Date(
                              workspace.created_at
                            ).toLocaleDateString()}
                          </span>
                        </div>
                        <Badge
                          variant="secondary"
                          className="bg-green-50 text-green-700 border-green-200"
                        >
                          Active
                        </Badge>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-slate-500">
                          <div className="flex -space-x-1">
                            <div className="w-5 h-5 bg-blue-200 rounded-full border border-white"></div>
                            <div className="w-5 h-5 bg-purple-200 rounded-full border border-white"></div>
                            <div className="w-5 h-5 bg-amber-200 rounded-full border border-white"></div>
                          </div>
                          <span>3 members</span>
                        </div>
                        <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-slate-600 group-hover:translate-x-1 transition-all" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {filteredWorkspaces.map((workspace, index) => (
                  <Card
                    key={workspace.id}
                    className="group border-slate-200 hover:shadow-md transition-all duration-200 cursor-pointer"
                    onClick={() => router.push(`/workspace/${workspace.id}`)}
                    style={{
                      animationDelay: `${index * 50}ms`,
                      animation: "fadeInUp 0.3s ease-out both",
                    }}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                          <FileText className="h-5 w-5 text-slate-600" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-slate-900 group-hover:text-slate-600 transition-colors">
                            {workspace.name}
                          </h4>
                          <p className="text-sm text-slate-500">
                            {workspace.description || "No description"}
                          </p>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-slate-500">
                          <span>
                            {new Date(
                              workspace.updated_at
                            ).toLocaleDateString()}
                          </span>
                          <Badge
                            variant="secondary"
                            className="bg-green-50 text-green-700"
                          >
                            Active
                          </Badge>
                          <div className="flex -space-x-1">
                            <div className="w-5 h-5 bg-blue-200 rounded-full border border-white"></div>
                            <div className="w-5 h-5 bg-purple-200 rounded-full border border-white"></div>
                          </div>
                        </div>
                        <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-slate-600 group-hover:translate-x-1 transition-all" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )
          ) : (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <FileText className="h-12 w-12 text-slate-400" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">
                {searchQuery ? "No workspaces found" : "No workspaces yet"}
              </h3>
              <p className="text-slate-600 mb-8 max-w-md mx-auto">
                {searchQuery
                  ? `No workspaces match "${searchQuery}". Try adjusting your search.`
                  : "Create your first workspace to start building your knowledge base"}
              </p>
              {!searchQuery && (
                <Button
                  onClick={() => setIsCreating(true)}
                  size="lg"
                  className="bg-slate-900 hover:bg-slate-800 text-white"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Create Your First Workspace
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Create Workspace Modal */}
        {isCreating && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <Card className="w-full max-w-md mx-4 bg-white shadow-2xl border-slate-200">
              <CardHeader className="text-center">
                <div className="w-12 h-12 bg-slate-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Plus className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-xl text-slate-900">
                  Create New Workspace
                </CardTitle>
                <p className="text-sm text-slate-600">
                  Set up a new knowledge base for your team
                </p>
              </CardHeader>
              <CardContent>
                <form onSubmit={createWorkspace} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Workspace Name *
                    </label>
                    <Input
                      value={newWorkspaceName}
                      onChange={(e) => setNewWorkspaceName(e.target.value)}
                      placeholder="Product Documentation"
                      className="border-slate-200 focus:border-slate-400"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Description
                    </label>
                    <Input
                      value={newWorkspaceDescription}
                      onChange={(e) =>
                        setNewWorkspaceDescription(e.target.value)
                      }
                      placeholder="Documentation and guides for our product"
                      className="border-slate-200 focus:border-slate-400"
                    />
                  </div>
                  <div className="flex gap-3 pt-4">
                    <Button
                      type="submit"
                      className="flex-1 bg-slate-900 hover:bg-slate-800 text-white"
                    >
                      Create Workspace
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setIsCreating(false);
                        setNewWorkspaceName("");
                        setNewWorkspaceDescription("");
                      }}
                      className="border-slate-200"
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animation-delay-150 {
          animation-delay: 150ms;
        }
      `}</style>
    </div>
  );
}
