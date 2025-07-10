import { useState, useEffect } from 'react';
import { 
  ref, 
  query, 
  orderByChild, 
  equalTo, 
  onValue, 
  push, 
  update, 
  remove,
  serverTimestamp
} from 'firebase/database';
import { database } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { Project } from '../types';
import { toast } from 'react-toastify';

export const useProjects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();

  useEffect(() => {
    if (!currentUser) {
      console.log('❌ No current user, skipping projects fetch');
      setProjects([]);
      setLoading(false);
      return;
    }

    console.log('🔄 Setting up projects listener for user:', currentUser.id);

    const projectsRef = ref(database, 'projects');
    const projectsQuery = query(projectsRef, orderByChild('userId'), equalTo(currentUser.id));

    const unsubscribe = onValue(projectsQuery, (snapshot) => {
      console.log('📊 Projects snapshot received');
      console.log('📈 Snapshot exists:', snapshot.exists());
      
      const projectsData: Project[] = [];
      
      if (snapshot.exists()) {
        snapshot.forEach((childSnapshot) => {
          const data = childSnapshot.val();
          console.log('📋 Processing project:', childSnapshot.key, data.title);
          projectsData.push({
            id: childSnapshot.key!,
            ...data,
            startDate: data.startDate ? new Date(data.startDate) : new Date(),
            endDate: data.endDate ? new Date(data.endDate) : new Date(),
            createdAt: data.createdAt ? new Date(data.createdAt) : new Date(),
            updatedAt: data.updatedAt ? new Date(data.updatedAt) : new Date(),
            themeIds: data.themeIds || [] // Ensure themeIds is always an array
          });
        });
      } else {
        console.log('📭 No projects found for user:', currentUser.id);
      }
      
      // Sort by creation date (newest first)
      projectsData.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      
      console.log('✅ Processed projects count:', projectsData.length);
      setProjects(projectsData);
      setLoading(false);
    }, (error) => {
      console.error('❌ Error fetching projects:', error);
      toast.error('Failed to load projects: ' + error.message);
      setLoading(false);
    });

    return () => {
      console.log('🔄 Cleaning up projects listener');
      unsubscribe();
    };
  }, [currentUser]);

  const addProject = async (projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'userId'>, themeIds?: string[]) => {
    if (!currentUser) return;

    try {
      console.log('➕ Adding project:', projectData.title);
      console.log('🎨 With themes:', themeIds);
      
      const projectsRef = ref(database, 'projects');
      const newProjectData = {
        ...projectData,
        startDate: projectData.startDate.toISOString(),
        endDate: projectData.endDate.toISOString(),
        themeIds: themeIds || [], // Store theme IDs directly in project
        userId: currentUser.id,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      const result = await push(projectsRef, newProjectData);
      const projectId = result.key!;
      
      console.log('✅ Project added successfully with ID:', projectId);
      toast.success('Project added successfully');
      return projectId;
    } catch (error: any) {
      console.error('❌ Error adding project:', error);
      toast.error('Failed to add project: ' + error.message);
      throw error;
    }
  };

  const updateProject = async (id: string, projectData: Partial<Project>, themeIds?: string[]) => {
    try {
      console.log('✏️ Updating project:', id);
      console.log('🎨 With themes:', themeIds);
      
      const projectRef = ref(database, `projects/${id}`);
      const updateData: any = {
        ...projectData,
        updatedAt: serverTimestamp()
      };

      // Convert dates to ISO strings if they exist
      if (projectData.startDate) {
        updateData.startDate = projectData.startDate.toISOString();
      }
      if (projectData.endDate) {
        updateData.endDate = projectData.endDate.toISOString();
      }

      // Update theme IDs if provided
      if (themeIds !== undefined) {
        updateData.themeIds = themeIds;
      }

      await update(projectRef, updateData);
      
      console.log('✅ Project updated successfully');
      toast.success('Project updated successfully');
    } catch (error: any) {
      console.error('❌ Error updating project:', error);
      toast.error('Failed to update project: ' + error.message);
      throw error;
    }
  };

  const deleteProject = async (id: string) => {
    try {
      console.log('🗑️ Deleting project:', id);
      const projectRef = ref(database, `projects/${id}`);
      await remove(projectRef);
      console.log('✅ Project deleted successfully');
      toast.success('Project deleted successfully');
    } catch (error: any) {
      console.error('❌ Error deleting project:', error);
      toast.error('Failed to delete project: ' + error.message);
      throw error;
    }
  };

  return {
    projects,
    loading,
    addProject,
    updateProject,
    deleteProject
  };
};