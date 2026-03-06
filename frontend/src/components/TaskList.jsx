import { CheckCircle, Circle, Trash2, Clock, Tag, Briefcase } from 'lucide-react';
import { format } from 'date-fns';

const TaskList = ({ tasks, onToggleStatus, onDelete }) => {
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100 dark:bg-red-900/20';
      case 'medium': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20';
      case 'low': return 'text-green-600 bg-green-100 dark:bg-green-900/20';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20';
    }
  };

  if (tasks.length === 0) {
    return (
      <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-dashed dark:border-gray-700">
        <p className="text-gray-500">No tasks found. Create one to get started!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {tasks.map((task) => (
        <div 
          key={task.id} 
          className="flex items-start p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 hover:shadow-md transition-shadow"
        >
          <button 
            onClick={() => onToggleStatus(task)}
            className="mt-1 mr-4 focus:outline-none"
          >
            {task.status === 'completed' ? (
              <CheckCircle className="w-6 h-6 text-green-500" />
            ) : (
              <Circle className="w-6 h-6 text-gray-300 hover:text-blue-500" />
            )}
          </button>
          
          <div className="flex-grow">
            <div className="flex items-center space-x-2">
              <h4 className={`text-lg font-medium ${task.status === 'completed' ? 'line-through text-gray-400' : ''}`}>
                {task.title}
              </h4>
              <span className={`px-2 py-0.5 rounded text-xs font-semibold uppercase ${getPriorityColor(task.priority)}`}>
                {task.priority}
              </span>
              {task.ai_priority_score && (
                <span className="text-[10px] bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded-full font-bold">
                  AI: {task.ai_priority_score.toFixed(1)}
                </span>
              )}
            </div>
            
            {task.description && (
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                {task.description}
              </p>
            )}
            
            <div className="mt-3 flex flex-wrap gap-4 text-xs text-gray-500">
              {task.deadline && (
                <div className="flex items-center">
                  <Clock className="w-3.5 h-3.5 mr-1" />
                  <span>{format(new Date(task.deadline), 'MMM d, h:mm a')}</span>
                </div>
              )}
              {task.project && (
                <div className="flex items-center">
                  <Briefcase className="w-3.5 h-3.5 mr-1" />
                  <span>{task.project}</span>
                </div>
              )}
              {task.tags?.length > 0 && (
                <div className="flex items-center">
                  <Tag className="w-3.5 h-3.5 mr-1" />
                  <div className="flex gap-1">
                    {task.tags.map(tag => (
                      <span key={tag} className="bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <button 
            onClick={() => onDelete(task.id)}
            className="p-2 text-gray-400 hover:text-red-500 transition-colors"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      ))}
    </div>
  );
};

export default TaskList;
