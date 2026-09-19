const express = require('express');
const router = express.Router();
const studentPhaseAllocationController = require('../controllers/studentPhaseAllocationController');
const verifyToken = require('../middleware/authMiddleware');
const { requirePermission } = require('../middleware/permissionMiddleware');

// 1. Get All Allocations
router.get(
  '/',
  verifyToken,
  requirePermission('STUDENT_PHASE_ALLOCATION_VIEW'),
  studentPhaseAllocationController.getAllAllocations
);

// 2. Get Available (Unallocated) Students for a Batch
router.get(
  '/available',
  verifyToken,
  requirePermission('STUDENT_PHASE_ALLOCATION_VIEW'),
  studentPhaseAllocationController.getAvailableStudents
);

// 3. Get Allocations By Batch ID
router.get(
  '/batch/:batchId',
  verifyToken,
  requirePermission('STUDENT_PHASE_ALLOCATION_VIEW'),
  studentPhaseAllocationController.getAllocationsByBatch
);

// 4. Get Allocation By ID
router.get(
  '/:id',
  verifyToken,
  requirePermission('STUDENT_PHASE_ALLOCATION_VIEW'),
  studentPhaseAllocationController.getAllocationById
);

// 5. Create Single Allocation
router.post(
  '/',
  verifyToken,
  requirePermission('STUDENT_PHASE_ALLOCATION_CREATE'),
  studentPhaseAllocationController.createAllocation
);

// 6. Bulk Allocate Students
router.post(
  '/bulk',
  verifyToken,
  requirePermission('STUDENT_PHASE_ALLOCATION_CREATE'),
  studentPhaseAllocationController.bulkAllocate
);

// 7. Update Allocation
router.put(
  '/:id',
  verifyToken,
  requirePermission('STUDENT_PHASE_ALLOCATION_UPDATE'),
  studentPhaseAllocationController.updateAllocation
);

// 8. Delete Allocation
router.delete(
  '/:id',
  verifyToken,
  requirePermission('STUDENT_PHASE_ALLOCATION_DELETE'),
  studentPhaseAllocationController.deleteAllocation
);

module.exports = router;