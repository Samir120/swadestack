import User, { UserAttributes } from '../models/sequelize/User';
import Address from '../models/sequelize/Address';
import { validatePassword } from '../utils/passwordValidator';

export class UserProfileService {
  async getUserProfile(userId: string) {
    const user = await User.findByPk(userId, {
      attributes: { exclude: ['password'] },
    });

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  }

  async updateProfile(userId: string, data: Partial<UserAttributes>) {
    const user = await User.findByPk(userId);

    if (!user) {
      throw new Error('User not found');
    }

    // Fields that can be updated
    const allowedFields = [
      'firstName',
      'lastName',
      'phone',
      'address',
      'city',
      'postalCode',
      'country',
      'avatarUrl',
      'dateOfBirth',
      'company',
      'organizationNumber',
      'vatNumber',
    ];

    // Validate company-specific fields if userType is company
    if (user.userType === 'company') {
      if (data.company !== undefined && !data.company) {
        throw new Error('Company name is required for company accounts');
      }
      if (data.organizationNumber !== undefined && !data.organizationNumber) {
        throw new Error('Organization number is required for company accounts');
      }
      if (data.vatNumber !== undefined && !data.vatNumber) {
        throw new Error('VAT number is required for company accounts');
      }
    }

    // Filter to only allowed fields and clean data
    const updateData: Partial<UserAttributes> = {};
    allowedFields.forEach((field) => {
      if (data[field as keyof UserAttributes] !== undefined) {
        let value = data[field as keyof UserAttributes];

        // Convert empty strings to null for optional fields (except for company type)
        if (value === '' || value === null) {
          // For company users, company fields should not be null
          if (user.userType === 'company' && ['company', 'organizationNumber', 'vatNumber'].includes(field)) {
            if (!value) {
              return; // Skip this field, will be caught by validation above
            }
          }
          value = null as any;
        }

        // Special handling for dateOfBirth - ensure proper format or null
        if (field === 'dateOfBirth' && value) {
          // If it's a string, validate it's a proper date
          if (typeof value === 'string') {
            const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
            if (!dateRegex.test(value)) {
              throw new Error('Invalid date format. Use YYYY-MM-DD');
            }
          }
        }

        (updateData as any)[field] = value;
      }
    });

    await user.update(updateData);

    // Sync address fields to the Address table so admin panel sees them
    const addressFields = ['address', 'city', 'postalCode', 'country'];
    const hasAddressUpdate = addressFields.some(f => f in updateData);
    if (hasAddressUpdate) {
      const updatedUser = user.toJSON() as UserAttributes;
      const streetAddress = updatedUser.address;
      const city = updatedUser.city;
      const postalCode = updatedUser.postalCode;

      if (streetAddress && city && postalCode) {
        const fullName = [updatedUser.firstName, updatedUser.lastName].filter(Boolean).join(' ') || '';
        const country = updatedUser.country || 'Sweden';

        // Find existing default shipping address or create one
        const existingAddress = await Address.findOne({
          where: { userId, type: 'shipping', isDefault: true } as any,
        });

        if (existingAddress) {
          await existingAddress.update({
            fullName,
            streetAddress,
            city,
            postalCode,
            country,
            phone: updatedUser.phone || undefined,
            company: updatedUser.company || undefined,
            organizationNumber: updatedUser.organizationNumber || undefined,
          });
        } else {
          await Address.create({
            userId,
            type: 'shipping',
            isDefault: true,
            fullName,
            streetAddress,
            city,
            postalCode,
            country,
            phone: updatedUser.phone || undefined,
            company: updatedUser.company || undefined,
            organizationNumber: updatedUser.organizationNumber || undefined,
          });
        }
      }
    }

    // Return user without password
    const { password, ...userProfile } = user.toJSON() as UserAttributes;
    return userProfile;
  }

  /**
   * Update user email (requires re-authentication)
   */
  async updateEmail(userId: string, newEmail: string, currentPassword: string) {
    const user = await User.findByPk(userId);

    if (!user) {
      throw new Error('User not found');
    }

    // Verify current password
    const isPasswordValid = await user.comparePassword(currentPassword);
    if (!isPasswordValid) {
      throw new Error('Invalid password');
    }

    // Check if email is already taken
    const existingUser = await User.findOne({ where: { email: newEmail } });
    if (existingUser && existingUser.id !== userId) {
      throw new Error('Email already in use');
    }

    await user.update({ email: newEmail });

    const { password, ...userProfile } = user.toJSON() as UserAttributes;
    return userProfile;
  }

  /**
   * Change user password
   */
  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ) {
    const user = await User.findByPk(userId);

    if (!user) {
      throw new Error('User not found');
    }

    // Verify current password
    const isPasswordValid = await user.comparePassword(currentPassword);
    if (!isPasswordValid) {
      throw new Error('Invalid current password');
    }

    // Validate new password using shared policy
    const passwordCheck = validatePassword(newPassword);
    if (!passwordCheck.valid) {
      throw new Error(passwordCheck.message);
    }

    // Update password - the beforeUpdate hook will hash it automatically
    await user.update({ password: newPassword });

    return { message: 'Password updated successfully' };
  }

  /**
   * Upload/Update avatar
   */
  async updateAvatar(userId: string, avatarData: string) {
    const user = await User.findByPk(userId);

    if (!user) {
      throw new Error('User not found');
    }

    // Validate avatar data (should be base64, URL, or /uploads/ path)
    if (!avatarData.startsWith('data:') && !avatarData.startsWith('http') && !avatarData.startsWith('/uploads/')) {
      throw new Error('Invalid avatar format');
    }

    await user.update({ avatarUrl: avatarData });

    const { password, ...userProfile } = user.toJSON() as UserAttributes;
    return userProfile;
  }

  /**
   * Delete user account
   */
  async deleteAccount(userId: string, password: string) {
    const user = await User.findByPk(userId);

    if (!user) {
      throw new Error('User not found');
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw new Error('Invalid password');
    }

    await user.destroy();

    return { message: 'Account deleted successfully' };
  }
}

export default UserProfileService;
