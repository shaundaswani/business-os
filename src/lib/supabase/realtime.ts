'use client'

import { useEffect, useRef } from 'react'
import { RealtimeChannel } from '@supabase/supabase-js'
import { createClient } from './client'

type ChannelEvent = 'INSERT' | 'UPDATE' | 'DELETE' | '*'

interface UseRealtimeChannelOptions<T> {
  table: string
  schema?: string
  event?: ChannelEvent
  filter?: string
  onData: (payload: { new: T; old: T; eventType: string }) => void
}

/**
 * Subscribes to a Supabase Realtime channel and cleans up on unmount.
 * All Realtime subscriptions in the app must use this hook.
 */
export function useRealtimeChannel<T = Record<string, unknown>>({
  table,
  schema = 'public',
  event = '*',
  filter,
  onData,
}: UseRealtimeChannelOptions<T>) {
  const channelRef = useRef<RealtimeChannel | null>(null)
  const onDataRef = useRef(onData)
  onDataRef.current = onData

  useEffect(() => {
    const supabase = createClient()
    const channelName = `${schema}:${table}:${event}:${filter ?? 'all'}`

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes' as Parameters<RealtimeChannel['on']>[0],
        {
          event,
          schema,
          table,
          ...(filter ? { filter } : {}),
        },
        (payload: { new: T; old: T; eventType: string }) => {
          onDataRef.current(payload)
        },
      )
      .subscribe()

    channelRef.current = channel

    return () => {
      supabase.removeChannel(channel)
    }
  }, [table, schema, event, filter])
}
