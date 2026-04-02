/**
 * useFollowUps(estimateId) — manage follow-up emails for a sent quote
 *
 * Provides:
 *   followUps        — list of sent follow-ups for this estimate
 *   nextFollowUp     — next scheduled send (day 3, 7, or 10) + date
 *   isLoading
 *   triggerNow()     — manually fire the Edge Function for this estimate
 *   cancelAll()      — delete all pending follow-ups (sets a flag in estimates)
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../integrations/supabase/client';

export interface FollowUp {
  id: string;
  estimate_id: string;
  day_number: 3 | 7 | 10;
  template_key: string;
  sent_at: string;
  resend_email_id: string | null;
  recipient_email: string;
  opened_at: string | null;
  clicked_at: string | null;
}

export interface NextFollowUp {
  dayNumber: 3 | 7 | 10;
  scheduledDate: Date;
  label: string;       // e.g. "Day 3 — Tomorrow"
  isSoon: boolean;     // within 24 hours
}

export interface UseFollowUpsReturn {
  followUps: FollowUp[];
  nextFollowUp: NextFollowUp | null;
  isLoading: boolean;
  isTriggeringNow: boolean;
  error: string | null;
  triggerNow: () => Promise<void>;
  cancelAll: () => Promise<void>;
  refresh: () => Promise<void>;
}

const DAY_TIERS: Array<3 | 7 | 10> = [3, 7, 10];

export function useFollowUps(estimateId: string | null): UseFollowUpsReturn {
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isTriggeringNow, setIsTriggeringNow] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sentAt, setSentAt] = useState<Date | null>(null);

  const fetchFollowUps = useCallback(async () => {
    if (!estimateId) return;
    setIsLoading(true);
    setError(null);

    try {
      // Get estimate sent_at
      const { data: estimate } = await supabase
        .from('estimates')
        .select('sent_at, updated_at, status')
        .eq('id', estimateId)
        .single();

      if (estimate?.sent_at) {
        setSentAt(new Date(estimate.sent_at));
      } else if (estimate?.status === 'sent') {
        setSentAt(new Date(estimate.updated_at));
      }

      // Get follow-ups
      const { data, error: fetchErr } = await supabase
        .from('follow_ups')
        .select('*')
        .eq('estimate_id', estimateId)
        .order('day_number', { ascending: true });

      if (fetchErr) throw fetchErr;
      setFollowUps((data as FollowUp[]) ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load follow-ups');
    } finally {
      setIsLoading(false);
    }
  }, [estimateId]);

  useEffect(() => {
    fetchFollowUps();
  }, [fetchFollowUps]);

  // Compute next follow-up
  const nextFollowUp: NextFollowUp | null = (() => {
    if (!sentAt) return null;
    const sentDays = new Set(followUps.map((f) => f.day_number));
    const now = new Date();

    for (const day of DAY_TIERS) {
      if (sentDays.has(day)) continue;
      const scheduledDate = new Date(sentAt.getTime() + day * 24 * 60 * 60 * 1000);
      const hoursUntil = (scheduledDate.getTime() - now.getTime()) / (1000 * 60 * 60);

      let label: string;
      if (hoursUntil < 0) {
        label = `Day ${day} — Sending soon`;
      } else if (hoursUntil < 24) {
        label = `Day ${day} — Today`;
      } else if (hoursUntil < 48) {
        label = `Day ${day} — Tomorrow`;
      } else {
        label = `Day ${day} — ${scheduledDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
      }

      return {
        dayNumber: day,
        scheduledDate,
        label,
        isSoon: hoursUntil < 24,
      };
    }
    return null; // All 3 follow-ups sent
  })();

  const triggerNow = useCallback(async () => {
    if (!estimateId) return;
    setIsTriggeringNow(true);
    setError(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/scheduled-followups`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${session?.access_token ?? ''}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ estimateId }),
        }
      );
      if (!res.ok) throw new Error(`Trigger failed: ${res.status}`);
      await fetchFollowUps();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to trigger follow-up');
    } finally {
      setIsTriggeringNow(false);
    }
  }, [estimateId, fetchFollowUps]);

  const cancelAll = useCallback(async () => {
    if (!estimateId) return;
    setError(null);
    try {
      // Mark estimate as opted-out of auto follow-ups
      await supabase
        .from('estimates')
        .update({ follow_up_count: -1 })
        .eq('id', estimateId);
      // Note: already-sent follow-ups remain for audit trail
      setFollowUps([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to cancel follow-ups');
    }
  }, [estimateId]);

  return {
    followUps,
    nextFollowUp,
    isLoading,
    isTriggeringNow,
    error,
    triggerNow,
    cancelAll,
    refresh: fetchFollowUps,
  };
}
