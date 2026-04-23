const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { createLogger } = require('../utils/logger');

class AuthService {
    constructor() {
        this.logger = createLogger('AuthService');
    }
    
    async register(userData) {
        try {
            const { name, email, password, role = 'user' } = userData;
            
            // Validation
            this._validateUserData(userData);
            
            // Check if user already exists
            const existingUser = await User.findOne({ email: email.toLowerCase() });
            if (existingUser) {
                throw new Error('User with this email already exists');
            }
            
            // Hash password
            const saltRounds = 12;
            const hashedPassword = await bcrypt.hash(password, saltRounds);
            
            // Create user
            const user = new User({
                name: name.trim(),
                email: email.toLowerCase().trim(),
                password: hashedPassword,
                role: role
            });
            
            await user.save();
            
            this.logger.info(`User registered successfully: ${email}`);
            
            return {
                success: true,
                message: 'User registered successfully',
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role
                }
            };
            
        } catch (error) {
            this.logger.error(`Registration failed: ${error.message}`);
            throw new Error(`Registration failed: ${error.message}`);
        }
    }
    
    async login(email, password) {
        try {
            // Validation
            this._validateLoginData({ email, password });
            
            // Find user
            const user = await User.findOne({ email: email.toLowerCase() });
            if (!user) {
                throw new Error('Invalid email or password');
            }
            
            // Check password
            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (!isPasswordValid) {
                throw new Error('Invalid email or password');
            }
            
            // Generate tokens
            const accessToken = this._generateAccessToken(user);
            const refreshToken = this._generateRefreshToken(user);
            
            // Update last login
            user.lastLogin = new Date();
            await user.save();
            
            this.logger.info(`User logged in successfully: ${email}`);
            
            return {
                success: true,
                message: 'Login successful',
                tokens: {
                    accessToken,
                    refreshToken,
                    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
                },
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    lastLogin: user.lastLogin
                }
            };
            
        } catch (error) {
            this.logger.error(`Login failed: ${error.message}`);
            throw new Error(`Login failed: ${error.message}`);
        }
    }
    
    async refreshToken(refreshToken) {
        try {
            // Verify refresh token
            const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
            
            if (decoded.type !== 'refresh') {
                throw new Error('Invalid refresh token');
            }
            
            // Find user
            const user = await User.findById(decoded.userId);
            if (!user) {
                throw new Error('User not found');
            }
            
            // Generate new access token
            const accessToken = this._generateAccessToken(user);
            
            this.logger.info(`Token refreshed for user: ${user.email}`);
            
            return {
                success: true,
                accessToken,
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role
                }
            };
            
        } catch (error) {
            this.logger.error(`Token refresh failed: ${error.message}`);
            throw new Error(`Token refresh failed: ${error.message}`);
        }
    }
    
    async changePassword(userId, currentPassword, newPassword) {
        try {
            // Find user
            const user = await User.findById(userId);
            if (!user) {
                throw new Error('User not found');
            }
            
            // Verify current password
            const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
            if (!isCurrentPasswordValid) {
                throw new Error('Current password is incorrect');
            }
            
            // Hash new password
            const saltRounds = 12;
            const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);
            
            // Update password
            user.password = hashedNewPassword;
            user.passwordChanged = new Date();
            await user.save();
            
            this.logger.info(`Password changed for user: ${user.email}`);
            
            return {
                success: true,
                message: 'Password changed successfully'
            };
            
        } catch (error) {
            this.logger.error(`Password change failed: ${error.message}`);
            throw new Error(`Password change failed: ${error.message}`);
        }
    }
    
    async updateProfile(userId, updateData) {
        try {
            const user = await User.findById(userId);
            if (!user) {
                throw new Error('User not found');
            }
            
            // Allowed fields for update
            const allowedFields = ['name', 'email'];
            const updates = {};
            
            Object.keys(updateData).forEach(key => {
                if (allowedFields.includes(key)) {
                    if (key === 'email') {
                        updates[key] = updateData[key].toLowerCase().trim();
                    } else {
                        updates[key] = updateData[key].trim();
                    }
                }
            });
            
            // Check for email uniqueness if email is being updated
            if (updates.email && updates.email !== user.email) {
                const existingUser = await User.findOne({ 
                    email: updates.email,
                    _id: { $ne: userId }
                });
                if (existingUser) {
                    throw new Error('Email already exists');
                }
            }
            
            // Update user
            Object.assign(user, updates);
            user.updatedAt = new Date();
            await user.save();
            
            this.logger.info(`Profile updated for user: ${user.email}`);
            
            return {
                success: true,
                message: 'Profile updated successfully',
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    updatedAt: user.updatedAt
                }
            };
            
        } catch (error) {
            this.logger.error(`Profile update failed: ${error.message}`);
            throw new Error(`Profile update failed: ${error.message}`);
        }
    }
    
    _generateAccessToken(user) {
        return jwt.sign(
            {
                userId: user._id,
                email: user.email,
                role: user.role,
                type: 'access'
            },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
        );
    }
    
    _generateRefreshToken(user) {
        return jwt.sign(
            {
                userId: user._id,
                email: user.email,
                type: 'refresh'
            },
            process.env.JWT_SECRET,
            { expiresIn: '30d' }
        );
    }
    
    _validateUserData(userData) {
        const { name, email, password } = userData;
        
        if (!name || name.trim().length < 2) {
            throw new Error('Name must be at least 2 characters long');
        }
        
        if (!email || !this._isValidEmail(email)) {
            throw new Error('Valid email is required');
        }
        
        if (!password || password.length < 8) {
            throw new Error('Password must be at least 8 characters long');
        }
        
        if (password.length > 128) {
            throw new Error('Password must be less than 128 characters');
        }
    }
    
    _validateLoginData(loginData) {
        const { email, password } = loginData;
        
        if (!email || !this._isValidEmail(email)) {
            throw new Error('Valid email is required');
        }
        
        if (!password || password.length < 1) {
            throw new Error('Password is required');
        }
    }
    
    _isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
}

module.exports = AuthService;
