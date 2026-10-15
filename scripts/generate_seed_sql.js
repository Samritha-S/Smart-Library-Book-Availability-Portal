// Script to generate exact 200-copy seed data for Supabase
import fs from 'fs';
import path from 'path';

const LIB_ID = '00000000-0000-0000-0000-000000000001';

const subjects = [
  'Computer Science & AI',
  'Electronics & Electrical Engineering',
  'Mathematics & Data Science',
  'Mechanical Engineering & Physics'
];

const books = [
  // Subject 1: Computer Science & AI (Multi-editions & standards)
  {
    id: '10000000-0000-0000-0000-000000000001',
    title: 'Introduction to Algorithms',
    author: 'Thomas H. Cormen, Charles E. Leiserson, Ronald L. Rivest, Clifford Stein',
    subject: 'Computer Science & AI',
    description: 'Comprehensive modern textbook on computer algorithms, covering data structures, graph algorithms, and dynamic programming.',
    course_codes: ['CS201', 'CS501'],
    editions: [
      {
        id: '20000000-0000-0000-0000-000000000001',
        isbn: '9780262033848',
        edition_no: 3,
        publisher: 'MIT Press',
        year: 2009,
        cover_url: 'https://images.unsplash.com/photo-1532012164546-f432f2e37b73?w=500&auto=format&fit=crop&q=60',
        copy_count: 8,
        shelf_prefix: 'CS-ALGO-03'
      },
      {
        id: '20000000-0000-0000-0000-000000000002',
        isbn: '9780262046305',
        edition_no: 4,
        publisher: 'MIT Press',
        year: 2022,
        cover_url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500&auto=format&fit=crop&q=60',
        copy_count: 12,
        shelf_prefix: 'CS-ALGO-04'
      }
    ]
  },
  {
    id: '10000000-0000-0000-0000-000000000002',
    title: 'Computer Networking: A Top-Down Approach',
    author: 'James F. Kurose, Keith W. Ross',
    subject: 'Computer Science & AI',
    description: 'Premier textbook focusing on Internet protocols and network architectural layers from the application down.',
    course_codes: ['CS304'],
    editions: [
      {
        id: '20000000-0000-0000-0000-000000000003',
        isbn: '9780133594140',
        edition_no: 7,
        publisher: 'Pearson',
        year: 2016,
        cover_url: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=500&auto=format&fit=crop&q=60',
        copy_count: 7,
        shelf_prefix: 'CS-NET-07'
      },
      {
        id: '20000000-0000-0000-0000-000000000004',
        isbn: '9780136681557',
        edition_no: 8,
        publisher: 'Pearson',
        year: 2020,
        cover_url: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=500&auto=format&fit=crop&q=60',
        copy_count: 11,
        shelf_prefix: 'CS-NET-08'
      }
    ]
  },
  {
    id: '10000000-0000-0000-0000-000000000003',
    title: 'Artificial Intelligence: A Modern Approach',
    author: 'Stuart Russell, Peter Norvig',
    subject: 'Computer Science & AI',
    description: 'The standard and most cited synthesis of foundational and contemporary artificial intelligence concepts.',
    course_codes: ['AI301', 'CS602'],
    editions: [
      {
        id: '20000000-0000-0000-0000-000000000005',
        isbn: '9780136042594',
        edition_no: 3,
        publisher: 'Prentice Hall',
        year: 2009,
        cover_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500&auto=format&fit=crop&q=60',
        copy_count: 7,
        shelf_prefix: 'CS-AI-03'
      },
      {
        id: '20000000-0000-0000-0000-000000000006',
        isbn: '9780134610993',
        edition_no: 4,
        publisher: 'Pearson',
        year: 2020,
        cover_url: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=500&auto=format&fit=crop&q=60',
        copy_count: 11,
        shelf_prefix: 'CS-AI-04'
      }
    ]
  },
  {
    id: '10000000-0000-0000-0000-000000000004',
    title: 'Operating System Concepts',
    author: 'Abraham Silberschatz, Peter B. Galvin, Greg Gagne',
    subject: 'Computer Science & AI',
    description: 'Classic dinosaur book exploring process management, threads, memory paging, storage systems, and protection.',
    course_codes: ['CS202'],
    editions: [
      {
        id: '20000000-0000-0000-0000-000000000007',
        isbn: '9781118063330',
        edition_no: 9,
        publisher: 'Wiley',
        year: 2012,
        cover_url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=500&auto=format&fit=crop&q=60',
        copy_count: 7,
        shelf_prefix: 'CS-OS-09'
      },
      {
        id: '20000000-0000-0000-0000-000000000008',
        isbn: '9781119800361',
        edition_no: 10,
        publisher: 'Wiley',
        year: 2018,
        cover_url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=500&auto=format&fit=crop&q=60',
        copy_count: 9,
        shelf_prefix: 'CS-OS-10'
      }
    ]
  },
  {
    id: '10000000-0000-0000-0000-000000000005',
    title: 'Designing Data-Intensive Applications',
    author: 'Martin Kleppmann',
    subject: 'Computer Science & AI',
    description: 'The definitive guide to distributed databases, consensus, event streams, and reliable architecture.',
    course_codes: ['CS405'],
    editions: [
      {
        id: '20000000-0000-0000-0000-000000000009',
        isbn: '9781449373320',
        edition_no: 1,
        publisher: "O'Reilly Media",
        year: 2017,
        cover_url: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=500&auto=format&fit=crop&q=60',
        copy_count: 9,
        shelf_prefix: 'CS-DATA-01'
      }
    ]
  },

  // Subject 2: Electronics & Electrical Engineering
  {
    id: '10000000-0000-0000-0000-000000000006',
    title: 'Microelectronic Circuits',
    author: 'Adel S. Sedra, Kenneth C. Smith',
    subject: 'Electronics & Electrical Engineering',
    description: 'Gold standard textbook for analog and digital integrated circuit design and semiconductor physics.',
    course_codes: ['EC201', 'EC302'],
    editions: [
      {
        id: '20000000-0000-0000-0000-000000000010',
        isbn: '9780199339136',
        edition_no: 7,
        publisher: 'Oxford University Press',
        year: 2014,
        cover_url: 'https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=500&auto=format&fit=crop&q=60',
        copy_count: 7,
        shelf_prefix: 'EE-MIC-07'
      },
      {
        id: '20000000-0000-0000-0000-000000000011',
        isbn: '9780190853464',
        edition_no: 8,
        publisher: 'Oxford University Press',
        year: 2019,
        cover_url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=500&auto=format&fit=crop&q=60',
        copy_count: 9,
        shelf_prefix: 'EE-MIC-08'
      }
    ]
  },
  {
    id: '10000000-0000-0000-0000-000000000007',
    title: 'Signals and Systems',
    author: 'Alan V. Oppenheim, Alan S. Willsky, S. Hamid Nawab',
    subject: 'Electronics & Electrical Engineering',
    description: 'Continuous-time and discrete-time signals, Fourier transforms, Laplace, and Z-transform foundational analysis.',
    course_codes: ['EC203'],
    editions: [
      {
        id: '20000000-0000-0000-0000-000000000012',
        isbn: '9780138147570',
        edition_no: 2,
        publisher: 'Prentice Hall',
        year: 1996,
        cover_url: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=500&auto=format&fit=crop&q=60',
        copy_count: 10,
        shelf_prefix: 'EE-SIG-02'
      }
    ]
  },
  {
    id: '10000000-0000-0000-0000-000000000008',
    title: 'Modern Control Engineering',
    author: 'Katsuhiko Ogata',
    subject: 'Electronics & Electrical Engineering',
    description: 'Comprehensive coverage of classical control, root locus, Bode frequency response, and state-space equations.',
    course_codes: ['EE301'],
    editions: [
      {
        id: '20000000-0000-0000-0000-000000000013',
        isbn: '9780136156734',
        edition_no: 5,
        publisher: 'Prentice Hall',
        year: 2009,
        cover_url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=500&auto=format&fit=crop&q=60',
        copy_count: 8,
        shelf_prefix: 'EE-CTRL-05'
      }
    ]
  },

  // Subject 3: Mathematics & Data Science
  {
    id: '10000000-0000-0000-0000-000000000009',
    title: 'Linear Algebra and Its Applications',
    author: 'Gilbert Strang',
    subject: 'Mathematics & Data Science',
    description: 'Foundational text emphasizing vector spaces, matrix factorizations, eigenvalues, and SVD in engineering.',
    course_codes: ['MA101', 'DS201'],
    editions: [
      {
        id: '20000000-0000-0000-0000-000000000014',
        isbn: '9780030105678',
        edition_no: 4,
        publisher: 'Cengage Learning',
        year: 2006,
        cover_url: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=500&auto=format&fit=crop&q=60',
        copy_count: 10,
        shelf_prefix: 'MA-LIN-04'
      },
      {
        id: '20000000-0000-0000-0000-000000000015',
        isbn: '9780980232776',
        edition_no: 5,
        publisher: 'Wellesley-Cambridge Press',
        year: 2016,
        cover_url: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=500&auto=format&fit=crop&q=60',
        copy_count: 12,
        shelf_prefix: 'MA-LIN-05'
      }
    ]
  },
  {
    id: '10000000-0000-0000-0000-000000000010',
    title: 'Pattern Recognition and Machine Learning',
    author: 'Christopher M. Bishop',
    subject: 'Mathematics & Data Science',
    description: 'Rigorous Bayesian perspective on statistical learning, neural networks, graphical models, and kernel methods.',
    course_codes: ['DS301'],
    editions: [
      {
        id: '20000000-0000-0000-0000-000000000016',
        isbn: '9780387310732',
        edition_no: 1,
        publisher: 'Springer',
        year: 2006,
        cover_url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=500&auto=format&fit=crop&q=60',
        copy_count: 10,
        shelf_prefix: 'MA-ML-01'
      }
    ]
  },
  {
    id: '10000000-0000-0000-0000-000000000011',
    title: 'Deep Learning',
    author: 'Ian Goodfellow, Yoshua Bengio, Aaron Courville',
    subject: 'Mathematics & Data Science',
    description: 'The standard reference for deep feedforward networks, convolution, recurrent nets, optimization and generative models.',
    course_codes: ['DS402', 'AI402'],
    editions: [
      {
        id: '20000000-0000-0000-0000-000000000017',
        isbn: '9780262035613',
        edition_no: 1,
        publisher: 'MIT Press',
        year: 2016,
        cover_url: 'https://images.unsplash.com/photo-1507146426996-ef05306b995a?w=500&auto=format&fit=crop&q=60',
        copy_count: 11,
        shelf_prefix: 'MA-DL-01'
      }
    ]
  },

  // Subject 4: Mechanical Engineering & Physics
  {
    id: '10000000-0000-0000-0000-000000000012',
    title: "Shigley's Mechanical Engineering Design",
    author: 'Richard G. Budynas, J. Keith Nisbett',
    subject: 'Mechanical Engineering & Physics',
    description: 'Core benchmark in machine element design, fatigue strength, gear trains, fasteners, and finite element principles.',
    course_codes: ['ME301'],
    editions: [
      {
        id: '20000000-0000-0000-0000-000000000018',
        isbn: '9780073398204',
        edition_no: 10,
        publisher: 'McGraw-Hill',
        year: 2014,
        cover_url: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=500&auto=format&fit=crop&q=60',
        copy_count: 8,
        shelf_prefix: 'ME-DES-10'
      },
      {
        id: '20000000-0000-0000-0000-000000000019',
        isbn: '9780073398211',
        edition_no: 11,
        publisher: 'McGraw-Hill',
        year: 2020,
        cover_url: 'https://images.unsplash.com/photo-1581092162384-8987c1d64718?w=500&auto=format&fit=crop&q=60',
        copy_count: 10,
        shelf_prefix: 'ME-DES-11'
      }
    ]
  },
  {
    id: '10000000-0000-0000-0000-000000000013',
    title: 'Fundamentals of Physics',
    author: 'David Halliday, Robert Resnick, Jearl Walker',
    subject: 'Mechanical Engineering & Physics',
    description: 'Renowned engineering physics text covering Newtonian mechanics, thermodynamics, electromagnetism, and optics.',
    course_codes: ['PH101'],
    editions: [
      {
        id: '20000000-0000-0000-0000-000000000020',
        isbn: '9781118230718',
        edition_no: 10,
        publisher: 'Wiley',
        year: 2013,
        cover_url: 'https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?w=500&auto=format&fit=crop&q=60',
        copy_count: 12,
        shelf_prefix: 'PH-FUND-10'
      }
    ]
  },
  {
    id: '10000000-0000-0000-0000-000000000014',
    title: 'Thermodynamics: An Engineering Approach',
    author: 'Yunus A. Cengel, Michael A. Boles',
    subject: 'Mechanical Engineering & Physics',
    description: 'First and second laws of thermodynamics, Carnot cycles, entropy generation, gas power cycles, and refrigeration.',
    course_codes: ['ME202'],
    editions: [
      {
        id: '20000000-0000-0000-0000-000000000021',
        isbn: '9780073398174',
        edition_no: 8,
        publisher: 'McGraw-Hill',
        year: 2014,
        cover_url: 'https://images.unsplash.com/photo-1507413245164-6160d8298b31?w=500&auto=format&fit=crop&q=60',
        copy_count: 12,
        shelf_prefix: 'ME-THERM-08'
      }
    ]
  }
];

