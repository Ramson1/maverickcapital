"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";

interface LoadingContextType {
  isLoading: boolean;
  loadingMessage: string;
  showLoading: (message?: string) => void;
  hideLoading: () => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export function LoadingProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");

  const showLoading = useCallback((message?: string) => {
    setLoadingMessage(message || "");
    setIsLoading(true);
  }, []);

  const hideLoading = useCallback(() => {
    setIsLoading(false);
    setLoadingMessage("");
  }, []);

  return (
    <LoadingContext.Provider value={{ isLoading, loadingMessage, showLoading, hideLoading }}>
      {children}
      {isLoading && <LoadingOverlay message={loadingMessage} />}
    </LoadingContext.Provider>
  );
}

function LoadingOverlay({ message }: { message: string }) {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-4 rounded-2xl bg-white p-8 shadow-2xl dark:bg-surface-900">
        {/* Custom animated loader */}
        <div className="relative h-16 w-16">
          {/* Outer ring */}
          <div className="absolute inset-0 rounded-full border-4 border-surface-200 dark:border-surface-700" />
          {/* Spinning ring */}
          <div className="absolute inset-0 animate-spin rounded-full border-4 border-transparent border-t-brand-600 dark:border-t-brand-400" />
          {/* Inner pulsing dot */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-4 w-4 animate-pulse rounded-full bg-brand-600 dark:bg-brand-400" />
          </div>
        </div>
        {/* Message */}
        {message && (
          <p className="text-sm font-medium text-surface-700 dark:text-surface-300">{message}</p>
        )}
      </div>
    </div>
  );
}

export function useLoading() {
  const context = useContext(LoadingContext);
  if (context === undefined) {
    throw new Error("useLoading must be used within a LoadingProvider");
  }
  return context;
}
