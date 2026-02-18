'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('SiteSettings', 'cookieConsentEnabled', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });
    await queryInterface.addColumn('SiteSettings', 'cookieConsentTitle_en', {
      type: Sequelize.STRING(255),
      allowNull: false,
      defaultValue: 'We use cookies',
    });
    await queryInterface.addColumn('SiteSettings', 'cookieConsentTitle_sv', {
      type: Sequelize.STRING(255),
      allowNull: false,
      defaultValue: 'Vi använder cookies',
    });
    await queryInterface.addColumn('SiteSettings', 'cookieConsentDescription_en', {
      type: Sequelize.TEXT,
      allowNull: false,
      defaultValue: 'This website uses cookies to ensure you get the best experience. By clicking "I accept", you consent to the use of all cookies in accordance with our cookie policy.',
    });
    await queryInterface.addColumn('SiteSettings', 'cookieConsentDescription_sv', {
      type: Sequelize.TEXT,
      allowNull: false,
      defaultValue: 'Denna webbplats använder cookies för att säkerställa att du får den bästa upplevelsen. Genom att klicka på "Jag accepterar" samtycker du till användningen av alla cookies i enlighet med vår cookiepolicy.',
    });
    await queryInterface.addColumn('SiteSettings', 'cookieConsentAcceptButton_en', {
      type: Sequelize.STRING(100),
      allowNull: false,
      defaultValue: 'I accept',
    });
    await queryInterface.addColumn('SiteSettings', 'cookieConsentAcceptButton_sv', {
      type: Sequelize.STRING(100),
      allowNull: false,
      defaultValue: 'Jag accepterar',
    });
    await queryInterface.addColumn('SiteSettings', 'cookieConsentReadMoreType', {
      type: Sequelize.STRING(20),
      allowNull: false,
      defaultValue: 'internal',
    });
    await queryInterface.addColumn('SiteSettings', 'cookieConsentReadMoreInternal', {
      type: Sequelize.STRING(500),
      allowNull: true,
    });
    await queryInterface.addColumn('SiteSettings', 'cookieConsentReadMoreExternal', {
      type: Sequelize.STRING(500),
      allowNull: true,
    });
    await queryInterface.addColumn('SiteSettings', 'cookieConsentExpiryDays', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 365,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('SiteSettings', 'cookieConsentEnabled');
    await queryInterface.removeColumn('SiteSettings', 'cookieConsentTitle_en');
    await queryInterface.removeColumn('SiteSettings', 'cookieConsentTitle_sv');
    await queryInterface.removeColumn('SiteSettings', 'cookieConsentDescription_en');
    await queryInterface.removeColumn('SiteSettings', 'cookieConsentDescription_sv');
    await queryInterface.removeColumn('SiteSettings', 'cookieConsentAcceptButton_en');
    await queryInterface.removeColumn('SiteSettings', 'cookieConsentAcceptButton_sv');
    await queryInterface.removeColumn('SiteSettings', 'cookieConsentReadMoreType');
    await queryInterface.removeColumn('SiteSettings', 'cookieConsentReadMoreInternal');
    await queryInterface.removeColumn('SiteSettings', 'cookieConsentReadMoreExternal');
    await queryInterface.removeColumn('SiteSettings', 'cookieConsentExpiryDays');
  },
};
