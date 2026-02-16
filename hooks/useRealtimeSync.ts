import { useEffect, useState, useRef } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase';
import type { BrandInstructions } from '../types';

export interface UseRealtimeSyncOptions {
  brandId: string;
  enabled: boolean;
  localVersion: number;
  onRemoteUpdate: (remoteData: BrandInstructions, remoteVersion: number) => void;
  onConflict?: (localVersion: number, remoteVersion: number) => void;
}

export interface UseRealtimeSyncReturn {
  isListening: boolean;
  remoteVersion: number | null;
}

/**
 * Hook for real-time synchronization of brand instructions
 *
 * Listens to Firestore changes and notifies when remote updates occur.
 * Detects conflicts when local changes exist.
 *
 * @example
 * const { isListening } = useRealtimeSync({
 *   brandId: 'cga',
 *   enabled: true,
 *   localVersion: 5,
 *   onRemoteUpdate: (remoteData, remoteVersion) => {
 *     if (hasUnsavedChanges) {
 *       // Show conflict modal
 *     } else {
 *       // Auto-update to latest
 *       setInstructions(remoteData);
 *     }
 *   }
 * });
 */
export function useRealtimeSync({
  brandId,
  enabled,
  localVersion,
  onRemoteUpdate,
  onConflict
}: UseRealtimeSyncOptions): UseRealtimeSyncReturn {
  const [isListening, setIsListening] = useState(false);
  const [remoteVersion, setRemoteVersion] = useState<number | null>(null);
  const isInitialLoad = useRef(true);

  useEffect(() => {
    if (!enabled || !brandId) {
      setIsListening(false);
      return;
    }

    console.log(`🔄 Starting real-time sync for brand: ${brandId}`);
    const docRef = doc(db, 'brandInstructions', brandId);

    const unsubscribe = onSnapshot(
      docRef,
      (snapshot) => {
        // Ignore local writes (only react to remote changes)
        if (snapshot.metadata.hasPendingWrites) {
          console.log('⏭️ Ignoring local write');
          return;
        }

        if (snapshot.exists()) {
          const remoteData = snapshot.data() as BrandInstructions;
          const remoteVer = remoteData.version || 1;

          setRemoteVersion(remoteVer);

          // Skip initial load (don't trigger update on mount)
          if (isInitialLoad.current) {
            console.log(`📡 Real-time sync active (current version: v${remoteVer})`);
            isInitialLoad.current = false;
            setIsListening(true);
            return;
          }

          // Remote update detected
          if (remoteVer > localVersion) {
            console.log(`🔔 Remote update: v${localVersion} → v${remoteVer}`);
            onRemoteUpdate(remoteData, remoteVer);
          } else if (remoteVer < localVersion) {
            // This shouldn't happen (local ahead of remote)
            console.warn(`⚠️ Local version ahead: local v${localVersion}, remote v${remoteVer}`);
            if (onConflict) {
              onConflict(localVersion, remoteVer);
            }
          }
        } else {
          console.log('📄 Document does not exist yet');
        }

        setIsListening(true);
      },
      (error) => {
        console.error('❌ Real-time sync error:', error);
        setIsListening(false);
      }
    );

    return () => {
      console.log(`🔌 Stopping real-time sync for brand: ${brandId}`);
      unsubscribe();
      setIsListening(false);
      isInitialLoad.current = true;
    };
  }, [brandId, enabled, localVersion]); // Removed onRemoteUpdate, onConflict to prevent infinite loop

  return {
    isListening,
    remoteVersion
  };
}
