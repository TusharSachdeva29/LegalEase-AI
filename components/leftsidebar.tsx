"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Upload,
  MessageCircle,
  FileText,
  History,
  User as UserIcon,
  LayoutDashboard,
  Video,
  Settings,
  ChevronDown,
  ChevronRight,
  FileSearch,
} from "lucide-react";
import { usePathname } from "next/navigation";
import {
  getAuth,
  onAuthStateChanged,
  User as FirebaseUser,
} from "firebase/auth";
import firebaseApp from "@/lib/firebase";

// Green color palette
const GREEN_GRADIENT = "from-green-500 to-green-700";
const GREEN_BG = "bg-green-700";
const GREEN_BG_LIGHT = "bg-green-600/20";
const GREEN_TEXT = "text-green-600";
const GREEN_ACCENT = "bg-green-100/10";

// Sidebar options with children for Document Analysis
const sidebarOptions = [
  {
    name: "Dashboard",
    icon: LayoutDashboard,
    href: "/dashboard",
  },
  {
    name: "Document Analysis",
    icon: FileText,
    hasChildren: true,
    children: [
      {
        name: "Upload",
        icon: Upload,
        href: "/upload",
      },
      {
        name: "Analysis",
        icon: FileSearch,
        href: "/analysis",
      },
    ],
  },
  {
    name: "Legal Chat Assistant",
    icon: MessageCircle,
    href: "/chat",
  },
  // {
  //   name: "Clause Analysis",
  //   icon: FileText,
  //   href: "/clauses",
  // },
  {
    name: "Start Meeting",
    icon: Video,
    href: "/meet",
  },
  // {
  //   name: "Chat History",
  //   icon: History,
  //   href: "/history",
  // },
  {
    name: "Settings",
    icon: Settings,
    href: "/settings",
  },
];

