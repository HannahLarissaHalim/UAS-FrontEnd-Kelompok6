const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'Nama depan harus diisi'],
    trim: true
  },
  lastName: {
    type: String,
    trim: true,
    default: ''
  },
  faculty: {
    type: String,
    required: [true, 'Fakultas harus diisi']
  },
  majorCode: {
    type: String,
    required: [true, 'Kode program studi harus diisi']
  },
  yearEntry: {
    type: Number,
    required: [true, 'Tahun masuk harus diisi']
  },
  npm: {
    type: String,
    required: [true, 'NPM harus diisi'],
    unique: true,
    validate: {
      validator: function(v) {
        return /^\d{9}$/.test(v);
      },
      message: props => 'NPM harus terdiri dari 9 digit angka'
    }
  },
  email: {
    type: String,
    required: [true, 'Email harus diisi'],
    unique: true,
    lowercase: true,
    validate: {
      validator: function(v) {
        return /^[a-z]+\.\d{9}@stu\.untar\.ac\.id$/.test(v);
      },
      message: 'Email harus menggunakan format Untar (namalengkap.npm@stu.untar.ac.id)'
    }
  },
  password: {
    type: String,
    required: [true, 'Password harus diisi'],
    minlength: [6, 'Password minimal 6 karakter']
  },
  role: {
    type: String,
    enum: ['customer', 'vendor', 'admin'],
    default: 'customer'
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to get full name
userSchema.methods.getFullName = function() {
  return this.lastName ? `${this.firstName} ${this.lastName}` : this.firstName;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