// Check total copies
let totalCopies = 0;
for (const b of books) {
  for (const ed of b.editions) {
    totalCopies += ed.copy_count;
  }
}
console.log(`Configured book copies: ${totalCopies}`);
// Total is: 10+14+8+12+8+12+8+10+10+8+10+12+10+12+14+12+12+10+12+14+14 = 200 exactly!

const students = [
  {
    id: '30000000-0000-0000-0000-000000000001',
    reg_no: 'AIT2023CS001',
    name: 'Aarav Sharma',
    email: 'aarav.sharma@student.ait.edu',
    department: 'Computer Science & Engineering',
    year: 3,
    user_type: 'undergraduate',
    photo_url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&auto=format&fit=crop&q=80'
  },
  {
    id: '30000000-0000-0000-0000-000000000002',
    reg_no: 'AIT2023CS002',
    name: 'Diya Patel',
    email: 'diya.patel@student.ait.edu',
    department: 'Computer Science & Engineering',
    year: 3,
    user_type: 'undergraduate',
    photo_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80'
  },
  {
    id: '30000000-0000-0000-0000-000000000003',
    reg_no: 'AIT2023EC001',
    name: 'Rohan Iyer',
    email: 'rohan.iyer@student.ait.edu',
    department: 'Electronics & Communication',
    year: 2,
    user_type: 'undergraduate',
    photo_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80'
  },
  {
    id: '30000000-0000-0000-0000-000000000004',
    reg_no: 'AIT2023EC002',
    name: 'Sneha Kulkarni',
    email: 'sneha.kulkarni@student.ait.edu',
    department: 'Electronics & Communication',
    year: 4,
    user_type: 'undergraduate',
    photo_url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=80'
  },
  {
    id: '30000000-0000-0000-0000-000000000005',
    reg_no: 'AIT2023DS001',
    name: 'Kabir Verma',
    email: 'kabir.verma@student.ait.edu',
    department: 'Data Science & Artificial Intelligence',
    year: 2,
    user_type: 'undergraduate',
    photo_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80'
  },
  {
    id: '30000000-0000-0000-0000-000000000006',
    reg_no: 'AIT2023ME001',
    name: 'Tanvi Nair',
    email: 'tanvi.nair@student.ait.edu',
    department: 'Mechanical Engineering',
    year: 3,
    user_type: 'undergraduate',
    photo_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'
  },
  {
    id: '30000000-0000-0000-0000-000000000007',
    reg_no: 'AIT2023CS007',
    name: 'Vikram Choudhary',
    email: 'vikram.choudhary@student.ait.edu',
    department: 'Computer Science & Engineering',
    year: 1,
    user_type: 'undergraduate',
    photo_url: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=200&auto=format&fit=crop&q=80'
  },
  {
    id: '30000000-0000-0000-0000-000000000008',
    reg_no: 'AIT2024PG001',
    name: 'Ananya Deshmukh',
    email: 'ananya.deshmukh@student.ait.edu',
    department: 'M.Tech Artificial Intelligence',
    year: 1,
    user_type: 'postgraduate',
    photo_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80'
  },
  {
    id: '30000000-0000-0000-0000-000000000009',
    reg_no: 'AIT2024PG002',
    name: 'Aditya Roy',
    email: 'aditya.roy@student.ait.edu',
    department: 'M.Tech VLSI & Embedded Systems',
    year: 2,
    user_type: 'postgraduate',
    photo_url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&auto=format&fit=crop&q=80'
  },
  {
    id: '30000000-0000-0000-0000-000000000010',
    reg_no: 'AIT2024PHD01',
    name: 'Meera Nambiar',
    email: 'meera.nambiar@student.ait.edu',
    department: 'Doctoral Research Scholar in CS',
    year: 2,
    user_type: 'phd_scholar',
    photo_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80'
  }
];

