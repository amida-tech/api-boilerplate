import { DataTypes } from 'sequelize';

/**
 * User Schema
 */
export default {
  name: 'User',
  attribute: {
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  }
};
