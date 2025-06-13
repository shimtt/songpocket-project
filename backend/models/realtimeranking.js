'use strict';
const {
  Model
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class RealtimeRanking extends Model {
    static associate(models) {
      // 관계 없음
    }
  }

  RealtimeRanking.init({
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
    viewCount: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    playlist: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    isCurrentTop100: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    }
  }, {
    sequelize,
    modelName: 'RealtimeRanking',
    tableName: 'RealtimeRanking', // 테이블명 고정
  });

  return RealtimeRanking;
};
