'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('Playlists', 'releaseDate', {
      type: Sequelize.STRING,
      allowNull: true
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('Playlists', 'releaseDate', {
      type: Sequelize.DATE,
      allowNull: true
    });
  }
};
