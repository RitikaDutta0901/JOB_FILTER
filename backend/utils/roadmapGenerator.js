const normalize = (value) => (value || '').toLowerCase();

const detectRoleFocus = ({ jobTitle = '', jobDescription = '' }) => {
  const text = `${normalize(jobTitle)} ${normalize(jobDescription)}`;

  if (/\b(data|machine learning|ml|analytics|analyst|scientist|etl|warehouse|pandas|spark)\b/.test(text)) {
    return 'Data';
  }
  if (/\b(full.?stack|product engineer|node.*react|react.*node|rails.*react|react.*rails)\b/.test(text)) {
    return 'Full Stack';
  }
  if (/\b(frontend|front-end|react|vue|angular|ui|ux|javascript|typescript|css)\b/.test(text)) {
    return 'Frontend';
  }
  if (/\b(devops|sre|platform|infrastructure|kubernetes|docker|aws|azure|cloud)\b/.test(text)) {
    return 'DevOps';
  }
  if (/\b(mobile|android|ios|react native|swift|kotlin)\b/.test(text)) {
    return 'Mobile';
  }
  if (/\b(backend|back-end|api|server|database|microservice|java|go|asp\.net|postgres|sql)\b/.test(text)) {
    return 'Backend';
  }

  return 'Software Engineering';
};

const detectExperienceLevel = ({ jobTitle = '', jobDescription = '' }) => {
  const text = `${normalize(jobTitle)} ${normalize(jobDescription)}`;

  if (/\b(intern|internship|trainee|graduate|fresher)\b/.test(text)) return 'internship';
  if (/\b(junior|jr|entry.?level|associate)\b/.test(text)) return 'junior';
  if (/\b(senior|sr|staff|principal|lead|architect|manager)\b/.test(text)) return 'senior';

  return 'mid';
};

const getStageAdjustment = (status) => {
  switch (status) {
    case 'Applied':
    case 'Shortlisted':
      return { startWeek: 1, totalWeeks: 4, label: 'full' };
    case 'OA':
      return { startWeek: 1, totalWeeks: 3, label: 'focused_coding' };
    case 'Interview':
      return { startWeek: 2, totalWeeks: 3, label: 'focused_interview' };
    case 'Offer':
      return { startWeek: 1, totalWeeks: 2, label: 'minimal' };
    case 'Rejected':
    case 'Withdrawn':
      return null;
    default:
      return { startWeek: 1, totalWeeks: 4, label: 'full' };
  }
};

const companyHints = {
  amazon: { emphasis: 'leadership_principles' },
  google: { emphasis: 'algorithms_system_design' },
  microsoft: { emphasis: 'algorithms_culture' },
  meta: { emphasis: 'system_design_behavioral' },
  apple: { emphasis: 'craftsmanship_detail' },
  netflix: { emphasis: 'ownership_impact' },
  stripe: { emphasis: 'api_design_systems' },
};

const companyEmphasisTopics = {
  leadership_principles: [
    ['Leadership Principles', 'Prepare stories mapped to leadership principles: ownership, dive deep, bias for action.'],
    ['Bar Raiser Prep', 'Study bar raiser interview format with behavioral depth and follow-up probes.'],
  ],
  algorithms_system_design: [
    ['Advanced Algorithms', 'Practice dynamic programming, graphs, tries, and hard-level algorithm problems.'],
    ['System Design Deep Dive', 'Prepare large-scale system design with Google-level scale expectations.'],
  ],
  algorithms_culture: [
    ['Problem Solving', 'Focus on clean, optimal solutions with clear verbal explanation of trade-offs.'],
    ['Culture Fit', 'Prepare stories demonstrating collaboration, growth mindset, and inclusion.'],
  ],
  system_design_behavioral: [
    ['System Design Practice', 'Design real-world systems (news feed, messenger, ads) with deep trade-off analysis.'],
    ['Behavioral Depth', 'Practice structured storytelling with STAR format and impact quantification.'],
  ],
  craftsmanship_detail: [
    ['Attention to Detail', 'Review code quality, edge cases, accessibility, and pixel-perfect implementation.'],
    ['Product Sense', 'Prepare examples of product thinking, user empathy, and design intuition.'],
  ],
  ownership_impact: [
    ['Ownership Stories', 'Prepare examples of taking initiative, resolving ambiguity, and driving measurable results.'],
    ['Impact Analysis', 'Practice articulating business impact, trade-offs, and decision rationale.'],
  ],
  api_design_systems: [
    ['API Design Excellence', 'Practice designing REST/gRPC APIs with idempotency, pagination, versioning, and error handling.'],
    ['Payment Systems', 'Study idempotency keys, double-entry ledger, fraud detection, and reconciliation.'],
  ],
};

