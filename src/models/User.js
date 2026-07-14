const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
    },
    password: {
      type: String,
      required: function () {
        return this.authProvider === 'email';
      },
      minlength: [6, 'Password must be at least 6 characters long'],
      select: false,
    },
    authProvider: {
      type: String,
      enum: ['email', 'google', 'apple'],
      default: 'email',
    },
    providerId: {
      type: String,
      default: null,
    },
    avatar: {
      type: String,
      default: '',
    },
    company: {
      type: String,
      default: '',
      trim: true,
    },
    profession: {
      type: String,
      default: '',
      trim: true,
    },
    phone: {
      type: String,
      default: '',
      trim: true,
    },
    city: {
      type: String,
      default: '',
      trim: true,
    },
    country: {
      type: String,
      default: '',
      trim: true,
    },
    subscriptionStatus: {
      type: String,
      enum: ['free', 'premium'],
      default: 'free',
    },
    preferredUnits: {
      type: String,
      enum: ['Metric', 'Imperial'],
      default: 'Metric',
    },
    preferredCurrency: {
      type: String,
      enum: ['PKR', 'USD', 'AED'],
      default: 'PKR',
    },
    projects: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
      },
    ],
    reports: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Report',
      },
    ],
    calculations: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Calculation',
      },
    ],
    resetPasswordToken: {
      type: String,
      default: null,
    },
    resetPasswordExpires: {
      type: Date,
      default: null,
    },
    resetPasswordOTP: {
      type: String,
      default: null,
    },
    resetPasswordOTPExpires: {
      type: Date,
      default: null,
    },
    pushResetSession: {
      token: {
        type: String,
        default: null,
      },
      status: {
        type: String,
        enum: ['pending', 'approved'],
        default: 'pending',
      },
      expiresAt: {
        type: Date,
        default: null,
      },
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for provider credentials lookup optimization
userSchema.index({ authProvider: 1, providerId: 1 });

// Pre-save hook to hash password if modified
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare entered password with hashed password
userSchema.methods.comparePassword = async function (candidatePassword) {
  if (!this.password) return false;
  return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);

module.exports = User;
