const { Company }            = require('../models');
const { cloudinary, upload } = require('../config/cloudinary');

exports.uploadMiddleware      = upload.single('file');
exports.logoUploadMiddleware  = upload.single('logo');

exports.getCompanies = async (req,res) => {
  try { res.json({ success:true, data: await Company.find({ isActive:true }).sort('-createdAt') }); }
  catch(e){ res.status(500).json({ success:false, message:e.message }); }
};

exports.createCompany = async (req,res) => {
  try {
    const data = { ...req.body };
    // tags may come as comma-string from FormData
    if (typeof data.tags === 'string') data.tags = data.tags.split(',').map(t=>t.trim()).filter(Boolean);
    // Handle logo file upload
    if (req.file) data.logoUrl = req.file.secure_url || req.file.path;
    const co = await Company.create(data);
    res.status(201).json({ success:true, data: co });
  } catch(e){ res.status(400).json({ success:false, message:e.message }); }
};

exports.updateCompany = async (req,res) => {
  try {
    const data = { ...req.body };
    if (typeof data.tags === 'string') data.tags = data.tags.split(',').map(t=>t.trim()).filter(Boolean);
    if (req.file) data.logoUrl = req.file.secure_url || req.file.path;
    res.json({ success:true, data: await Company.findByIdAndUpdate(req.params.id, data, {new:true}) });
  } catch(e){ res.status(500).json({ success:false, message:e.message }); }
};

exports.deleteCompany = async (req,res) => {
  try { await Company.findByIdAndUpdate(req.params.id, { isActive:false }); res.json({ success:true }); }
  catch(e){ res.status(500).json({ success:false, message:e.message }); }
};

// POST /api/companies/:id/resources
exports.addResource = async (req,res) => {
  try {
    const company = await Company.findById(req.params.id);
    if (!company) return res.status(404).json({ success:false, message:'Company not found' });

    const resource = {
      name:        (req.body.name||'').trim(),
      type:        req.body.type || 'other',
      description: (req.body.description||'').trim(),
      url:         (req.body.url||'').trim(),
    };

    if (!resource.name) return res.status(400).json({ success:false, message:'Resource name is required' });

    // File uploaded via Cloudinary
    if (req.file) {
      // Use secure_url (https) — this is the key PDF 401 fix
      resource.url          = req.file.secure_url || req.file.path;
      resource.secureUrl    = req.file.secure_url || req.file.path;
      resource.filePublicId = req.file.filename || req.file.public_id;
      resource.fileName     = req.file.originalname;
      resource.mimeType     = req.file.mimetype;
      // Auto-detect type from mimetype
      if (!req.body.type || req.body.type === 'other') {
        const mime = req.file.mimetype || '';
        if (mime.includes('pdf'))        resource.type = 'pdf';
        else if (mime.includes('video')) resource.type = 'video';
        else if (mime.includes('image')) resource.type = 'image';
        else if (mime.includes('presentation') || mime.includes('powerpoint')) resource.type = 'ppt';
        else if (mime.includes('word') || mime.includes('document')) resource.type = 'note';
        else if (mime.includes('sheet') || mime.includes('excel')) resource.type = 'sheet';
      }
    }

    company.resources.push(resource);
    await company.save();
    res.json({ success:true, data:company });
  } catch(e) {
    console.error('addResource error:', e);
    res.status(500).json({ success:false, message: e.message || 'Failed to add resource' });
  }
};

// DELETE /api/companies/:id/resources/:resourceId
exports.deleteResource = async (req,res) => {
  try {
    const company = await Company.findById(req.params.id);
    if (!company) return res.status(404).json({ success:false, message:'Company not found' });
    const resource = company.resources.id(req.params.resourceId);
    if (!resource) return res.status(404).json({ success:false, message:'Resource not found' });
    if (resource.filePublicId) {
      try { await cloudinary.uploader.destroy(resource.filePublicId, { resource_type:'auto' }); }
      catch(ce){ console.warn('Cloudinary delete warning:', ce.message); }
    }
    company.resources.pull({ _id: req.params.resourceId });
    await company.save();
    res.json({ success:true, data:company });
  } catch(e) {
    console.error('deleteResource error:', e);
    res.status(500).json({ success:false, message: e.message || 'Failed to delete resource' });
  }
};
