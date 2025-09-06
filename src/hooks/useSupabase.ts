import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import type { Tables, InsertTables, UpdateTables } from '../lib/supabase'

// Generic hook for Supabase queries
export function useSupabaseQuery<T>(
  table: string,
  query?: (query: any) => any,
  dependencies: any[] = []
) {
  const [data, setData] = useState<T[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        setError(null)
        
        let supabaseQuery = supabase.from(table)
        
        if (query) {
          supabaseQuery = query(supabaseQuery)
        }
        
        const { data: result, error: queryError } = await supabaseQuery
        
        if (queryError) {
          throw queryError
        }
        
        setData(result)
      } catch (err: any) {
        setError(err.message)
        console.error(`Error fetching ${table}:`, err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, dependencies)

  return { data, loading, error }
}

// Hook for single item queries
export function useSupabaseSingle<T>(
  table: string,
  id: string | null,
  dependencies: any[] = []
) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      if (!id) {
        setData(null)
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)
        
        const { data: result, error: queryError } = await supabase
          .from(table)
          .select('*')
          .eq('id', id)
          .single()
        
        if (queryError) {
          throw queryError
        }
        
        setData(result)
      } catch (err: any) {
        setError(err.message)
        console.error(`Error fetching ${table} with id ${id}:`, err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [id, ...dependencies])

  return { data, loading, error }
}

// Hook for mutations
export function useSupabaseMutation<T extends keyof Database['public']['Tables']>(
  table: T
) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const insert = async (data: InsertTables<T>) => {
    try {
      setLoading(true)
      setError(null)
      
      const { data: result, error: insertError } = await supabase
        .from(table)
        .insert(data)
        .select()
        .single()
      
      if (insertError) {
        throw insertError
      }
      
      return result
    } catch (err: any) {
      setError(err.message)
      console.error(`Error inserting into ${table}:`, err)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const update = async (id: string, data: UpdateTables<T>) => {
    try {
      setLoading(true)
      setError(null)
      
      const { data: result, error: updateError } = await supabase
        .from(table)
        .update(data)
        .eq('id', id)
        .select()
        .single()
      
      if (updateError) {
        throw updateError
      }
      
      return result
    } catch (err: any) {
      setError(err.message)
      console.error(`Error updating ${table}:`, err)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const remove = async (id: string) => {
    try {
      setLoading(true)
      setError(null)
      
      const { error: deleteError } = await supabase
        .from(table)
        .delete()
        .eq('id', id)
      
      if (deleteError) {
        throw deleteError
      }
      
      return true
    } catch (err: any) {
      setError(err.message)
      console.error(`Error deleting from ${table}:`, err)
      throw err
    } finally {
      setLoading(false)
    }
  }

  return { insert, update, remove, loading, error }
}

// Specific hooks for your application
export function useEvents() {
  return useSupabaseQuery<Tables<'events'>>('events', (query) => 
    query.select('*').order('created_at', { ascending: false })
  )
}

export function usePublishedEvents() {
  return useSupabaseQuery<Tables<'events'>>('events', (query) => 
    query.select('*').eq('status', 'published').order('start_date', { ascending: true })
  )
}

export function useEvent(id: string | null) {
  return useSupabaseSingle<Tables<'events'>>('events', id)
}

export function useParticipantRegistrations() {
  return useSupabaseQuery<Tables<'participant_registrations'>>('participant_registrations', (query) => 
    query.select('*').order('registered_at', { ascending: false })
  )
}

export function useRegistrationsByEvent(eventId: string | null) {
  return useSupabaseQuery<Tables<'participant_registrations'>>(
    'participant_registrations', 
    (query) => query.select('*').eq('event_id', eventId).order('registered_at', { ascending: false }),
    [eventId]
  )
}

export function usePreQualifierTests() {
  return useSupabaseQuery<Tables<'pre_qualifier_tests'>>('pre_qualifier_tests', (query) => 
    query.select('*').eq('is_active', true).order('start_date', { ascending: true })
  )
}

export function useActiveTests() {
  const now = new Date().toISOString()
  return useSupabaseQuery<Tables<'pre_qualifier_tests'>>('pre_qualifier_tests', (query) => 
    query
      .select('*')
      .eq('is_active', true)
      .lte('start_date', now)
      .gte('end_date', now)
      .order('start_date', { ascending: true })
  )
}

export function useParticipatingInstitutions() {
  return useSupabaseQuery<Tables<'participating_institutions'>>('participating_institutions', (query) => 
    query.select('*').eq('is_active', true).order('order', { ascending: true })
  )
}

export function useNewsUpdates() {
  return useSupabaseQuery<Tables<'news_updates'>>('news_updates', (query) => 
    query.select('*').eq('status', 'published').order('publish_date', { ascending: false })
  )
}

export function useOrganizerCredentials() {
  return useSupabaseQuery<Tables<'organizer_credentials'>>('organizer_credentials', (query) => 
    query.select('*').order('created_at', { ascending: false })
  )
}

// Authentication hooks
export function useAuth() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { data, error }
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    return { error }
  }

  const signUp = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })
    return { data, error }
  }

  return {
    user,
    loading,
    signIn,
    signOut,
    signUp,
  }
}

// Real-time subscriptions
export function useRealtimeSubscription<T>(
  table: string,
  callback: (payload: any) => void,
  filter?: string
) {
  useEffect(() => {
    let subscription: any

    if (filter) {
      subscription = supabase
        .channel(`${table}_changes`)
        .on('postgres_changes', 
          { event: '*', schema: 'public', table, filter },
          callback
        )
        .subscribe()
    } else {
      subscription = supabase
        .channel(`${table}_changes`)
        .on('postgres_changes', 
          { event: '*', schema: 'public', table },
          callback
        )
        .subscribe()
    }

    return () => {
      if (subscription) {
        supabase.removeChannel(subscription)
      }
    }
  }, [table, callback, filter])
}
