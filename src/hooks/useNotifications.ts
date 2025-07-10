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
import { useProjects } from './useProjects';
import { useMeetings } from './useMeetings';
import { addDays, isWithinInterval, startOfDay, endOfDay } from 'date-fns';

interface Notification {
  id: string;
  type: 'deadline' | 'meeting' | 'payment' | 'info';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  priority: 'low' | 'medium' | 'high';
  relatedId?: string;
  userId: string;
}

export const useNotifications = () => {
  const { currentUser } = useAuth();
  const { projects } = useProjects();
  const { meetings } = useMeetings();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  // Load notifications from Firebase
  useEffect(() => {
    if (!currentUser) {
      setNotifications([]);
      setLoading(false);
      return;
    }

    const notificationsRef = ref(database, 'notifications');
    const notificationsQuery = query(notificationsRef, orderByChild('userId'), equalTo(currentUser.id));

    const unsubscribe = onValue(notificationsQuery, (snapshot) => {
      const notificationsData: Notification[] = [];
      
      if (snapshot.exists()) {
        snapshot.forEach((childSnapshot) => {
          const data = childSnapshot.val();
          notificationsData.push({
            id: childSnapshot.key!,
            ...data,
            timestamp: data.timestamp ? new Date(data.timestamp) : new Date()
          });
        });
      }
      
      // Sort by timestamp (newest first)
      notificationsData.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
      
      setNotifications(notificationsData);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching notifications:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser]);

  // Generate automatic notifications based on projects and meetings
  useEffect(() => {
    if (!currentUser || loading) return;

    const generateAutoNotifications = async () => {
      const now = new Date();
      const oneDayFromNow = addDays(now, 1);

      // Check for project deadlines
      for (const project of projects) {
        if (project.status === 'in-progress') {
          const endDate = new Date(project.endDate);
          const daysUntilDeadline = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

          if (daysUntilDeadline <= 3 && daysUntilDeadline > 0) {
            const notificationId = `deadline-${project.id}`;
            const existingNotification = notifications.find(n => n.relatedId === project.id && n.type === 'deadline');
            
            if (!existingNotification) {
              await addNotification({
                type: 'deadline',
                title: 'Project Deadline Approaching',
                message: `${project.title} is due in ${daysUntilDeadline} day${daysUntilDeadline > 1 ? 's' : ''}`,
                relatedId: project.id,
                priority: daysUntilDeadline <= 1 ? 'high' : 'medium',
                read: false
              });
            }
          }
        }
      }

      // Check for upcoming meetings
      for (const meeting of meetings) {
        if (meeting.status === 'scheduled') {
          const meetingDate = new Date(meeting.date);
          
          // Meetings tomorrow
          if (isWithinInterval(meetingDate, { start: startOfDay(oneDayFromNow), end: endOfDay(oneDayFromNow) })) {
            const existingNotification = notifications.find(n => n.relatedId === meeting.id && n.type === 'meeting');
            
            if (!existingNotification) {
              await addNotification({
                type: 'meeting',
                title: 'Meeting Tomorrow',
                message: `${meeting.title} is scheduled for tomorrow`,
                relatedId: meeting.id,
                priority: 'medium',
                read: false
              });
            }
          }
        }
      }
    };

    generateAutoNotifications();
  }, [projects, meetings, currentUser, loading, notifications]);

  const addNotification = async (notificationData: Omit<Notification, 'id' | 'timestamp' | 'userId'>) => {
    if (!currentUser) return;

    try {
      const notificationsRef = ref(database, 'notifications');
      const newNotificationData = {
        ...notificationData,
        userId: currentUser.id,
        timestamp: serverTimestamp()
      };

      await push(notificationsRef, newNotificationData);
    } catch (error) {
      console.error('Error adding notification:', error);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      const notificationRef = ref(database, `notifications/${id}`);
      await update(notificationRef, { read: true });
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const updates: { [key: string]: any } = {};
      notifications.forEach(notification => {
        if (!notification.read) {
          updates[`notifications/${notification.id}/read`] = true;
        }
      });
      
      if (Object.keys(updates).length > 0) {
        await update(ref(database), updates);
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const dismissNotification = async (id: string) => {
    try {
      const notificationRef = ref(database, `notifications/${id}`);
      await remove(notificationRef);
    } catch (error) {
      console.error('Error dismissing notification:', error);
    }
  };

  return {
    notifications,
    loading,
    markAsRead,
    markAllAsRead,
    dismissNotification,
    addNotification,
    unreadCount: notifications.filter(n => !n.read).length
  };
};