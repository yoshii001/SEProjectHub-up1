import { useState, useEffect } from 'react';
import { 
  ref, 
  query, 
  orderByChild, 
  onValue, 
  push, 
  update, 
  remove,
  serverTimestamp,
  get,
  equalTo
} from 'firebase/database';
import { database } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';

export interface SavedTheme {
  id: string;
  name: string;
  description: string;
  themeData: {
    mode: 'light' | 'dark';
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
  };
  createdAt: Date;
  updatedAt: Date;
  userId: string;
}

export interface ProjectTheme {
  id: string;
  projectId: string;
  themeId: string;
  assignedAt: Date;
  userId: string;
}

export const useThemes = () => {
  const [themes, setThemes] = useState<SavedTheme[]>([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();

  useEffect(() => {
    if (!currentUser) {
      console.log('❌ No current user, skipping themes fetch');
      setThemes([]);
      setLoading(false);
      return;
    }

    console.log('🔄 Setting up themes listener for user:', currentUser.id);

    const themesRef = ref(database, 'themes');
    const themesQuery = query(themesRef, orderByChild('userId'), equalTo(currentUser.id));

    const unsubscribe = onValue(themesQuery, (snapshot) => {
      console.log('🎨 Themes data received:', snapshot.exists());
      const themesData: SavedTheme[] = [];
      
      if (snapshot.exists()) {
        snapshot.forEach((childSnapshot) => {
          const data = childSnapshot.val();
          console.log('🎨 Theme data:', data);
          themesData.push({
            id: childSnapshot.key!,
            ...data,
            createdAt: data.createdAt ? new Date(data.createdAt) : new Date(),
            updatedAt: data.updatedAt ? new Date(data.updatedAt) : new Date()
          });
        });
      }
      
      // Sort by creation date (newest first)
      themesData.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      
      console.log('✅ Processed themes:', themesData.length);
      setThemes(themesData);
      setLoading(false);
    }, (error) => {
      console.error('❌ Error fetching themes:', error);
      toast.error('Failed to load themes: ' + error.message);
      setLoading(false);
    });

    return () => {
      console.log('🔄 Cleaning up themes listener');
      unsubscribe();
    };
  }, [currentUser]);

  const saveTheme = async (themeData: Omit<SavedTheme, 'id' | 'createdAt' | 'updatedAt' | 'userId'>) => {
    if (!currentUser) {
      toast.error('You must be logged in to save themes');
      return null;
    }

    // Validate theme name (no spaces, unique)
    const sanitizedName = themeData.name.replace(/\s+/g, '').toLowerCase();
    if (sanitizedName !== themeData.name.toLowerCase()) {
      toast.error('Theme name cannot contain spaces');
      return null;
    }

    // Check for duplicate theme names
    const existingTheme = themes.find(theme => 
      theme.name.toLowerCase() === themeData.name.toLowerCase()
    );
    if (existingTheme) {
      toast.error('A theme with this name already exists');
      return null;
    }

    console.log('💾 Saving theme:', themeData);

    try {
      const themesRef = ref(database, 'themes');
      const newThemeData = {
        ...themeData,
        userId: currentUser.id,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      console.log('📤 Sending theme data to Firebase:', newThemeData);
      const result = await push(themesRef, newThemeData);
      console.log('✅ Theme saved with ID:', result.key);
      toast.success('Theme saved successfully');
      return result.key;
    } catch (error: any) {
      console.error('❌ Error saving theme:', error);
      toast.error('Failed to save theme: ' + error.message);
      throw error;
    }
  };

  const updateTheme = async (id: string, themeData: Partial<SavedTheme>) => {
    try {
      console.log('✏️ Updating theme:', id, themeData);
      const themeRef = ref(database, `themes/${id}`);
      const updateData = {
        ...themeData,
        updatedAt: serverTimestamp()
      };

      await update(themeRef, updateData);
      console.log('✅ Theme updated successfully');
      toast.success('Theme updated successfully');
    } catch (error: any) {
      console.error('❌ Error updating theme:', error);
      toast.error('Failed to update theme: ' + error.message);
      throw error;
    }
  };

  const deleteTheme = async (id: string) => {
    try {
      console.log('🗑️ Deleting theme:', id);
      
      // Check if theme is assigned to any projects
      const projectThemesRef = ref(database, 'projectThemes');
      const projectThemesQuery = query(projectThemesRef, orderByChild('themeId'), equalTo(id));
      const projectThemesSnapshot = await get(projectThemesQuery);
      
      if (projectThemesSnapshot.exists()) {
        toast.error('Cannot delete theme: it is assigned to one or more projects');
        return;
      }

      const themeRef = ref(database, `themes/${id}`);
      await remove(themeRef);
      console.log('✅ Theme deleted successfully');
      toast.success('Theme deleted successfully');
    } catch (error: any) {
      console.error('❌ Error deleting theme:', error);
      toast.error('Failed to delete theme: ' + error.message);
      throw error;
    }
  };

  return {
    themes,
    loading,
    saveTheme,
    updateTheme,
    deleteTheme
  };
};

export const useProjectThemes = () => {
  const [projectThemes, setProjectThemes] = useState<ProjectTheme[]>([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();

  useEffect(() => {
    if (!currentUser) {
      setProjectThemes([]);
      setLoading(false);
      return;
    }

    const projectThemesRef = ref(database, 'projectThemes');
    const projectThemesQuery = query(projectThemesRef, orderByChild('userId'), equalTo(currentUser.id));

    const unsubscribe = onValue(projectThemesQuery, (snapshot) => {
      const projectThemesData: ProjectTheme[] = [];
      
      if (snapshot.exists()) {
        snapshot.forEach((childSnapshot) => {
          const data = childSnapshot.val();
          projectThemesData.push({
            id: childSnapshot.key!,
            ...data,
            assignedAt: data.assignedAt ? new Date(data.assignedAt) : new Date()
          });
        });
      }
      
      setProjectThemes(projectThemesData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser]);

  const assignThemesToProject = async (projectId: string, themeIds: string[]) => {
    if (!currentUser) return;

    if (themeIds.length === 0) {
      toast.error('At least one theme must be assigned to the project');
      return;
    }

    try {
      console.log('🎨 Assigning themes to project:', projectId, themeIds);

      // Remove existing theme assignments for this project
      const existingAssignments = projectThemes.filter(pt => pt.projectId === projectId);
      for (const assignment of existingAssignments) {
        const assignmentRef = ref(database, `projectThemes/${assignment.id}`);
        await remove(assignmentRef);
      }

      // Add new theme assignments
      const projectThemesRef = ref(database, 'projectThemes');
      for (const themeId of themeIds) {
        const assignmentData = {
          projectId,
          themeId,
          userId: currentUser.id,
          assignedAt: serverTimestamp()
        };
        await push(projectThemesRef, assignmentData);
      }

      console.log('✅ Themes assigned successfully');
      toast.success('Themes assigned to project successfully');
    } catch (error: any) {
      console.error('❌ Error assigning themes:', error);
      toast.error('Failed to assign themes: ' + error.message);
      throw error;
    }
  };

  const getProjectThemes = (projectId: string): string[] => {
    return projectThemes
      .filter(pt => pt.projectId === projectId)
      .map(pt => pt.themeId);
  };

  const removeThemeFromProject = async (projectId: string, themeId: string) => {
    try {
      const assignment = projectThemes.find(pt => 
        pt.projectId === projectId && pt.themeId === themeId
      );
      
      if (assignment) {
        const assignmentRef = ref(database, `projectThemes/${assignment.id}`);
        await remove(assignmentRef);
        toast.success('Theme removed from project');
      }
    } catch (error: any) {
      console.error('❌ Error removing theme from project:', error);
      toast.error('Failed to remove theme: ' + error.message);
    }
  };

  return {
    projectThemes,
    loading,
    assignThemesToProject,
    getProjectThemes,
    removeThemeFromProject
  };
};