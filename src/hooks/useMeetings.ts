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
import { Meeting } from '../types';
import { toast } from 'react-toastify';

export const useMeetings = () => {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();

  useEffect(() => {
    if (!currentUser) {
      console.log('❌ No current user, skipping meetings fetch');
      setMeetings([]);
      setLoading(false);
      return;
    }

    console.log('🔄 Setting up meetings listener for user:', currentUser.id);

    const meetingsRef = ref(database, 'meetings');
    const meetingsQuery = query(meetingsRef, orderByChild('userId'), equalTo(currentUser.id));

    const unsubscribe = onValue(meetingsQuery, (snapshot) => {
      console.log('📊 Meetings snapshot received');
      console.log('📈 Snapshot exists:', snapshot.exists());
      
      const meetingsData: Meeting[] = [];
      
      if (snapshot.exists()) {
        snapshot.forEach((childSnapshot) => {
          const data = childSnapshot.val();
          console.log('📅 Processing meeting:', childSnapshot.key, data.title);
          meetingsData.push({
            id: childSnapshot.key!,
            ...data,
            date: data.date ? new Date(data.date) : new Date(),
            createdAt: data.createdAt ? new Date(data.createdAt) : new Date(),
            updatedAt: data.updatedAt ? new Date(data.updatedAt) : new Date()
          });
        });
      } else {
        console.log('📭 No meetings found for user:', currentUser.id);
      }
      
      // Sort by meeting date (newest first)
      meetingsData.sort((a, b) => b.date.getTime() - a.date.getTime());
      
      console.log('✅ Processed meetings count:', meetingsData.length);
      setMeetings(meetingsData);
      setLoading(false);
    }, (error) => {
      console.error('❌ Error fetching meetings:', error);
      toast.error('Failed to load meetings: ' + error.message);
      setLoading(false);
    });

    return () => {
      console.log('🔄 Cleaning up meetings listener');
      unsubscribe();
    };
  }, [currentUser]);

  const addMeeting = async (meetingData: Omit<Meeting, 'id' | 'createdAt' | 'updatedAt' | 'userId'>) => {
    if (!currentUser) return;

    try {
      console.log('➕ Adding meeting:', meetingData.title);
      const meetingsRef = ref(database, 'meetings');
      const newMeetingData = {
        ...meetingData,
        date: meetingData.date.toISOString(),
        userId: currentUser.id,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      await push(meetingsRef, newMeetingData);
      console.log('✅ Meeting added successfully');
      toast.success('Meeting scheduled successfully');
    } catch (error: any) {
      console.error('❌ Error adding meeting:', error);
      toast.error('Failed to schedule meeting: ' + error.message);
      throw error;
    }
  };

  const updateMeeting = async (id: string, meetingData: Partial<Meeting>) => {
    try {
      console.log('✏️ Updating meeting:', id);
      const meetingRef = ref(database, `meetings/${id}`);
      const updateData: any = {
        ...meetingData,
        updatedAt: serverTimestamp()
      };

      // Convert date to ISO string if it exists
      if (meetingData.date) {
        updateData.date = meetingData.date.toISOString();
      }

      await update(meetingRef, updateData);
      console.log('✅ Meeting updated successfully');
      toast.success('Meeting updated successfully');
    } catch (error: any) {
      console.error('❌ Error updating meeting:', error);
      toast.error('Failed to update meeting: ' + error.message);
      throw error;
    }
  };

  const deleteMeeting = async (id: string) => {
    try {
      console.log('🗑️ Deleting meeting:', id);
      const meetingRef = ref(database, `meetings/${id}`);
      await remove(meetingRef);
      console.log('✅ Meeting deleted successfully');
      toast.success('Meeting deleted successfully');
    } catch (error: any) {
      console.error('❌ Error deleting meeting:', error);
      toast.error('Failed to delete meeting: ' + error.message);
      throw error;
    }
  };

  return {
    meetings,
    loading,
    addMeeting,
    updateMeeting,
    deleteMeeting
  };
};