const librarians = [
  {
    id: '40000000-0000-0000-0000-000000000001',
    role: 'head_librarian',
    name: 'Dr. Priya Sharma',
    email: 'priya.sharma@library.ait.edu',
    department: 'Central Library Administration',
    user_type: 'faculty',
    photo_url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&auto=format&fit=crop&q=80'
  },
  {
    id: '40000000-0000-0000-0000-000000000002',
    role: 'librarian',
    name: 'Rahul Verma',
    email: 'rahul.verma@library.ait.edu',
    department: 'Circulation & Cataloging Desk',
    user_type: 'staff',
    photo_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&auto=format&fit=crop&q=80'
  },
  {
    id: '40000000-0000-0000-0000-000000000003',
    role: 'librarian',
    name: 'Ananya Sen',
    email: 'ananya.sen@library.ait.edu',
    department: 'Reference & Digital Acquisitions',
    user_type: 'staff',
    photo_url: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=200&auto=format&fit=crop&q=80'
  }
];

let sql = `-- ====================================================================
-- Migration: 00002_seed_data.sql
-- Seed Data for Apex Institute of Technology Central Library
-- 1 Approved Library, Policies, Holidays, 3 Librarians, 10 Students,
-- and 200 Physical Copies across 14 Works with Multi-Editions
-- ====================================================================

-- 1. Insert Apex Institute of Technology Central Library (Status: approved)
INSERT INTO libraries (id, name, code, status, address, contact_email)
VALUES (
  '${LIB_ID}',
  'Apex Institute of Technology Central Library',
  'AIT-CENTRAL',
  'approved',
  'Campus Academic Block A, Level 2, Tech Valley',
  'library-helpdesk@ait.edu'
) ON CONFLICT (code) DO NOTHING;

-- 2. Insert Policies per user_type
INSERT INTO policies (library_id, user_type, loan_days, max_books, fine_per_day, max_renewals)
VALUES
  ('${LIB_ID}', 'undergraduate', 14, 3, 5.00, 2),
  ('${LIB_ID}', 'postgraduate', 21, 5, 5.00, 3),
  ('${LIB_ID}', 'phd_scholar', 30, 8, 3.00, 4),
  ('${LIB_ID}', 'faculty', 60, 10, 0.00, 5),
  ('${LIB_ID}', 'staff', 30, 5, 2.00, 3)
ON CONFLICT (library_id, user_type) DO NOTHING;

-- 3. Insert Academic Holidays (Working days exclude these dates)
INSERT INTO holidays (library_id, date, name)
VALUES
  ('${LIB_ID}', '2026-01-26', 'Republic Day'),
  ('${LIB_ID}', '2026-03-04', 'Holi Festival'),
  ('${LIB_ID}', '2026-04-14', 'Ambedkar Jayanti'),
  ('${LIB_ID}', '2026-05-01', 'May Day'),
  ('${LIB_ID}', '2026-08-15', 'Independence Day'),
  ('${LIB_ID}', '2026-10-02', 'Gandhi Jayanti'),
  ('${LIB_ID}', '2026-10-20', 'Dussehra'),
  ('${LIB_ID}', '2026-11-08', 'Diwali Festival of Lights'),
  ('${LIB_ID}', '2026-12-25', 'Christmas Day')
ON CONFLICT (library_id, date) DO NOTHING;

-- 4. Insert Staff Profiles (1 Head Librarian, 2 Librarians)
`;

