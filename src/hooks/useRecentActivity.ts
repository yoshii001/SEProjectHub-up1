import { useState, useEffect } from 'react';
import { useClients } from './useClients';
import { useProjects } from './useProjects';
import { useMeetings } from './useMeetings';
import { Briefcase, Users, Calendar, Clock } from 'lucide-react';

interface ActivityItem {
  id: string;
  type: 'project' | 'client' | 'meeting' | 'deadline';
  title: string;
  time: string;
  icon: any;
  relatedId?: string;
}

export const useRecentActivity = () => {
  const { clients } = useClients();
  const { projects } = useProjects();
  const { meetings } = useMeetings();
  const [activities, setActivities] = useState<ActivityItem[]>([]);

  useEffect(() => {
    const generateActivities = () => {
      const activityList: ActivityItem[] = [];

      // Recent projects
      const recentProjects = projects
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 3);

      recentProjects.forEach(project => {
        const client = clients.find(c => c.id === project.clientId);
        activityList.push({
          id: `project-${project.id}`,
          type: 'project',
          title: `New project "${project.title}" started`,
          time: getRelativeTime(project.createdAt),
          icon: Briefcase,
          relatedId: project.id
        });
      });

      // Recent clients
      const recentClients = clients
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 2);

      recentClients.forEach(client => {
        activityList.push({
          id: `client-${client.id}`,
          type: 'client',
          title: `New client "${client.name}" added`,
          time: getRelativeTime(client.createdAt),
          icon: Users,
          relatedId: client.id
        });
      });

      // Recent meetings
      const recentMeetings = meetings
        .filter(m => m.status === 'completed')
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 2);

      recentMeetings.forEach(meeting => {
        const client = clients.find(c => c.id === meeting.clientId);
        activityList.push({
          id: `meeting-${meeting.id}`,
          type: 'meeting',
          title: `Meeting "${meeting.title}" completed`,
          time: getRelativeTime(meeting.date),
          icon: Calendar,
          relatedId: meeting.id
        });
      });

      // Upcoming deadlines
      const upcomingDeadlines = projects
        .filter(p => p.status === 'in-progress')
        .filter(p => {
          const daysLeft = Math.ceil((new Date(p.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
          return daysLeft <= 7 && daysLeft > 0;
        })
        .slice(0, 2);

      upcomingDeadlines.forEach(project => {
        const daysLeft = Math.ceil((new Date(project.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
        activityList.push({
          id: `deadline-${project.id}`,
          type: 'deadline',
          title: `Project "${project.title}" deadline in ${daysLeft} day${daysLeft > 1 ? 's' : ''}`,
          time: `${daysLeft} day${daysLeft > 1 ? 's' : ''} left`,
          icon: Clock,
          relatedId: project.id
        });
      });

      // Sort by most recent and limit to 6 items
      activityList.sort((a, b) => {
        // For deadlines, prioritize by urgency
        if (a.type === 'deadline' && b.type !== 'deadline') return -1;
        if (b.type === 'deadline' && a.type !== 'deadline') return 1;
        return 0;
      });

      setActivities(activityList.slice(0, 6));
    };

    generateActivities();
  }, [clients, projects, meetings]);

  const getRelativeTime = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - new Date(date).getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    
    const diffInWeeks = Math.floor(diffInDays / 7);
    return `${diffInWeeks} week${diffInWeeks > 1 ? 's' : ''} ago`;
  };

  return { activities };
};