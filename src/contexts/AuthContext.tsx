import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AuthContextType, CreateUserData, UserRole } from '../types';
import { supabase } from '../lib/supabase';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import {
  authenticateUser as authenticateUserDb,
  getAllUsers as getAllUsersDb,
  createUserAccount as createUserAccountDb,
  updateUserRoleDb,
  toggleUserStatusDb,
  deleteUserAccountDb,
} from '../lib/userManagement';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Convert Supabase user to our User type
const mapSupabaseUser = (supabaseUser: SupabaseUser | null, profile: any): User | null => {
  if (!supabaseUser) return null;
  
  return {
    id: supabaseUser.id,
    name: profile?.name || supabaseUser.user_metadata?.name || supabaseUser.email?.split('@')[0] || 'User',
    email: supabaseUser.email || '',
    role: profile?.role || 'user',
    isActive: profile?.is_active ?? true,
    avatar: profile?.avatar,
    createdAt: new Date(supabaseUser.created_at),
    updatedAt: new Date(profile?.updated_at || supabaseUser.created_at),
  };
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch user profile from Supabase
  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
    return data;
  };

  // Fetch all users (for admin)
  const fetchAllUsers = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching users:', error);
      return [];
    }
    
    return data.map((profile: any) => ({
      id: profile.id,
      name: profile.name,
      email: profile.email,
      role: profile.role,
      isActive: profile.is_active,
      avatar: profile.avatar,
      createdAt: new Date(profile.created_at),
      updatedAt: new Date(profile.updated_at),
    }));
  };


  // Initialize auth state
  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        // TEMPORARY: Skip Supabase check for frontend development
        // Get current session
        // const { data: { session } } = await supabase.auth.getSession();
        
        // if (session?.user && mounted) {
        //   const profile = await fetchProfile(session.user.id);
        //   const mappedUser = mapSupabaseUser(session.user, profile);
        //   setUser(mappedUser);
          
        //   // Fetch all users if admin
        //   if (profile?.role === 'admin') {
        //     const allUsers = await fetchAllUsers();
        //     setUsers(allUsers);
        //   }
        // }
      } catch (err) {
        console.error('Auth initialization error:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;

        if (event === 'SIGNED_IN' && session?.user) {
          const profile = await fetchProfile(session.user.id);
          const mappedUser = mapSupabaseUser(session.user, profile);
          setUser(mappedUser);
          
          if (profile?.role === 'admin') {
            const allUsers = await fetchAllUsers();
            setUsers(allUsers);
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setUsers([]);
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const login = async (username: string, password: string): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      // Authenticate with Supabase
      const result = await authenticateUserDb(username, password);
      
      if (!result.success || !result.user) {
        throw new Error(result.error || 'Invalid username or password');
      }

      // Set current user
      setUser(result.user);
      localStorage.setItem('current_user', JSON.stringify(result.user));

      // If admin, fetch all users
      if (result.user.role === 'admin') {
        const usersResult = await getAllUsersDb();
        if (usersResult.success && usersResult.users) {
          setUsers(usersResult.users);
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    await supabase.auth.signOut();
    setUser(null);
    setUsers([]);
    // Clear current user from localStorage but keep users list
    localStorage.removeItem('current_user');
  };


  const createUser = async (userData: CreateUserData): Promise<{ success: boolean; error?: string }> => {
    try {
      // Create user in Supabase
      const result = await createUserAccountDb(userData, user?.id);
      
      if (!result.success) {
        return { success: false, error: result.error };
      }

      // Refresh users list
      const usersResult = await getAllUsersDb();
      if (usersResult.success && usersResult.users) {
        setUsers(usersResult.users);
      }

      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create user';
      return { success: false, error: errorMessage };
    }
  };

  const updateUserRole = async (userId: string, role: UserRole): Promise<{ success: boolean; error?: string }> => {
    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    try {
      // Update role in Supabase
      const result = await updateUserRoleDb(userId, role, user.id);
      
      if (!result.success) {
        return { success: false, error: result.error };
      }

      // Refresh users list
      const usersResult = await getAllUsersDb();
      if (usersResult.success && usersResult.users) {
        setUsers(usersResult.users);
        
        // Update current user if they changed their own role
        if (user.id === userId) {
          const updatedUser = usersResult.users.find(u => u.id === userId);
          if (updatedUser) {
            setUser(updatedUser);
            localStorage.setItem('current_user', JSON.stringify(updatedUser));
          }
        }
      }

      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update role';
      return { success: false, error: errorMessage };
    }
  };

  const toggleUserStatus = async (userId: string): Promise<{ success: boolean; error?: string }> => {
    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    try {
      // Toggle status in Supabase
      const result = await toggleUserStatusDb(userId, user.id);
      
      if (!result.success) {
        return { success: false, error: result.error };
      }

      // Refresh users list
      const usersResult = await getAllUsersDb();
      if (usersResult.success && usersResult.users) {
        setUsers(usersResult.users);
      }

      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to toggle status';
      return { success: false, error: errorMessage };
    }
  };

  const deleteUser = async (userId: string): Promise<{ success: boolean; error?: string }> => {
    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    try {
      // Delete user in Supabase (soft delete)
      const result = await deleteUserAccountDb(userId, user.id);
      
      if (!result.success) {
        return { success: false, error: result.error };
      }

      // Refresh users list
      const usersResult = await getAllUsersDb();
      if (usersResult.success && usersResult.users) {
        setUsers(usersResult.users);
      }

      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete user';
      return { success: false, error: errorMessage };
    }
  };

  const isAdmin = user?.role === 'admin';

  const value: AuthContextType = {
    user,
    users,
    isAuthenticated: !!user,
    isAdmin,
    login,
    logout,
    createUser,
    updateUserRole,
    toggleUserStatus,
    deleteUser,
    loading,
    error,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
