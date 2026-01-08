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

  // Districts
  districts: {
    getAll: async () => {
      const { data, error } = await supabase
        .from('districts')
        .select('*')
        .order('name', { ascending: true })
      return { data, error }
    },
    create: async (name: string) => {
      const { data, error } = await supabase
        .from('districts')
        .insert([{ name }])
        .select()
        .single()
      return { data, error }
    },
    delete: async (id: string) => {
      const { error } = await supabase
        .from('districts')
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
    create: async (name: string, addedBy: string, number?: string, location?: string) => {
      const { data, error } = await supabase
        .from('books')
        .insert([{ name, added_by: addedBy, number: number || '', location: location || '' }])
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

  // Library Locations
  libraryLocations: {
    getAll: async () => {
      const { data, error } = await supabase
        .from('library_locations')
        .select('*')
        .order('name', { ascending: true })
      return { data, error }
    },
    create: async (name: string, createdBy: string) => {
      const { data, error } = await supabase
        .from('library_locations')
        .insert([{ name, created_by: createdBy }])
        .select()
        .single()
      return { data, error }
    },
    delete: async (id: string) => {
      const { error } = await supabase
        .from('library_locations')
        .delete()
        .eq('id', id)
      return { error }
    }
  },

  // Storage Locations
  storageLocations: {
    getAll: async () => {
      const { data, error } = await supabase
        .from('storage_locations')
        .select('*')
        .order('name', { ascending: true })
      return { data, error }
    },
    create: async (name: string, createdBy: string) => {
      const { data, error } = await supabase
        .from('storage_locations')
        .insert([{ name, created_by: createdBy }])
        .select()
        .single()
      return { data, error }
    },
    delete: async (id: string) => {
      const { error } = await supabase
        .from('storage_locations')
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

  // Tasks
  tasks: {
    getAll: async () => {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false })
      return { data, error }
    },
    getByUser: async (userId: string) => {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('assigned_to', userId)
        .order('deadline', { ascending: true })
      return { data, error }
    },
    getPending: async () => {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('status', 'pending')
        .order('deadline', { ascending: true })
      return { data, error }
    },
    create: async (taskData: any) => {
      const { data, error } = await supabase
        .from('tasks')
        .insert([taskData])
        .select()
        .single()
      return { data, error }
    },
    update: async (id: string, taskData: any) => {
      const { data, error } = await supabase
        .from('tasks')
        .update(taskData)
        .eq('id', id)
        .select()
        .single()
      return { data, error }
    },
    delete: async (id: string) => {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id)
      return { error }
    },
    complete: async (id: string) => {
      const { data, error } = await supabase
        .from('tasks')
        .update({ status: 'completed', completed_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()
      return { data, error }
    }
  },

  // Attendance
  attendance: {
    getAll: async () => {
      const { data, error } = await supabase
        .from('attendance')
        .select('*')
        .order('date', { ascending: false })
      return { data, error }
    },
    getByUser: async (userId: string) => {
      const { data, error } = await supabase
        .from('attendance')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false })
      return { data, error }
    },
    getByDate: async (date: string) => {
      const { data, error } = await supabase
        .from('attendance')
        .select('*')
        .eq('date', date)
      return { data, error }
    },
    create: async (attendanceData: any) => {
      const { data, error } = await supabase
        .from('attendance')
        .insert([attendanceData])
        .select()
        .single()
      return { data, error }
    },
    update: async (id: string, attendanceData: any) => {
      const { data, error } = await supabase
        .from('attendance')
        .update(attendanceData)
        .eq('id', id)
        .select()
        .single()
      return { data, error }
    },
    upsert: async (attendanceData: any) => {
      const { data, error } = await supabase
        .from('attendance')
        .upsert([attendanceData], { onConflict: 'user_id,date' })
        .select()
        .single()
      return { data, error }
    }
  },

  // Expenses
  expenses: {
    getAll: async () => {
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .order('created_at', { ascending: false })
      return { data, error }
    },
    getByMonth: async (month: string) => {
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .eq('month', month)
        .order('created_at', { ascending: false })
      return { data, error }
    },
    create: async (expenseData: any) => {
      const { data, error } = await supabase
        .from('expenses')
        .insert([expenseData])
        .select()
        .single()
      return { data, error }
    },
    update: async (id: string, expenseData: any) => {
      const { data, error } = await supabase
        .from('expenses')
        .update(expenseData)
        .eq('id', id)
        .select()
        .single()
      return { data, error }
    },
    delete: async (id: string) => {
      const { error } = await supabase
        .from('expenses')
        .delete()
        .eq('id', id)
      return { error }
    }
  },

  // Library Items
  libraryItems: {
    getAll: async () => {
      const { data, error } = await supabase
        .from('library_items')
        .select('*')
        .order('added_at', { ascending: false })
      return { data, error }
    },
    getByLocation: async (locationId: string) => {
      const { data, error } = await supabase
        .from('library_items')
        .select('*')
        .eq('location_id', locationId)
        .order('added_at', { ascending: false })
      return { data, error }
    },
    create: async (itemData: any) => {
      const { data, error } = await supabase
        .from('library_items')
        .insert([itemData])
        .select()
        .single()
      return { data, error }
    },
    update: async (id: string, itemData: any) => {
      const { data, error } = await supabase
        .from('library_items')
        .update(itemData)
        .eq('id', id)
        .select()
        .single()
      return { data, error }
    },
    delete: async (id: string) => {
      const { error } = await supabase
        .from('library_items')
        .delete()
        .eq('id', id)
      return { error }
    }
  },

  // Storage Items
  storageItems: {
    getAll: async () => {
      const { data, error } = await supabase
        .from('storage_items')
        .select('*')
        .order('added_at', { ascending: false })
      return { data, error }
    },
    getByLocation: async (locationId: string) => {
      const { data, error } = await supabase
        .from('storage_items')
        .select('*')
        .eq('location_id', locationId)
        .order('added_at', { ascending: false })
      return { data, error }
    },
    create: async (itemData: any) => {
      const { data, error } = await supabase
        .from('storage_items')
        .insert([itemData])
        .select()
        .single()
      return { data, error }
    },
    update: async (id: string, itemData: any) => {
      const { data, error } = await supabase
        .from('storage_items')
        .update(itemData)
        .eq('id', id)
        .select()
        .single()
      return { data, error }
    },
    delete: async (id: string) => {
      const { error } = await supabase
        .from('storage_items')
        .delete()
        .eq('id', id)
      return { error }
    }
  },

  // Case Files
  caseFiles: {
    getAll: async () => {
      const { data, error } = await supabase
        .from('case_files')
        .select('*')
        .order('created_at', { ascending: false })
      return { data, error }
    },
    getByCaseId: async (caseId: string) => {
      const { data, error } = await supabase
        .from('case_files')
        .select('*')
        .eq('case_id', caseId)
        .order('created_at', { ascending: false })
      return { data, error }
    },
    create: async (fileData: any) => {
      const { data, error } = await supabase
        .from('case_files')
        .insert([fileData])
        .select()
        .single()
      return { data, error }
    },
    delete: async (id: string) => {
      const { error } = await supabase
        .from('case_files')
        .delete()
        .eq('id', id)
      return { error }
    }
  },

  // Case Payments
  casePayments: {
    getByCaseId: async (caseId: string) => {
      const { data, error } = await supabase
        .from('case_payments')
        .select('*')
        .eq('case_id', caseId)
        .order('date', { ascending: false })
      return { data, error }
    },
    create: async (paymentData: {
      case_id: string;
      amount: number;
      date: string;
      received_by: string;
      payment_mode: string;
      reference_id?: string;
      tds?: number;
      is_accepted?: boolean;
    }) => {
      const { data, error } = await supabase
        .from('case_payments')
        .insert([paymentData])
        .select()
        .single()
      return { data, error }
    },
    update: async (id: string, paymentData: any) => {
      const { data, error } = await supabase
        .from('case_payments')
        .update(paymentData)
        .eq('id', id)
        .select()
        .single()
      return { data, error }
    },
    accept: async (id: string, acceptedBy: string) => {
      const { data, error } = await supabase
        .from('case_payments')
        .update({ 
          is_accepted: true, 
          accepted_by: acceptedBy,
          accepted_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single()
      return { data, error }
    },
    delete: async (id: string) => {
      const { error } = await supabase
        .from('case_payments')
        .delete()
        .eq('id', id)
      return { error }
    }
  },

  // Case Timeline
  caseTimeline: {
    getByCaseId: async (caseId: string) => {
      const { data, error } = await supabase
        .from('case_timeline')
        .select('*')
        .eq('case_id', caseId)
        .order('event_date', { ascending: false })
      return { data, error }
    },
    create: async (timelineData: {
      case_id: string;
      title: string;
      description?: string;
      event_date?: string;
      created_by?: string;
    }) => {
      const { data, error } = await supabase
        .from('case_timeline')
        .insert([timelineData])
        .select()
        .single()
      return { data, error }
    },
    update: async (id: string, timelineData: any) => {
      const { data, error } = await supabase
        .from('case_timeline')
        .update(timelineData)
        .eq('id', id)
        .select()
        .single()
      return { data, error }
    },
    delete: async (id: string) => {
      const { error } = await supabase
        .from('case_timeline')
        .delete()
        .eq('id', id)
      return { error }
    }
  },

  // Dashboard Stats
  getDashboardStats: async () => {
    const { data, error } = await supabase.rpc('get_dashboard_stats')
    return { data, error }
  },

  // Notifications
  notifications: {
    getAll: async (userId?: string) => {
      let query = supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
      
      if (userId) {
        query = query.or(`user_id.eq.${userId},user_id.is.null`);
      }
      
      return await query;
    },

    getUnread: async (userId?: string) => {
      let query = supabase
        .from('notifications')
        .select('*')
        .eq('is_read', false)
        .order('created_at', { ascending: false });
      
      if (userId) {
        query = query.or(`user_id.eq.${userId},user_id.is.null`);
      }
      
      return await query;
    },

    create: async (notification: {
      user_id?: string;
      type: string;
      title: string;
      description: string;
      icon?: string;
      related_id?: string;
      created_by?: string;
      created_by_name?: string;
    }) => {
      return await supabase.from('notifications').insert(notification).select().single();
    },

    createForAll: async (notification: {
      type: string;
      title: string;
      description: string;
      icon?: string;
      related_id?: string;
      created_by?: string;
      created_by_name?: string;
    }) => {
      return await supabase.rpc('create_notification_for_all', {
        p_type: notification.type,
        p_title: notification.title,
        p_description: notification.description,
        p_icon: notification.icon || '🔔',
        p_related_id: notification.related_id,
        p_created_by: notification.created_by,
        p_created_by_name: notification.created_by_name
      });
    },

    markAsRead: async (notificationId: string) => {
      return await supabase.rpc('mark_notification_read', {
        p_notification_id: notificationId
      });
    },

    markAllAsRead: async (userId: string) => {
      return await supabase.rpc('mark_all_notifications_read', {
        p_user_id: userId
      });
    },

    delete: async (id: string) => {
      return await supabase.from('notifications').delete().eq('id', id);
    }
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

  subscribeToNotifications: (callback: (payload: any) => void) => {
    return supabase
      .channel('notifications-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'notifications' },
        callback
      )
      .subscribe()
  },

  subscribeToTasks: (callback: (payload: any) => void) => {
    return supabase
      .channel('tasks-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'tasks' },
        callback
      )
      .subscribe()
  },

  subscribeToLibraryLocations: (callback: (payload: any) => void) => {
    return supabase
      .channel('library-locations-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'library_locations' },
        callback
      )
      .subscribe()
  },

  subscribeToStorageLocations: (callback: (payload: any) => void) => {
    return supabase
      .channel('storage-locations-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'storage_locations' },
        callback
      )
      .subscribe()
  },

  unsubscribe: (channel: any) => {
    supabase.removeChannel(channel)
  }
}
