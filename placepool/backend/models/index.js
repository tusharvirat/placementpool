const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

/* ── User ─────────────────────────────────── */
const userSchema = new mongoose.Schema({
  name:       { type: String, required: true, trim: true },
  email:      { type: String, required: true, unique: true, lowercase: true },
  password:   { type: String, required: true, select: false },
  rollNo:     { type: String, trim: true },
  role:       { type: String, enum: ['student','admin'], default: 'student' },
  isVerified: { type: Boolean, default: false },
  otp:        { type: String, select: false },
  otpExpiry:  { type: Date,   select: false },
}, { timestamps: true });
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});
userSchema.methods.matchPassword = function (plain) {
  return bcrypt.compare(plain, this.password);
};
const User = mongoose.model('User', userSchema);

/* ── DSA Topic ────────────────────────────── */
const dsaTopicSchema = new mongoose.Schema({
  name:        { type: String, required: true, unique: true, trim: true },
  description: String,
  order:       { type: Number, default: 0 },
}, { timestamps: true });
const DSATopic = mongoose.model('DSATopic', dsaTopicSchema);

/* ── DSA Problem ──────────────────────────── */
const dsaProblemSchema = new mongoose.Schema({
  name:        { type: String, required: true, trim: true },
  topic:       { type: mongoose.Schema.Types.ObjectId, ref: 'DSATopic', required: true },
  difficulty:  { type: String, enum: ['easy','medium','hard'], required: true },
  leetcodeUrl: { type: String, trim: true },
  description: String,
  companyTags: [String],
  isActive:    { type: Boolean, default: true },
}, { timestamps: true });
const DSAProblem = mongoose.model('DSAProblem', dsaProblemSchema);

/* ── Subject ──────────────────────────────── */
const subjectSchema = new mongoose.Schema({
  name:     { type: String, required: true, unique: true },
  icon:     { type: String, default: '📚' },
  color:    { type: String, default: '#ede9fe' },
  topics:   [{ name: String, description: String }],
  isActive: { type: Boolean, default: true },
}, { timestamps: true });
const Subject = mongoose.model('Subject', subjectSchema);

/* ── Subject Question ─────────────────────── */
const subjectQuestionSchema = new mongoose.Schema({
  subject:    { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
  topicName:  { type: String, required: true },
  question:   { type: String, required: true },
  answer:     { type: String, required: true },
  type:       { type: String, enum: ['MCQ','Short Answer','True/False','Long Answer','Fill in the Blank'], default: 'Short Answer' },
  options:    [String],
  difficulty: { type: String, enum: ['easy','medium','hard'], default: 'medium' },
  isActive:   { type: Boolean, default: true },
}, { timestamps: true });
const SubjectQuestion = mongoose.model('SubjectQuestion', subjectQuestionSchema);

/* ── Aptitude Category ────────────────────── */
const aptCatSchema = new mongoose.Schema({
  name:     { type: String, required: true, unique: true },
  icon:     { type: String, default: '🧠' },
  color:    { type: String, default: '#ede9fe' },
  isActive: { type: Boolean, default: true },
});
const AptitudeCategory = mongoose.model('AptitudeCategory', aptCatSchema);

/* ── Aptitude Question ────────────────────── */
const aptQSchema = new mongoose.Schema({
  category:    { type: mongoose.Schema.Types.ObjectId, ref: 'AptitudeCategory', required: true },
  question:    { type: String, required: true },
  options:     [String],
  answer:      { type: String, required: true },
  explanation: String,
  difficulty:  { type: String, enum: ['easy','medium','hard'], default: 'medium' },
  isActive:    { type: Boolean, default: true },
}, { timestamps: true });
const AptitudeQuestion = mongoose.model('AptitudeQuestion', aptQSchema);

/* ── Company Resource ─────────────────────── */
const resourceSchema = new mongoose.Schema({
  name:         { type: String, required: true },
  type:         { type: String, enum: ['pdf','video','sheet','note','link','image','ppt','other'], default: 'other' },
  description:  String,
  url:          String,           // Cloudinary URL or external link
  secureUrl:    String,           // Cloudinary secure_url (always HTTPS)
  filePublicId: String,
  fileName:     String,
  mimeType:     String,
  addedAt:      { type: Date, default: Date.now },
});

/* ── Company ──────────────────────────────── */
const companySchema = new mongoose.Schema({
  name:        { type: String, required: true, trim: true },
  role:        String,
  emoji:       { type: String, default: '🏢' },
  logoUrl:     String,            // imported logo image URL
  accentColor: { type: String, default: '#7c3aed' },
  bgColor:     { type: String, default: '#ede9fe' },
  visitDate:   Date,              // when company visits campus
  isUpcoming:  { type: Boolean, default: false }, // show in upcoming section
  announcement:String,            // announcement text for upcoming companies
  tags:        [String],
  resources:   [resourceSchema],
  isActive:    { type: Boolean, default: true },
}, { timestamps: true });
const Company = mongoose.model('Company', companySchema);

/* ── Student Progress ─────────────────────── */
const progressSchema = new mongoose.Schema({
  user:           { type: mongoose.Schema.Types.ObjectId, ref: 'User', unique: true },
  solvedProblems: [{ type: mongoose.Schema.Types.ObjectId, ref: 'DSAProblem' }],
  aptitudeDone:   [{ type: mongoose.Schema.Types.ObjectId, ref: 'AptitudeQuestion' }],
  studiedTopics:  [{ subject: mongoose.Schema.Types.ObjectId, topic: String }],
  streak:         { type: Number, default: 0 },
  lastActivity:   Date,
  activityLog:    [{ date: String, count: { type: Number, default: 0 } }],
}, { timestamps: true });
const Progress = mongoose.model('Progress', progressSchema);

module.exports = { User, DSATopic, DSAProblem, Subject, SubjectQuestion, AptitudeCategory, AptitudeQuestion, Company, Progress };
