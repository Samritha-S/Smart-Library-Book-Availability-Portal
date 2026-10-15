import type { SearchResultWork, WorkDetail, StudentLoan } from '@/types/database';

export interface SeedEdition {
  id: string;
  isbn: string;
  edition_no: number;
  publisher: string;
  year: number;
  price: number;
  cover_url: string;
  copy_count: number;
  shelf_prefix: string;
}

export interface SeedWork {
  id: string;
  title: string;
  author: string;
  subject: string;
  description: string;
  course_codes: string[];
  editions: SeedEdition[];
}

export const SEED_SUBJECTS = [
  'All',
  'Computer Science & AI',
  'Electronics & Electrical Engineering',
  'Mathematics & Data Science',
  'Mechanical Engineering & Physics'
] as const;

export const SEED_WORKS: SeedWork[] = [
  {
    id: '10000000-0000-0000-0000-000000000001',
    title: 'Introduction to Algorithms',
    author: 'Thomas H. Cormen, Charles E. Leiserson, Ronald L. Rivest, Clifford Stein',
    subject: 'Computer Science & AI',
    description: 'Comprehensive modern textbook on computer algorithms, covering data structures, graph algorithms, divide-and-conquer, and dynamic programming.',
    course_codes: ['CS201', 'CS501'],
    editions: [
      {
        id: '20000000-0000-0000-0000-000000000001',
        isbn: '9780262033848',
        edition_no: 3,
        publisher: 'MIT Press',
        year: 2009,
        price: 850.00,
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
        price: 1195.00,
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
    description: 'Premier textbook focusing on Internet protocols and network architectural layers from the application layer down to the physical layer.',
    course_codes: ['CS304'],
    editions: [
      {
        id: '20000000-0000-0000-0000-000000000003',
        isbn: '9780133594140',
        edition_no: 7,
        publisher: 'Pearson',
        year: 2016,
        price: 799.00,
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
        price: 945.00,
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
    description: 'The standard and most cited synthesis of foundational search algorithms, probabilistic reasoning, machine learning, and multi-agent systems.',
    course_codes: ['AI301', 'CS602'],
    editions: [
      {
        id: '20000000-0000-0000-0000-000000000005',
        isbn: '9780136042594',
        edition_no: 3,
        publisher: 'Prentice Hall',
        year: 2009,
        price: 890.00,
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
        price: 1050.00,
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
    description: 'Classic dinosaur book exploring process management, threads, concurrency, virtual memory paging, storage systems, and protection.',
    course_codes: ['CS202'],
    editions: [
      {
        id: '20000000-0000-0000-0000-000000000007',
        isbn: '9781118063330',
        edition_no: 9,
        publisher: 'Wiley',
        year: 2012,
        price: 720.00,
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
        price: 899.00,
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
    description: 'The definitive guide to distributed storage engines, replication, partitioning, consensus, stream processing, and reliable architecture.',
    course_codes: ['CS405'],
    editions: [
      {
        id: '20000000-0000-0000-0000-000000000009',
        isbn: '9781449373320',
        edition_no: 1,
        publisher: "O'Reilly Media",
        year: 2017,
        price: 1100.00,
        cover_url: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=500&auto=format&fit=crop&q=60',
        copy_count: 9,
        shelf_prefix: 'CS-DATA-01'
      }
    ]
  },
  {
    id: '10000000-0000-0000-0000-000000000006',
    title: 'Microelectronic Circuits',
    author: 'Adel S. Sedra, Kenneth C. Smith',
    subject: 'Electronics & Electrical Engineering',
    description: 'Gold standard textbook for analog and digital integrated circuit design, MOSFET characteristics, and operational amplifiers.',
    course_codes: ['EC201', 'EC302'],
    editions: [
      {
        id: '20000000-0000-0000-0000-000000000010',
        isbn: '9780199339136',
        edition_no: 7,
        publisher: 'Oxford University Press',
        year: 2014,
        price: 875.00,
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
        price: 995.00,
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
    description: 'Continuous-time and discrete-time signals, Fourier series, Fourier transforms, Laplace, and Z-transform foundational analysis.',
    course_codes: ['EC203'],
    editions: [
      {
        id: '20000000-0000-0000-0000-000000000012',
        isbn: '9780138147570',
        edition_no: 2,
        publisher: 'Prentice Hall',
        year: 1996,
        price: 650.00,
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
    description: 'Comprehensive coverage of classical control, root locus, Bode frequency response, Nyquist plots, and state-space equations.',
    course_codes: ['EE301'],
    editions: [
      {
        id: '20000000-0000-0000-0000-000000000013',
        isbn: '9780136156734',
        edition_no: 5,
        publisher: 'Prentice Hall',
        year: 2009,
        price: 780.00,
        cover_url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=500&auto=format&fit=crop&q=60',
        copy_count: 8,
        shelf_prefix: 'EE-CTRL-05'
      }
    ]
  },
  {
    id: '10000000-0000-0000-0000-000000000009',
    title: 'Linear Algebra and Its Applications',
    author: 'Gilbert Strang',
    subject: 'Mathematics & Data Science',
    description: 'Foundational text emphasizing vector spaces, matrix factorizations, eigenvalues, singular value decomposition, and computational applications.',
    course_codes: ['MA101', 'DS201'],
    editions: [
      {
        id: '20000000-0000-0000-0000-000000000014',
        isbn: '9780030105678',
        edition_no: 4,
        publisher: 'Cengage Learning',
        year: 2006,
        price: 695.00,
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
        price: 825.00,
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
    description: 'Rigorous Bayesian perspective on statistical machine learning, neural networks, graphical models, and kernel methods.',
    course_codes: ['DS301'],
    editions: [
      {
        id: '20000000-0000-0000-0000-000000000016',
        isbn: '9780387310732',
        edition_no: 1,
        publisher: 'Springer',
        year: 2006,
        price: 1250.00,
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
    description: 'The standard modern reference for deep feedforward networks, convolution, recurrent architectures, and generative modeling.',
    course_codes: ['DS402', 'AI402'],
    editions: [
      {
        id: '20000000-0000-0000-0000-000000000017',
        isbn: '9780262035613',
        edition_no: 1,
        publisher: 'MIT Press',
        year: 2016,
        price: 980.00,
        cover_url: 'https://images.unsplash.com/photo-1507146426996-ef05306b995a?w=500&auto=format&fit=crop&q=60',
        copy_count: 11,
        shelf_prefix: 'MA-DL-01'
      }
    ]
  },
  {
    id: '10000000-0000-0000-0000-000000000012',
    title: "Shigley's Mechanical Engineering Design",
    author: 'Richard G. Budynas, J. Keith Nisbett',
    subject: 'Mechanical Engineering & Physics',
    description: 'Core benchmark in machine element design, fatigue strength, gear trains, fasteners, and stress analysis.',
    course_codes: ['ME301'],
    editions: [
      {
        id: '20000000-0000-0000-0000-000000000018',
        isbn: '9780073398204',
        edition_no: 10,
        publisher: 'McGraw-Hill',
        year: 2014,
        price: 840.00,
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
        price: 960.00,
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
        price: 750.00,
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
        price: 820.00,
        cover_url: 'https://images.unsplash.com/photo-1507413245164-6160d8298b31?w=500&auto=format&fit=crop&q=60',
        copy_count: 12,
        shelf_prefix: 'ME-THERM-08'
      }
    ]
  }
];

import type { CopyStatus } from '@/types/database';

const sampleStatuses: CopyStatus[] = [
  'available', 'available', 'available', 'available', 'issued',
  'available', 'available', 'available', 'on_hold_shelf', 'available',
  'available', 'issued', 'available', 'damaged_repair', 'available',
  'available', 'available', 'issued', 'lost', 'available'
];

let accIndex = 1;
export const SEED_CATALOG_WORKS: SearchResultWork[] = [];
export const SEED_WORK_DETAILS = new Map<string, WorkDetail>();

for (const w of SEED_WORKS) {
  // Find latest edition (highest edition_no)
  const sortedEditions = [...w.editions].sort((a, b) => b.edition_no - a.edition_no);
  const latest = sortedEditions[0];

  let workTotalCopies = 0;
  let workAvailableCopies = 0;
  let workRefCopies = 0;

  const editionDetails = sortedEditions.map(ed => {
    let edAvailable = 0;
    let edRef = 0;
    let edIssued = 0;
    const copies = [];

    for (let i = 1; i <= ed.copy_count; i++) {
      const status = sampleStatuses[(accIndex - 1) % sampleStatuses.length];
      const isRef = i === 1 && ed.copy_count >= 8;
      const shelf = `${ed.shelf_prefix}-S${String(Math.ceil(i / 4)).padStart(2, '0')}-R${(i % 4) + 1}`;
      const accNo = `ACC-${String(accIndex).padStart(3, '0')}`;

      if (status === 'available' && !isRef) {
        edAvailable++;
        workAvailableCopies++;
      }
      if (isRef && status !== 'withdrawn') {
        edRef++;
        workRefCopies++;
      }
      if (status === 'issued') {
        edIssued++;
      }
      workTotalCopies++;

      copies.push({
        id: `copy-${accIndex}`,
        accession_no: accNo,
        shelf_location: shelf,
        reference_only: isRef,
        status: status
      });

      accIndex++;
    }

    return {
      edition_id: ed.id,
      isbn: ed.isbn,
      edition_no: ed.edition_no,
      publisher: ed.publisher,
      year: ed.year,
      price: ed.price,
      cover_url: ed.cover_url,
      is_latest: ed.edition_no === latest.edition_no,
      total_copies: ed.copy_count,
      available_copies: edAvailable,
      reference_copies: edRef,
      issued_copies: edIssued,
      copies
    };
  });

  const searchItem: SearchResultWork = {
    work_id: w.id,
    title: w.title,
    author: w.author,
    subject: w.subject,
    description: w.description,
    latest_edition_id: latest.id,
    latest_edition_no: latest.edition_no,
    cover_url: latest.cover_url,
    edition_count: w.editions.length,
    total_copies: workTotalCopies,
    available_copies: workAvailableCopies,
    reference_only_copies: workRefCopies,
    last_updated: new Date(Date.now() - 3600000).toISOString(),
    course_codes: w.course_codes
  };

  SEED_CATALOG_WORKS.push(searchItem);

  SEED_WORK_DETAILS.set(w.id, {
    work_id: w.id,
    library_id: '00000000-0000-0000-0000-000000000001',
    title: w.title,
    author: w.author,
    subject: w.subject,
    description: w.description,
    total_copies: workTotalCopies,
    available_copies: workAvailableCopies,
    reference_only_copies: workRefCopies,
    course_codes: w.course_codes,
    editions: editionDetails,
    last_updated: new Date().toISOString()
  });
}

// Sample student active loans for the Home due ring
export const SEED_STUDENT_LOANS: Record<string, StudentLoan[]> = {
  // Aarav Sharma (AIT2023CS001) has 2 active loans:
  // 1 due in 5 working days (Teal ring) and 1 due in 2 working days (Amber ring)
  '30000000-0000-0000-0000-000000000001': [
    {
      loan_id: 'loan-1',
      library_id: '00000000-0000-0000-0000-000000000001',
      issued_at: new Date(Date.now() - 7 * 86400000).toISOString(),
      due_date: new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0],
      renewals_count: 0,
      is_overdue: false,
      working_days_diff: 2, // Amber threshold (1-3 days)
      computed_fine: 0.00,
      accession_no: 'ACC-005',
      shelf_location: 'CS-ALGO-03-S02-R1',
      isbn: '9780262033848',
      edition_no: 3,
      cover_url: 'https://images.unsplash.com/photo-1532012164546-f432f2e37b73?w=500&auto=format&fit=crop&q=60',
      work_id: '10000000-0000-0000-0000-000000000001',
      book_title: 'Introduction to Algorithms',
      book_author: 'Thomas H. Cormen, et al.',
      book_subject: 'Computer Science & AI'
    },
    {
      loan_id: 'loan-2',
      library_id: '00000000-0000-0000-0000-000000000001',
      issued_at: new Date(Date.now() - 3 * 86400000).toISOString(),
      due_date: new Date(Date.now() + 8 * 86400000).toISOString().split('T')[0],
      renewals_count: 0,
      is_overdue: false,
      working_days_diff: 7, // Teal (>3 days)
      computed_fine: 0.00,
      accession_no: 'ACC-012',
      shelf_location: 'CS-NET-07-S01-R4',
      isbn: '9780133594140',
      edition_no: 7,
      cover_url: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=500&auto=format&fit=crop&q=60',
      work_id: '10000000-0000-0000-0000-000000000002',
      book_title: 'Computer Networking: A Top-Down Approach',
      book_author: 'James F. Kurose, Keith W. Ross',
      book_subject: 'Computer Science & AI'
    }
  ],
  // Diya Patel (AIT2023CS002) has 1 loan overdue by 3 working days (Red ring with fine)
  '30000000-0000-0000-0000-000000000002': [
    {
      loan_id: 'loan-3',
      library_id: '00000000-0000-0000-0000-000000000001',
      issued_at: new Date(Date.now() - 18 * 86400000).toISOString(),
      due_date: new Date(Date.now() - 4 * 86400000).toISOString().split('T')[0],
      renewals_count: 1,
      is_overdue: true,
      working_days_diff: 3, // Overdue by 3 working days
      computed_fine: 15.00, // 3 days * 5.00
      accession_no: 'ACC-018',
      shelf_location: 'CS-AI-03-S02-R2',
      isbn: '9780136042594',
      edition_no: 3,
      cover_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500&auto=format&fit=crop&q=60',
      work_id: '10000000-0000-0000-0000-000000000003',
      book_title: 'Artificial Intelligence: A Modern Approach',
      book_author: 'Stuart Russell, Peter Norvig',
      book_subject: 'Computer Science & AI'
    }
  ]
};
