const { User, DSATopic, Subject, AptitudeCategory } = require('../models');

exports.seedAll = async () => {
  try {
    // Admin
    if (!(await User.findOne({ email: process.env.ADMIN_EMAIL }))) {
      await User.create({ name: process.env.ADMIN_NAME || 'Admin', email: process.env.ADMIN_EMAIL, password: process.env.ADMIN_PASSWORD, role: 'admin', isVerified: true });
      console.log('✅ Admin seeded');
    }
    // DSA Topics
    if (!(await DSATopic.countDocuments())) {
      const names = ['Arrays','Linked Lists','Trees & BST','Dynamic Programming','Graphs','Stacks & Queues','Strings','Binary Search','Backtracking','Greedy','Heap','Tries'];
      await DSATopic.insertMany(names.map((name, order) => ({ name, order })));
      console.log('✅ DSA topics seeded');
    }
    // Subjects
    if (!(await Subject.countDocuments())) {
      await Subject.insertMany([
        { name:'Operating Systems', icon:'⚙️', color:'#dbeafe', topics:[{name:'Processes & Threads'},{name:'Scheduling'},{name:'Memory Management'},{name:'Deadlocks'},{name:'File Systems'}]},
        { name:'DBMS',              icon:'🗄️', color:'#d1fae5', topics:[{name:'Normalization'},{name:'SQL'},{name:'Transactions'},{name:'Indexing'},{name:'Joins'}]},
        { name:'Computer Networks', icon:'🌐', color:'#fef3c7', topics:[{name:'OSI Model'},{name:'TCP/IP'},{name:'HTTP'},{name:'DNS'},{name:'Routing'}]},
        { name:'OOP',               icon:'📦', color:'#ede9fe', topics:[{name:'Inheritance'},{name:'Polymorphism'},{name:'Abstraction'},{name:'SOLID'},{name:'Design Patterns'}]},
        { name:'System Design',     icon:'🏗️', color:'#fef9c3', topics:[{name:'Scalability'},{name:'Load Balancing'},{name:'Caching'},{name:'Databases'},{name:'Microservices'}]},
      ]);
      console.log('✅ Subjects seeded');
    }
    // Aptitude
    if (!(await AptitudeCategory.countDocuments())) {
      await AptitudeCategory.insertMany([
        { name:'Quantitative Aptitude', icon:'🔢', color:'#dbeafe' },
        { name:'Logical Reasoning',     icon:'🧩', color:'#ede9fe' },
        { name:'Verbal Ability',        icon:'📖', color:'#d1fae5' },
        { name:'Data Interpretation',   icon:'📊', color:'#fef3c7' },
        { name:'Abstract Reasoning',    icon:'🔷', color:'#fce7f3' },
        { name:'Technical MCQs',        icon:'💡', color:'#fef9c3' },
      ]);
      console.log('✅ Aptitude categories seeded');
    }
  } catch (e) { console.error('Seed error:', e.message); }
};