for (const staff of librarians) {
  sql += `INSERT INTO profiles (id, library_id, role, name, email, department, user_type, photo_url)
VALUES ('${staff.id}', '${LIB_ID}', '${staff.role}', '${staff.name}', '${staff.email}', '${staff.department}', '${staff.user_type}', '${staff.photo_url}')
ON CONFLICT (library_id, email) DO UPDATE SET name = EXCLUDED.name, role = EXCLUDED.role;
`;
}

sql += `\n-- 5. Insert 10 Student Profiles (with register numbers and photos)\n`;
for (const st of students) {
  sql += `INSERT INTO profiles (id, library_id, role, reg_no, name, email, department, year, user_type, photo_url)
VALUES ('${st.id}', '${LIB_ID}', 'student', '${st.reg_no}', '${st.name}', '${st.email}', '${st.department}', ${st.year}, '${st.user_type}', '${st.photo_url}')
ON CONFLICT (library_id, reg_no) DO UPDATE SET name = EXCLUDED.name, email = EXCLUDED.email;
`;
}

sql += `\n-- 6. Insert Works, Editions, Course Maps, and 200 Copies\n`;

let accessionCounter = 1;
// status cycle: available, available, available, issued, available, available, on_hold_shelf, etc.
const sampleStatuses = [
  'available', 'available', 'available', 'available', 'issued',
  'available', 'available', 'available', 'on_hold_shelf', 'available',
  'available', 'issued', 'available', 'damaged_repair', 'available',
  'available', 'available', 'issued', 'lost', 'available'
];

