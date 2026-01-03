// MongoDB initialization script
// Note: MONGO_USER and MONGO_PASSWORD are set via docker-compose environment variables

db = db.getSiblingDB('sales-automation');

// Create application user with environment variables
// These are passed from docker-compose.yml
const appUser = process.env.MONGO_USER || 'sellx';
const appPassword = process.env.MONGO_PASSWORD || 'sellxpassword';

db.createUser({
  user: appUser,
  pwd: appPassword,
  roles: [
    {
      role: 'readWrite',
      db: 'sales-automation'
    }
  ]
});

// Create indexes for better performance
db.users.createIndex({ username: 1 }, { unique: true });
db.clients.createIndex({ userId: 1, createdAt: -1 });
db.clients.createIndex({ userId: 1, status: 1 });
db.clients.createIndex({ userId: 1, followUpDate: 1 });
db.conversations.createIndex({ clientId: 1, createdAt: -1 });
db.conversations.createIndex({ userId: 1, clientId: 1 });
db.scheduledreminders.createIndex({ scheduledTime: 1, status: 1 });
db.scheduledreminders.createIndex({ clientId: 1, status: 1 });

print('Database initialized successfully with user: ' + appUser);
