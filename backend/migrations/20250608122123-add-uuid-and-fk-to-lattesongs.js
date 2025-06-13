'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. uuid 추가
    await queryInterface.addColumn('LatteSongs', 'uuid', {
      type: Sequelize.STRING,
      allowNull: false,
    });

    // 2. playlist_table_id 추가 (FK)
    await queryInterface.addColumn('LatteSongs', 'playlist_table_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'playlisttables',  // FK 참조
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('LatteSongs', 'playlist_table_id');
    await queryInterface.removeColumn('LatteSongs', 'uuid');
  }
};
