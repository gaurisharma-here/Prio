import { useState } from "react";
import { Zap, Loader2, Calendar, Clock } from "lucide-react";
import api from "../api/axios";

const ScheduleGenerator = () => {
  const [availableHours, setAvailableHours] = useState(4);
  const [loading, setLoading] = useState(false);
  const [schedule, setSchedule] = useState(null);
  const [error, setError] = useState(null);

  const handleGenerateSchedule = async () => {
    if (availableHours <= 0) {
      setError("Available hours must be greater than 0");
      return;
    }

    setLoading(true);
    setError(null);
    setSchedule(null);

    try {
      const response = await api.post("/schedule/generate", {
        available_hours_per_day: availableHours,
      });
      setSchedule(response.data);
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to generate schedule");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border dark:border-gray-700">
        <div className="flex items-center space-x-2 mb-4">
          <Zap className="w-5 h-5 text-yellow-500" />
          <h2 className="text-2xl font-bold">AI Schedule Generator</h2>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Available Hours Per Day
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                min="0.5"
                step="0.5"
                value={availableHours}
                onChange={(e) => setAvailableHours(parseFloat(e.target.value))}
                className="flex-1 px-4 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                placeholder="e.g. 4"
              />
              <button
                onClick={handleGenerateSchedule}
                disabled={loading}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400 transition-colors flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Generating...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4" />
                    <span>Generate Schedule</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 rounded-md text-red-700 dark:text-red-400">
              {error}
            </div>
          )}
        </div>
      </div>

      {schedule && schedule.schedule && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Your Generated Schedule</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {schedule.schedule.map((day, index) => (
              <div
                key={index}
                className="bg-white dark:bg-gray-800 p-4 rounded-lg border dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="font-semibold text-lg">Day {day.day}</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {day.date}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-sm font-semibold text-blue-600 dark:text-blue-400">
                      <Clock className="w-4 h-4" />
                      {day.total_hours}h
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  {day.tasks && day.tasks.length > 0 ? (
                    day.tasks.map((task, taskIndex) => (
                      <div
                        key={taskIndex}
                        className="bg-gray-50 dark:bg-gray-700 p-2 rounded text-sm flex justify-between items-center"
                      >
                        <span className="font-medium text-gray-800 dark:text-gray-200">
                          {task.task_title}
                        </span>
                        <span className="text-gray-600 dark:text-gray-400 text-xs font-semibold">
                          {task.hours}h
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                      No tasks scheduled
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ScheduleGenerator;