export function LeftSidebar({ userId }: { userId?: string }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [openMenus, setOpenMenus] = useState<string[]>([]);
  const pathname = usePathname();

  // Firebase user state
  const [user, setUser] = useState<FirebaseUser | null>(null);

  useEffect(() => {
    const auth = getAuth(firebaseApp);
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });
    return () => unsubscribe();
  }, []);

  // Check if a menu item is active
  const isActive = (href: string) => {
    return (
      pathname === href ||
      (href === "/dashboard#history" && pathname === "/dashboard")
    );
  };

  // Check if a parent menu has an active child
  const hasActiveChild = (item: any) => {
    if (!item.hasChildren || !item.children) return false;
    return item.children.some((child: any) => isActive(child.href));
  };

  // Auto-expand parent menu when a child route is active
  useEffect(() => {
    sidebarOptions.forEach((item) => {
      if (item.hasChildren && item.children) {
        const shouldExpand = item.children.some(
          (child: any) => isActive(child.href)
        );
        if (shouldExpand && !openMenus.includes(item.name)) {
          setOpenMenus((prev) => [...prev, item.name]);
        }
      }
    });
    // eslint-disable-next-line
  }, [pathname]);

  const toggleMenu = (name: string) => {
    if (openMenus.includes(name)) {
      setOpenMenus(openMenus.filter((item) => item !== name));
    } else {
      setOpenMenus([...openMenus, name]);
    }
  };

  return (
    <div
      className={`fixed top-20 left-0 z-30 flex flex-col transition-all duration-300 ease-in-out overflow-hidden
        ${isExpanded ? "w-56" : "w-16"}
        bg-white border-r border-green-200`}
      style={{ height: "calc(100vh - 5rem)" }}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      {/* Sidebar Navigation */}
      <div
        className="flex flex-col flex-1 py-2 overflow-y-auto overflow-x-hidden hide-scrollbar"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {sidebarOptions.map((opt) => {
          if (opt.hasChildren && opt.children) {
            const active = hasActiveChild(opt);
            return (
              <div key={opt.name} className="w-full px-2 mb-1">
                <div
                  className={`
                    flex items-center py-2.5 px-3 rounded-md transition-colors duration-200 cursor-pointer
                    ${active ? "bg-green-600/20 text-green-800 font-medium" : "hover:bg-green-100/40 text-gray-700"}
                    focus:outline-none w-full
                  `}
                  onClick={() => toggleMenu(opt.name)}
                >
                  <div
                    className={`
                      flex items-center justify-center w-6 h-6 rounded-md
                      ${active ? GREEN_TEXT : "text-gray-700"}
                    `}
                  >
                    <opt.icon size={20} />
                  </div>
                  <span
                    className={`
                      ml-3 flex-1 transition-opacity duration-300 whitespace-nowrap text-sm
                      ${isExpanded ? "opacity-100" : "opacity-0"}
                    `}
                  >
                    {opt.name}
                  </span>
                  {isExpanded && (
                    openMenus.includes(opt.name) ? (
                      <ChevronDown size={16} />
                    ) : (
                      <ChevronRight size={16} />
                    )
                  )}
                </div>
                {/* Children */}
                {openMenus.includes(opt.name) && isExpanded && (
                  <div className="pl-9 pr-2 py-1 space-y-1">
                    {opt.children.map((child: any) => (
                      <Link
                        key={child.name}
                        href={child.href}
                        className={`
                          flex items-center py-2 px-3 rounded-md text-sm transition-colors duration-200
                          ${isActive(child.href)
                            ? "bg-green-600/30 text-green-800 font-medium"
                            : "text-gray-700 hover:bg-green-100/40"}
                          focus:outline-none w-full
                        `}
                      >
                        <div
                          className={`
                            flex items-center justify-center w-5 h-5 rounded-md
                            ${isActive(child.href) ? GREEN_TEXT : "text-gray-700"}
                          `}
                        >
                          <child.icon size={17} />
                        </div>
                        <span
                          className={`
                            ml-2 transition-opacity duration-300 whitespace-nowrap
                            ${isExpanded ? "opacity-100" : "opacity-0"}
                          `}
                        >
                          {child.name}
                        </span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          }
          // Single-level item
          const active = isActive(opt.href);
          return (
            <div key={opt.name} className="w-full px-2 mb-1">
              <Link
                href={opt.href ?? "#"}
                className={`
                  flex items-center py-2.5 px-3 rounded-md transition-colors duration-200
                  ${
                    active
                      ? "bg-green-600/20 text-green-800 font-medium"
                      : "hover:bg-green-100/40 text-gray-700"
                  }
                  focus:outline-none w-full
                `}
              >
                <div
                  className={`
                    flex items-center justify-center w-6 h-6 rounded-md
                    ${active ? GREEN_TEXT : "text-gray-700"}
                  `}
                >
                  <opt.icon size={20} />
                </div>
                <span
                  className={`
                    ml-3 transition-opacity duration-300 whitespace-nowrap text-sm
                    ${isExpanded ? "opacity-100" : "opacity-0"}
                  `}
                >
                  {opt.name}
                </span>
              </Link>
            </div>
          );
        })}
      </div>

      {/* User Info */}
      <div className="border-t border-green-200 p-3">
        <div
          className={`
            flex items-center rounded-2xl p-2 ${GREEN_ACCENT} hover:bg-green-100/30 transition-all duration-200
            ${isExpanded ? "justify-between" : "justify-center"}
          `}
        >
          {user && user.photoURL ? (
            <img
              src={user.photoURL}
              alt={user.displayName || user.email || "User"}
              className="h-8 w-8 rounded-full border-2 border-white/20 shadow-md object-cover"
            />
          ) : (
            <div className="h-8 w-8 text-xs rounded-2xl bg-gradient-to-r from-green-500 to-green-700 flex items-center justify-center text-white shadow-md">
              <UserIcon className="h-5 w-5" />
            </div>
          )}
          <div
            className={`
              transition-opacity duration-300 overflow-hidden
              ${isExpanded ? "opacity-100 ml-2 flex-1" : "opacity-0 w-0"}
            `}
          >
            {user ? (
              <>
                <p className="text-green-900 text-sm font-medium truncate">
                  {user.displayName || user.email}
                </p>
                <p className="text-green-500 text-xs truncate">{user.email}</p>
              </>
            ) : (
              <>
                <p className="text-green-900 text-sm font-medium truncate">
                  {userId || "User ID"}
                </p>
                <p className="text-green-500 text-xs truncate">Legal User</p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// WithSidebar component for layout with sidebar
export function WithSidebar({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [userId, setUserId] = useState<string | undefined>(undefined);

  useEffect(() => {
    const auth = getAuth(firebaseApp);
    const user = auth.currentUser;
    if (user) setUserId(user.uid);
  }, []);

  // Hide sidebar on hero-section ("/"), signin, and any future signup
  if (
    pathname === "/" ||
    pathname.startsWith("/signin") ||
    pathname.startsWith("/signup")
  ) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen">
      <LeftSidebar userId={userId} />
      <div className="flex-1">{children}</div>
    </div>
  );
}
