
const otpGen           = require('otp-generator');
const { User }         = require('../models');
const { sendOTPEmail } = require('../utils/email');
const { signToken }    = require('../middleware/auth');

const makeOTP = () => otpGen.generate(6, {
  upperCaseAlphabets: false, specialChars: false, lowerCaseAlphabets: false
});

exports.signup = async (req, res) => {
  try {
    const { name, email, password, rollNo } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ success: false, message: 'Name, email and password are required' });

    let user = await User.findOne({ email });
    if (user?.isVerified)
      return res.status(400).json({ success: false, message: 'Email already registered. Please login.' });

    const otp = makeOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    if (user) {
      user.name = name; user.password = password;
      user.rollNo = rollNo; user.otp = otp; user.otpExpiry = otpExpiry;
      await user.save();
    } else {
      user = await User.create({ name, email, password, rollNo, otp, otpExpiry });
    }

    try {
      await sendOTPEmail(email, name, otp);
    } catch (emailErr) {
      console.error('EMAIL SEND FAILED:', emailErr.message);
      // Delete the user we just created so they can retry
      if (!user.isVerified) await User.findByIdAndDelete(user._id);
      return res.status(500).json({
        success: false,
        message: `OTP email failed: ${emailErr.message}. Check EMAIL_PASS in Railway variables — it must be the 16-char Gmail App Password with no spaces.`
      });
    }

    res.json({ success: true, message: 'OTP sent to your email', email });
  } catch (e) {
    console.error('SIGNUP ERROR:', e.message);
    res.status(500).json({ success: false, message: e.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ success: false, message: 'Email and password are required' });

    const user = await User.findOne({ email }).select('+password +otp +otpExpiry');
    if (!user || !(await user.matchPassword(password)))
      return res.status(401).json({ success: false, message: 'Invalid email or password' });

    if (!user.isVerified)
      return res.status(401).json({ success: false, message: 'Account not verified. Please sign up first.' });

    const otp = makeOTP();
    user.otp = otp;
    user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    try {
      await sendOTPEmail(email, user.name, otp);
    } catch (emailErr) {
      console.error('EMAIL SEND FAILED:', emailErr.message);
      return res.status(500).json({
        success: false,
        message: `OTP email failed: ${emailErr.message}. Check EMAIL_PASS in Railway — must be 16-char Gmail App Password, no spaces.`
      });
    }

    res.json({ success: true, message: 'OTP sent to your email', email });
  } catch (e) {
    console.error('LOGIN ERROR:', e.message);
    res.status(500).json({ success: false, message: e.message });
  }
};

exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email }).select('+otp +otpExpiry');
    if (!user)
      return res.status(404).json({ success: false, message: 'User not found' });
    if (user.otp !== otp)
      return res.status(400).json({ success: false, message: 'Incorrect OTP. Please try again.' });
    if (user.otpExpiry < Date.now())
      return res.status(400).json({ success: false, message: 'OTP expired. Request a new one.' });

    user.isVerified = true; user.otp = undefined; user.otpExpiry = undefined;
    await user.save();

    const token = signToken(user._id);
    res.json({ success: true, token, user: { id: user._id, name: user.name, email: user.email, role: user.role, rollNo: user.rollNo } });
  } catch (e) {
    console.error('VERIFY OTP ERROR:', e.message);
    res.status(500).json({ success: false, message: e.message });
  }
};

exports.resendOTP = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    const otp = makeOTP();
    user.otp = otp; user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();
    await sendOTPEmail(email, user.name, otp);
    res.json({ success: true, message: 'OTP resent successfully' });
  } catch (e) {
    console.error('RESEND OTP ERROR:', e.message);
    res.status(500).json({ success: false, message: e.message });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: 'Email required' });
    const user = await User.findOne({ email, isVerified: true });
    if (!user) return res.status(404).json({ success: false, message: 'No verified account found with this email' });
    const otp = makeOTP();
    user.otp = otp; user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();
    await sendOTPEmail(email, user.name, otp);
    res.json({ success: true, message: 'Password reset OTP sent', email });
  } catch (e) {
    console.error('FORGOT PASSWORD ERROR:', e.message);
    res.status(500).json({ success: false, message: e.message });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword)
      return res.status(400).json({ success: false, message: 'Email, OTP and new password required' });
    const user = await User.findOne({ email }).select('+otp +otpExpiry');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (user.otp !== otp) return res.status(400).json({ success: false, message: 'Incorrect OTP' });
    if (user.otpExpiry < Date.now()) return res.status(400).json({ success: false, message: 'OTP expired' });
    user.password = newPassword; user.otp = undefined; user.otpExpiry = undefined;
    await user.save();
    res.json({ success: true, message: 'Password reset successful. You can now login.' });
  } catch (e) {
    console.error('RESET PASSWORD ERROR:', e.message);
    res.status(500).json({ success: false, message: e.message });
  }
};

exports.getMe = (req, res) => res.json({ success: true, user: req.user });
