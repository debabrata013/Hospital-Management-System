const { Sequelize, DataTypes } = require('sequelize');
console.log('Starting test...');

async function runTest() {
    console.log('Creating database connection...');
    const sequelize = new Sequelize({
        dialect: 'sqlite',
        storage: ':memory:',
        logging: false
    });

    try {
        console.log('Testing database connection...');
        await sequelize.authenticate();
        console.log('Database connection successful!');

        console.log('Defining Room model...');
        const Room = sequelize.define('Room', {
            roomNumber: {
                type: DataTypes.STRING,
                allowNull: false
            },
            type: {
                type: DataTypes.STRING,
                allowNull: false
            },
            status: {
                type: DataTypes.STRING,
                defaultValue: 'available'
            }
        });

        console.log('Syncing database...');
        await sequelize.sync({ force: true });
        console.log('Database synced!');

        console.log('Creating test room...');
        const room = await Room.create({
            roomNumber: '101',
            type: 'General'
        });

        console.log('Room created successfully:', room.toJSON());
        console.log('Test completed successfully!');

    } catch (error) {
        console.error('Error occurred:', error);
    } finally {
        console.log('Closing database connection...');
        await sequelize.close();
        console.log('Test finished.');
    }
}

console.log('Running test...');
runTest();
