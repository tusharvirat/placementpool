const { AptitudeCategory, AptitudeQuestion } = require('../models');

exports.getCategories = async (req,res) => {
  try { res.json({ success:true, data: await AptitudeCategory.find({ isActive:true }) }); }
  catch(e){ res.status(500).json({ success:false, message:e.message }); }
};
exports.createCategory = async (req,res) => {
  try { res.status(201).json({ success:true, data: await AptitudeCategory.create(req.body) }); }
  catch(e){ res.status(400).json({ success:false, message:e.message }); }
};
exports.deleteCategory = async (req,res) => {
  try { await AptitudeCategory.findByIdAndUpdate(req.params.id, { isActive:false }); res.json({ success:true }); }
  catch(e){ res.status(500).json({ success:false, message:e.message }); }
};
exports.getQuestions = async (req,res) => {
  try {
    const f={ isActive:true };
    if(req.query.category)   f.category=req.query.category;
    if(req.query.difficulty) f.difficulty=req.query.difficulty;
    // Always populate category so name shows up
    res.json({ success:true, data: await AptitudeQuestion.find(f).populate('category','name icon color').sort('createdAt') });
  } catch(e){ res.status(500).json({ success:false, message:e.message }); }
};
exports.createQuestion = async (req,res) => {
  try {
    const created = await AptitudeQuestion.create(req.body);
    // Populate category before returning so frontend shows category name immediately
    const populated = await AptitudeQuestion.findById(created._id).populate('category','name icon color');
    res.status(201).json({ success:true, data: populated });
  }
  catch(e){ res.status(400).json({ success:false, message:e.message }); }
};
exports.deleteQuestion = async (req,res) => {
  try { await AptitudeQuestion.findByIdAndUpdate(req.params.id, { isActive:false }); res.json({ success:true }); }
  catch(e){ res.status(500).json({ success:false, message:e.message }); }
};
