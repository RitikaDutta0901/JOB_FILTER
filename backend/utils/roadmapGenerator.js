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

const commonWeeks = [
  [
    ['Interview Baseline', 'Review the job description, recruiter notes, required stack, and likely interview rounds.'],
    ['Company Research', 'Study the product, recent engineering work, business model, and role expectations.'],
  ],
  [
    ['Coding Practice', 'Practice timed data structures and algorithms problems with clean explanations.'],
    ['Debugging Drill', 'Walk through failed solutions and write down recurring mistakes.'],
  ],
  [
    ['System Design Basics', 'Prepare requirement gathering, API boundaries, data model, scaling, and trade-off discussion.'],
    ['Behavioral Stories', 'Prepare concise stories for ownership, conflict, ambiguity, failure, and impact.'],
  ],
  [
    ['Mock Interview', 'Run a timed mock covering coding, role depth, and communication.'],
    ['Final Review', 'Refresh weak areas, prepare questions for interviewers, and verify logistics.'],
  ],
];

const rolePlans = {
  Backend: [
    [
      ['API Design', 'Practice REST endpoint design, request validation, pagination, filtering, and error responses.'],
      ['Database Modeling', 'Review indexes, joins, transactions, constraints, and query performance trade-offs.'],
    ],
    [
      ['Concurrency', 'Study race conditions, locking, idempotency, retries, queues, and background jobs.'],
      ['Service Reliability', 'Prepare monitoring, logging, rate limits, timeouts, and graceful degradation scenarios.'],
    ],
    [
      ['Distributed Systems', 'Review caching, sharding, replication, consistency, and message delivery guarantees.'],
      ['Backend Project Deep Dive', 'Prepare one backend project with architecture, scale, failures, and measurable impact.'],
    ],
    [
      ['Production Readiness', 'Practice discussing deployment, migrations, rollback, security, and incident response.'],
      ['Backend Mock Round', 'Run a mock focused on API design plus database and scaling follow-ups.'],
    ],
  ],
  Frontend: [
    [
      ['React Fundamentals', 'Review component state, effects, rendering behavior, forms, and route-level data flow.'],
      ['Browser Basics', 'Study DOM events, accessibility, CSS layout, storage, network requests, and performance budgets.'],
    ],
    [
      ['UI Architecture', 'Practice component decomposition, reusable controls, loading/error states, and design consistency.'],
      ['Frontend Performance', 'Review memoization, bundle splitting, image handling, virtualization, and render profiling.'],
    ],
    [
      ['State Management', 'Prepare trade-offs between local state, context, server cache, and URL state.'],
      ['Frontend System Design', 'Practice designing dashboards, feeds, forms, and collaborative interfaces.'],
    ],
    [
      ['Accessibility Review', 'Check keyboard flows, semantic markup, focus states, contrast, and screen reader basics.'],
      ['Frontend Mock Round', 'Run a mock covering component design, debugging, performance, and product polish.'],
    ],
  ],
  'Full Stack': [
    [
      ['End-to-End Flow', 'Trace a feature from UI event through API, validation, database write, and response handling.'],
      ['Data Contracts', 'Practice request/response schemas, frontend validation, backend validation, and error mapping.'],
    ],
    [
      ['API and UI Integration', 'Build sample CRUD flows with optimistic updates, loading states, and retry paths.'],
      ['Schema Design', 'Review relational modeling, migrations, indexes, and how UI requirements shape backend queries.'],
    ],
    [
      ['Full Stack System Design', 'Design a product feature with client state, API boundaries, auth, storage, and analytics.'],
      ['Testing Strategy', 'Prepare examples of unit, integration, API, and end-to-end test coverage.'],
    ],
    [
      ['Deployment Flow', 'Review environment configuration, build pipelines, static hosting, API hosting, and rollback.'],
      ['Full Stack Mock Round', 'Run a mock that moves between UI, backend, database, and product trade-offs.'],
    ],
  ],
  Data: [
    [
      ['SQL Foundations', 'Practice joins, aggregations, windows, CTEs, indexes, and explain-plan reasoning.'],
      ['Metrics Thinking', 'Prepare examples of defining reliable product or business metrics.'],
    ],
    [
      ['Data Pipelines', 'Review ingestion, cleaning, validation, scheduling, backfills, and data quality checks.'],
      ['Python Analysis', 'Practice pandas-style transformations, statistics basics, and clear notebook storytelling.'],
    ],
    [
      ['Experimentation', 'Study A/B testing, sampling, confidence intervals, bias, and interpreting noisy results.'],
      ['Data Modeling', 'Review dimensional models, fact/dimension tables, slowly changing dimensions, and warehouses.'],
    ],
    [
      ['Case Study Prep', 'Practice product analytics and root-cause analysis cases with structured assumptions.'],
      ['Data Mock Round', 'Run a mock covering SQL, metrics, experimentation, and communication of insights.'],
    ],
  ],
  DevOps: [
    [
      ['Linux and Networking', 'Review processes, filesystems, DNS, HTTP, TLS, ports, and common troubleshooting commands.'],
      ['Cloud Fundamentals', 'Study compute, storage, networking, IAM, managed databases, and cost trade-offs.'],
    ],
    [
      ['Containers', 'Review Docker images, layers, networking, volumes, and Kubernetes primitives.'],
      ['CI/CD', 'Prepare pipeline design, secrets handling, release strategies, and rollback patterns.'],
    ],
    [
      ['Observability', 'Review logs, metrics, traces, alerts, SLOs, and incident triage.'],
      ['Infrastructure Design', 'Practice designing scalable, secure, and maintainable deployment architecture.'],
    ],
    [
      ['Reliability Scenarios', 'Prepare responses for outages, capacity incidents, deploy failures, and postmortems.'],
      ['DevOps Mock Round', 'Run a mock covering infrastructure, debugging, security, and reliability trade-offs.'],
    ],
  ],
  Mobile: [
    [
      ['Platform Basics', 'Review lifecycle, navigation, storage, permissions, networking, and offline behavior.'],
      ['UI Implementation', 'Practice responsive screens, reusable components, forms, lists, and accessibility.'],
    ],
    [
      ['Performance', 'Study startup time, memory, images, rendering, pagination, and background work.'],
      ['API Integration', 'Prepare caching, retries, authentication, and sync conflict handling.'],
    ],
    [
      ['Mobile Architecture', 'Review state management, modularization, testing boundaries, and release channels.'],
      ['App Store Readiness', 'Prepare crash reporting, analytics, feature flags, and phased rollout trade-offs.'],
    ],
    [
      ['Device Debugging', 'Practice diagnosing crashes, slow screens, flaky networks, and inconsistent device behavior.'],
      ['Mobile Mock Round', 'Run a mock covering UI, platform behavior, architecture, and debugging.'],
    ],
  ],
  'Software Engineering': [
    [
      ['Role Mapping', 'Map the job description to core technical areas and identify likely interview formats.'],
      ['Core CS Review', 'Refresh data structures, algorithms, complexity, and language fundamentals.'],
    ],
    [
      ['Project Deep Dive', 'Prepare two projects with architecture, trade-offs, ownership, failures, and impact.'],
      ['Code Quality', 'Review testing, refactoring, API boundaries, naming, and maintainability examples.'],
    ],
    [
      ['System Design Practice', 'Practice designing a realistic product workflow with storage and scaling trade-offs.'],
      ['Behavioral Preparation', 'Prepare structured examples for teamwork, leadership, conflict, and learning.'],
    ],
    [
      ['Mixed Mock Round', 'Run a mock across coding, system design, and behavioral topics.'],
      ['Final Calibration', 'Review feedback, close knowledge gaps, and prepare interviewer questions.'],
    ],
  ],
};

const generateRoadmapTopics = ({ applicationId, jobTitle, jobDescription }) => {
  const roleFocus = detectRoleFocus({ jobTitle, jobDescription });
  const roleWeeks = rolePlans[roleFocus] || rolePlans['Software Engineering'];
  const topics = [];

  for (let weekIndex = 0; weekIndex < 4; weekIndex++) {
    const weekNumber = weekIndex + 1;
    const merged = [...commonWeeks[weekIndex], ...roleWeeks[weekIndex]];

    merged.forEach(([topic, description], itemIndex) => {
      topics.push({
        applicationId,
        roleFocus,
        weekNumber,
        category: `Week ${weekNumber}`,
        topic,
        description,
        displayOrder: weekIndex * 10 + itemIndex + 1,
      });
    });
  }

  return topics;
};

module.exports = {
  detectRoleFocus,
  generateRoadmapTopics,
};
