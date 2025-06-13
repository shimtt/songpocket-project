'use strict';
const {
  Model
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Playlist extends Model {
    static associate(models) {
      // playlisttable과의 관계 설정
      Playlist.belongsTo(models.PlaylistTable, {
        foreignKey: 'playlist_table_id',
        onDelete: 'SET NULL',
      })
    }
  }

  Playlist.init({
    uuid: {
      type: DataTypes.STRING,
      allowNull: false
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    artist: {
      type: DataTypes.STRING,
      allowNull: false
    },
    releaseDate: {
      type: DataTypes.STRING,
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
    playlist_table_id: { // FK 필드 정의
      type: DataTypes.INTEGER,
      allowNull: true
    },
    viewCount: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'Playlist',
    tableName: 'Playlists', // 테이블 이름 고정
  });

  return Playlist;
};
