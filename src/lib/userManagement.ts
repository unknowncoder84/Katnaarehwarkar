import { supabase } from './supabase';
import { User, CreateUserData, UserRole } from '../types';

// Helper to convert database user to app User type
const mapDbUserToUser = (dbUser: any): User => ({
  id: dbUser.id,
  name: dbUser.name || dbUser.username,
  email: dbUser.email || `${dbUser.username}@katneshwarkar.com`,
  username: dbUser.username,
  role: dbUser.role as UserRole,
  isActive: dbUser.is_active,
  createdAt: new Date(dbUser.created_at),
  updatedAt: new Date(dbUser.updated_at),
});

// Authenticate user
export const authenticateUser = async (
  username: string,
  password: string
): Promise<{ success: boolean; user?: User; error?: string }> => {
  try {
    const { data, error } = await supabase.rpc('authenticate_user', {
      p_username: username,
      p_password: password,
    });

    if (error) {
      console.error('Authentication error:', error);
      return { success: false, error: error.message };
    }

    if (!data || data.length === 0) {
      return { success: false, error: 'Invalid username or password' };
    }

    const result = data[0];
    
    if (!result.success) {
      return { success: false, error: result.error_message || 'Authentication failed' };
    }

    const user: User = {
      id: result.user_id,
      name: result.name || result.username,
      email: result.email || `${result.username}@katneshwarkar.com`,
      username: result.username,
      role: result.role as UserRole,
      isActive: result.is_active,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return { success: true, user };
  } catch (err) {
    console.error('Authentication exception:', err);
    return { success: false, error: 'Authentication failed' };
  }
};

// Get all users
export const getAllUsers = async (): Promise<{ success: boolean; users?: User[]; error?: string }> => {
  try {
    const { data, error } = await supabase.rpc('get_all_users');

    if (error) {
      console.error('Get users error:', error);
      return { success: false, error: error.message };
    }

    const users = data.map(mapDbUserToUser);
    return { success: true, users };
  } catch (err) {
    console.error('Get users exception:', err);
    return { success: false, error: 'Failed to fetch users' };
  }
};

// Create user
export const createUserAccount = async (
  userData: CreateUserData,
  createdBy?: string
): Promise<{ success: boolean; userId?: string; error?: string }> => {
  try {
    const { data, error } = await supabase.rpc('create_user_account', {
      p_name: userData.name,
      p_email: userData.email,
      p_username: userData.username, // Use provided username
      p_password: userData.password,
      p_role: userData.role,
      p_created_by: createdBy || null,
    });

    if (error) {
      console.error('Create user error:', error);
      return { success: false, error: error.message };
    }

    if (!data || data.length === 0) {
      return { success: false, error: 'Failed to create user' };
    }

    const result = data[0];
    
    if (!result.success) {
      return { success: false, error: result.error_message || 'Failed to create user' };
    }

    return { success: true, userId: result.user_id };
  } catch (err) {
    console.error('Create user exception:', err);
    return { success: false, error: 'Failed to create user' };
  }
};

// Update user role
export const updateUserRoleDb = async (
  userId: string,
  newRole: UserRole,
  updatedBy: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const { data, error } = await supabase.rpc('update_user_role', {
      p_user_id: userId,
      p_new_role: newRole,
      p_updated_by: updatedBy,
    });

    if (error) {
      console.error('Update role error:', error);
      return { success: false, error: error.message };
    }

    if (!data || data.length === 0) {
      return { success: false, error: 'Failed to update role' };
    }

    const result = data[0];
    
    if (!result.success) {
      return { success: false, error: result.error_message || 'Failed to update role' };
    }

    return { success: true };
  } catch (err) {
    console.error('Update role exception:', err);
    return { success: false, error: 'Failed to update role' };
  }
};

// Toggle user status
export const toggleUserStatusDb = async (
  userId: string,
  updatedBy: string
): Promise<{ success: boolean; newStatus?: boolean; error?: string }> => {
  try {
    const { data, error } = await supabase.rpc('toggle_user_status', {
      p_user_id: userId,
      p_updated_by: updatedBy,
    });

    if (error) {
      console.error('Toggle status error:', error);
      return { success: false, error: error.message };
    }

    if (!data || data.length === 0) {
      return { success: false, error: 'Failed to toggle status' };
    }

    const result = data[0];
    
    if (!result.success) {
      return { success: false, error: result.error_message || 'Failed to toggle status' };
    }

    return { success: true, newStatus: result.new_status };
  } catch (err) {
    console.error('Toggle status exception:', err);
    return { success: false, error: 'Failed to toggle status' };
  }
};

// Delete user
export const deleteUserAccountDb = async (
  userId: string,
  deletedBy: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const { data, error } = await supabase.rpc('delete_user_account', {
      p_user_id: userId,
      p_deleted_by: deletedBy,
    });

    if (error) {
      console.error('Delete user error:', error);
      return { success: false, error: error.message };
    }

    if (!data || data.length === 0) {
      return { success: false, error: 'Failed to delete user' };
    }

    const result = data[0];
    
    if (!result.success) {
      return { success: false, error: result.error_message || 'Failed to delete user' };
    }

    return { success: true };
  } catch (err) {
    console.error('Delete user exception:', err);
    return { success: false, error: 'Failed to delete user' };
  }
};

