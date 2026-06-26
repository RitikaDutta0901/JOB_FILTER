const db = require('../db');

const exportApplicationsCSV = async (req, res, next) => {
  const userId = req.user.id;
  const { search, status, workMode } = req.query;

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

    const query = `
      SELECT
        a.id, c.name AS company_name, a.job_title, a.status, a.location,
        a.work_mode, a.salary, a.applied_date, a.deadline, a.job_url,
        (SELECT COUNT(*) FROM rounds r WHERE r.application_id = a.id) AS rounds_count,
        (SELECT COUNT(*) FROM notes n WHERE n.application_id = a.id) AS notes_count,
        a.created_at
      FROM applications a
      JOIN companies c ON a.company_id = c.id
      ${whereClause}
      ORDER BY a.created_at DESC
    `;

    const result = await db.query(query, queryParams);
    const rows = result.rows;

    const headers = [
      'ID', 'Company', 'Job Title', 'Status', 'Location', 'Work Mode',
      'Salary', 'Applied Date', 'Deadline', 'Job URL', 'Rounds', 'Notes', 'Created At'
    ];

    const csvRows = [headers.join(',')];

    for (const row of rows) {
      const escapeCsv = (val) => {
        if (val === null || val === undefined) return '';
        const str = String(val);
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
          return '"' + str.replace(/"/g, '""') + '"';
        }
        return str;
      };

      csvRows.push([
        row.id,
        escapeCsv(row.company_name),
        escapeCsv(row.job_title),
        row.status,
        escapeCsv(row.location || ''),
        row.work_mode || '',
        row.salary || '',
        row.applied_date ? row.applied_date.toISOString().split('T')[0] : '',
        row.deadline ? row.deadline.toISOString().split('T')[0] : '',
        escapeCsv(row.job_url || ''),
        row.rounds_count || 0,
        row.notes_count || 0,
        row.created_at ? row.created_at.toISOString() : ''
      ].join(','));
    }

    const dateStr = new Date().toISOString().split('T')[0].replace(/-/g, '_');
    const filename = `applications_${dateStr}.csv`;

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    return res.status(200).send(csvRows.join('\n'));
  } catch (error) {
    next(error);
  }
};

module.exports = { exportApplicationsCSV };