const getLevelMultiplier = (level) => {
  switch (level) {
    case 'internship': return { depth: 'fundamentals', label: 'Internship' };
    case 'junior': return { depth: 'core', label: 'Junior' };
    case 'mid': return { depth: 'advanced', label: 'Mid-Level' };
    case 'senior': return { depth: 'expert', label: 'Senior' };
    default: return { depth: 'core', label: 'Standard' };
  }
};

const commonWeeks = {
  fundamentals: [
    ['Interview Baseline', 'Review the job description, recruiter notes, required stack, and likely interview rounds.'],
    ['Company Research', 'Study the product, recent engineering work, business model, and role expectations.'],
  ],
  core: [
    ['Coding Practice', 'Practice timed data structures and algorithms problems with clean explanations.'],
    ['Debugging Drill', 'Walk through failed solutions and write down recurring mistakes.'],
  ],
  advanced: [
    ['System Design Basics', 'Prepare requirement gathering, API boundaries, data model, scaling, and trade-off discussion.'],
    ['Behavioral Stories', 'Prepare concise stories for ownership, conflict, ambiguity, failure, and impact.'],
  ],
  expert: [
    ['Mock Interview', 'Run a timed mock covering coding, role depth, and communication.'],
    ['Final Review', 'Refresh weak areas, prepare questions for interviewers, and verify logistics.'],
  ],
};

