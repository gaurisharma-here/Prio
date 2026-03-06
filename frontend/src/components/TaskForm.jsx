import { useState } from 'react';
import { Plus, X } from 'lucide-react';

const TaskForm = ({ onTaskCreated, onClose }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    deadline: '',
    tags: '',
    project: '',
    estimated_hours: 1.0
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const taskData = {
      ...formData,
      estimated_hours: parseFloat(formData.estimated_hours),
      tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag !== '')
    };
    onTaskCreated(taskData);
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border dark:border-gray-700">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold">Create New Task</h3>
        {onClose && (
          <button onClick={onClose} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Title</label>
          <input
            required
            className="w-full px-4 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
            value={formData.title}
            onChange={(e) => setFormData({...formData, title: e.target.value})}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea
            className="w-full px-4 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
            rows="3"
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Priority</label>
            <select
              className="w-full px-4 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
              value={formData.priority}
              onChange={(e) => setFormData({...formData, priority: e.target.value})}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Deadline</label>
            <input
              type="datetime-local"
              className="w-full px-4 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
              value={formData.deadline}
              onChange={(e) => setFormData({...formData, deadline: e.target.value})}
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Project</label>
            <input
              className="w-full px-4 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
              value={formData.project}
              onChange={(e) => setFormData({...formData, project: e.target.value})}
              placeholder="e.g. Work, Personal"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Estimated Hours</label>
            <input
              type="number"
              min="0.5"
              step="0.5"
              className="w-full px-4 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
              value={formData.estimated_hours}
              onChange={(e) => setFormData({...formData, estimated_hours: e.target.value})}
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Tags (comma separated)</label>
          <input
            className="w-full px-4 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
            value={formData.tags}
            onChange={(e) => setFormData({...formData, tags: e.target.value})}
            placeholder="e.g. urgent, feature"
          />
        </div>
        <button
          type="submit"
          className="w-full py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center justify-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>Create Task</span>
        </button>
      </form>
    </div>
  );
};


export default TaskForm;