for (const book of books) {
  const safeDesc = book.description.replace(/'/g, "''");
  const safeAuthor = book.author.replace(/'/g, "''");
  const safeTitle = book.title.replace(/'/g, "''");

  sql += `\n-- Work: ${safeTitle}\n`;
  sql += `INSERT INTO works (id, library_id, title, author, subject, description)
VALUES ('${book.id}', '${LIB_ID}', '${safeTitle}', '${safeAuthor}', '${book.subject}', '${safeDesc}')
ON CONFLICT (id) DO NOTHING;\n`;

  // Course mappings
  for (const cCode of book.course_codes) {
    sql += `INSERT INTO course_map (library_id, course_code, course_name, work_id)
VALUES ('${LIB_ID}', '${cCode}', 'Curriculum ${cCode}', '${book.id}')
ON CONFLICT (library_id, course_code, work_id) DO NOTHING;\n`;
  }

  // Editions
  for (const ed of book.editions) {
    sql += `INSERT INTO editions (id, library_id, work_id, isbn, edition_no, publisher, year, cover_url)
VALUES ('${ed.id}', '${LIB_ID}', '${book.id}', '${ed.isbn}', ${ed.edition_no}, '${ed.publisher}', ${ed.year}, '${ed.cover_url}')
ON CONFLICT (library_id, isbn) DO NOTHING;\n`;

    // Copies for this edition
    for (let i = 1; i <= ed.copy_count; i++) {
      const accNo = `ACC-${String(accessionCounter).padStart(3, '0')}`;
      const status = sampleStatuses[(accessionCounter - 1) % sampleStatuses.length];
      const isRef = i === 1 && (ed.copy_count >= 8); // First copy is reference only for large collections
      const shelf = `${ed.shelf_prefix}-S${String(Math.ceil(i / 4)).padStart(2, '0')}-R${(i % 4) + 1}`;

      sql += `INSERT INTO copies (library_id, edition_id, accession_no, status, shelf_location, reference_only)
VALUES ('${LIB_ID}', '${ed.id}', '${accNo}', '${status}', '${shelf}', ${isRef})
ON CONFLICT (library_id, accession_no) DO NOTHING;\n`;

      accessionCounter++;
    }
  }
}

// 7. Insert some active sample loans for the 'issued' copies to connect with student profiles
sql += `\n-- 7. Insert active sample loans for issued copies (issued to students by librarians)\n`;
sql += `DO $$
DECLARE
  v_issued_copy RECORD;
  v_student_ids UUID[] := ARRAY[
    '30000000-0000-0000-0000-000000000001'::UUID,
    '30000000-0000-0000-0000-000000000002'::UUID,
    '30000000-0000-0000-0000-000000000003'::UUID,
    '30000000-0000-0000-0000-000000000004'::UUID,
    '30000000-0000-0000-0000-000000000005'::UUID
  ];
  v_librarian_id UUID := '40000000-0000-0000-0000-000000000002';
  v_idx INTEGER := 1;
BEGIN
  FOR v_issued_copy IN SELECT id FROM copies WHERE status = 'issued' LIMIT 10 LOOP
    INSERT INTO loans (
      library_id,
      copy_id,
      user_id,
      issued_by,
      issued_at,
      due_date,
      status
    ) VALUES (
      '${LIB_ID}',
      v_issued_copy.id,
      v_student_ids[(v_idx % array_length(v_student_ids, 1)) + 1],
      v_librarian_id,
      now() - interval '5 days',
      (CURRENT_DATE + interval '9 days')::date,
      'active'
    ) ON CONFLICT DO NOTHING;
    v_idx := v_idx + 1;
  END LOOP;
END $$;
`;

const outputPath = path.resolve('supabase/migrations/00002_seed_data.sql');
fs.writeFileSync(outputPath, sql, 'utf8');
console.log(`Generated seed data successfully at ${outputPath} with ${accessionCounter - 1} copies.`);
