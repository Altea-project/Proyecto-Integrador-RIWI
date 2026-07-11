

router.post('/users', verifyToken, requireRole('admin'), createUser);