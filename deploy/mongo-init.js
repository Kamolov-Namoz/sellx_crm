// MongoDB initialization script
db = db.getSiblingDB('sales-automation');

// Create application user
db.createUser({
  user: 'sellx',
  pwd: 'sellxpassword', // Change this in production!
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

print('Database initialized successfully');
