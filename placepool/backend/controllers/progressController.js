const { Progress, DSAProblem } = require('../models');

const getOrCreate = async (uid) =>
  (await Progress.findOne({ user:uid })) || await Progress.create({ user:uid });

exports.getProgress = async (req,res) => {
  try { res.json({ success:true, data: await getOrCreate(req.user._id) }); }
  catch(e){ res.status(500).json({ success:false, message:e.message }); }
};

// Toggle problem solved/unsolved — also cleans up deleted problem IDs
exports.toggleProblem = async (req,res) => {
  try {
    const p   = await getOrCreate(req.user._id);
    const pid = req.params.problemId;

    // Verify problem still exists and is active
    const problem = await DSAProblem.findOne({ _id:pid, isActive:true });
    if (!problem) {
      // Problem was deleted — remove from solved list if present
      p.solvedProblems = p.solvedProblems.filter(id => id.toString() !== pid);
      await p.save();
      return res.json({ success:true, data:p, message:'Problem no longer exists' });
    }

    const idx = p.solvedProblems.findIndex(id => id.toString() === pid);
    if (idx >= 0) {
      p.solvedProblems.splice(idx, 1);
    } else {
      p.solvedProblems.push(pid);
      const today = new Date().toISOString().split('T')[0];
      const log   = p.activityLog.find(l => l.date === today);
      if (log) log.count++; else p.activityLog.push({ date:today, count:1 });
    }
    p.lastActivity = new Date();
    // Update streak
    const yesterday = new Date(); yesterday.setDate(yesterday.getDate()-1);
    const yKey = yesterday.toISOString().split('T')[0];
    const todayKey = new Date().toISOString().split('T')[0];
    const hadYesterday = p.activityLog.find(l=>l.date===yKey && l.count>0);
    const hasToday     = p.activityLog.find(l=>l.date===todayKey && l.count>0);
    if (hasToday && hadYesterday) p.streak = (p.streak||0) + (idx>=0 ? 0 : 1);
    else if (!hasToday) p.streak = 0;
    await p.save();
    res.json({ success:true, data:p });
  } catch(e){ res.status(500).json({ success:false, message:e.message }); }
};

exports.toggleAptitude = async (req,res) => {
  try {
    const p   = await getOrCreate(req.user._id);
    const qid = req.params.questionId;
    const idx = p.aptitudeDone.findIndex(id => id.toString() === qid);
    if (idx >= 0) p.aptitudeDone.splice(idx, 1);
    else           p.aptitudeDone.push(qid);
    await p.save();
    res.json({ success:true, data:p });
  } catch(e){ res.status(500).json({ success:false, message:e.message }); }
};

// Clean up progress — remove solved IDs for deleted problems
exports.cleanProgress = async (req,res) => {
  try {
    const p = await getOrCreate(req.user._id);
    const activeProblems = await DSAProblem.find({ isActive:true }).select('_id');
    const activeIds = new Set(activeProblems.map(x=>x._id.toString()));
    const before = p.solvedProblems.length;
    p.solvedProblems = p.solvedProblems.filter(id => activeIds.has(id.toString()));
    const removed = before - p.solvedProblems.length;
    if (removed > 0) await p.save();
    res.json({ success:true, data:p, removed });
  } catch(e){ res.status(500).json({ success:false, message:e.message }); }
};
