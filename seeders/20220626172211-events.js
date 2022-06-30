'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      await queryInterface.bulkInsert('events', [
        {
          eventName: 'Event - 1',
          description: 'Event - 1 description',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        // {
        //   eventName: 'Event - 2',
        //   description: 'Event - 2 description',
        //   createdAt: new Date(),
        //   updatedAt: new Date(),
        // },
        // {
        //   eventName: 'Event - 3',
        //   description: 'Event - 3 description',
        //   createdAt: new Date(),
        //   updatedAt: new Date(),
        // },
        // {
        //   eventName: 'Event - 4',
        //   description: 'Event - 4 description',
        //   createdAt: new Date(),
        //   updatedAt: new Date(),
        // },
      ]);
      const events = await queryInterface.sequelize.query(
        `SELECT id from events;`,
      );
      let ticket = [];
      const min = 4;
      const max = 6;
      const random = (min, max) =>
        Math.floor(Math.random() * (max - min)) + min;
      console.log(events);
      events[0].map((event) => {
        for (let k = 0; k < 20; k++) {
          ticket.push({
            name: `Ticket - ${k}`,
            rowNumber: k / 10 <= 1 ? 5 : 6,
            sellingOptions: Sequelize.literal(
              `ARRAY['EVEN', 'ALL_TOGETHER']::"enum_tickets_sellingOptions"[]`,
            ),
            price: 10,
            eventId: event.id,
            createdAt: new Date(),
            updatedAt: new Date(),
          });
        }
      });
      console.log(ticket);
      await queryInterface.bulkInsert('tickets', ticket);
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
  },
};
