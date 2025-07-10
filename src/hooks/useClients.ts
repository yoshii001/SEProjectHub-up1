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
  serverTimestamp,
  off
} from 'firebase/database';
import { database } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { Client } from '../types';
import { toast } from 'react-toastify';

export const useClients = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();

  useEffect(() => {
    if (!currentUser) {
      console.log('❌ No current user, skipping clients fetch');
      setClients([]);
      setLoading(false);
      return;
    }

    console.log('🔄 Setting up clients listener for user:', currentUser.id);
    
    const clientsRef = ref(database, 'clients');
    const clientsQuery = query(clientsRef, orderByChild('userId'), equalTo(currentUser.id));

    const unsubscribe = onValue(clientsQuery, (snapshot) => {
      console.log('📊 Clients data received:', snapshot.exists());
      const clientsData: Client[] = [];
      
      if (snapshot.exists()) {
        snapshot.forEach((childSnapshot) => {
          const data = childSnapshot.val();
          console.log('👤 Client data:', data);
          clientsData.push({
            id: childSnapshot.key!,
            ...data,
            createdAt: data.createdAt ? new Date(data.createdAt) : new Date(),
            updatedAt: data.updatedAt ? new Date(data.updatedAt) : new Date()
          });
        });
      }
      
      // Sort by creation date (newest first)
      clientsData.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      
      console.log('✅ Processed clients:', clientsData.length);
      setClients(clientsData);
      setLoading(false);
    }, (error) => {
      console.error('❌ Error fetching clients:', error);
      toast.error('Failed to load clients: ' + error.message);
      setLoading(false);
    });

    return () => {
      console.log('🔄 Cleaning up clients listener');
      off(clientsQuery);
    };
  }, [currentUser]);

  const addClient = async (clientData: Omit<Client, 'id' | 'createdAt' | 'updatedAt' | 'userId'>) => {
    if (!currentUser) {
      toast.error('You must be logged in to add clients');
      return;
    }

    console.log('➕ Adding client:', clientData);

    try {
      const clientsRef = ref(database, 'clients');
      const newClientData = {
        ...clientData,
        userId: currentUser.id,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      console.log('📤 Sending client data to Firebase:', newClientData);
      const result = await push(clientsRef, newClientData);
      console.log('✅ Client added with ID:', result.key);
      toast.success('Client added successfully');
    } catch (error: any) {
      console.error('❌ Error adding client:', error);
      toast.error('Failed to add client: ' + error.message);
      throw error;
    }
  };

  const updateClient = async (id: string, clientData: Partial<Client>) => {
    try {
      console.log('✏️ Updating client:', id, clientData);
      const clientRef = ref(database, `clients/${id}`);
      const updateData = {
        ...clientData,
        updatedAt: serverTimestamp()
      };

      await update(clientRef, updateData);
      console.log('✅ Client updated successfully');
      toast.success('Client updated successfully');
    } catch (error: any) {
      console.error('❌ Error updating client:', error);
      toast.error('Failed to update client: ' + error.message);
      throw error;
    }
  };

  const deleteClient = async (id: string) => {
    try {
      console.log('🗑️ Deleting client:', id);
      const clientRef = ref(database, `clients/${id}`);
      await remove(clientRef);
      console.log('✅ Client deleted successfully');
      toast.success('Client deleted successfully');
    } catch (error: any) {
      console.error('❌ Error deleting client:', error);
      toast.error('Failed to delete client: ' + error.message);
      throw error;
    }
  };

  return {
    clients,
    loading,
    addClient,
    updateClient,
    deleteClient
  };
};