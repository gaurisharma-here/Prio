import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';

const Analytics = ({ summary, trends, insights }) => {
  const pieData = summary ? [
    { name: 'Completed', value: summary.completed, color: '#10B981' },
    { name: 'Pending', value: summary.pending, color: '#6366F1' },
  ] : [];

  const priorityData = summary ? Object.entries(summary.priority_distribution).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    count: value
  })) : [];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border dark:border-gray-700">
        <h3 className="text-lg font-semibold mb-4">Task Status</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex justify-center space-x-6 mt-2 text-sm">
          {pieData.map(d => (
            <div key={d.name} className="flex items-center">
              <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: d.color }}></div>
              <span>{d.name}: {d.value}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border dark:border-gray-700">
        <h3 className="text-lg font-semibold mb-4">Productivity (Last 7 Days)</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={trends}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 10 }} />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="completed_count" fill="#3B82F6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border dark:border-gray-700">
        <h3 className="text-lg font-semibold mb-4">Priority Distribution</h3>
        <div className="space-y-4">
          {priorityData.length > 0 ? priorityData.map(p => (
            <div key={p.name}>
              <div className="flex justify-between text-sm mb-1">
                <span>{p.name}</span>
                <span className="font-semibold">{p.count}</span>
              </div>
              <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full" 
                  style={{ width: `${(p.count / summary.total) * 100}%` }}
                ></div>
              </div>
            </div>
          )) : (
            <p className="text-gray-500 text-sm">No data available</p>
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border dark:border-gray-700 md:col-span-2 lg:col-span-3">
        <h3 className="text-lg font-semibold mb-4">AI Productivity Insights</h3>
        {insights ? (
          <div className="space-y-4">
            <p className="text-sm text-gray-700 dark:text-gray-300">{insights.ai_message}</p>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3">
                <p className="text-xs text-gray-500">Total Tasks</p>
                <p className="text-lg font-semibold">{insights.total_tasks}</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3">
                <p className="text-xs text-gray-500">Completed</p>
                <p className="text-lg font-semibold">{insights.completed_tasks}</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3">
                <p className="text-xs text-gray-500">Pending</p>
                <p className="text-lg font-semibold">{insights.pending_tasks}</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3">
                <p className="text-xs text-gray-500">High Priority</p>
                <p className="text-lg font-semibold">{insights.high_priority_tasks}</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3">
                <p className="text-xs text-gray-500">Due in 3 Days</p>
                <p className="text-lg font-semibold">{insights.upcoming_deadlines}</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3">
                <p className="text-xs text-gray-500">Avg Est. Hours</p>
                <p className="text-lg font-semibold">{insights.average_estimated_hours}</p>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-gray-500 text-sm">Loading insights...</p>
        )}
      </div>
    </div>
  );
};

export default Analytics;
