import { useState, useEffect } from 'react';
import { ref, onValue, push, update, remove, serverTimestamp } from 'firebase/database';
import { database } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';

export interface ComponentSample {
  id: string;
  name: string;
  category: 'navigation' | 'forms' | 'cards' | 'buttons' | 'modals';
  preview: string;
  code: string;
  selected?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  userId?: string;
}

export const useComponents = () => {
  const [components, setComponents] = useState<ComponentSample[]>([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();

  useEffect(() => {
    console.log('🔄 Setting up components listener');
    
    const componentsRef = ref(database, 'components');

    const unsubscribe = onValue(componentsRef, (snapshot) => {
      console.log('🧩 Components data received:', snapshot.exists());
      const componentsData: ComponentSample[] = [];
      
      if (snapshot.exists()) {
        const data = snapshot.val();
        
        // Handle both array and object formats
        if (Array.isArray(data)) {
          data.forEach((component, index) => {
            if (component) {
              componentsData.push({
                ...component,
                id: component.id || index.toString(),
                selected: false,
                createdAt: component.createdAt ? new Date(component.createdAt) : new Date(),
                updatedAt: component.updatedAt ? new Date(component.updatedAt) : new Date()
              });
            }
          });
        } else {
          Object.entries(data).forEach(([key, component]: [string, any]) => {
            if (component) {
              componentsData.push({
                ...component,
                id: component.id || key,
                selected: false,
                createdAt: component.createdAt ? new Date(component.createdAt) : new Date(),
                updatedAt: component.updatedAt ? new Date(component.updatedAt) : new Date()
              });
            }
          });
        }
      }
      
      console.log('✅ Processed components:', componentsData.length);
      setComponents(componentsData);
      setLoading(false);
    }, (error) => {
      console.error('❌ Error fetching components:', error);
      toast.error('Failed to load components: ' + error.message);
      setLoading(false);
    });

    return () => {
      console.log('🔄 Cleaning up components listener');
      unsubscribe();
    };
  }, []);

  const addComponent = async (componentData: Omit<ComponentSample, 'id' | 'createdAt' | 'updatedAt' | 'userId'>) => {
    if (!currentUser) {
      toast.error('You must be logged in to add components');
      return;
    }

    console.log('➕ Adding component:', componentData.name);

    try {
      const componentsRef = ref(database, 'components');
      const newComponentData = {
        ...componentData,
        userId: currentUser.id,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      console.log('📤 Sending component data to Firebase:', newComponentData);
      const result = await push(componentsRef, newComponentData);
      console.log('✅ Component added with ID:', result.key);
      toast.success('Component added successfully');
      return result.key;
    } catch (error: any) {
      console.error('❌ Error adding component:', error);
      toast.error('Failed to add component: ' + error.message);
      throw error;
    }
  };

  const updateComponent = async (id: string, componentData: Partial<ComponentSample>) => {
    try {
      console.log('✏️ Updating component:', id, componentData);
      const componentRef = ref(database, `components/${id}`);
      const updateData = {
        ...componentData,
        updatedAt: serverTimestamp()
      };

      await update(componentRef, updateData);
      console.log('✅ Component updated successfully');
      toast.success('Component updated successfully');
    } catch (error: any) {
      console.error('❌ Error updating component:', error);
      toast.error('Failed to update component: ' + error.message);
      throw error;
    }
  };

  const deleteComponent = async (id: string) => {
    try {
      console.log('🗑️ Deleting component:', id);
      const componentRef = ref(database, `components/${id}`);
      await remove(componentRef);
      console.log('✅ Component deleted successfully');
      toast.success('Component deleted successfully');
    } catch (error: any) {
      console.error('❌ Error deleting component:', error);
      toast.error('Failed to delete component: ' + error.message);
      throw error;
    }
  };

  return {
    components,
    loading,
    addComponent,
    updateComponent,
    deleteComponent
  };
};