import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { 
  Plus, 
  User, 
  Clock, 
  Flag, 
  MessageSquare, 
  MoreHorizontal,
  Edit,
  Trash2
} from 'lucide-react';
import { UserStory, Task } from '../../types/agile';
import Button from '../UI/Button';

interface ScrumBoardProps {
  stories: UserStory[];
  tasks: Task[];
  onUpdateStoryStatus: (storyId: string, status: UserStory['status']) => void;
  onUpdateTaskStatus: (taskId: string, status: Task['status']) => void;
  onCreateStory: () => void;
  onCreateTask: () => void;
  onEditStory: (story: UserStory) => void;
  onEditTask: (task: Task) => void;
}

const ScrumBoard: React.FC<ScrumBoardProps> = ({
  stories,
  tasks,
  onUpdateStoryStatus,
  onUpdateTaskStatus,
  onCreateStory,
  onCreateTask,
  onEditStory,
  onEditTask
}) => {
  const [viewMode, setViewMode] = useState<'stories' | 'tasks'>('stories');

  const columns = [
    { id: 'todo', title: 'To Do', color: 'bg-gray-100 dark:bg-gray-800' },
    { id: 'in_progress', title: 'In Progress', color: 'bg-blue-100 dark:bg-blue-900/30' },
    { id: 'done', title: 'Done', color: 'bg-green-100 dark:bg-green-900/30' }
  ];

  const getItemsByStatus = (status: string) => {
    if (viewMode === 'stories') {
      return stories.filter(story => story.status === status || 
        (status === 'todo' && story.status === 'backlog'));
    } else {
      return tasks.filter(task => task.status === status);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const handleDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (destination.droppableId === source.droppableId) return;

    const newStatus = destination.droppableId as UserStory['status'] | Task['status'];

    if (viewMode === 'stories') {
      const mappedStatus = newStatus === 'todo' ? 'backlog' : newStatus;
      onUpdateStoryStatus(draggableId, mappedStatus as UserStory['status']);
    } else {
      onUpdateTaskStatus(draggableId, newStatus as Task['status']);
    }
  };

  const renderStoryCard = (story: UserStory, index: number) => (
    <Draggable key={story.id} draggableId={story.id} index={index}>
      {(provided, snapshot) => (
        <motion.div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`bg-surface p-4 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all cursor-pointer ${
            snapshot.isDragging ? 'rotate-3 shadow-lg' : ''
          }`}
        >
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${getPriorityColor(story.priority)}`} />
              <span className="text-xs font-medium text-muted">
                {story.storyPoints} pts
              </span>
            </div>
            <div className="flex items-center space-x-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEditStory(story);
                }}
                className="p-1 text-muted hover:text-primary transition-colors"
              >
                <Edit className="w-3 h-3" />
              </button>
              <button className="p-1 text-muted hover:text-primary transition-colors">
                <MoreHorizontal className="w-3 h-3" />
              </button>
            </div>
          </div>

          <h4 className="font-semibold text-primary text-sm mb-2 line-clamp-2">
            {story.title}
          </h4>

          <p className="text-xs text-secondary mb-3 line-clamp-2">
            As a {story.asA}, I want {story.iWant}
          </p>

          <div className="flex items-center justify-between text-xs text-muted">
            <div className="flex items-center space-x-2">
              <MessageSquare className="w-3 h-3" />
              <span>{story.acceptanceCriteria.length}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Clock className="w-3 h-3" />
              <span>{story.tasks.length} tasks</span>
            </div>
          </div>
        </motion.div>
      )}
    </Draggable>
  );

  const renderTaskCard = (task: Task, index: number) => (
    <Draggable key={task.id} draggableId={task.id} index={index}>
      {(provided, snapshot) => (
        <motion.div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`bg-surface p-4 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all cursor-pointer ${
            snapshot.isDragging ? 'rotate-3 shadow-lg' : ''
          }`}
        >
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${getPriorityColor(task.priority)}`} />
              <span className="text-xs font-medium text-muted">
                {task.estimatedHours}h
              </span>
            </div>
            <div className="flex items-center space-x-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEditTask(task);
                }}
                className="p-1 text-muted hover:text-primary transition-colors"
              >
                <Edit className="w-3 h-3" />
              </button>
              <button className="p-1 text-muted hover:text-primary transition-colors">
                <MoreHorizontal className="w-3 h-3" />
              </button>
            </div>
          </div>

          <h4 className="font-semibold text-primary text-sm mb-2 line-clamp-2">
            {task.title}
          </h4>

          <p className="text-xs text-secondary mb-3 line-clamp-2">
            {task.description}
          </p>

          <div className="flex items-center justify-between text-xs text-muted">
            {task.assignedTo && (
              <div className="flex items-center space-x-1">
                <User className="w-3 h-3" />
                <span>Assigned</span>
              </div>
            )}
            {task.dueDate && (
              <div className="flex items-center space-x-1">
                <Clock className="w-3 h-3" />
                <span>{new Date(task.dueDate).toLocaleDateString()}</span>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </Draggable>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h2 className="text-2xl font-bold text-primary">Scrum Board</h2>
          <div className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            <button
              onClick={() => setViewMode('stories')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'stories'
                  ? 'bg-blue-600 text-white'
                  : 'text-secondary hover:text-primary'
              }`}
            >
              Stories
            </button>
            <button
              onClick={() => setViewMode('tasks')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'tasks'
                  ? 'bg-blue-600 text-white'
                  : 'text-secondary hover:text-primary'
              }`}
            >
              Tasks
            </button>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            onClick={viewMode === 'stories' ? onCreateStory : onCreateTask}
            icon={Plus}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Add {viewMode === 'stories' ? 'Story' : 'Task'}
          </Button>
        </div>
      </div>

      {/* Board */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {columns.map((column) => {
            const items = getItemsByStatus(column.id);
            
            return (
              <div key={column.id} className="space-y-4">
                <div className={`p-4 rounded-lg ${column.color}`}>
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-primary">
                      {column.title}
                    </h3>
                    <span className="text-sm text-muted bg-white dark:bg-gray-700 px-2 py-1 rounded-full">
                      {items.length}
                    </span>
                  </div>
                </div>

                <Droppable droppableId={column.id}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`min-h-[400px] space-y-3 p-2 rounded-lg transition-colors ${
                        snapshot.isDraggingOver 
                          ? 'bg-blue-50 dark:bg-blue-900/20 border-2 border-dashed border-blue-300' 
                          : ''
                      }`}
                    >
                      <AnimatePresence>
                        {items.map((item, index) => 
                          viewMode === 'stories' 
                            ? renderStoryCard(item as UserStory, index)
                            : renderTaskCard(item as Task, index)
                        )}
                      </AnimatePresence>
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            );
          })}
        </div>
      </DragDropContext>
    </div>
  );
};

export default ScrumBoard;