import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Check your .env file.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Auth helper functions
export const auth = {
  // Sign up with email and password
  signUp: async (email: string, password: string, name: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name, role: 'user' }
      }
    })
    return { data, error }
  },

  // Sign in with email and password
  signIn: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    return { data, error }
  },

  // Sign in with Google
  signInWithGoogle: async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin
      }
    })
    return { data, error }
  },

  // Sign out
  signOut: async () => {
    const { error } = await supabase.auth.signOut()
    return { error }
  },

  // Get current user
  getUser: async () => {
    const { data: { user }, error } = await supabase.auth.getUser()
    return { user, error }
  },

  // Get current session
  getSession: async () => {
    const { data: { session }, error } = await supabase.auth.getSession()
    return { session, error }
  },

  // Listen to auth state changes
  onAuthStateChange: (callback: (event: string, session: any) => void) => {
    return supabase.auth.onAuthStateChange(callback)
  }
}

// Database helper functions
export const db = {
  // Cases
  cases: {
    getAll: async () => {
      const { data, error } = await supabase
        .from('cases')
        .select('*')
        .order('created_at', { ascending: false })
      return { data, error }
    },
    getById: async (id: string) => {
      const { data, error } = await supabase
        .from('cases')
        .select('*')
        .eq('id', id)
        .single()
      return { data, error }
    },
    create: async (caseData: any) => {
      const { data, error } = await supabase
        .from('cases')
        .insert([caseData])
        .select()
        .single()
      return { data, error }
    },
    update: async (id: string, caseData: any) => {
      const { data, error } = await supabase
        .from('cases')
        .update(caseData)
        .eq('id', id)
        .select()
        .single()
      return { data, error }
    },
    delete: async (id: string) => {
      const { error } = await supabase
        .from('cases')
        .delete()
        .eq('id', id)
      return { error }
    },
    search: async (searchTerm: string) => {
      const { data, error } = await supabase
        .from('cases')
        .select('*')
        .or(`client_name.ilike.%${searchTerm}%,file_no.ilike.%${searchTerm}%,parties_name.ilike.%${searchTerm}%`)
      return { data, error }
    },
    getByStatus: async (status: string) => {
      const { data, error } = await supabase
        .from('cases')
        .select('*')
        .eq('status', status)
        .order('created_at', { ascending: false })
      return { data, error }
    },
    getByDate: async (date: string) => {
      const { data, error } = await supabase
        .from('cases')
        .select('*')
        .eq('next_date', date)
      return { data, error }
    }
  },

  // Counsel
  counsel: {
    getAll: async () => {
      const { data, error } = await supabase
        .from('counsel')
        .select('*')
        .order('name', { ascending: true })
      return { data, error }
    },
    getById: async (id: string) => {
      const { data, error } = await supabase
        .from('counsel')
        .select('*')
        .eq('id', id)
        .single()
      return { data, error }
    },
    create: async (counselData: any) => {
      const { data, error } = await supabase
        .from('counsel')
        .insert([counselData])
        .select()
        .single()
      return { data, error }
    },
    update: async (id: string, counselData: any) => {
      const { data, error } = await supabase
        .from('counsel')
        .update(counselData)
        .eq('id', id)
        .select()
        .single()
      return { data, error }
    },
    delete: async (id: string) => {
      const { error } = await supabase
        .from('counsel')
        .delete()
        .eq('id', id)
      return { error }
    }
  },

  // Appointments
  appointments: {
    getAll: async () => {
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .order('date', { ascending: true })
      return { data, error }
    },
    getByDate: async (date: string) => {
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('date', date)
        .order('time', { ascending: true })
      return { data, error }
    },
    create: async (appointmentData: any) => {
      const { data, error } = await supabase
        .from('appointments')
        .insert([appointmentData])
        .select()
        .single()
      return { data, error }
    },
    update: async (id: string, appointmentData: any) => {
      const { data, error } = await supabase
        .from('appointments')
        .update(appointmentData)
        .eq('id', id)
        .select()
        .single()
      return { data, error }
    },
    delete: async (id: string) => {
      const { error } = await supabase
        .from('appointments')
        .delete()
        .eq('id', id)
      return { error }
    }
  },

  // Transactions
  transactions: {
    getAll: async () => {
      const { data, error } = await supabase
        .from('transactions')
        .select('*, cases(client_name, file_no)')
        .order('created_at', { ascending: false })
      return { data, error }
    },
    getByCaseId: async (caseId: string) => {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('case_id', caseId)
      return { data, error }
    },
    create: async (transactionData: any) => {
      const { data, error } = await supabase
        .from('transactions')
        .insert([transactionData])
        .select()
        .single()
      return { data, error }
    },
    update: async (id: string, transactionData: any) => {
      const { data, error } = await supabase
        .from('transactions')
        .update(transactionData)
        .eq('id', id)
        .select()
        .single()
      return { data, error }
    }
  },

  // Courts
  courts: {
    getAll: async () => {
      const { data, error } = await supabase
        .from('courts')
        .select('*')
        .order('name', { ascending: true })
      return { data, error }
    },
    create: async (name: string) => {
      const { data, error } = await supabase
        .from('courts')
        .insert([{ name }])
        .select()
        .single()
      return { data, error }
    },
    delete: async (id: string) => {
      const { error } = await supabase
        .from('courts')
        .delete()
        .eq('id', id)
      return { error }
    }
  },

  // Case Types
  caseTypes: {
    getAll: async () => {
      const { data, error } = await supabase
        .from('case_types')
        .select('*')
        .order('name', { ascending: true })
      return { data, error }
    },
    create: async (name: string) => {
      const { data, error } = await supabase
        .from('case_types')
        .insert([{ name }])
        .select()
        .single()
      return { data, error }
    },
    delete: async (id: string) => {
      const { error } = await supabase
        .from('case_types')
        .delete()
        .eq('id', id)
      return { error }
    }
  },

  // Books (Library)
  books: {
    getAll: async () => {
      const { data, error } = await supabase
        .from('books')
        .select('*')
        .order('added_at', { ascending: false })
      return { data, error }
    },
    create: async (name: string, addedBy: string) => {
      const { data, error } = await supabase
        .from('books')
        .insert([{ name, added_by: addedBy }])
        .select()
        .single()
      return { data, error }
    },
    delete: async (id: string) => {
      const { error } = await supabase
        .from('books')
        .delete()
        .eq('id', id)
      return { error }
    }
  },

  // Sofa Items
  sofaItems: {
    getAll: async () => {
      const { data, error } = await supabase
        .from('sofa_items')
        .select('*, cases(client_name, file_no, parties_name)')
        .order('added_at', { ascending: false })
      return { data, error }
    },
    getByCompartment: async (compartment: 'C1' | 'C2') => {
      const { data, error } = await supabase
        .from('sofa_items')
        .select('*, cases(client_name, file_no, parties_name)')
        .eq('compartment', compartment)
      return { data, error }
    },
    create: async (caseId: string, compartment: 'C1' | 'C2', addedBy: string) => {
      const { data, error } = await supabase
        .from('sofa_items')
        .insert([{ case_id: caseId, compartment, added_by: addedBy }])
        .select()
        .single()
      return { data, error }
    },
    delete: async (id: string) => {
      const { error } = await supabase
        .from('sofa_items')
        .delete()
        .eq('id', id)
      return { error }
    }
  },

  // Profiles
  profiles: {
    getAll: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })
      return { data, error }
    },
    getById: async (id: string) => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single()
      return { data, error }
    },
    update: async (id: string, profileData: any) => {
      const { data, error } = await supabase
        .from('profiles')
        .update(profileData)
        .eq('id', id)
        .select()
        .single()
      return { data, error }
    }
  },

  // Dashboard Stats
  getDashboardStats: async () => {
    const { data, error } = await supabase.rpc('get_dashboard_stats')
    return { data, error }
  }
}

// Realtime subscriptions
export const realtime = {
  subscribeToCases: (callback: (payload: any) => void) => {
    return supabase
      .channel('cases-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'cases' },
        callback
      )
      .subscribe()
  },
  
  subscribeToAppointments: (callback: (payload: any) => void) => {
    return supabase
      .channel('appointments-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'appointments' },
        callback
      )
      .subscribe()
  },

  unsubscribe: (channel: any) => {
    supabase.removeChannel(channel)
  }
}
