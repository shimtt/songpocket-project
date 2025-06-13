'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('RealtimeRanking', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false
      },
      artist: {
        type: Sequelize.STRING,
        allowNull: false
      },
      releaseDate: {
        type: Sequelize.DATE,
        allowNull: true
      },
      genre: {
        type: Sequelize.STRING,
        allowNull: true
      },
      youtubeUrl: {
        type: Sequelize.STRING,
        allowNull: false
      },
      youtubeThumbnail: {
        type: Sequelize.STRING,
        allowNull: false
      },
      viewCount: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      playlist: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      isCurrentTop100: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('RealtimeRanking');
  }
};
