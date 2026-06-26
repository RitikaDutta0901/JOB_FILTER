import { CheckCircle2, Circle, Target, CalendarDays } from 'lucide-react';

const InterviewRoadmap = ({ roadmap, onToggleTopic, updatingTopicId }) => {
  if (!roadmap || !roadmap.topics || roadmap.topics.length === 0) {
    return (
      <div className="glass-panel rounded-3xl p-6 md:p-8 border border-brand-border/60">
        <p className="text-sm text-gray-500 text-center">No interview roadmap available yet.</p>
      </div>
    );
  }

  const topicsByWeek = roadmap.topics.reduce((acc, topic) => {
    if (!acc[topic.week_number]) acc[topic.week_number] = [];
    acc[topic.week_number].push(topic);
    return acc;
  }, {});

  return (
    <div className="glass-panel rounded-3xl p-6 md:p-8 space-y-6 border border-brand-border/60">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 border-b border-brand-border/60 pb-4">
        <div>
          <h3 className="font-bold text-white text-lg tracking-tight flex items-center gap-2">
            <Target size={18} className="text-brand-secondary" aria-hidden="true" />
            Interview Preparation Roadmap
          </h3>
          <p className="text-xs text-gray-400 mt-1">{roadmap.roleFocus} focused plan</p>
        </div>
        <div className="min-w-32">
          <div className="flex items-end justify-between gap-3">
            <span className="text-3xl font-black text-white">{roadmap.completionPercentage}%</span>
            <span className="text-xs text-gray-400 pb-1">
              {roadmap.completedTopics}/{roadmap.totalTopics}
            </span>
          </div>
          <div className="h-2 bg-brand-dark rounded-full overflow-hidden border border-brand-border/60 mt-2">
            <div
              className="h-full bg-brand-secondary transition-all duration-300"
              style={{ width: `${roadmap.completionPercentage}%` }}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {roadmap.weeklyProgress.map((week) => (
          <div key={week.weekNumber} className="bg-brand-dark/30 border border-brand-border/40 rounded-2xl p-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-400 font-semibold flex items-center gap-1">
                <CalendarDays size={12} className="text-gray-500" aria-hidden="true" />
                Week {week.weekNumber}
              </span>
              <span className="text-brand-secondary font-bold">{week.completionPercentage}%</span>
            </div>
            <div className="h-1.5 bg-brand-border/70 rounded-full overflow-hidden mt-2">
              <div
                className="h-full bg-brand-primary"
                style={{ width: `${week.completionPercentage}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-5">
        {Object.entries(topicsByWeek).map(([weekNumber, topics]) => (
          <div key={weekNumber} className="space-y-3">
            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Week {weekNumber}
            </h4>
            <div className="space-y-2">
              {topics.map((topic) => (
                <button
                  key={topic.id}
                  type="button"
                  onClick={() => onToggleTopic(topic)}
                  disabled={updatingTopicId === topic.id}
                  className={`w-full text-left rounded-2xl p-4 border transition-all flex items-start gap-3 ${
                    topic.is_completed
                      ? 'bg-emerald-500/5 border-emerald-500/20'
                      : 'bg-brand-dark/30 border-brand-border/50 hover:border-brand-primary/30'
                  } disabled:opacity-60`}
                >
                  <span className="mt-0.5 shrink-0">
                    {topic.is_completed ? (
                      <CheckCircle2 size={18} className="text-emerald-400" aria-hidden="true" />
                    ) : (
                      <Circle size={18} className="text-gray-500" aria-hidden="true" />
                    )}
                  </span>
                  <span className="space-y-1 min-w-0">
                    <span className={`block text-sm font-bold ${topic.is_completed ? 'text-emerald-300' : 'text-gray-100'}`}>
                      {topic.topic}
                    </span>
                    <span className="block text-xs text-gray-400 leading-relaxed">
                      {topic.description}
                    </span>
                  </span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InterviewRoadmap;