const rolePlans = {
  Backend: {
    fundamentals: [
      ['API Design', 'Practice REST endpoint design, request validation, pagination, filtering, and error responses.'],
      ['Database Modeling', 'Review indexes, joins, transactions, constraints, and query performance trade-offs.'],
    ],
    core: [
      ['Concurrency', 'Study race conditions, locking, idempotency, retries, queues, and background jobs.'],
      ['Service Reliability', 'Prepare monitoring, logging, rate limits, timeouts, and graceful degradation scenarios.'],
    ],
    advanced: [
      ['Distributed Systems', 'Review caching, sharding, replication, consistency, and message delivery guarantees.'],
      ['Backend Project Deep Dive', 'Prepare one backend project with architecture, scale, failures, and measurable impact.'],
    ],
    expert: [
      ['Production Readiness', 'Practice discussing deployment, migrations, rollback, security, and incident response.'],
      ['Backend Mock Round', 'Run a mock focused on API design plus database and scaling follow-ups.'],
    ],
  },
  Frontend: {
    fundamentals: [
      ['React Fundamentals', 'Review component state, effects, rendering behavior, forms, and route-level data flow.'],
      ['Browser Basics', 'Study DOM events, accessibility, CSS layout, storage, network requests, and performance budgets.'],
    ],
    core: [
      ['UI Architecture', 'Practice component decomposition, reusable controls, loading/error states, and design consistency.'],
      ['Frontend Performance', 'Review memoization, bundle splitting, image handling, virtualization, and render profiling.'],
    ],
    advanced: [
      ['State Management', 'Prepare trade-offs between local state, context, server cache, and URL state.'],
      ['Frontend System Design', 'Practice designing dashboards, feeds, forms, and collaborative interfaces.'],
    ],
    expert: [
      ['Accessibility Review', 'Check keyboard flows, semantic markup, focus states, contrast, and screen reader basics.'],
      ['Frontend Mock Round', 'Run a mock covering component design, debugging, performance, and product polish.'],
    ],
  },
  'Full Stack': {
    fundamentals: [
      ['End-to-End Flow', 'Trace a feature from UI event through API, validation, database write, and response handling.'],
      ['Data Contracts', 'Practice request/response schemas, frontend validation, backend validation, and error mapping.'],
    ],
    core: [
      ['API and UI Integration', 'Build sample CRUD flows with optimistic updates, loading states, and retry paths.'],
      ['Schema Design', 'Review relational modeling, migrations, indexes, and how UI requirements shape backend queries.'],
    ],
    advanced: [
      ['Full Stack System Design', 'Design a product feature with client state, API boundaries, auth, storage, and analytics.'],
      ['Testing Strategy', 'Prepare examples of unit, integration, API, and end-to-end test coverage.'],
    ],
    expert: [
      ['Deployment Flow', 'Review environment configuration, build pipelines, static hosting, API hosting, and rollback.'],
      ['Full Stack Mock Round', 'Run a mock that moves between UI, backend, database, and product trade-offs.'],
    ],
  },
  Data: {
    fundamentals: [
      ['SQL Foundations', 'Practice joins, aggregations, windows, CTEs, indexes, and explain-plan reasoning.'],
      ['Metrics Thinking', 'Prepare examples of defining reliable product or business metrics.'],
    ],
    core: [
      ['Data Pipelines', 'Review ingestion, cleaning, validation, scheduling, backfills, and data quality checks.'],
      ['Python Analysis', 'Practice pandas-style transformations, statistics basics, and clear notebook storytelling.'],
    ],
    advanced: [
      ['Experimentation', 'Study A/B testing, sampling, confidence intervals, bias, and interpreting noisy results.'],
      ['Data Modeling', 'Review dimensional models, fact/dimension tables, slowly changing dimensions, and warehouses.'],
    ],
    expert: [
      ['Case Study Prep', 'Practice product analytics and root-cause analysis cases with structured assumptions.'],
      ['Data Mock Round', 'Run a mock covering SQL, metrics, experimentation, and communication of insights.'],
    ],
  },
  DevOps: {
    fundamentals: [
      ['Linux and Networking', 'Review processes, filesystems, DNS, HTTP, TLS, ports, and common troubleshooting commands.'],
      ['Cloud Fundamentals', 'Study compute, storage, networking, IAM, managed databases, and cost trade-offs.'],
    ],
    core: [
      ['Containers', 'Review Docker images, layers, networking, volumes, and Kubernetes primitives.'],
      ['CI/CD', 'Prepare pipeline design, secrets handling, release strategies, and rollback patterns.'],
    ],
    advanced: [
      ['Observability', 'Review logs, metrics, traces, alerts, SLOs, and incident triage.'],
      ['Infrastructure Design', 'Practice designing scalable, secure, and maintainable deployment architecture.'],
    ],
    expert: [
      ['Reliability Scenarios', 'Prepare responses for outages, capacity incidents, deploy failures, and postmortems.'],
      ['DevOps Mock Round', 'Run a mock covering infrastructure, debugging, security, and reliability trade-offs.'],
    ],
  },
  Mobile: {
    fundamentals: [
      ['Platform Basics', 'Review lifecycle, navigation, storage, permissions, networking, and offline behavior.'],
      ['UI Implementation', 'Practice responsive screens, reusable components, forms, lists, and accessibility.'],
    ],
    core: [
      ['Performance', 'Study startup time, memory, images, rendering, pagination, and background work.'],
      ['API Integration', 'Prepare caching, retries, authentication, and sync conflict handling.'],
    ],
    advanced: [
      ['Mobile Architecture', 'Review state management, modularization, testing boundaries, and release channels.'],
      ['App Store Readiness', 'Prepare crash reporting, analytics, feature flags, and phased rollout trade-offs.'],
    ],
    expert: [
      ['Device Debugging', 'Practice diagnosing crashes, slow screens, flaky networks, and inconsistent device behavior.'],
      ['Mobile Mock Round', 'Run a mock covering UI, platform behavior, architecture, and debugging.'],
    ],
  },
  'Software Engineering': {
    fundamentals: [
      ['Role Mapping', 'Map the job description to core technical areas and identify likely interview formats.'],
      ['Core CS Review', 'Refresh data structures, algorithms, complexity, and language fundamentals.'],
    ],
    core: [
      ['Project Deep Dive', 'Prepare two projects with architecture, trade-offs, ownership, failures, and impact.'],
      ['Code Quality', 'Review testing, refactoring, API boundaries, naming, and maintainability examples.'],
    ],
    advanced: [
      ['System Design Practice', 'Practice designing a realistic product workflow with storage and scaling trade-offs.'],
      ['Behavioral Preparation', 'Prepare structured examples for teamwork, leadership, conflict, and learning.'],
    ],
    expert: [
      ['Mixed Mock Round', 'Run a mock across coding, system design, and behavioral topics.'],
      ['Final Calibration', 'Review feedback, close knowledge gaps, and prepare interviewer questions.'],
    ],
  },
};

