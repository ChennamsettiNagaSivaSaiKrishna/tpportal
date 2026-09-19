const db = require('../config/db');

async function runMigration() {
  console.log('🚀 Starting Safe Database & RBAC Initialization...');

  // 1. Create system_permissions table
  await db.query(`
    CREATE TABLE IF NOT EXISTS system_permissions (
      id INT AUTO_INCREMENT PRIMARY KEY,
      permission_key VARCHAR(100) NOT NULL UNIQUE,
      description VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
  console.log('✅ system_permissions table verified.');

  // 2. Create role_permissions_mapping table
  await db.query(`
    CREATE TABLE IF NOT EXISTS role_permissions_mapping (
      id INT AUTO_INCREMENT PRIMARY KEY,
      role VARCHAR(50) NOT NULL,
      permission_id INT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY unique_role_perm (role, permission_id),
      FOREIGN KEY (permission_id) REFERENCES system_permissions(id) ON DELETE CASCADE
    )
  `);
  console.log('✅ role_permissions_mapping table verified.');

  // 3. Create student_phase_allocations table
  await db.query(`
    CREATE TABLE IF NOT EXISTS student_phase_allocations (
      id INT AUTO_INCREMENT PRIMARY KEY,
      student_roll VARCHAR(50) NOT NULL,
      batch_id INT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY unique_student_batch (student_roll, batch_id)
    )
  `);
  console.log('✅ student_phase_allocations table verified.');

  // 4. Safely inspect and alter training_phases columns
  const [phaseCols] = await db.query('DESCRIBE training_phases');
  const phaseColNames = phaseCols.map(c => c.Field);

  if (!phaseColNames.includes('academic_year')) {
    await db.query(`ALTER TABLE training_phases ADD COLUMN academic_year VARCHAR(50) DEFAULT '2025-2026'`);
    console.log('✅ Added academic_year to training_phases');
  }
  if (!phaseColNames.includes('is_active')) {
    await db.query(`ALTER TABLE training_phases ADD COLUMN is_active TINYINT(1) DEFAULT 1`);
    console.log('✅ Added is_active to training_phases');
  }

  // 5. Safely add unique constraint to attendance if not present
  const [attIndexes] = await db.query('SHOW INDEX FROM attendance');
  const hasUniqueSessionStudent = attIndexes.some(idx => idx.Key_name === 'unique_session_student');
  if (!hasUniqueSessionStudent) {
    // Check for any duplicate rows before adding constraint
    const [dups] = await db.query('SELECT session_id, student_roll, COUNT(*) c FROM attendance GROUP BY session_id, student_roll HAVING c > 1');
    if (dups.length === 0) {
      await db.query(`ALTER TABLE attendance ADD UNIQUE KEY unique_session_student (session_id, student_roll)`);
      console.log('✅ Added unique constraint unique_session_student to attendance');
    } else {
      console.warn('⚠️ Duplicates found in attendance; skipping unique index until resolved.');
    }
  }

  // 6. Seed System Permissions
  const permissionsToSeed = [
    // Training Phases
    { key: 'TRAINING_PHASE_VIEW', desc: 'View training phase details and listings' },
    { key: 'TRAINING_PHASE_CREATE', desc: 'Create new training phases' },
    { key: 'TRAINING_PHASE_UPDATE', desc: 'Update existing training phase parameters' },
    { key: 'TRAINING_PHASE_DELETE', desc: 'Delete training phases where allowed' },
    // Phase Batches
    { key: 'PHASE_BATCH_VIEW', desc: 'View batches and roster configurations' },
    { key: 'PHASE_BATCH_CREATE', desc: 'Create new training batches under a phase' },
    { key: 'PHASE_BATCH_UPDATE', desc: 'Update existing training batch parameters' },
    { key: 'PHASE_BATCH_DELETE', desc: 'Delete training batches where allowed' },
    // Student Allocations
    { key: 'STUDENT_PHASE_ALLOCATION_VIEW', desc: 'View student batch allocations' },
    { key: 'STUDENT_PHASE_ALLOCATION_CREATE', desc: 'Allocate individual or bulk students to a batch' },
    { key: 'STUDENT_PHASE_ALLOCATION_UPDATE', desc: 'Update or modify student batch allocation' },
    { key: 'STUDENT_PHASE_ALLOCATION_DELETE', desc: 'Remove student allocation from a batch' },
    // Training Sessions
    { key: 'TRAINING_SESSION_VIEW', desc: 'View training sessions in a batch' },
    { key: 'TRAINING_SESSION_CREATE', desc: 'Schedule and create training sessions' },
    { key: 'TRAINING_SESSION_UPDATE', desc: 'Update training session details or status' },
    { key: 'TRAINING_SESSION_DELETE', desc: 'Delete training sessions' },
    // Attendance
    { key: 'ATTENDANCE_VIEW', desc: 'View session attendance rosters and history' },
    { key: 'ATTENDANCE_MARK', desc: 'Mark initial attendance for a session' },
    { key: 'ATTENDANCE_UPDATE', desc: 'Update or edit existing attendance records' },
    { key: 'ATTENDANCE_DELETE', desc: 'Delete attendance records' },
    { key: 'ATTENDANCE_REPORT_VIEW', desc: 'Access analytical attendance reports and aggregates' },
  ];

  for (const perm of permissionsToSeed) {
    await db.query(`
      INSERT INTO system_permissions (permission_key, description)
      VALUES (?, ?)
      ON DUPLICATE KEY UPDATE description = VALUES(description)
    `, [perm.key, perm.desc]);
  }
  console.log(`✅ Seeded ${permissionsToSeed.length} permissions into system_permissions.`);

  // 7. Ensure roles exist in roles table
  const defaultRoles = [
    { name: 'admin', desc: 'Global System Administrator' },
    { name: 'training_head', desc: 'Training & Development Head' },
    { name: 'placement_coordinator', desc: 'Placement and Batch Coordinator' },
    { name: 'placement_officer', desc: 'Placement Officer' },
    { name: 'student', desc: 'Student / Candidate' },
  ];
  for (const r of defaultRoles) {
    const [existingRole] = await db.query('SELECT id FROM roles WHERE name = ?', [r.name]);
    if (existingRole.length === 0) {
      await db.query('INSERT INTO roles (name, description) VALUES (?, ?)', [r.name, r.desc]);
    }
  }

  // 8. Fetch all permissions with IDs for mapping
  const [allPerms] = await db.query('SELECT id, permission_key FROM system_permissions');
  const permMap = new Map(allPerms.map(p => [p.permission_key, p.id]));

  // Helper to assign permissions to a role
  async function assignPermissions(role, permKeys) {
    for (const key of permKeys) {
      const pId = permMap.get(key);
      if (pId) {
        await db.query(`
          INSERT INTO role_permissions_mapping (role, permission_id)
          VALUES (?, ?)
          ON DUPLICATE KEY UPDATE role = VALUES(role)
        `, [role, pId]);
      }
    }
  }

  const allKeys = permissionsToSeed.map(p => p.key);

  // Admin gets ALL permissions
  await assignPermissions('admin', allKeys);

  // Training Head gets ALL training and attendance permissions
  await assignPermissions('training_head', allKeys);

  // Placement Coordinator gets phase/batch view+create, allocations, attendance mark/view, reports
  await assignPermissions('placement_coordinator', [
    'TRAINING_PHASE_VIEW',
    'PHASE_BATCH_VIEW',
    'PHASE_BATCH_CREATE',
    'PHASE_BATCH_UPDATE',
    'STUDENT_PHASE_ALLOCATION_VIEW',
    'STUDENT_PHASE_ALLOCATION_CREATE',
    'STUDENT_PHASE_ALLOCATION_UPDATE',
    'STUDENT_PHASE_ALLOCATION_DELETE',
    'TRAINING_SESSION_VIEW',
    'TRAINING_SESSION_CREATE',
    'TRAINING_SESSION_UPDATE',
    'ATTENDANCE_VIEW',
    'ATTENDANCE_MARK',
    'ATTENDANCE_UPDATE',
    'ATTENDANCE_REPORT_VIEW'
  ]);

  // Placement Officer gets view rights and reports
  await assignPermissions('placement_officer', [
    'TRAINING_PHASE_VIEW',
    'PHASE_BATCH_VIEW',
    'STUDENT_PHASE_ALLOCATION_VIEW',
    'TRAINING_SESSION_VIEW',
    'ATTENDANCE_VIEW',
    'ATTENDANCE_REPORT_VIEW'
  ]);

  // Student gets attendance view for their own records
  await assignPermissions('student', [
    'ATTENDANCE_VIEW',
    'ATTENDANCE_REPORT_VIEW'
  ]);

  console.log('✅ Role-Permission mappings successfully configured.');
  console.log('🎉 Migration completed successfully with zero data loss.');
  process.exit(0);
}

runMigration().catch(err => {
  console.error('❌ Migration failed:', err);
  process.exit(1);
});
