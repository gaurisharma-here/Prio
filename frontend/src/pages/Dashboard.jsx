import { useState, useEffect } from "react";
import api from "../api/axios";
import TaskList from "../components/TaskList";
import TaskForm from "../components/TaskForm";
import Analytics from "../components/Analytics";
import ScheduleGenerator from "../components/ScheduleGenerator";
import {
  LayoutDashboard,
  ListTodo,
  Plus,
  Sparkles,
  Filter,
  Zap,
} from "lucide-react";

const Dashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [summary, setSummary] = useState(null);
  const [trends, setTrends] = useState([]);
  const [insights, setInsights] = useState(null);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("list"); // 'list', 'analytics', or 'schedule'
  const [filter, setFilter] = useState("all");

  const fetchData = async () => {
    try {
      const [tasksRes, summaryRes, trendsRes, insightsRes] = await Promise.all([
        api.get("/tasks/"),
        api.get("/analytics/summary"),
        api.get("/analytics/productivity-trends"),
        api.get("/ai/insights"),
      ]);
      setTasks(tasksRes.data);
      setSummary(summaryRes.data);
      setTrends(trendsRes.data);
      setInsights(insightsRes.data);
    } catch (err) {
      console.error("Error fetching data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateTask = async (taskData) => {
    try {
      await api.post("/tasks/", taskData);
      setShowTaskForm(false);
      fetchData();
    } catch (err) {
      console.error("Error creating task", err);
    }
  };

  const handleToggleStatus = async (task) => {
    try {
      const newStatus = task.status === "completed" ? "todo" : "completed";
      await api.put(`/tasks/${task.id}`, { status: newStatus });
      fetchData();
    } catch (err) {
      console.error("Error updating task", err);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      try {
        await api.delete(`/tasks/${taskId}`);
        fetchData();
      } catch (err) {
        console.error("Error deleting task", err);
      }
    }
  };

  const handleGetAIPriority = async () => {
    try {
      setLoading(true);
      const res = await api.get("/analytics/prioritized-tasks");
      setTasks(res.data);
    } catch (err) {
      console.error("Error getting AI priority", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredTasks = tasks.filter((t) => {
    if (filter === "completed") return t.status === "completed";
    if (filter === "pending") return t.status !== "completed";
    return true;
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">My Dashboard</h1>
          <p className="text-gray-500">Track and manage your productivity</p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setView("list")}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${view === "list" ? "bg-blue-600 text-white" : "bg-white dark:bg-gray-800 hover:bg-gray-50"}`}
          >
            <ListTodo className="w-4 h-4" />
            <span>Tasks</span>
          </button>
          <button
            onClick={() => setView("analytics")}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${view === "analytics" ? "bg-blue-600 text-white" : "bg-white dark:bg-gray-800 hover:bg-gray-50"}`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Analytics</span>
          </button>
          <button
            onClick={() => setView("schedule")}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${view === "schedule" ? "bg-blue-600 text-white" : "bg-white dark:bg-gray-800 hover:bg-gray-50"}`}
          >
            <Zap className="w-4 h-4" />
            <span>Schedule</span>
          </button>
          <button
            onClick={() => setShowTaskForm(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>New Task</span>
          </button>
        </div>
      </div>

      {view === "analytics" ? (
        <Analytics summary={summary} trends={trends} insights={insights} />
      ) : view === "schedule" ? (
        <ScheduleGenerator />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border dark:border-gray-700">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Filter className="w-4 h-4 text-gray-400" />
                  <select
                    className="bg-transparent text-sm font-medium focus:outline-none"
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                  >
                    <option value="all">All Tasks</option>
                    <option value="pending">Pending</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>

              <button
                onClick={handleGetAIPriority}
                className="flex items-center space-x-1 text-sm font-semibold text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 px-3 py-1.5 rounded-lg transition-colors"
              >
                <Sparkles className="w-4 h-4" />
                <span>AI Prioritize</span>
              </button>
            </div>

            {loading ? (
              <div className="text-center py-12">Loading tasks...</div>
            ) : (
              <TaskList
                tasks={filteredTasks}
                onToggleStatus={handleToggleStatus}
                onDelete={handleDeleteTask}
              />
            )}
          </div>

          <div className="space-y-6">
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-6 rounded-2xl text-white shadow-lg">
              <h3 className="text-lg font-semibold mb-2">Daily Progress</h3>
              <div className="text-4xl font-bold mb-4">
                {summary?.completion_rate?.toFixed(0) || 0}%
              </div>
              <div className="w-full bg-white/20 rounded-full h-3 mb-2">
                <div
                  className="bg-white h-3 rounded-full"
                  style={{ width: `${summary?.completion_rate || 0}%` }}
                ></div>
              </div>
              <p className="text-sm text-blue-100">
                {summary?.completed} of {summary?.total} tasks completed
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border dark:border-gray-700">
              <h3 className="text-lg font-semibold mb-4">Quick Stats</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 text-sm">
                    Upcoming Deadlines
                  </span>
                  <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-1 rounded-full">
                    {insights?.upcoming_deadlines ?? 0}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 text-sm">
                    Current Projects
                  </span>
                  <span className="bg-blue-100 text-blue-600 text-xs font-bold px-2 py-1 rounded-full">
                    {summary
                      ? Object.keys(summary.priority_distribution).length
                      : 0}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showTaskForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-2xl">
            <TaskForm
              onTaskCreated={handleCreateTask}
              onClose={() => setShowTaskForm(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
