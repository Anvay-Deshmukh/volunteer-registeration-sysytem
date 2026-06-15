const admin = require('firebase-admin');
const PDFDocument = require('pdfkit');

/**
 * Get volunteer report
 */
exports.getVolunteerReport = async (req, res) => {
  try {
    const { startDate, endDate, status } = req.query;

    let queryRef = admin.firestore().collection('volunteers');

    if (status) {
      queryRef = queryRef.where('status', '==', status);
    }

    const snapshot = await queryRef.get();
    const volunteers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Filter by date range if provided
    let filtered = volunteers;
    if (startDate || endDate) {
      filtered = volunteers.filter(vol => {
        const created = vol.createdAt?.toDate ? vol.createdAt.toDate() : new Date(vol.createdAt);
        if (startDate && created < new Date(startDate)) return false;
        if (endDate && created > new Date(endDate)) return false;
        return true;
      });
    }

    // Calculate statistics
    const byStatus = {};
    const bySkill = {};

    filtered.forEach(vol => {
      const s = vol.status || 'unknown';
      byStatus[s] = (byStatus[s] || 0) + 1;
      if (vol.skills && Array.isArray(vol.skills)) {
        vol.skills.forEach(skill => {
          bySkill[skill] = (bySkill[skill] || 0) + 1;
        });
      }
    });

    const report = {
      totalVolunteers: filtered.length,
      byStatus,
      bySkill,
      generatedAt: new Date()
    };

    res.status(200).json({
      message: 'Volunteer report generated',
      data: report
    });
  } catch (error) {
    console.error('Error generating volunteer report:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get activity report
 */
exports.getActivityReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const assignmentsSnapshot = await admin.firestore().collection('assignments').get();
    const assignments = assignmentsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    let filtered = assignments;
    if (startDate || endDate) {
      filtered = assignments.filter(a => {
        const assigned = a.assignedAt?.toDate ? a.assignedAt.toDate() : new Date(a.assignedAt);
        if (startDate && assigned < new Date(startDate)) return false;
        if (endDate && assigned > new Date(endDate)) return false;
        return true;
      });
    }

    // Aggregate hours from volunteers
    const volunteersSnapshot = await admin.firestore()
      .collection('volunteers')
      .where('status', '==', 'approved')
      .get();

    let totalHours = 0;
    volunteersSnapshot.docs.forEach(doc => {
      totalHours += doc.data().hoursLogged || 0;
    });

    const report = {
      totalActivities: filtered.length,
      hoursLogged: totalHours,
      activeVolunteers: volunteersSnapshot.size,
      generatedAt: new Date()
    };

    res.status(200).json({
      message: 'Activity report generated',
      data: report
    });
  } catch (error) {
    console.error('Error generating activity report:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get system statistics
 */
exports.getStatistics = async (req, res) => {
  try {
    const [volunteersSnap, assignmentsSnap] = await Promise.all([
      admin.firestore().collection('volunteers').get(),
      admin.firestore().collection('assignments').get()
    ]);

    const volunteers = volunteersSnap.docs.map(d => d.data());
    const assignments = assignmentsSnap.docs.map(d => d.data());

    const totalVolunteers = volunteers.length;
    let totalHours = 0;
    volunteers.forEach(v => { totalHours += v.hoursLogged || 0; });

    const averageHoursPerVolunteer = totalVolunteers > 0
      ? (totalHours / totalVolunteers).toFixed(1)
      : 0;

    // Build volunteer growth by month (last 6 months)
    const growthMap = {};
    volunteers.forEach(v => {
      const date = v.createdAt?.toDate ? v.createdAt.toDate() : new Date(v.createdAt);
      if (!date || isNaN(date)) return;
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      growthMap[key] = (growthMap[key] || 0) + 1;
    });
    const volunteerGrowth = Object.entries(growthMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, count]) => ({ month, count }));

    const statistics = {
      totalVolunteers,
      totalHours,
      averageHoursPerVolunteer,
      totalProjects: [...new Set(assignments.map(a => a.projectId))].length,
      activeProjects: assignments.filter(a => a.status === 'active').length,
      completedProjects: assignments.filter(a => a.status === 'completed').length,
      volunteerGrowth
    };

    res.status(200).json({
      message: 'Statistics retrieved',
      data: statistics
    });
  } catch (error) {
    console.error('Error getting statistics:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Export volunteer data as CSV — fetches real Firestore data
 */
exports.exportCSV = async (req, res) => {
  try {
    const { status } = req.query;

    let queryRef = admin.firestore().collection('volunteers');
    if (status) {
      queryRef = queryRef.where('status', '==', status);
    }

    const snapshot = await queryRef.get();
    const volunteers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    const rows = volunteers.map(v => [
      v.firstName || '',
      v.lastName || '',
      v.email || '',
      v.phone || '',
      v.city || '',
      v.state || '',
      v.status || '',
      v.hoursLogged || 0,
      (v.skills || []).join('; '),
      v.createdAt?.toDate ? v.createdAt.toDate().toLocaleDateString() : ''
    ].map(field => `"${String(field).replace(/"/g, '""')}"`).join(','));

    const header = 'First Name,Last Name,Email,Phone,City,State,Status,Hours Logged,Skills,Join Date';
    const csvData = [header, ...rows].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=volunteers.csv');
    res.send(csvData);
  } catch (error) {
    console.error('Error exporting CSV:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Export report as PDF with real data
 */
exports.exportPDF = async (req, res) => {
  try {
    const snapshot = await admin.firestore().collection('volunteers').get();
    const volunteers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    const totalVolunteers = volunteers.length;
    const approved = volunteers.filter(v => v.status === 'approved').length;
    const pending = volunteers.filter(v => v.status === 'pending').length;
    const rejected = volunteers.filter(v => v.status === 'rejected').length;
    const totalHours = volunteers.reduce((sum, v) => sum + (v.hoursLogged || 0), 0);

    const doc = new PDFDocument({ margin: 50 });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=volunteer-report.pdf');
    doc.pipe(res);

    // Title
    doc.fontSize(24).font('Helvetica-Bold').text('Volunteer System Report', { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(11).font('Helvetica').fillColor('#555555')
      .text(`Generated on: ${new Date().toLocaleDateString('en-US', { dateStyle: 'long' })}`, { align: 'center' });
    doc.moveDown(1.5);

    // Summary section
    doc.fontSize(16).font('Helvetica-Bold').fillColor('#000000').text('Summary');
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown(0.5);

    const summaryRows = [
      ['Total Volunteers', totalVolunteers],
      ['Approved Volunteers', approved],
      ['Pending Registrations', pending],
      ['Rejected', rejected],
      ['Total Hours Logged', totalHours]
    ];

    summaryRows.forEach(([label, value]) => {
      doc.fontSize(12).font('Helvetica-Bold').text(`${label}: `, { continued: true });
      doc.font('Helvetica').text(String(value));
    });

    doc.moveDown(1.5);

    // Volunteer list
    doc.fontSize(16).font('Helvetica-Bold').text('Volunteer List');
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown(0.5);

    volunteers.slice(0, 40).forEach((v, i) => {
      const name = `${v.firstName || ''} ${v.lastName || ''}`.trim() || 'N/A';
      const statusColor = v.status === 'approved' ? '#16a34a' : v.status === 'rejected' ? '#dc2626' : '#d97706';
      doc.fontSize(11).font('Helvetica-Bold').fillColor('#000000')
        .text(`${i + 1}. ${name}`, { continued: true });
      doc.font('Helvetica').fillColor('#555555')
        .text(`  |  ${v.email || 'N/A'}  |  `, { continued: true });
      doc.fillColor(statusColor).text(v.status || 'pending');

      if (doc.y > 720) { doc.addPage(); }
    });

    doc.end();
  } catch (error) {
    console.error('Error exporting PDF:', error);
    res.status(500).json({ error: error.message });
  }
};
