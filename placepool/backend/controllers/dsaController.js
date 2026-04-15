const { DSATopic, DSAProblem } = require('../models');

exports.getTopics = async (req,res) => {
  try { res.json({ success:true, data: await DSATopic.find().sort('order') }); }
  catch(e){ res.status(500).json({ success:false, message:e.message }); }
};
exports.createTopic = async (req,res) => {
  try { res.status(201).json({ success:true, data: await DSATopic.create(req.body) }); }
  catch(e){ res.status(400).json({ success:false, message:e.message }); }
};
exports.updateTopic = async (req,res) => {
  try { res.json({ success:true, data: await DSATopic.findByIdAndUpdate(req.params.id,req.body,{new:true}) }); }
  catch(e){ res.status(500).json({ success:false, message:e.message }); }
};
exports.deleteTopic = async (req,res) => {
  try { await DSATopic.findByIdAndDelete(req.params.id); res.json({ success:true }); }
  catch(e){ res.status(500).json({ success:false, message:e.message }); }
};
exports.getProblems = async (req,res) => {
  try {
    const f={isActive:true};
    if(req.query.topic) f.topic=req.query.topic;
    if(req.query.difficulty) f.difficulty=req.query.difficulty;
    res.json({ success:true, data: await DSAProblem.find(f).populate('topic','name').sort('createdAt') });
  } catch(e){ res.status(500).json({ success:false, message:e.message }); }
};
exports.createProblem = async (req,res) => {
  try {
    const created = await DSAProblem.create(req.body);
    // Populate topic before returning so frontend shows topic name immediately (P1 fix)
    const populated = await DSAProblem.findById(created._id).populate('topic','name');
    res.status(201).json({ success:true, data: populated });
  }
  catch(e){ res.status(400).json({ success:false, message:e.message }); }
};
exports.updateProblem = async (req,res) => {
  try { res.json({ success:true, data: await DSAProblem.findByIdAndUpdate(req.params.id,req.body,{new:true}).populate('topic','name') }); }
  catch(e){ res.status(500).json({ success:false, message:e.message }); }
};
exports.deleteProblem = async (req,res) => {
  try { await DSAProblem.findByIdAndUpdate(req.params.id,{isActive:false}); res.json({ success:true }); }
  catch(e){ res.status(500).json({ success:false, message:e.message }); }
};
