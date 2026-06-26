const db = require('../db');
const { generateRoadmapTopics } = require('../utils/roadmapGenerator');

const mapRoadmapRows = (rows) => {
  const totalTopics = rows.length;
  const completedTopics = rows.filter((topic) => topic.is_completed).length;
  const completionPercentage = totalTopics === 0
    ? 0
    : Math.round((completedTopics / totalTopics) * 100);

  const weeklyProgress = rows.reduce((acc, topic) => {
    const existing = acc.find((week) => week.weekNumber === topic.week_number);
    if (existing) {
      existing.totalTopics += 1;
      if (topic.is_completed) existing.completedTopics += 1;
      existing.completionPercentage = Math.round((existing.completedTopics / existing.totalTopics) * 100);
      return acc;
    }

    acc.push({
      weekNumber: topic.week_number,
      totalTopics: 1,
      completedTopics: topic.is_completed ? 1 : 0,
      completionPercentage: topic.is_completed ? 100 : 0,
    });
    return acc;
  }, []);

  return {
    roleFocus: rows[0]?.role_focus || 'Software Engineering',
    totalTopics,
    completedTopics,
    completionPercentage,
    weeklyProgress,
    topics: rows,
  };
};

const createRoadmapForApplication = async (application, client = db) => {
  const topics = generateRoadmapTopics({
    applicationId: application.id,
    jobTitle: application.job_title,
    jobDescription: application.job_description,
  });

  if (topics.length === 0) return;

  const values = [];
  const params = [];
  let idx = 1;

  for (const topic of topics) {
    params.push(topic.applicationId, topic.roleFocus, topic.weekNumber, topic.category, topic.topic, topic.description, topic.displayOrder);
    values.push(`($${idx}, $${idx + 1}, $${idx + 2}, $${idx + 3}, $${idx + 4}, $${idx + 5}, $${idx + 6})`);
    idx += 7;
  }

  await client.query(
    `INSERT INTO interview_roadmap_topics (application_id, role_focus, week_number, category, topic, description, display_order) VALUES ${values.join(', ')} ON CONFLICT (application_id, display_order) DO NOTHING`,
    params
  );
};

const getRoadmapRows = async (applicationId) => {
  const result = await db.query(
    `SELECT *
     FROM interview_roadmap_topics
     WHERE application_id = $1
     ORDER BY week_number ASC, display_order ASC`,
    [applicationId]
  );

  return result.rows;
};

const ensureRoadmapsForUser = async (userId) => {
  const result = await db.query(
    `SELECT a.id, a.job_title, a.job_description
     FROM applications a
     LEFT JOIN interview_roadmap_topics rt ON rt.application_id = a.id
     WHERE a.user_id = $1
     GROUP BY a.id, a.job_title, a.job_description
     HAVING COUNT(rt.id) = 0`,
    [userId]
  );

  for (const application of result.rows) {
    await createRoadmapForApplication(application);
  }
};

const getRoadmapForApplication = async (req, res, next) => {
  const userId = req.user.id;
  const applicationId = req.params.id;

  try {
    const appResult = await db.query(
      `SELECT id, job_title, job_description
       FROM applications
       WHERE id = $1 AND user_id = $2`,
      [applicationId, userId]
    );

    if (appResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Application not found or unauthorized',
      });
    }

    let rows = await getRoadmapRows(applicationId);

    if (rows.length === 0) {
      await createRoadmapForApplication(appResult.rows[0]);
      rows = await getRoadmapRows(applicationId);
    }

    return res.status(200).json({
      success: true,
      roadmap: mapRoadmapRows(rows),
    });
  } catch (error) {
    next(error);
  }
};

const updateRoadmapTopic = async (req, res, next) => {
  const userId = req.user.id;
  const topicId = req.params.id;
  const { isCompleted } = req.body;

  if (typeof isCompleted !== 'boolean') {
    return res.status(400).json({
      success: false,
      message: 'isCompleted must be a boolean',
    });
  }

  try {
    const checkResult = await db.query(
      `SELECT rt.id, rt.application_id
       FROM interview_roadmap_topics rt
       JOIN applications a ON rt.application_id = a.id
       WHERE rt.id = $1 AND a.user_id = $2`,
      [topicId, userId]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Roadmap topic not found or unauthorized',
      });
    }

    const updateResult = await db.query(
      `UPDATE interview_roadmap_topics
       SET is_completed = $1,
           completed_at = CASE WHEN $1 = TRUE THEN CURRENT_TIMESTAMP ELSE NULL END
       WHERE id = $2
       RETURNING *`,
      [isCompleted, topicId]
    );

    const rows = await getRoadmapRows(checkResult.rows[0].application_id);

    return res.status(200).json({
      success: true,
      topic: updateResult.rows[0],
      roadmap: mapRoadmapRows(rows),
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createRoadmapForApplication,
  ensureRoadmapsForUser,
  getRoadmapForApplication,
  updateRoadmapTopic,
};
