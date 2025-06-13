'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Playlists', 'playlist_table_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'playlisttables', // FK로 연결할 테이블
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Playlists', 'playlist_table_id');
  }
};
