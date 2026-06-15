const admin = require('firebase-admin');

/**
 * Get dashboard statistics
 */
exports.getDashboardStats = async (req, res) => {
  try {
    const volunteersSnapshot = await admin.firestore().collection('volunteers').get();
    const totalVolunteers = volunteersSnapshot.size;

    const approvedSnapshot = await admin.firestore()
      .collection('volunteers')
      .where('status', '==', 'approved')
      .get();
    const activeVolunteers = approvedSnapshot.size;

    const pendingSnapshot = await admin.firestore()
      .collection('volunteers')
      .where('status', '==', 'pending')
      .get();
    const pendingRegistrations = pendingSnapshot.size;

    // Calculate total hours across all volunteers
    let totalHours = 0;
    volunteersSnapshot.docs.forEach(doc => {
      totalHours += doc.data().hoursLogged || 0;
    });

    const stats = {
      totalVolunteers,
      activeVolunteers,
      pendingRegistrations,
      totalHours,
      averageRating: 0
    };

    res.status(200).json({
      message: 'Dashboard stats retrieved',
      data: stats
    });
  } catch (error) {
    console.error('Error getting dashboard stats:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get all volunteers (admin view) with optional filters
 */
exports.getAllVolunteers = async (req, res) => {
  try {
    const { status } = req.query;

    let queryRef = admin.firestore().collection('volunteers');

    if (status) {
      queryRef = queryRef.where('status', '==', status);
    }

    const snapshot = await queryRef.get();
    const volunteers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    res.status(200).json({
      message: 'Volunteers retrieved',
      data: volunteers
    });
  } catch (error) {
    console.error('Error getting volunteers:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Approve volunteer registration
 */
exports.approveVolunteer = async (req, res) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;

    // Check volunteer exists first
    const volRef = admin.firestore().collection('volunteers').doc(id);
    const volDoc = await volRef.get();

    if (!volDoc.exists) {
      return res.status(404).json({ error: 'Volunteer not found' });
    }

    await volRef.update({
      status: 'approved',
      approvedAt: admin.firestore.FieldValue.serverTimestamp(),
      approvedBy: req.user.uid,
      approvalNotes: notes || ''
    });

    res.status(200).json({
      message: 'Volunteer approved successfully'
    });
  } catch (error) {
    console.error('Error approving volunteer:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Reject volunteer registration
 */
exports.rejectVolunteer = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const volRef = admin.firestore().collection('volunteers').doc(id);
    const volDoc = await volRef.get();

    if (!volDoc.exists) {
      return res.status(404).json({ error: 'Volunteer not found' });
    }

    await volRef.update({
      status: 'rejected',
      rejectedAt: admin.firestore.FieldValue.serverTimestamp(),
      rejectedBy: req.user.uid,
      rejectionReason: reason || ''
    });

    res.status(200).json({
      message: 'Volunteer rejected'
    });
  } catch (error) {
    console.error('Error rejecting volunteer:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Update volunteer (admin)
 */
exports.updateVolunteer = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Remove fields that shouldn't be updated by admin directly
    delete updateData.id;
    delete updateData.createdAt;

    const volRef = admin.firestore().collection('volunteers').doc(id);
    const volDoc = await volRef.get();

    if (!volDoc.exists) {
      return res.status(404).json({ error: 'Volunteer not found' });
    }

    await volRef.update({
      ...updateData,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedBy: req.user.uid
    });

    res.status(200).json({
      message: 'Volunteer updated successfully'
    });
  } catch (error) {
    console.error('Error updating volunteer:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Delete volunteer (admin) — removes from Firestore and Firebase Auth
 */
exports.deleteVolunteer = async (req, res) => {
  try {
    const { id } = req.params;

    const volRef = admin.firestore().collection('volunteers').doc(id);
    const volDoc = await volRef.get();

    if (!volDoc.exists) {
      return res.status(404).json({ error: 'Volunteer not found' });
    }

    const volunteerData = volDoc.data();

    // Delete from Firestore
    await volRef.delete();

    // Also delete from Firebase Auth if we have an email
    if (volunteerData.email) {
      try {
        const userRecord = await admin.auth().getUserByEmail(volunteerData.email);
        await admin.auth().deleteUser(userRecord.uid);

        // Remove from users collection too
        await admin.firestore().collection('users').doc(userRecord.uid).delete();
      } catch (authError) {
        // Auth user may not exist — that's okay
        console.warn('Could not delete Firebase Auth user:', authError.message);
      }
    }

    res.status(200).json({
      message: 'Volunteer deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting volunteer:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Assign volunteer to project
 */
exports.assignProject = async (req, res) => {
  try {
    const { volunteerId, projectId, role } = req.body;

    if (!volunteerId || !projectId) {
      return res.status(400).json({
        error: 'Volunteer ID and project ID are required'
      });
    }

    // Verify volunteer exists
    const volDoc = await admin.firestore().collection('volunteers').doc(volunteerId).get();
    if (!volDoc.exists) {
      return res.status(404).json({ error: 'Volunteer not found' });
    }

    const assignment = {
      volunteerId,
      projectId,
      role: role || 'member',
      assignedAt: admin.firestore.FieldValue.serverTimestamp(),
      assignedBy: req.user.uid,
      status: 'active'
    };

    const assignmentRef = await admin.firestore().collection('assignments').add(assignment);

    res.status(201).json({
      message: 'Volunteer assigned to project successfully',
      assignmentId: assignmentRef.id
    });
  } catch (error) {
    console.error('Error assigning project:', error);
    res.status(500).json({ error: error.message });
  }
};