const depthOrder = ['fundamentals', 'core', 'advanced', 'expert'];

const resolveCompanyEmphasis = (companyName) => {
  if (!companyName) return null;
  const key = normalize(companyName).replace(/[^a-z]/g, '');
  for (const [pattern, info] of Object.entries(companyHints)) {
    if (key.includes(pattern)) return info.emphasis;
  }
  return null;
};

const generateRoadmapTopics = ({ applicationId, jobTitle, jobDescription, companyName, status }) => {
  const roleFocus = detectRoleFocus({ jobTitle, jobDescription });
  const experienceLevel = detectExperienceLevel({ jobTitle, jobDescription });
  const stageAdj = getStageAdjustment(status);
  const levelInfo = getLevelMultiplier(experienceLevel);
  const companyEmphasis = resolveCompanyEmphasis(companyName);

  const roleWeeks = rolePlans[roleFocus] || rolePlans['Software Engineering'];
  const topics = [];

  if (!stageAdj) return topics;

  const { startWeek, totalWeeks } = stageAdj;
  const isSenior = experienceLevel === 'senior';
  const isIntern = experienceLevel === 'internship';

  let topicIndex = 0;

  for (let offset = 0; offset < totalWeeks; offset++) {
    const weekNumber = startWeek + offset;
    const depthKey = depthOrder[offset] || 'core';
    const common = commonWeeks[depthKey] || [];
    const role = roleWeeks[depthKey] || [];

    let merged = [...common, ...role];

    if (offset === 0 && companyEmphasis && companyEmphasisTopics[companyEmphasis]) {
      merged = [...companyEmphasisTopics[companyEmphasis], ...merged];
    }

    if (isIntern && depthKey === 'expert') {
      merged = merged.filter(([t]) => !t.includes('Mock') && !t.includes('Production'));
      merged.push(['Internship Expectations', 'Review team structure, mentorship cadence, and how to ask effective questions.']);
    }

    if (isSenior && depthKey === 'fundamentals') {
      merged = merged.filter(([t]) => !t.includes('Baseline') && !t.includes('CS Review'));
      merged.unshift(['Leadership & Mentorship', 'Prepare examples of mentoring, code review leadership, and technical decision-making.']);
    }

    merged.forEach(([topic, description]) => {
      topicIndex++;
      topics.push({
        applicationId,
        roleFocus,
        weekNumber,
        category: `Week ${weekNumber}`,
        topic,
        description,
        displayOrder: weekNumber * 100 + topicIndex,
      });
    });
  }

  return topics;
};

module.exports = {
  detectRoleFocus,
  detectExperienceLevel,
  generateRoadmapTopics,
  getStageAdjustment,
};
