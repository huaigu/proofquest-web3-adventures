import { Button } from "@/components/ui/button";
import { Link, useLocation } from "react-router-dom";
import { Menu, User, LogOut, Shield } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAuthUI } from '@/hooks/useAuth';

export const Navigation = () => {
  const location = useLocation();
  const { 
    authButtonState, 
    userDisplayName, 
    isAuthenticated, 
    isLoading,
    isWalletConnected 
  } = useAuthUI();

  const navItems = [
    { label: "Explore", href: "/quests" },
    { label: "Create", href: "/create" },
    { label: "Profile", href: "/profile" },
  ];

  const isActive = (path: string) => {
    if (path === "/" && location.pathname === "/") return true;
    if (path !== "/" && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-3 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[hsl(var(--vibrant-blue))] to-[hsl(var(--vibrant-purple))] text-white font-bold text-lg shadow-lg group-hover:scale-105 transition-transform duration-200">
            P
          </div>
          <span className="font-bold text-xl bg-gradient-to-r from-[hsl(var(--vibrant-blue))] to-[hsl(var(--vibrant-purple))] bg-clip-text text-transparent">
            ProofQuest
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-3">
          {navItems.map((item, index) => {
            const gradients = [
              "from-[hsl(var(--vibrant-blue))] to-[hsl(var(--vibrant-purple))]", // Explore
              "from-[hsl(var(--vibrant-orange))] to-[hsl(var(--vibrant-yellow))]", // Create
              "from-[hsl(var(--vibrant-green))] to-[hsl(var(--vibrant-blue))]", // Profile
            ];
            
            return (
              <Link
                key={item.href}
                to={item.href}
                className={`relative px-4 py-2 rounded-xl font-medium text-sm transition-all duration-200 hover:scale-105 hover:shadow-lg ${
                  isActive(item.href)
                    ? `bg-gradient-to-r ${gradients[index]} text-white shadow-lg`
                    : "bg-gradient-to-r from-[hsl(var(--vibrant-blue))]/15 to-[hsl(var(--vibrant-purple))]/15 text-foreground border border-[hsl(var(--vibrant-blue))]/20 hover:from-[hsl(var(--vibrant-blue))]/25 hover:to-[hsl(var(--vibrant-purple))]/25 hover:border-[hsl(var(--vibrant-blue))]/40 shadow-sm"
                }`}
              >
                <div className="relative z-10 flex items-center gap-2">
                  {item.label}
                  {isActive(item.href) && (
                    <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                  )}
                </div>
                {!isActive(item.href) && (
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 hover:opacity-100 transition-opacity" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Wallet Connection & Authentication */}
        <div className="flex items-center space-x-3">
          {/* Authentication Status Indicator */}
          {isWalletConnected && (
            <div className="hidden sm:flex items-center space-x-2">
              {isAuthenticated ? (
                <Badge variant="secondary" className="bg-green-500/20 text-green-400 border-green-500/50">
                  <Shield className="w-3 h-3 mr-1" />
                  Authenticated
                </Badge>
              ) : (
                <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-400 border-yellow-500/50">
                  <User className="w-3 h-3 mr-1" />
                  Sign In Required
                </Badge>
              )}
            </div>
          )}
          
          {/* Wallet Connect Button */}
          <div className="hidden sm:flex">
            <ConnectButton />
          </div>
          
          {/* SIWE Authentication Button */}
          {isWalletConnected && !isAuthenticated && (
            <Button
              variant={authButtonState.variant}
              size="sm"
              disabled={authButtonState.disabled}
              onClick={authButtonState.action}
              className="hidden sm:flex items-center space-x-2"
            >
              <Shield className="w-4 h-4" />
              <span>{authButtonState.text}</span>
            </Button>
          )}
          
          {/* User Display */}
          {isAuthenticated && userDisplayName && (
            <div className="hidden sm:flex items-center space-x-2 px-3 py-1 rounded-lg bg-gradient-to-r from-[hsl(var(--vibrant-blue))]/15 to-[hsl(var(--vibrant-purple))]/15 border border-[hsl(var(--vibrant-blue))]/20">
              <User className="w-4 h-4 text-[hsl(var(--vibrant-blue))]" />
              <span className="text-sm font-medium">{userDisplayName}</span>
            </div>
          )}

          {/* Mobile Menu */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <div className="flex flex-col space-y-4 mt-6">
                {/* Mobile Wallet Connection */}
                <div className="w-full">
                  <ConnectButton />
                </div>
                
                {/* Mobile Authentication */}
                {isWalletConnected && (
                  <div className="flex flex-col space-y-3">
                    {/* Authentication Status */}
                    <div className="flex items-center justify-center">
                      {isAuthenticated ? (
                        <Badge variant="secondary" className="bg-green-500/20 text-green-400 border-green-500/50">
                          <Shield className="w-3 h-3 mr-1" />
                          Authenticated as {userDisplayName}
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-400 border-yellow-500/50">
                          <User className="w-3 h-3 mr-1" />
                          Sign In Required
                        </Badge>
                      )}
                    </div>
                    
                    {/* Mobile Authentication Button */}
                    {!isAuthenticated && (
                      <Button
                        variant={authButtonState.variant}
                        size="sm"
                        disabled={authButtonState.disabled}
                        onClick={authButtonState.action}
                        className="w-full flex items-center justify-center space-x-2"
                      >
                        <Shield className="w-4 h-4" />
                        <span>{authButtonState.text}</span>
                      </Button>
                    )}
                  </div>
                )}
                
                <div className="border-t pt-4 space-y-3">
                  {navItems.map((item, index) => {
                    const gradients = [
                      "from-[hsl(var(--vibrant-blue))] to-[hsl(var(--vibrant-purple))]", // Explore
                      "from-[hsl(var(--vibrant-orange))] to-[hsl(var(--vibrant-yellow))]", // Create
                      "from-[hsl(var(--vibrant-green))] to-[hsl(var(--vibrant-blue))]", // Profile
                    ];
                    
                    return (
                      <Link
                        key={item.href}
                        to={item.href}
                        className={`block px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 ${
                          isActive(item.href)
                            ? `bg-gradient-to-r ${gradients[index]} text-white shadow-lg`
                            : "bg-gradient-to-r from-[hsl(var(--vibrant-blue))]/15 to-[hsl(var(--vibrant-purple))]/15 text-foreground border border-[hsl(var(--vibrant-blue))]/20 hover:from-[hsl(var(--vibrant-blue))]/25 hover:to-[hsl(var(--vibrant-purple))]/25 hover:border-[hsl(var(--vibrant-blue))]/40 shadow-sm"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {item.label}
                          {isActive(item.href) && (
                            <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                          )}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};