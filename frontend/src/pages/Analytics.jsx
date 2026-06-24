import React, { useState, useEffect } from 'react';
import { applicationService } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  ResponsiveContainer, BarChart, Bar, LineChart, Line, AreaChart, Area,
  PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend
} from 'recharts';
import { BarChart3, AlertCircle, TrendingUp, Award, Activity, Percent } from 'lucide-react';

const Analytics = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await applicationService.getStats();
      setStats(response.data.stats);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch analytics statistics. Make sure database is seeded and server is up.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Calculating recruitment funnel statistics..." />;
  }

  if (error || !stats) {
    return (
      <div className="text-center p-12 glass-panel rounded-3xl border border-red-500/20 text-red-400">
        <AlertCircle className="mx-auto w-12 h-12 mb-4 opacity-80" />
        <h3 className="text-lg font-bold">Analytics Failure</h3>
        <p className="text-sm mt-1">{error || 'Stats details not initialized.'}</p>
      </div>
    );
  }

  // Pre-process conversion funnel in standard chronological order
  const getFunnelData = () => {
    const stages = ['Applied', 'Shortlisted', 'OA', 'Interview', 'Offer'];
    const distribution = stats.statusDistribution;
    
    return stages.map(stage => {
      const found = distribution.find(d => d.status === stage);
      return {
        stage,
        count: found ? found.count : 0,
      };
    });
  };

  const funnelData = getFunnelData();

  // Status Distribution Data & Color mapping
  const statusColors = {
    Applied: '#3B82F6',      // Blue
    Shortlisted: '#8B5CF6',  // Indigo/Purple
    OA: '#F59E0B',           // Amber/Gold
    Interview: '#EC4899',    // Pink
    Offer: '#10B981',        // Emerald/Green
    Rejected: '#EF4444',     // Red
    Withdrawn: '#6B7280',    // Gray
  };

  const pieData = stats.statusDistribution.filter(d => d.count > 0);

  // Compute conversion percentage
  const totalApplied = funnelData[0]?.count || 0;
  const totalOffers = funnelData[4]?.count || 0;
  const conversionRate = totalApplied > 0 ? ((totalOffers / totalApplied) * 100).toFixed(1) : '0';

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
          <BarChart3 className="text-brand-primary" />
          Analytics Dashboard
        </h1>
        <p className="text-sm text-gray-400 mt-1">Aggregated statistics of your recruitment pipeline stages</p>
      </div>

      {/* Analytics KPI banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-panel rounded-3xl p-6 border border-brand-border/60 flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
            <Activity size={24} />
          </div>
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Total Applications</p>
            <h3 className="text-3xl font-black text-white mt-1">{stats.totalApplications}</h3>
          </div>
        </div>

        <div className="glass-panel rounded-3xl p-6 border border-brand-border/60 flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <Award size={24} />
          </div>
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Offers Secured</p>
            <h3 className="text-3xl font-black text-white mt-1">{totalOffers}</h3>
          </div>
        </div>

        <div className="glass-panel rounded-3xl p-6 border border-brand-border/60 flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-teal-500/10 border border-teal-500/20 text-teal-400 flex items-center justify-center">
            <Percent size={24} />
          </div>
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Conversion Rate</p>
            <h3 className="text-3xl font-black text-white mt-1">{conversionRate}%</h3>
          </div>
        </div>
      </div>

      {/* Charts Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Funnel chart */}
        <div className="glass-panel rounded-3xl p-6 border border-brand-border/60 space-y-4">
          <div>
            <h3 className="text-lg font-bold text-white leading-tight">Pipeline Conversion Funnel</h3>
            <p className="text-xs text-gray-400 mt-1">Application progression from submission to offer</p>
          </div>
          <div className="h-80 w-full pr-4 text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={funnelData}
                layout="vertical"
                margin={{ top: 10, right: 10, left: 10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#232E4A" horizontal={false} />
                <XAxis type="number" stroke="#9CA3AF" />
                <YAxis dataKey="stage" type="category" stroke="#9CA3AF" width={80} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#151D30', borderColor: '#232E4A' }}
                  labelStyle={{ color: '#fff', fontWeight: 'bold' }}
                />
                <Bar dataKey="count" radius={[0, 8, 8, 0]}>
                  {funnelData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={statusColors[entry.stage] || '#6366F1'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status distribution Pie */}
        <div className="glass-panel rounded-3xl p-6 border border-brand-border/60 space-y-4">
          <div>
            <h3 className="text-lg font-bold text-white leading-tight">Applications by Status</h3>
            <p className="text-xs text-gray-400 mt-1">Status proportions of all registered items</p>
          </div>
          <div className="h-80 flex flex-col sm:flex-row items-center justify-center gap-6">
            {pieData.length === 0 ? (
              <p className="text-sm text-gray-500">No active applications to show.</p>
            ) : (
              <>
                <div className="h-full w-full sm:w-3/5 text-xs">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={5}
                        dataKey="count"
                        nameKey="status"
                        labelLine={false}
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={statusColors[entry.status] || '#6B7280'} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ backgroundColor: '#151D30', borderColor: '#232E4A' }}
                        itemStyle={{ color: '#fff' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                {/* Custom Legend */}
                <div className="w-full sm:w-2/5 flex flex-col gap-2 border-l border-brand-border/40 pl-6 text-xs">
                  {pieData.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: statusColors[item.status] }}></span>
                      <span className="text-gray-400 font-medium">{item.status} ({item.count})</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Applications Over Time Line/Area */}
        <div className="glass-panel rounded-3xl p-6 border border-brand-border/60 space-y-4">
          <div>
            <h3 className="text-lg font-bold text-white leading-tight flex items-center gap-1.5">
              <TrendingUp size={18} className="text-brand-secondary" />
              Applications Over Time
            </h3>
            <p className="text-xs text-gray-400 mt-1">Timeline logs of submitted applications</p>
          </div>
          <div className="h-80 w-full pr-4 text-xs">
            {stats.timelineData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-sm text-gray-500">No submission records.</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={stats.timelineData}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#14B8A6" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#14B8A6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#232E4A" vertical={false} />
                  <XAxis dataKey="date" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#151D30', borderColor: '#232E4A' }}
                    labelStyle={{ color: '#fff', fontWeight: 'bold' }}
                  />
                  <Area type="monotone" dataKey="count" stroke="#14B8A6" fillOpacity={1} fill="url(#colorCount)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Company volumes & salary comparison */}
        <div className="glass-panel rounded-3xl p-6 border border-brand-border/60 space-y-4">
          <div>
            <h3 className="text-lg font-bold text-white leading-tight">Company Analytics</h3>
            <p className="text-xs text-gray-400 mt-1">Top companies by volume and average package</p>
          </div>
          <div className="h-80 w-full pr-4 text-xs">
            {stats.companyData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-sm text-gray-500">No company details registered.</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={stats.companyData}
                  margin={{ top: 20, right: 10, left: -10, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#232E4A" vertical={false} />
                  <XAxis dataKey="companyName" stroke="#9CA3AF" />
                  <YAxis yAxisId="left" stroke="#6366F1" orientation="left" label={{ value: 'Applications', angle: -90, position: 'insideLeft', fill: '#6366F1', offset: 0 }} />
                  <YAxis yAxisId="right" stroke="#A855F7" orientation="right" label={{ value: 'Avg Salary ($)', angle: 90, position: 'insideRight', fill: '#A855F7', offset: 0 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#151D30', borderColor: '#232E4A' }}
                    labelStyle={{ color: '#fff', fontWeight: 'bold' }}
                  />
                  <Legend verticalAlign="top" height={36}/>
                  <Bar yAxisId="left" dataKey="count" name="Applications" fill="#6366F1" radius={[6, 6, 0, 0]} />
                  <Bar yAxisId="right" dataKey="avgSalary" name="Avg Salary" fill="#A855F7" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
