'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class LatteSong extends Model {
    static associate(models) {
      LatteSong.belongsTo(models.PlaylistTable, {
        foreignKey: 'playlist_table_id',
        onDelete: 'SET NULL'
      });
    }
  }
  LatteSong.init({
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    artist: {
      type: DataTypes.STRING,
      allowNull: false
    },
    releaseDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    genre: {
      type: DataTypes.STRING,
      allowNull: true
    },
    youtubeUrl: {
      type: DataTypes.STRING,
      allowNull: false
    },
    youtubeThumbnail: {
      type: DataTypes.STRING,
      allowNull: false
    },
    playlist: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    viewCount: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    uuid: {
      type: DataTypes.STRING,
      allowNull: false
    },
    playlist_table_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'LatteSong',
    tableName: 'LatteSongs',
    timestamps: true
  });
  return LatteSong;
};