const db = require('../db');
const { createRoadmapForApplication, ensureRoadmapsForUser, deleteRoadmapForApplication } = require('./roadmapController');

/**
 * @desc    Get all user applications (with Search, Filter, Sort)
 * @route   GET /api/applications
 * @access  Private
 */
const getApplications = async (req, res, next) => {
  const userId = req.user.id;
  const { search, status, workMode, sortBy, sortOrder, page = '1', limit = '12' } = req.query;
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 12));
  const offset = (pageNum - 1) * limitNum;

  try {
    let whereClause = 'WHERE a.user_id = $1';
    const queryParams = [userId];
    let paramCounter = 2;

    if (search) {
      whereClause += ` AND (a.job_title ILIKE $${paramCounter} OR c.name ILIKE $${paramCounter})`;
      queryParams.push(`%${search}%`);
      paramCounter++;
    }

    if (status) {
      whereClause += ` AND a.status = $${paramCounter}`;
      queryParams.push(status);
      paramCounter++;
    }

    if (workMode) {
      whereClause += ` AND a.work_mode = $${paramCounter}`;
      queryParams.push(workMode);
      paramCounter++;
    }

    const allowedSortFields = ['applied_date', 'salary', 'deadline', 'created_at', 'company_name', 'job_title'];
    const activeSortField = allowedSortFields.includes(sortBy) ? sortBy : 'created_at';
    const activeSortOrder = sortOrder === 'asc' ? 'ASC' : 'DESC';

    const orderClause = activeSortField === 'company_name'
      ? `ORDER BY c.name ${activeSortOrder}`
      : `ORDER BY a.${activeSortField} ${activeSortOrder}`;

    const [countResult, dataResult] = await Promise.all([
      db.query(
        `SELECT COUNT(*) as count FROM applications a JOIN companies c ON a.company_id = c.id ${whereClause}`,
        queryParams
      ),
      db.query(
        `SELECT a.id, a.user_id, a.company_id, a.job_title, a.job_description, a.job_url, a.salary, a.location, a.work_mode, a.status, a.applied_date, a.deadline, a.resume_url, a.created_at, a.updated_at, c.name AS company_name, c.website AS company_website, c.logo_url AS company_logo FROM applications a JOIN companies c ON a.company_id = c.id ${whereClause} ${orderClause} LIMIT $${paramCounter} OFFSET $${paramCounter + 1}`,
        [...queryParams, limitNum, offset]
      ),
    ]);

    const totalCount = parseInt(countResult.rows[0].count, 10);
    const totalPages = Math.ceil(totalCount / limitNum);

    return res.status(200).json({
      success: true,
      count: dataResult.rows.length,
      totalCount,
      page: pageNum,
      totalPages,
      applications: dataResult.rows,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get a single application by ID
 * @route   GET /api/applications/:id
 * @access  Private
 */
const getApplicationById = async (req, res, next) => {
  const userId = req.user.id;
  const { id } = req.params;

  try {
    const queryText = `
      SELECT 
        a.*, 
        c.name AS company_name, 
        c.website AS company_website, 
        c.logo_url AS company_logo
      FROM applications a
      JOIN companies c ON a.company_id = c.id
      WHERE a.id = $1 AND a.user_id = $2
    `;
    const result = await db.query(queryText, [id, userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Application not found or unauthorized',
      });
    }

    return res.status(200).json({
      success: true,
      application: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a new application
 * @route   POST /api/applications
 * @access  Private
 */
const createApplication = async (req, res, next) => {
  const userId = req.user.id;
  const {
    companyName,
    jobTitle,
    jobDescription,
    jobUrl,
    salary,
    location,
    workMode,
    status,
    appliedDate,
    deadline,
    resumeUrl,
  } = req.body;

  try {
    // 1. Get or Create the Company
    const companyNameTrim = companyName.trim();
    // Resolve clean domain from name for a website placeholder if website not provided
    const websitePlaceholder = `https://${companyNameTrim.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`;
    const logoPlaceholder = `https://logo.clearbit.com/${companyNameTrim.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`;

    const findOrCreateCompanyQuery = `
      INSERT INTO companies (name, website, industry, logo_url)
      VALUES ($1, $2, 'Technology', $3)
      ON CONFLICT (name) 
      DO UPDATE SET name = EXCLUDED.name -- dummy set to return record id
      RETURNING id
    `;
    const companyResult = await db.query(findOrCreateCompanyQuery, [
      companyNameTrim,
      websitePlaceholder,
      logoPlaceholder
    ]);
    const companyId = companyResult.rows[0].id;

    // 2. Insert Application record
    const insertAppQuery = `
      INSERT INTO applications (
        user_id, company_id, job_title, job_description, job_url, 
        salary, location, work_mode, status, applied_date, deadline, resume_url
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *
    `;
    
    // Parse values to ensure correct DB types
    const appParams = [
      userId,
      companyId,
      jobTitle.trim(),
      jobDescription || null,
      jobUrl || null,
      salary ? parseFloat(salary) : null,
      location || null,
      workMode || 'Remote',
      status || 'Applied',
      appliedDate || new Date().toISOString().split('T')[0],
      deadline || null,
      resumeUrl || null,
    ];

    const appResult = await db.query(insertAppQuery, appParams);
    const createdApp = appResult.rows[0];

    await createRoadmapForApplication(createdApp);

    // Query application with company details for instant frontend sync
    const finalResult = await db.query(
      `SELECT a.*, c.name AS company_name, c.website AS company_website, c.logo_url AS company_logo
       FROM applications a JOIN companies c ON a.company_id = c.id WHERE a.id = $1`,
      [createdApp.id]
    );

    return res.status(201).json({
      success: true,
      message: 'Application created successfully',
      application: finalResult.rows[0],
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update an application
 * @route   PUT /api/applications/:id
 * @access  Private
 */
const updateApplication = async (req, res, next) => {
  const userId = req.user.id;
  const { id } = req.params;
  const {
    companyName,
    jobTitle,
    jobDescription,
    jobUrl,
    salary,
    location,
    workMode,
    status,
    appliedDate,
    deadline,
    resumeUrl,
  } = req.body;

  try {
    // 1. Verify existence & ownership
    const checkQuery = 'SELECT id, company_id, status FROM applications WHERE id = $1 AND user_id = $2';
    const checkResult = await db.query(checkQuery, [id, userId]);

    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Application not found or unauthorized',
      });
    }

    const currentApp = checkResult.rows[0];
    let companyId = currentApp.company_id;

    // 2. If company name is changed/updated, resolve company
    if (companyName) {
      const companyNameTrim = companyName.trim();
      const websitePlaceholder = `https://${companyNameTrim.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`;
      const logoPlaceholder = `https://logo.clearbit.com/${companyNameTrim.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`;

      const findOrCreateCompanyQuery = `
        INSERT INTO companies (name, website, industry, logo_url)
        VALUES ($1, $2, 'Technology', $3)
        ON CONFLICT (name) 
        DO UPDATE SET name = EXCLUDED.name
        RETURNING id
      `;
      const companyResult = await db.query(findOrCreateCompanyQuery, [
        companyNameTrim,
        websitePlaceholder,
        logoPlaceholder
      ]);
      companyId = companyResult.rows[0].id;
    }

    // 3. Update the Application
    const updateQuery = `
      UPDATE applications
      SET 
        company_id = $1,
        job_title = $2,
        job_description = $3,
        job_url = $4,
        salary = $5,
        location = $6,
        work_mode = $7,
        status = $8,
        applied_date = CASE WHEN $9::text IS NULL OR $9::text = '' THEN applied_date ELSE $9::text::timestamp END,
        deadline = CASE WHEN $10::text IS NULL OR $10::text = '' THEN deadline ELSE $10::text::timestamp END,
        resume_url = $11
      WHERE id = $12 AND user_id = $13
      RETURNING *
    `;

    const updateParams = [
      companyId,
      jobTitle ? jobTitle.trim() : null,
      jobDescription !== undefined ? jobDescription : null,
      jobUrl !== undefined ? jobUrl : null,
      salary !== undefined && salary !== null ? parseFloat(salary) : null,
      location !== undefined ? location : null,
      workMode || 'Remote',
      status || 'Applied',
      appliedDate || null,
      deadline !== undefined ? deadline : null,
      resumeUrl !== undefined ? resumeUrl : null,
      id,
      userId,
    ];

    const result = await db.query(updateQuery, updateParams);
    const updatedApp = result.rows[0];

    // Regenerate roadmap if status changed
    if (status && status !== currentApp.status) {
      const roadmapApp = await db.query(
        `SELECT a.id, a.job_title, a.job_description, a.status, c.name AS company_name
         FROM applications a JOIN companies c ON a.company_id = c.id WHERE a.id = $1`,
        [updatedApp.id]
      );
      await deleteRoadmapForApplication(updatedApp.id);
      await createRoadmapForApplication(roadmapApp.rows[0]);
    }

    // Fetch joined details
    const finalResult = await db.query(
      `SELECT a.*, c.name AS company_name, c.website AS company_website, c.logo_url AS company_logo
       FROM applications a JOIN companies c ON a.company_id = c.id WHERE a.id = $1`,
      [updatedApp.id]
    );

    return res.status(200).json({
      success: true,
      message: 'Application updated successfully',
      application: finalResult.rows[0],
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete an application
 * @route   DELETE /api/applications/:id
 * @access  Private
 */
const deleteApplication = async (req, res, next) => {
  const userId = req.user.id;
  const { id } = req.params;

  try {
    const deleteQuery = 'DELETE FROM applications WHERE id = $1 AND user_id = $2 RETURNING id';
    const result = await db.query(deleteQuery, [id, userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Application not found or unauthorized',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Application deleted successfully',
      id: result.rows[0].id,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get aggregated application stats (Analytics)
 * @route   GET /api/applications/stats
 * @access  Private
 */
const getApplicationStats = async (req, res, next) => {
  const userId = req.user.id;

  try {
    await ensureRoadmapsForUser(userId);

    const [
      totalRes,
      statusRes,
      timelineRes,
      companyRes,
      roadmapTotalsRes,
      weeklyRoadmapRes,
      applicationReadinessRes,
    ] = await Promise.all([
      db.query('SELECT COUNT(*) as count FROM applications WHERE user_id = $1', [userId]),
      db.query('SELECT status, COUNT(*) as count FROM applications WHERE user_id = $1 GROUP BY status', [userId]),
      db.query(`
        SELECT applied_date::text as date, COUNT(*) as count
        FROM applications
        WHERE user_id = $1
        GROUP BY applied_date
        ORDER BY applied_date ASC
      `, [userId]),
      db.query(`
        SELECT c.name as company_name, COUNT(*) as count, COALESCE(AVG(a.salary), 0)::numeric(12,2) as avg_salary
        FROM applications a
        JOIN companies c ON a.company_id = c.id
        WHERE a.user_id = $1
        GROUP BY c.name
        ORDER BY count DESC, avg_salary DESC
        LIMIT 5
      `, [userId]),
      db.query(`
        SELECT
          COUNT(rt.id) AS total_topics,
          COUNT(rt.id) FILTER (WHERE rt.is_completed = TRUE) AS completed_topics
        FROM interview_roadmap_topics rt
        JOIN applications a ON rt.application_id = a.id
        WHERE a.user_id = $1
      `, [userId]),
      db.query(`
        SELECT
          rt.week_number,
          COUNT(rt.id) AS total_topics,
          COUNT(rt.id) FILTER (WHERE rt.is_completed = TRUE) AS completed_topics
        FROM interview_roadmap_topics rt
        JOIN applications a ON rt.application_id = a.id
        WHERE a.user_id = $1
        GROUP BY rt.week_number
        ORDER BY rt.week_number ASC
      `, [userId]),
      db.query(`
        SELECT
          a.id,
          a.job_title,
          c.name AS company_name,
          COUNT(rt.id) AS total_topics,
          COUNT(rt.id) FILTER (WHERE rt.is_completed = TRUE) AS completed_topics
        FROM applications a
        JOIN companies c ON a.company_id = c.id
        LEFT JOIN interview_roadmap_topics rt ON rt.application_id = a.id
        WHERE a.user_id = $1
        GROUP BY a.id, a.job_title, c.name
        ORDER BY a.created_at DESC
        LIMIT 5
      `, [userId]),
    ]);

    const totalApplications = parseInt(totalRes.rows[0].count, 10);
    const statusDistribution = statusRes.rows.map(r => ({ status: r.status, count: parseInt(r.count, 10) }));
    const timelineData = timelineRes.rows.map(r => ({ date: r.date, count: parseInt(r.count, 10) }));
    const companyData = companyRes.rows.map(r => ({
      companyName: r.company_name,
      count: parseInt(r.count, 10),
      avgSalary: parseFloat(r.avg_salary),
    }));

    const totalRoadmapTopics = parseInt(roadmapTotalsRes.rows[0].total_topics, 10);
    const completedRoadmapTopics = parseInt(roadmapTotalsRes.rows[0].completed_topics, 10);
    const roadmapCompletionPercentage = totalRoadmapTopics === 0
      ? 0
      : Math.round((completedRoadmapTopics / totalRoadmapTopics) * 100);

    const roadmapWeeklyProgress = weeklyRoadmapRes.rows.map(r => {
      const totalTopics = parseInt(r.total_topics, 10);
      const completedTopics = parseInt(r.completed_topics, 10);
      return {
        weekNumber: parseInt(r.week_number, 10),
        totalTopics,
        completedTopics,
        completionPercentage: totalTopics === 0 ? 0 : Math.round((completedTopics / totalTopics) * 100),
      };
    });

    const applicationReadiness = applicationReadinessRes.rows.map(r => {
      const totalTopics = parseInt(r.total_topics, 10);
      const completedTopics = parseInt(r.completed_topics, 10);
      return {
        id: r.id,
        jobTitle: r.job_title,
        companyName: r.company_name,
        totalTopics,
        completedTopics,
        completionPercentage: totalTopics === 0 ? 0 : Math.round((completedTopics / totalTopics) * 100),
      };
    });

    return res.status(200).json({
      success: true,
      stats: {
        totalApplications,
        statusDistribution,
        timelineData,
        companyData,
        roadmapProgress: {
          totalTopics: totalRoadmapTopics,
          completedTopics: completedRoadmapTopics,
          completionPercentage: roadmapCompletionPercentage,
          weeklyProgress: roadmapWeeklyProgress,
          applicationReadiness,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getApplications,
  getApplicationById,
  createApplication,
  updateApplication,
  deleteApplication,
  getApplicationStats,
};
