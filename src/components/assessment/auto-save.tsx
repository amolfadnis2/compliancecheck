'use client';

/**
 * Auto-Save Hook and Component for Assessment Progress
 * Provides visual confirmation of save status
 */

import { useState, useEffect, useCallback, useRef } from 'react';

// Types
export interface SaveState {
  status: 'idle' | 'saving' | 'saved' | 'error';
  lastSaved: Date | null;
  error: string | null;
}

interface AutoSaveOptions {
  debounceMs?: number;
  storageKey: string;
  onSave?: (data: unknown) => Promise<void>;
}

// Local storage helper with error handling
const safeLocalStorage = {
  get: <T,>(key: string): T | null => {
    if (typeof window === 'undefined') return null;
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (e) {
      console.error('Error reading from localStorage:', e);
      return null;
    }
  },
  set: (key: string, value: unknown): boolean => {
    if (typeof window === 'undefined') return false;
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (e) {
      console.error('Error writing to localStorage:', e);
      return false;
    }
  },
  remove: (key: string): void => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.error('Error removing from localStorage:', e);
    }
  },
};


/**
 * Custom hook for auto-saving assessment progress
 */
export function useAutoSave<T>(
  data: T,
  options: AutoSaveOptions
): {
  saveState: SaveState;
  forceSave: () => Promise<void>;
  clearSaved: () => void;
  loadSaved: () => T | null;
} {
  const { debounceMs = 2000, storageKey, onSave } = options;
  
  const [saveState, setSaveState] = useState<SaveState>({
    status: 'idle',
    lastSaved: null,
    error: null,
  });
  
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const dataRef = useRef(data);
  
  useEffect(() => {
    dataRef.current = data;
  }, [data]);
  
  const saveData = useCallback(async () => {
    setSaveState((prev) => ({ ...prev, status: 'saving', error: null }));
    
    try {
      const saved = safeLocalStorage.set(storageKey, dataRef.current);
      
      if (!saved) {
        throw new Error('Failed to save to local storage');
      }
      
      if (onSave) {
        await onSave(dataRef.current);
      }
      
      setSaveState({
        status: 'saved',
        lastSaved: new Date(),
        error: null,
      });
      
      setTimeout(() => {
        setSaveState((prev) => 
          prev.status === 'saved' ? { ...prev, status: 'idle' } : prev
        );
      }, 3000);
      
    } catch (error) {
      setSaveState({
        status: 'error',
        lastSaved: null,
        error: error instanceof Error ? error.message : 'Save failed',
      });
    }
  }, [storageKey, onSave]);
  
  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      saveData();
    }, debounceMs);
    
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [data, debounceMs, saveData]);
  
  const forceSave = useCallback(async () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    await saveData();
  }, [saveData]);
  
  const clearSaved = useCallback(() => {
    safeLocalStorage.remove(storageKey);
    setSaveState({ status: 'idle', lastSaved: null, error: null });
  }, [storageKey]);
  
  const loadSaved = useCallback((): T | null => {
    return safeLocalStorage.get<T>(storageKey);
  }, [storageKey]);
  
  return { saveState, forceSave, clearSaved, loadSaved };
}


/**
 * Visual save status indicator component
 */
export function SaveStatusIndicator({ state }: { state: SaveState }) {
  const getIcon = () => {
    switch (state.status) {
      case 'saving':
        return (
          <svg className="animate-spin h-4 w-4 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        );
      case 'saved':
        return (
          <svg className="h-4 w-4 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        );
      case 'error':
        return (
          <svg className="h-4 w-4 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        );
      default:
        return (
          <svg className="h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
            <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
          </svg>
        );
    }
  };
  
  const getMessage = () => {
    switch (state.status) {
      case 'saving': return 'Saving...';
      case 'saved': return state.lastSaved 
        ? `Saved at ${state.lastSaved.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`
        : 'Saved';
      case 'error': return state.error || 'Save failed';
      default: return 'Auto-save enabled';
    }
  };
  
  const getColourClass = () => {
    switch (state.status) {
      case 'saving': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'saved': return 'text-green-600 bg-green-50 border-green-200';
      case 'error': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-500 bg-gray-50 border-gray-200';
    }
  };
  
  return (
    <div 
      className={`inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-full border transition-all duration-300 ease-in-out ${getColourClass()}`}
      role="status"
      aria-live="polite"
    >
      {getIcon()}
      <span>{getMessage()}</span>
    </div>
  );
}


/**
 * Resume prompt component - shown when saved progress exists
 */
export function ResumeBanner({
  savedAt,
  onResume,
  onStartFresh,
}: {
  savedAt: Date;
  onResume: () => void;
  onStartFresh: () => void;
}) {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-blue-900">
            Resume your assessment?
          </h3>
          <p className="mt-1 text-sm text-blue-700">
            You have saved progress from{' '}
            {savedAt.toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
          <div className="mt-3 flex gap-3">
            <button
              onClick={onResume}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            >
              Resume
            </button>
            <button
              onClick={onStartFresh}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-blue-700 bg-white border border-blue-300 rounded-md hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            >
              Start Fresh
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
