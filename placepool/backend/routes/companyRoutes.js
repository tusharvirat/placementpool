const r   = require('express').Router();
const c   = require('../controllers/companyController');
const { protect, adminOnly } = require('../middleware/auth');
const { upload } = require('../config/cloudinary');

r.get('/',    protect, c.getCompanies);
r.post('/',   protect, adminOnly, upload.single('logo'), c.createCompany);
r.put('/:id', protect, adminOnly, upload.single('logo'), c.updateCompany);
r.delete('/:id', protect, adminOnly, c.deleteCompany);
r.post('/:id/resources',              protect, adminOnly, upload.single('file'), c.addResource);
r.delete('/:id/resources/:resourceId',protect, adminOnly, c.deleteResource);
module.exports = r;
