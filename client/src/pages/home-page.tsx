import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "../hooks/use-auth";
import { useWebSocket } from "../hooks/use-websocket";
import { apiRequest, queryClient } from "../lib/queryClient";
import { Loader2, PlusCircle } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Badge } from "../components/ui/badge";
import { Textarea } from "../components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "../components/ui/popover";
import { ScrollArea } from "../components/ui/scroll-area";
import { NotificationToast } from "../components/ui/notification-toast";
import { BellIcon } from "lucide-react";
import { formatDistanceToNow } from "../lib/date";
import { Avatar, AvatarFallback } from "../components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../components/ui/dropdown-menu";
import { z } from "zod";

interface Blog {
  id: number;
  title: string;
  content: string;
  tags: string;
  userId: number;
  createdAt: string;
  user?: {
    id: number;
    username: string;
  };
}

interface Notification {
  id: number;
  message: string;
  blogId: number | null;
  userId: number | null;
  read: boolean;
  createdAt: string;
}

const blogFormSchema = z.object({
  title: z.string().min(5, { message: "Title must be at least 5 characters" }),
  content: z.string().min(10, { message: "Content must be at least 10 characters" }),
  tags: z.string().optional(),
});

type BlogFormValues = z.infer<typeof blogFormSchema>;

export default function HomePage() {
  const { user, logoutMutation } = useAuth();
  const [isNewBlogModalOpen, setIsNewBlogModalOpen] = useState(false);
  const [isNotificationPanelOpen, setIsNotificationPanelOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeNotification, setActiveNotification] = useState<Notification | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [formValues, setFormValues] = useState<BlogFormValues>({
    title: "",
    content: "",
    tags: ""
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  
  const websocket = useWebSocket();

  // Get blogs
  const { 
    data: blogs,
    isLoading: isLoadingBlogs,
    isError: isErrorBlogs
  } = useQuery<Blog[]>({
    queryKey: ['/api/blogs'],
  });
  
  // Get notifications
  const { 
    data: notifications,
    isLoading: isLoadingNotifications
  } = useQuery<Notification[]>({
    queryKey: ['/api/notifications'],
  });
  
  // Handle new blog submission
  const createBlogMutation = useMutation({
    mutationFn: async (newBlog: BlogFormValues) => {
      const response = await apiRequest("POST", "/api/blogs", newBlog);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/blogs'] });
      setIsNewBlogModalOpen(false);
      setFormValues({
        title: "",
        content: "",
        tags: ""
      });
    }
  });

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      blogFormSchema.parse(formValues);
      setFormErrors({});
      createBlogMutation.mutate(formValues);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path) {
            errors[err.path[0]] = err.message;
          }
        });
        setFormErrors(errors);
      }
    }
  };
  
  // Handle websocket updates
  useEffect(() => {
    if (websocket.data && websocket.data.type === 'NEW_BLOG') {
      queryClient.invalidateQueries({ queryKey: ['/api/blogs'] });
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
      
      if (websocket.data.data.user.id !== user?.id) {
        setActiveNotification(websocket.data.data.notification);
        setShowToast(true);
      }
    }
  }, [websocket.data, user?.id]);
  
  // Calculate unread notifications
  const unreadNotifications = notifications?.filter(
    notification => !notification.read
  ).length || 0;
  
  // Get user initials for avatar
  const getUserInitials = (username: string) => {
    return username.substring(0, 2).toUpperCase();
  };

  // Format date (like "2 hours ago")
  const formatDate = (date: string) => {
    return formatDistanceToNow(new Date(date));
  };
  
  // Get tags from comma-separated string
  const getBlogTags = (tagsString: string | undefined) => {
    if (!tagsString) return [];
    return tagsString.split(',').map(tag => tag.trim()).filter(Boolean);
  };
  
  // Estimate read time based on content length
  const getReadTime = (content: string) => {
    const wordsPerMinute = 200;
    const words = content.trim().split(/\s+/).length;
    const minutes = Math.ceil(words / wordsPerMinute);
    return `${minutes} min read`;
  };

  // Handle logout
  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar */}
      <nav className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <a href="/" className="flex items-center">
                  <svg className="h-8 w-8 text-primary-600" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd"></path>
                  </svg>
                  <span className="ml-2 text-xl font-bold text-gray-900">BlogSpace</span>
                </a>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:items-center">
                <div className="px-3 py-2 text-sm font-medium text-gray-900 hover:text-primary-600">Home</div>
                <div className="px-3 py-2 text-sm font-medium text-gray-500 hover:text-primary-600">Explore</div>
                <div className="px-3 py-2 text-sm font-medium text-gray-500 hover:text-primary-600">My Blogs</div>
              </div>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:items-center">
              {/* Notification button */}
              <div className="relative ml-3">
                <Popover open={isNotificationPanelOpen} onOpenChange={setIsNotificationPanelOpen}>
                  <PopoverTrigger asChild>
                    <Button variant="ghost" size="icon" className="relative">
                      <BellIcon className="h-6 w-6 text-gray-500 hover:text-primary-600" />
                      {unreadNotifications > 0 && (
                        <span className="absolute top-0 right-0 h-2 w-2 bg-amber-500 rounded-full animate-pulse" />
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80 p-0">
                    <div className="px-4 py-2 text-sm text-gray-700 border-b border-gray-200 font-semibold">
                      Notifications
                    </div>
                    <ScrollArea className="h-[300px]">
                      {isLoadingNotifications ? (
                        <div className="flex justify-center py-4">
                          <Loader2 className="h-6 w-6 animate-spin text-primary-600" />
                        </div>
                      ) : notifications && notifications.length > 0 ? (
                        notifications.map((notification) => (
                          <div key={notification.id} className="px-4 py-3 hover:bg-gray-50">
                            <p className="text-sm text-gray-700 mb-1" dangerouslySetInnerHTML={{ __html: notification.message.replace(/([A-Za-z0-9_-]+)/, '<span class="font-medium text-primary-600">$1</span>') }} />
                            <p className="text-xs text-gray-500">{formatDate(notification.createdAt)}</p>
                          </div>
                        ))
                      ) : (
                        <div className="px-4 py-4 text-sm text-gray-500 text-center">
                          No notifications yet
                        </div>
                      )}
                    </ScrollArea>
                    <div className="px-4 py-2 text-sm text-primary-600 text-center border-t border-gray-200">
                      <a href="#" className="hover:text-primary-800">View all notifications</a>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>

              {/* User menu */}
              <div className="relative ml-3">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>{user ? getUserInitials(user.username) : "??"}</AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      Your Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      Settings
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleLogout}>
                      Sign out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            <div className="-mr-2 flex items-center sm:hidden">
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                <span className="sr-only">Open main menu</span>
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </Button>
            </div>
          </div>
        </div>
        
        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="sm:hidden">
            <div className="pt-2 pb-3 space-y-1">
              <a href="#" className="bg-primary-50 border-primary-500 text-primary-700 block pl-3 pr-4 py-2 border-l-4 text-base font-medium">Home</a>
              <a href="#" className="border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700 block pl-3 pr-4 py-2 border-l-4 text-base font-medium">Explore</a>
              <a href="#" className="border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700 block pl-3 pr-4 py-2 border-l-4 text-base font-medium">My Blogs</a>
            </div>
            <div className="pt-4 pb-3 border-t border-gray-200">
              <div className="flex items-center px-4">
                <div className="flex-shrink-0">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback>{user ? getUserInitials(user.username) : "??"}</AvatarFallback>
                  </Avatar>
                </div>
                <div className="ml-3">
                  <div className="text-base font-medium text-gray-800">{user?.username}</div>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="ml-auto"
                  onClick={() => setIsNotificationPanelOpen(!isNotificationPanelOpen)}
                >
                  <BellIcon className="h-6 w-6 text-gray-500" />
                  {unreadNotifications > 0 && (
                    <span className="absolute top-1 right-1 h-2 w-2 bg-amber-500 rounded-full animate-pulse" />
                  )}
                </Button>
              </div>
              <div className="mt-3 space-y-1">
                <a href="#" className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100">Your Profile</a>
                <a href="#" className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100">Settings</a>
                <button 
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                >
                  Sign out
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Main content */}
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          {/* New blog button */}
          <div className="px-4 sm:px-0 mb-6 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Latest Posts</h1>
            <Button 
              onClick={() => setIsNewBlogModalOpen(true)}
              className="bg-primary hover:bg-primary/90 shadow-md"
              size="default"
            >
              <PlusCircle className="mr-2 h-5 w-5" />
              New Blog
            </Button>
          </div>

          {/* Blog grid */}
          <div className="grid gap-6 lg:grid-cols-3 md:grid-cols-2 sm:grid-cols-1 px-4 sm:px-0">
            {isLoadingBlogs ? (
              <div className="col-span-full flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : isErrorBlogs ? (
              <div className="col-span-full text-center py-12">
                <p className="text-red-500">Failed to load blogs. Please try again later.</p>
              </div>
            ) : blogs && blogs.length > 0 ? (
              blogs.map((blog) => (
                <Card key={blog.id} className="overflow-hidden">
                  <CardContent className="p-0">
                    <div className="px-4 py-5 sm:p-6">
                      <div className="flex items-center mb-4">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback>{blog.user ? getUserInitials(blog.user.username) : "??"}</AvatarFallback>
                        </Avatar>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900">{blog.user?.username || "Unknown User"}</p>
                          <p className="text-xs text-gray-500">{formatDate(blog.createdAt)}</p>
                        </div>
                      </div>
                      <a href="#" className="block">
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">{blog.title}</h3>
                        <p className="text-gray-600 line-clamp-3 mb-4">{blog.content}</p>
                      </a>
                      <div className="flex justify-between items-center">
                        <div className="flex flex-wrap gap-2">
                          {getBlogTags(blog.tags).map((tag, index) => (
                            <Badge key={index} variant="secondary" className="bg-primary/10 text-primary border-transparent">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                        <div className="text-sm text-gray-500">{getReadTime(blog.content)}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <p className="text-gray-500">No blogs yet. Be the first to create a blog post!</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* New blog modal */}
      <Dialog open={isNewBlogModalOpen} onOpenChange={setIsNewBlogModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Create a New Blog Post</DialogTitle>
            <DialogDescription>
              Share your thoughts with the community. Your post will be published immediately.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="blog-title">Title</Label>
                <Input
                  id="blog-title"
                  value={formValues.title}
                  onChange={(e) => setFormValues({ ...formValues, title: e.target.value })}
                  placeholder="Enter a title for your blog post"
                />
                {formErrors.title && <p className="text-sm text-red-500">{formErrors.title}</p>}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="blog-content">Content</Label>
                <Textarea
                  id="blog-content"
                  rows={6}
                  value={formValues.content}
                  onChange={(e) => setFormValues({ ...formValues, content: e.target.value })}
                  placeholder="Write your blog post here..."
                />
                {formErrors.content && <p className="text-sm text-red-500">{formErrors.content}</p>}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="blog-tags">Tags (comma separated)</Label>
                <Input
                  id="blog-tags"
                  value={formValues.tags}
                  onChange={(e) => setFormValues({ ...formValues, tags: e.target.value })}
                  placeholder="React, Node.js, MongoDB"
                />
              </div>
            </div>
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsNewBlogModalOpen(false)}
                disabled={createBlogMutation.isPending}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={createBlogMutation.isPending}
              >
                {createBlogMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Publishing...
                  </>
                ) : (
                  "Publish"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Toast notification */}
      {activeNotification && (
        <NotificationToast
          show={showToast}
          onClose={() => setShowToast(false)}
          title="New Blog Post"
        >
          {activeNotification.message}
        </NotificationToast>
      )}
    </div>
  );
}
