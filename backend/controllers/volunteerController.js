const admin = require('firebase-admin');

/**
 * Register a new volunteer
 */
exports.registerVolunteer = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      address,
      city,
      state,
      zipCode,
      skills,
      interests,
      availability,
      experience
    } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !email || !phone) {
      return res.status(400).json({
        error: 'First name, last name, email, and phone are required'
      });
    }

    // Check for duplicate email
    const existing = await admin.firestore()
      .collection('volunteers')
      .where('email', '==', email)
      .limit(1)
      .get();

    if (!existing.empty) {
      return res.status(409).json({ error: 'A volunteer with this email is already registered' });
    }

    // Save to Firestore
    const volunteersRef = admin.firestore().collection('volunteers');
    const docRef = await volunteersRef.add({
      firstName,
      lastName,
      email,
      phone,
      address: address || '',
      city: city || '',
      state: state || '',
      zipCode: zipCode || '',
      skills: skills || [],
      interests: interests || [],
      availability: availability || [],
      experience: experience || '',
      status: 'pending',
      hoursLogged: 0,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    res.status(201).json({
      message: 'Volunteer registered successfully',
      volunteerId: docRef.id
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get all volunteers
 */
exports.getAllVolunteers = async (req, res) => {
  try {
    const snapshot = await admin.firestore()
      .collection('volunteers')
      .orderBy('createdAt', 'desc')
      .get();

    const volunteers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    res.status(200).json({
      message: 'Volunteers fetched successfully',
      volunteers
    });
  } catch (error) {
    console.error('Error fetching volunteers:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get volunteer by ID
 */
exports.getVolunteerById = async (req, res) => {
  try {
    const { id } = req.params;

    const doc = await admin.firestore()
      .collection('volunteers')
      .doc(id)
      .get();

    if (!doc.exists) {
      return res.status(404).json({ error: 'Volunteer not found' });
    }

    res.status(200).json({
      message: 'Volunteer fetched successfully',
      volunteer: { id: doc.id, ...doc.data() }
    });
  } catch (error) {
    console.error('Error fetching volunteer:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Update volunteer profile
 */
exports.updateVolunteer = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Remove immutable fields
    delete updateData.id;
    delete updateData.createdAt;
    delete updateData.email; // email changes require re-auth

    const volRef = admin.firestore().collection('volunteers').doc(id);
    const volDoc = await volRef.get();

    if (!volDoc.exists) {
      return res.status(404).json({ error: 'Volunteer not found' });
    }

    await volRef.update({
      ...updateData,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
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
 * Delete volunteer
 */
exports.deleteVolunteer = async (req, res) => {
  try {
    const { id } = req.params;

    const volRef = admin.firestore().collection('volunteers').doc(id);
    const volDoc = await volRef.get();

    if (!volDoc.exists) {
      return res.status(404).json({ error: 'Volunteer not found' });
    }

    await volRef.delete();

    res.status(200).json({
      message: 'Volunteer deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting volunteer:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Search volunteers — supports email, skill, availability filters
 */
exports.searchVolunteers = async (req, res) => {
  try {
    const { query, skill, availability, email } = req.query;

    let queryRef = admin.firestore().collection('volunteers');

    // Firestore only supports one array-contains per query
    if (email) {
      queryRef = queryRef.where('email', '==', email);
    } else if (skill) {
      queryRef = queryRef.where('skills', 'array-contains', skill);
    } else if (availability) {
      queryRef = queryRef.where('availability', 'array-contains', availability);
    }

    const snapshot = await queryRef.get();
    let volunteers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Apply text search on name/email client-side if query param exists
    if (query) {
      const q = query.toLowerCase();
      volunteers = volunteers.filter(v =>
        `${v.firstName} ${v.lastName}`.toLowerCase().includes(q) ||
        (v.email || '').toLowerCase().includes(q) ||
        (v.city || '').toLowerCase().includes(q)
      );
    }

    res.status(200).json({
      message: 'Search completed',
      data: volunteers
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: error.message });
  }
};
