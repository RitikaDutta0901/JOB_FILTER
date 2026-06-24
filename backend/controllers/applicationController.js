const db = require('../db');

/**
 * @desc    Get all user applications (with Search, Filter, Sort)
 * @route   GET /api/applications
 * @access  Private
 */
const getApplications = async (req, res, next) => {
  const userId = req.user.id;
  const { search, status, workMode, sortBy, sortOrder } = req.query;

  try {
    let queryText = `
      SELECT 
        a.id, 
        a.user_id, 
        a.company_id, 
        a.job_title, 
        a.job_description, 
        a.job_url, 
        a.salary, 
        a.location, 
        a.work_mode, 
        a.status, 
        a.applied_date, 
        a.deadline, 
        a.resume_url, 
        a.created_at, 
        a.updated_at,
        c.name AS company_name,
        c.website AS company_website,
        c.logo_url AS company_logo
      FROM applications a
      JOIN companies c ON a.company_id = c.id
      WHERE a.user_id = $1
    `;
    
    const queryParams = [userId];
    let paramCounter = 2;

    // Apply Search (Job Title or Company Name)
    if (search) {
      queryText += ` AND (a.job_title ILIKE $${paramCounter} OR c.name ILIKE $${paramCounter})`;
      queryParams.push(`%${search}%`);
      paramCounter++;
    }

    // Apply Status Filter
    if (status) {
      queryText += ` AND a.status = $${paramCounter}`;
      queryParams.push(status);
      paramCounter++;
    }

    // Apply Work Mode Filter
    if (workMode) {
      queryText += ` AND a.work_mode = $${paramCounter}`;
      queryParams.push(workMode);
      paramCounter++;
    }

    // Apply Sorting
    const allowedSortFields = ['applied_date', 'salary', 'deadline', 'created_at', 'company_name', 'job_title'];
    const activeSortField = allowedSortFields.includes(sortBy) ? sortBy : 'created_at';
    const activeSortOrder = sortOrder === 'asc' ? 'ASC' : 'DESC';

    if (activeSortField === 'company_name') {
      queryText += ` ORDER BY c.name ${activeSortOrder}`;
    } else {
      queryText += ` ORDER BY a.${activeSortField} ${activeSortOrder}`;
    }

    const result = await db.query(queryText, queryParams);

    return res.status(200).json({
      success: true,
      count: result.rows.length,
      applications: result.rows,
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
    const checkQuery = 'SELECT id, company_id FROM applications WHERE id = $1 AND user_id = $2';
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
        applied_date = $9,
        deadline = $10,
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
    // 1. Total Applications Count
    const totalQuery = 'SELECT COUNT(*) as count FROM applications WHERE user_id = $1';
    const totalRes = await db.query(totalQuery, [userId]);
    const totalApplications = parseInt(totalRes.rows[0].count, 10);

    // 2. Status Distribution Count
    const statusQuery = 'SELECT status, COUNT(*) as count FROM applications WHERE user_id = $1 GROUP BY status';
    const statusRes = await db.query(statusQuery, [userId]);
    const statusDistribution = statusRes.rows.map(r => ({
      status: r.status,
      count: parseInt(r.count, 10),
    }));

    // 3. Applications Over Time (grouped by applied_date)
    const timelineQuery = `
      SELECT applied_date::text as date, COUNT(*) as count 
      FROM applications 
      WHERE user_id = $1 
      GROUP BY applied_date 
      ORDER BY applied_date ASC
    `;
    const timelineRes = await db.query(timelineQuery, [userId]);
    const timelineData = timelineRes.rows.map(r => ({
      date: r.date,
      count: parseInt(r.count, 10),
    }));

    // 4. Company Analytics (Application volumes and average salaries)
    const companyStatsQuery = `
      SELECT c.name as company_name, COUNT(*) as count, COALESCE(AVG(a.salary), 0)::numeric(12,2) as avg_salary
      FROM applications a
      JOIN companies c ON a.company_id = c.id
      WHERE a.user_id = $1
      GROUP BY c.name
      ORDER BY count DESC, avg_salary DESC
      LIMIT 5
    `;
    const companyRes = await db.query(companyStatsQuery, [userId]);
    const companyData = companyRes.rows.map(r => ({
      companyName: r.company_name,
      count: parseInt(r.count, 10),
      avgSalary: parseFloat(r.avg_salary),
    }));

    return res.status(200).json({
      success: true,
      stats: {
        totalApplications,
        statusDistribution,
        timelineData,
        companyData,
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
