'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('SiteSettings', 'featureSectionTitle_en', {
      type: Sequelize.STRING(255),
      allowNull: false,
      defaultValue: 'What We Offer',
    });
    await queryInterface.addColumn('SiteSettings', 'featureSectionTitle_sv', {
      type: Sequelize.STRING(255),
      allowNull: false,
      defaultValue: 'Vad Vi Erbjuder',
    });
    await queryInterface.addColumn('SiteSettings', 'featureSectionSubtitle_en', {
      type: Sequelize.STRING(255),
      allowNull: false,
      defaultValue: 'Our Core Capabilities',
    });
    await queryInterface.addColumn('SiteSettings', 'featureSectionSubtitle_sv', {
      type: Sequelize.STRING(255),
      allowNull: false,
      defaultValue: 'Våra Kärnkompetenser',
    });
    await queryInterface.addColumn('SiteSettings', 'featureSectionImageFile', {
      type: Sequelize.TEXT,
      allowNull: true,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('SiteSettings', 'featureSectionTitle_en');
    await queryInterface.removeColumn('SiteSettings', 'featureSectionTitle_sv');
    await queryInterface.removeColumn('SiteSettings', 'featureSectionSubtitle_en');
    await queryInterface.removeColumn('SiteSettings', 'featureSectionSubtitle_sv');
    await queryInterface.removeColumn('SiteSettings', 'featureSectionImageFile');
  },
};
