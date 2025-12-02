import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AuthContextType, CreateUserData, UserRole } from '../types';
import { supabase } from '../lib/supabase';
import type { User as SupabaseUser } from '@supabase/supabase-js';

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
        // Get current session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user && mounted) {
          const profile = await fetchProfile(session.user.id);
          const mappedUser = mapSupabaseUser(session.user, profile);
          setUser(mappedUser);
          
          // Fetch all users if admin
          if (profile?.role === 'admin') {
            const allUsers = await fetchAllUsers();
            setUsers(allUsers);
          }
        }
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

  const login = async (email: string, password: string): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        throw new Error(signInError.message);
      }

      if (data.user) {
        const profile = await fetchProfile(data.user.id);
        
        if (profile && !profile.is_active) {
          await supabase.auth.signOut();
          throw new Error('Account is deactivated. Please contact an administrator.');
        }

        const mappedUser = mapSupabaseUser(data.user, profile);
        setUser(mappedUser);

        if (profile?.role === 'admin') {
          const allUsers = await fetchAllUsers();
          setUsers(allUsers);
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
  };


  const createUser = async (userData: CreateUserData): Promise<{ success: boolean; error?: string }> => {
    try {
      // Create user in Supabase Auth
      const { error: signUpError } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            name: userData.name,
            role: userData.role,
          },
        },
      });

      if (signUpError) {
        return { success: false, error: signUpError.message };
      }

      // Refresh users list
      const allUsers = await fetchAllUsers();
      setUsers(allUsers);

      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create user';
      return { success: false, error: errorMessage };
    }
  };

  const updateUserRole = async (userId: string, role: UserRole): Promise<{ success: boolean; error?: string }> => {
    // Prevent self-demotion
    if (user?.id === userId && role !== 'admin' && user.role === 'admin') {
      return { success: false, error: 'You cannot demote yourself' };
    }

    try {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ role, updated_at: new Date().toISOString() })
        .eq('id', userId);

      if (updateError) {
        return { success: false, error: updateError.message };
      }

      // Update local state
      setUsers((prev) =>
        prev.map((u) =>
          u.id === userId ? { ...u, role, updatedAt: new Date() } : u
        )
      );

      // Update current user if they changed their own role
      if (user?.id === userId) {
        setUser({ ...user, role, updatedAt: new Date() });
      }

      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update role';
      return { success: false, error: errorMessage };
    }
  };

  const toggleUserStatus = async (userId: string): Promise<{ success: boolean; error?: string }> => {
    // Prevent self-deactivation
    if (user?.id === userId) {
      return { success: false, error: 'You cannot deactivate your own account' };
    }

    try {
      const targetUser = users.find((u) => u.id === userId);
      if (!targetUser) {
        return { success: false, error: 'User not found' };
      }

      const newStatus = !targetUser.isActive;

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ is_active: newStatus, updated_at: new Date().toISOString() })
        .eq('id', userId);

      if (updateError) {
        return { success: false, error: updateError.message };
      }

      // Update local state
      setUsers((prev) =>
        prev.map((u) =>
          u.id === userId ? { ...u, isActive: newStatus, updatedAt: new Date() } : u
        )
      );

      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to toggle status';
      return { success: false, error: errorMessage };
    }
  };

  const deleteUser = async (userId: string): Promise<{ success: boolean; error?: string }> => {
    // Prevent self-deletion
    if (user?.id === userId) {
      return { success: false, error: 'You cannot delete your own account' };
    }

    try {
      // Note: Deleting from profiles will cascade due to FK constraint
      // But we can't delete from auth.users directly from client
      // Instead, we deactivate the user
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ is_active: false, updated_at: new Date().toISOString() })
        .eq('id', userId);

      if (updateError) {
        return { success: false, error: updateError.message };
      }

      // Remove from local state
      setUsers((prev) => prev.filter((u) => u.id !== userId));

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
