const { Subject, SubjectQuestion } = require('../models');

exports.getSubjects = async (req,res) => {
  try { res.json({ success:true, data: await Subject.find({isActive:true}) }); }
  catch(e){ res.status(500).json({ success:false, message:e.message }); }
};
exports.createSubject = async (req,res) => {
  try { res.status(201).json({ success:true, data: await Subject.create(req.body) }); }
  catch(e){ res.status(400).json({ success:false, message:e.message }); }
};
exports.updateSubject = async (req,res) => {
  try { res.json({ success:true, data: await Subject.findByIdAndUpdate(req.params.id,req.body,{new:true}) }); }
  catch(e){ res.status(500).json({ success:false, message:e.message }); }
};
exports.deleteSubject = async (req,res) => {
  try { await Subject.findByIdAndUpdate(req.params.id,{isActive:false}); res.json({ success:true }); }
  catch(e){ res.status(500).json({ success:false, message:e.message }); }
};
exports.getQuestions = async (req,res) => {
  try {
    const f={isActive:true};
    if(req.query.subject) f.subject=req.query.subject;
    if(req.query.difficulty) f.difficulty=req.query.difficulty;
    res.json({ success:true, data: await SubjectQuestion.find(f).populate('subject','name icon color').sort('createdAt') });
  } catch(e){ res.status(500).json({ success:false, message:e.message }); }
};
exports.createQuestion = async (req,res) => {
  try {
    const created = await SubjectQuestion.create(req.body);
    // Populate subject before returning so frontend shows subject name immediately (P1 fix)
    const populated = await SubjectQuestion.findById(created._id).populate('subject','name icon color');
    res.status(201).json({ success:true, data: populated });
  }
  catch(e){ res.status(400).json({ success:false, message:e.message }); }
};
exports.updateQuestion = async (req,res) => {
  try { res.json({ success:true, data: await SubjectQuestion.findByIdAndUpdate(req.params.id,req.body,{new:true}).populate('subject','name') }); }
  catch(e){ res.status(500).json({ success:false, message:e.message }); }
};
exports.deleteQuestion = async (req,res) => {
  try { await SubjectQuestion.findByIdAndUpdate(req.params.id,{isActive:false}); res.json({ success:true }); }
  catch(e){ res.status(500).json({ success:false, message:e.message }); }
};
