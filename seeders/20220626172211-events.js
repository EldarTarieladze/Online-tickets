'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      await queryInterface.bulkInsert('events', [{
        eventName: 'Event - 1',
        description: 'Event - 1 description',
        createdAt: new Date(),
        updatedAt: new Date()
      }, {
        eventName: 'Event - 2',
        description: 'Event - 2 description',
        createdAt: new Date(),
        updatedAt: new Date()
      }, {
        eventName: 'Event - 3',
        description: 'Event - 3 description',
        createdAt: new Date(),
        updatedAt: new Date()
      }, {
        eventName: 'Event - 4',
        description: 'Event - 4 description',
        createdAt: new Date(),
        updatedAt: new Date()
      }])
      const events = await queryInterface.sequelize.query(
        `SELECT id from events;`
      );
      let ticket = []
      events[0].map(event => {
        for (let k = 0; k < 10; k++) {
          ticket.push({
            name: `Ticket - ${k}`,
            rowNumber: 5,
            sellingOptions: Sequelize.literal(`ARRAY['EVEN', 'ALL_TOGETHER']::"enum_tickets_sellingOptions"[]`),
            eventId: event.id,
            createdAt: new Date(),
            updatedAt: new Date()
          })
        }
      })
      console.log(ticket)
      await queryInterface.bulkInsert('tickets', ticket)

    } catch (err) {
      throw err;
    }
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
    */
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('tickets', null, {});
    // await queryInterface.dropEnum('enum_reservations_paymentStatus')
    // await queryInterface.dropEnum('enum_tickets_sellingOptions')
    await queryInterface.bulkDelete('events', null, {});
  }
};
