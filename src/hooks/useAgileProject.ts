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
import { UserStory, Epic, Sprint, Task, DailyStandup, Risk, Stakeholder } from '../types/agile';
import { toast } from 'react-toastify';

export const useAgileProject = (projectId: string) => {
  const [epics, setEpics] = useState<Epic[]>([]);
  const [stories, setStories] = useState<UserStory[]>([]);
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [standups, setStandups] = useState<DailyStandup[]>([]);
  const [risks, setRisks] = useState<Risk[]>([]);
  const [stakeholders, setStakeholders] = useState<Stakeholder[]>([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();

  // Load all agile data for the project
  useEffect(() => {
    if (!projectId || !currentUser) {
      setLoading(false);
      return;
    }

    console.log('🔄 Loading agile data for project:', projectId);

    const unsubscribes: (() => void)[] = [];

    // Load Epics
    const epicsRef = ref(database, 'epics');
    const epicsQuery = query(epicsRef, orderByChild('projectId'), equalTo(projectId));
    const epicsUnsubscribe = onValue(epicsQuery, (snapshot) => {
      const epicsData: Epic[] = [];
      if (snapshot.exists()) {
        snapshot.forEach((childSnapshot) => {
          epicsData.push({
            id: childSnapshot.key!,
            ...childSnapshot.val(),
            createdAt: new Date(childSnapshot.val().createdAt),
            updatedAt: new Date(childSnapshot.val().updatedAt)
          });
        });
      }
      setEpics(epicsData);
    });
    unsubscribes.push(epicsUnsubscribe);

    // Load User Stories
    const storiesRef = ref(database, 'userStories');
    const storiesQuery = query(storiesRef, orderByChild('projectId'), equalTo(projectId));
    const storiesUnsubscribe = onValue(storiesQuery, (snapshot) => {
      const storiesData: UserStory[] = [];
      if (snapshot.exists()) {
        snapshot.forEach((childSnapshot) => {
          storiesData.push({
            id: childSnapshot.key!,
            ...childSnapshot.val(),
            createdAt: new Date(childSnapshot.val().createdAt),
            updatedAt: new Date(childSnapshot.val().updatedAt)
          });
        });
      }
      setStories(storiesData);
    });
    unsubscribes.push(storiesUnsubscribe);

    // Load Sprints
    const sprintsRef = ref(database, 'sprints');
    const sprintsQuery = query(sprintsRef, orderByChild('projectId'), equalTo(projectId));
    const sprintsUnsubscribe = onValue(sprintsQuery, (snapshot) => {
      const sprintsData: Sprint[] = [];
      if (snapshot.exists()) {
        snapshot.forEach((childSnapshot) => {
          sprintsData.push({
            id: childSnapshot.key!,
            ...childSnapshot.val(),
            startDate: new Date(childSnapshot.val().startDate),
            endDate: new Date(childSnapshot.val().endDate),
            createdAt: new Date(childSnapshot.val().createdAt),
            updatedAt: new Date(childSnapshot.val().updatedAt)
          });
        });
      }
      setSprints(sprintsData);
    });
    unsubscribes.push(sprintsUnsubscribe);

    // Load Tasks
    const tasksRef = ref(database, 'agileTasks');
    const tasksQuery = query(tasksRef, orderByChild('projectId'), equalTo(projectId));
    const tasksUnsubscribe = onValue(tasksQuery, (snapshot) => {
      const tasksData: Task[] = [];
      if (snapshot.exists()) {
        snapshot.forEach((childSnapshot) => {
          tasksData.push({
            id: childSnapshot.key!,
            ...childSnapshot.val(),
            dueDate: childSnapshot.val().dueDate ? new Date(childSnapshot.val().dueDate) : undefined,
            createdAt: new Date(childSnapshot.val().createdAt),
            updatedAt: new Date(childSnapshot.val().updatedAt)
          });
        });
      }
      setTasks(tasksData);
    });
    unsubscribes.push(tasksUnsubscribe);

    // Load Daily Standups
    const standupsRef = ref(database, 'dailyStandups');
    const standupsQuery = query(standupsRef, orderByChild('projectId'), equalTo(projectId));
    const standupsUnsubscribe = onValue(standupsQuery, (snapshot) => {
      const standupsData: DailyStandup[] = [];
      if (snapshot.exists()) {
        snapshot.forEach((childSnapshot) => {
          standupsData.push({
            id: childSnapshot.key!,
            ...childSnapshot.val(),
            date: new Date(childSnapshot.val().date)
          });
        });
      }
      setStandups(standupsData);
    });
    unsubscribes.push(standupsUnsubscribe);

    // Load Risks
    const risksRef = ref(database, 'risks');
    const risksQuery = query(risksRef, orderByChild('projectId'), equalTo(projectId));
    const risksUnsubscribe = onValue(risksQuery, (snapshot) => {
      const risksData: Risk[] = [];
      if (snapshot.exists()) {
        snapshot.forEach((childSnapshot) => {
          risksData.push({
            id: childSnapshot.key!,
            ...childSnapshot.val(),
            createdAt: new Date(childSnapshot.val().createdAt),
            updatedAt: new Date(childSnapshot.val().updatedAt)
          });
        });
      }
      setRisks(risksData);
    });
    unsubscribes.push(risksUnsubscribe);

    // Load Stakeholders
    const stakeholdersRef = ref(database, 'stakeholders');
    const stakeholdersUnsubscribe = onValue(stakeholdersRef, (snapshot) => {
      const stakeholdersData: Stakeholder[] = [];
      if (snapshot.exists()) {
        snapshot.forEach((childSnapshot) => {
          const stakeholder = childSnapshot.val();
          if (stakeholder.projectIds && stakeholder.projectIds.includes(projectId)) {
            stakeholdersData.push({
              id: childSnapshot.key!,
              ...stakeholder,
              createdAt: new Date(stakeholder.createdAt),
              updatedAt: new Date(stakeholder.updatedAt)
            });
          }
        });
      }
      setStakeholders(stakeholdersData);
    });
    unsubscribes.push(stakeholdersUnsubscribe);

    setLoading(false);

    return () => {
      unsubscribes.forEach(unsubscribe => unsubscribe());
    };
  }, [projectId, currentUser]);

  // CRUD Operations
  const createEpic = async (epicData: Omit<Epic, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const epicsRef = ref(database, 'epics');
      const newEpic = {
        ...epicData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      await push(epicsRef, newEpic);
      toast.success('Epic created successfully');
    } catch (error) {
      console.error('Error creating epic:', error);
      toast.error('Failed to create epic');
    }
  };

  const createUserStory = async (storyData: Omit<UserStory, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const storiesRef = ref(database, 'userStories');
      const newStory = {
        ...storyData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      await push(storiesRef, newStory);
      toast.success('User story created successfully');
    } catch (error) {
      console.error('Error creating user story:', error);
      toast.error('Failed to create user story');
    }
  };

  const createSprint = async (sprintData: Omit<Sprint, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const sprintsRef = ref(database, 'sprints');
      const newSprint = {
        ...sprintData,
        startDate: sprintData.startDate.toISOString(),
        endDate: sprintData.endDate.toISOString(),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      await push(sprintsRef, newSprint);
      toast.success('Sprint created successfully');
    } catch (error) {
      console.error('Error creating sprint:', error);
      toast.error('Failed to create sprint');
    }
  };

  const createTask = async (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const tasksRef = ref(database, 'agileTasks');
      const newTask = {
        ...taskData,
        dueDate: taskData.dueDate?.toISOString(),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      await push(tasksRef, newTask);
      toast.success('Task created successfully');
    } catch (error) {
      console.error('Error creating task:', error);
      toast.error('Failed to create task');
    }
  };

  const updateStoryStatus = async (storyId: string, status: UserStory['status']) => {
    try {
      const storyRef = ref(database, `userStories/${storyId}`);
      await update(storyRef, { 
        status,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating story status:', error);
      toast.error('Failed to update story status');
    }
  };

  const updateTaskStatus = async (taskId: string, status: Task['status']) => {
    try {
      const taskRef = ref(database, `agileTasks/${taskId}`);
      await update(taskRef, { 
        status,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating task status:', error);
      toast.error('Failed to update task status');
    }
  };

  const addDailyStandup = async (standupData: Omit<DailyStandup, 'id'>) => {
    try {
      const standupsRef = ref(database, 'dailyStandups');
      const newStandup = {
        ...standupData,
        date: standupData.date.toISOString()
      };
      await push(standupsRef, newStandup);
      toast.success('Daily standup logged successfully');
    } catch (error) {
      console.error('Error adding daily standup:', error);
      toast.error('Failed to log daily standup');
    }
  };

  const createRisk = async (riskData: Omit<Risk, 'id' | 'createdAt' | 'updatedAt' | 'riskScore'>) => {
    try {
      const risksRef = ref(database, 'risks');
      const newRisk = {
        ...riskData,
        riskScore: riskData.probability * riskData.impact,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      await push(risksRef, newRisk);
      toast.success('Risk created successfully');
    } catch (error) {
      console.error('Error creating risk:', error);
      toast.error('Failed to create risk');
    }
  };

  const createStakeholder = async (stakeholderData: Omit<Stakeholder, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const stakeholdersRef = ref(database, 'stakeholders');
      const newStakeholder = {
        ...stakeholderData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      await push(stakeholdersRef, newStakeholder);
      toast.success('Stakeholder created successfully');
    } catch (error) {
      console.error('Error creating stakeholder:', error);
      toast.error('Failed to create stakeholder');
    }
  };

  return {
    epics,
    stories,
    sprints,
    tasks,
    standups,
    risks,
    stakeholders,
    loading,
    createEpic,
    createUserStory,
    createSprint,
    createTask,
    updateStoryStatus,
    updateTaskStatus,
    addDailyStandup,
    createRisk,
    createStakeholder
  };
};