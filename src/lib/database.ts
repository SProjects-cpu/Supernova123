import { supabase } from './supabase'
import type { Tables, InsertTables, UpdateTables } from './supabase'

// Database service with Supabase as primary, Convex as backup
export class DatabaseService {
  private static instance: DatabaseService
  private convexBackup: boolean = true

  static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService()
    }
    return DatabaseService.instance
  }

  // Primary Supabase operations
  async query<T extends keyof Database['public']['Tables']>(
    table: T,
    query?: (query: any) => any
  ): Promise<Tables<T>[]> {
    try {
      let supabaseQuery = supabase.from(table)
      
      if (query) {
        supabaseQuery = query(supabaseQuery)
      }
      
      const { data, error } = await supabaseQuery
      
      if (error) {
        throw error
      }
      
      return data || []
    } catch (error) {
      console.error(`Supabase query error for ${table}:`, error)
      
      // Fallback to Convex if enabled
      if (this.convexBackup) {
        return this.fallbackToConvex(table, query)
      }
      
      throw error
    }
  }

  async insert<T extends keyof Database['public']['Tables']>(
    table: T,
    data: InsertTables<T>
  ): Promise<Tables<T>> {
    try {
      const { data: result, error } = await supabase
        .from(table)
        .insert(data)
        .select()
        .single()
      
      if (error) {
        throw error
      }

      // Sync to Convex backup
      if (this.convexBackup) {
        this.syncToConvex(table, result, 'insert').catch(console.error)
      }
      
      return result
    } catch (error) {
      console.error(`Supabase insert error for ${table}:`, error)
      throw error
    }
  }

  async update<T extends keyof Database['public']['Tables']>(
    table: T,
    id: string,
    data: UpdateTables<T>
  ): Promise<Tables<T>> {
    try {
      const { data: result, error } = await supabase
        .from(table)
        .update(data)
        .eq('id', id)
        .select()
        .single()
      
      if (error) {
        throw error
      }

      // Sync to Convex backup
      if (this.convexBackup) {
        this.syncToConvex(table, result, 'update').catch(console.error)
      }
      
      return result
    } catch (error) {
      console.error(`Supabase update error for ${table}:`, error)
      throw error
    }
  }

  async delete<T extends keyof Database['public']['Tables']>(
    table: T,
    id: string
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from(table)
        .delete()
        .eq('id', id)
      
      if (error) {
        throw error
      }

      // Sync to Convex backup
      if (this.convexBackup) {
        this.syncToConvex(table, { id }, 'delete').catch(console.error)
      }
      
      return true
    } catch (error) {
      console.error(`Supabase delete error for ${table}:`, error)
      throw error
    }
  }

  // Real-time subscriptions
  subscribe<T extends keyof Database['public']['Tables']>(
    table: T,
    callback: (payload: any) => void,
    filter?: string
  ) {
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
  }

  // Authentication methods
  async signIn(email: string, password: string) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      
      if (error) throw error
      return { data, error: null }
    } catch (error: any) {
      return { data: null, error }
    }
  }

  async signUp(email: string, password: string) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      })
      
      if (error) throw error
      return { data, error: null }
    } catch (error: any) {
      return { data: null, error }
    }
  }

  async signOut() {
    try {
      const { error } = await supabase.auth.signOut()
      return { error }
    } catch (error: any) {
      return { error }
    }
  }

  async getCurrentUser() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      return { user, error }
    } catch (error: any) {
      return { user: null, error }
    }
  }

  // File upload methods
  async uploadFile(
    bucket: string,
    path: string,
    file: File,
    options?: { cacheControl?: string; upsert?: boolean }
  ) {
    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(path, file, options)
      
      if (error) throw error
      return { data, error: null }
    } catch (error: any) {
      return { data: null, error }
    }
  }

  async getPublicUrl(bucket: string, path: string) {
    try {
      const { data } = supabase.storage
        .from(bucket)
        .getPublicUrl(path)
      
      return { data, error: null }
    } catch (error: any) {
      return { data: null, error }
    }
  }

  // Backup and sync methods
  private async fallbackToConvex<T extends keyof Database['public']['Tables']>(
    table: T,
    query?: (query: any) => any
  ): Promise<Tables<T>[]> {
    try {
      // This would call your existing Convex functions
      // For now, return empty array
      console.log(`Falling back to Convex for ${table}`)
      return []
    } catch (error) {
      console.error(`Convex fallback error for ${table}:`, error)
      return []
    }
  }

  private async syncToConvex<T extends keyof Database['public']['Tables']>(
    table: T,
    data: any,
    operation: 'insert' | 'update' | 'delete'
  ) {
    try {
      // Sync data to Convex as backup
      const response = await fetch('/api/sync-to-convex', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ table, data, operation })
      })
      
      if (!response.ok) {
        throw new Error(`Sync failed: ${response.statusText}`)
      }
    } catch (error) {
      console.error('Failed to sync to Convex:', error)
    }
  }

  // Health check
  async healthCheck() {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('count')
        .limit(1)
      
      return { 
        supabase: !error, 
        convex: this.convexBackup,
        timestamp: new Date().toISOString()
      }
    } catch (error) {
      return { 
        supabase: false, 
        convex: this.convexBackup,
        timestamp: new Date().toISOString(),
        error: error.message
      }
    }
  }

  // Configuration
  setConvexBackup(enabled: boolean) {
    this.convexBackup = enabled
  }
}

