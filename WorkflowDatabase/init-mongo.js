db.createUser({
  user: 'mve-workflowengine',
  pwd: 'mve-workflowengine-password',
  roles: [
    {
      role: 'readWrite',
      db: 'workflow-db',
    },
  ],
});