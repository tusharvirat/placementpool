const r=require('express').Router();
const c=require('../controllers/progressController');
const {protect}=require('../middleware/auth');
r.get('/',                            protect, c.getProgress);
r.get('/clean',                       protect, c.cleanProgress);
r.post('/toggle-problem/:problemId',  protect, c.toggleProblem);
r.post('/toggle-aptitude/:questionId',protect, c.toggleAptitude);
module.exports=r;