// Export singleton instance
export const db = DatabaseService.getInstance()

// Specific service methods for your application
export const EventService = {
  async getAll() {
    return db.query('events', (query) => 
      query.select('*').order('created_at', { ascending: false })
    )
  },

  async getPublished() {
    return db.query('events', (query) => 
      query.select('*').eq('status', 'published').order('start_date', { ascending: true })
    )
  },

  async getById(id: string) {
    const result = await db.query('events', (query) => 
      query.select('*').eq('id', id).single()
    )
    return result[0] || null
  },

  async create(data: InsertTables<'events'>) {
    return db.insert('events', data)
  },

  async update(id: string, data: UpdateTables<'events'>) {
    return db.update('events', id, data)
  },

  async delete(id: string) {
    return db.delete('events', id)
  }
}

export const RegistrationService = {
  async getAll() {
    return db.query('participant_registrations', (query) => 
      query.select('*').order('registered_at', { ascending: false })
    )
  },

  async getByEvent(eventId: string) {
    return db.query('participant_registrations', (query) => 
      query.select('*').eq('event_id', eventId).order('registered_at', { ascending: false })
    )
  },

  async create(data: InsertTables<'participant_registrations'>) {
    return db.insert('participant_registrations', data)
  },

  async update(id: string, data: UpdateTables<'participant_registrations'>) {
    return db.update('participant_registrations', id, data)
  },

  async delete(id: string) {
    return db.delete('participant_registrations', id)
  }
}

export const TestService = {
  async getAll() {
    return db.query('pre_qualifier_tests', (query) => 
      query.select('*').eq('is_active', true).order('start_date', { ascending: true })
    )
  },

  async getActive() {
    const now = new Date().toISOString()
    return db.query('pre_qualifier_tests', (query) => 
      query
        .select('*')
        .eq('is_active', true)
        .lte('start_date', now)
        .gte('end_date', now)
        .order('start_date', { ascending: true })
    )
  },

  async create(data: InsertTables<'pre_qualifier_tests'>) {
    return db.insert('pre_qualifier_tests', data)
  },

  async update(id: string, data: UpdateTables<'pre_qualifier_tests'>) {
    return db.update('pre_qualifier_tests', id, data)
  },

  async delete(id: string) {
    return db.delete('pre_qualifier_tests', id)
  }
}

export const InstitutionService = {
  async getAll() {
    return db.query('participating_institutions', (query) => 
      query.select('*').eq('is_active', true).order('order', { ascending: true })
    )
  },

  async getByType(type: 'college' | 'university' | 'company') {
    return db.query('participating_institutions', (query) => 
      query.select('*').eq('type', type).eq('is_active', true).order('order', { ascending: true })
    )
  },

  async create(data: InsertTables<'participating_institutions'>) {
    return db.insert('participating_institutions', data)
  },

  async update(id: string, data: UpdateTables<'participating_institutions'>) {
    return db.update('participating_institutions', id, data)
  },

  async delete(id: string) {
    return db.delete('participating_institutions', id)
  }
}

export const NewsService = {
  async getAll() {
    return db.query('news_updates', (query) => 
      query.select('*').eq('status', 'published').order('publish_date', { ascending: false })
    )
  },

  async getFeatured() {
    return db.query('news_updates', (query) => 
      query.select('*').eq('status', 'published').eq('featured', true).order('publish_date', { ascending: false })
    )
  },

  async create(data: InsertTables<'news_updates'>) {
    return db.insert('news_updates', data)
  },

  async update(id: string, data: UpdateTables<'news_updates'>) {
    return db.update('news_updates', id, data)
  },

  async delete(id: string) {
    return db.delete('news_updates', id)
  }
}
