
import { format, subDays, addDays } from 'date-fns';

export interface Screening {
  id: string;
  studentName: string;
  type: 'speech' | 'hearing' | 'progress';
  status: 'completed' | 'in_progress' | 'scheduled' | 'cancelled';
  date: string;
  screener: string;
  result?: string;
  grade?: string;
  schoolId: string;
}

// Generate realistic dates
const today = new Date();
const getRandomDate = (daysBack: number, daysForward: number = 0) => {
  const randomDays = Math.floor(Math.random() * (daysBack + daysForward)) - daysBack;
  return format(addDays(today, randomDays), 'yyyy-MM-dd');
};

export const mockScreenings: Screening[] = [
  // Westfield Elementary School (School ID: 1)
  {
    id: 'ws1',
    studentName: 'Emma Johnson',
    type: 'speech',
    status: 'completed',
    date: getRandomDate(30),
    screener: 'Dr. Sarah Johnson',
    result: 'P',
    grade: '3rd',
    schoolId: '1'
  },
  {
    id: 'ws2',
    studentName: 'Michael Chen',
    type: 'hearing',
    status: 'completed',
    date: getRandomDate(25),
    screener: 'Dr. Mike Wilson',
    result: 'M',
    grade: '2nd',
    schoolId: '1'
  },
  {
    id: 'ws3',
    studentName: 'Sofia Rodriguez',
    type: 'speech',
    status: 'in_progress',
    date: getRandomDate(5),
    screener: 'Dr. Sarah Johnson',
    grade: '4th',
    schoolId: '1'
  },
  {
    id: 'ws4',
    studentName: 'David Park',
    type: 'progress',
    status: 'scheduled',
    date: getRandomDate(0, 7),
    screener: 'Dr. Lisa Anderson',
    grade: '1st',
    schoolId: '1'
  },
  {
    id: 'ws5',
    studentName: 'Aisha Patel',
    type: 'hearing',
    status: 'completed',
    date: getRandomDate(15),
    screener: 'Dr. Mike Wilson',
    result: 'P',
    grade: '5th',
    schoolId: '1'
  },
  {
    id: 'ws6',
    studentName: 'Carlos Martinez',
    type: 'speech',
    status: 'completed',
    date: getRandomDate(20),
    screener: 'Dr. Sarah Johnson',
    result: 'Q',
    grade: 'K',
    schoolId: '1'
  },
  {
    id: 'ws7',
    studentName: 'Lily Thompson',
    type: 'hearing',
    status: 'scheduled',
    date: getRandomDate(0, 10),
    screener: 'Dr. Mike Wilson',
    grade: '3rd',
    schoolId: '1'
  },
  {
    id: 'ws8',
    studentName: 'Jacob Williams',
    type: 'progress',
    status: 'completed',
    date: getRandomDate(12),
    screener: 'Dr. Lisa Anderson',
    result: 'M',
    grade: '2nd',
    schoolId: '1'
  },

  // Desert Pines High School (School ID: 2)
  {
    id: 'dp1',
    studentName: 'Jordan Smith',
    type: 'speech',
    status: 'completed',
    date: getRandomDate(28),
    screener: 'Dr. Sarah Johnson',
    result: 'P',
    grade: '11th',
    schoolId: '2'
  },
  {
    id: 'dp2',
    studentName: 'Taylor Davis',
    type: 'hearing',
    status: 'completed',
    date: getRandomDate(22),
    screener: 'Dr. Mike Wilson',
    result: 'M',
    grade: '9th',
    schoolId: '2'
  },
  {
    id: 'dp3',
    studentName: 'Alex Rivera',
    type: 'speech',
    status: 'in_progress',
    date: getRandomDate(3),
    screener: 'Dr. Sarah Johnson',
    grade: '12th',
    schoolId: '2'
  },
  {
    id: 'dp4',
    studentName: 'Morgan Lee',
    type: 'progress',
    status: 'scheduled',
    date: getRandomDate(0, 5),
    screener: 'Dr. Lisa Anderson',
    grade: '10th',
    schoolId: '2'
  },
  {
    id: 'dp5',
    studentName: 'Casey Brown',
    type: 'hearing',
    status: 'completed',
    date: getRandomDate(18),
    screener: 'Dr. Mike Wilson',
    result: 'NR',
    grade: '11th',
    schoolId: '2'
  },
  {
    id: 'dp6',
    studentName: 'Riley Johnson',
    type: 'speech',
    status: 'cancelled',
    date: getRandomDate(10),
    screener: 'Dr. Sarah Johnson',
    grade: '9th',
    schoolId: '2'
  },
  {
    id: 'dp7',
    studentName: 'Avery Wilson',
    type: 'hearing',
    status: 'scheduled',
    date: getRandomDate(0, 8),
    screener: 'Dr. Mike Wilson',
    grade: '12th',
    schoolId: '2'
  },
  {
    id: 'dp8',
    studentName: 'Sage Garcia',
    type: 'progress',
    status: 'completed',
    date: getRandomDate(14),
    screener: 'Dr. Lisa Anderson',
    result: 'P',
    grade: '10th',
    schoolId: '2'
  },
  {
    id: 'dp9',
    studentName: 'Quinn Martinez',
    type: 'speech',
    status: 'completed',
    date: getRandomDate(35),
    screener: 'Dr. Sarah Johnson',
    result: 'C',
    grade: '11th',
    schoolId: '2'
  },

  // Valley View Middle School (School ID: 3)
  {
    id: 'vv1',
    studentName: 'Madison Clark',
    type: 'speech',
    status: 'completed',
    date: getRandomDate(26),
    screener: 'Dr. Sarah Johnson',
    result: 'P',
    grade: '7th',
    schoolId: '3'
  },
  {
    id: 'vv2',
    studentName: 'Ethan Moore',
    type: 'hearing',
    status: 'completed',
    date: getRandomDate(21),
    screener: 'Dr. Mike Wilson',
    result: 'M',
    grade: '6th',
    schoolId: '3'
  },
  {
    id: 'vv3',
    studentName: 'Zoe Anderson',
    type: 'speech',
    status: 'in_progress',
    date: getRandomDate(2),
    screener: 'Dr. Sarah Johnson',
    grade: '8th',
    schoolId: '3'
  },
  {
    id: 'vv4',
    studentName: 'Noah Taylor',
    type: 'progress',
    status: 'scheduled',
    date: getRandomDate(0, 6),
    screener: 'Dr. Lisa Anderson',
    grade: '7th',
    schoolId: '3'
  },
  {
    id: 'vv5',
    studentName: 'Chloe White',
    type: 'hearing',
    status: 'completed',
    date: getRandomDate(16),
    screener: 'Dr. Mike Wilson',
    result: 'P',
    grade: '6th',
    schoolId: '3'
  },
  {
    id: 'vv6',
    studentName: 'Liam Harris',
    type: 'speech',
    status: 'completed',
    date: getRandomDate(19),
    screener: 'Dr. Sarah Johnson',
    result: 'Q',
    grade: '8th',
    schoolId: '3'
  },
  {
    id: 'vv7',
    studentName: 'Isabella Thomas',
    type: 'hearing',
    status: 'scheduled',
    date: getRandomDate(0, 9),
    screener: 'Dr. Mike Wilson',
    grade: '7th',
    schoolId: '3'
  },
  {
    id: 'vv8',
    studentName: 'Owen Jackson',
    type: 'progress',
    status: 'completed',
    date: getRandomDate(13),
    screener: 'Dr. Lisa Anderson',
    result: 'M',
    grade: '6th',
    schoolId: '3'
  },
  {
    id: 'vv9',
    studentName: 'Emma Walker',
    type: 'speech',
    status: 'completed',
    date: getRandomDate(24),
    screener: 'Dr. Sarah Johnson',
    result: 'NC',
    grade: '8th',
    schoolId: '3'
  },

  // Sunrise Elementary School (School ID: 4)
  {
    id: 'se1',
    studentName: 'Lucas Green',
    type: 'speech',
    status: 'completed',
    date: getRandomDate(27),
    screener: 'Dr. Sarah Johnson',
    result: 'P',
    grade: '4th',
    schoolId: '4'
  },
  {
    id: 'se2',
    studentName: 'Mia Adams',
    type: 'hearing',
    status: 'completed',
    date: getRandomDate(23),
    screener: 'Dr. Mike Wilson',
    result: 'M',
    grade: '2nd',
    schoolId: '4'
  },
  {
    id: 'se3',
    studentName: 'Oliver Baker',
    type: 'speech',
    status: 'in_progress',
    date: getRandomDate(4),
    screener: 'Dr. Sarah Johnson',
    grade: '5th',
    schoolId: '4'
  },
  {
    id: 'se4',
    studentName: 'Ava Nelson',
    type: 'progress',
    status: 'scheduled',
    date: getRandomDate(0, 4),
    screener: 'Dr. Lisa Anderson',
    grade: '1st',
    schoolId: '4'
  },
  {
    id: 'se5',
    studentName: 'Benjamin Carter',
    type: 'hearing',
    status: 'completed',
    date: getRandomDate(17),
    screener: 'Dr. Mike Wilson',
    result: 'P',
    grade: '3rd',
    schoolId: '4'
  },
  {
    id: 'se6',
    studentName: 'Charlotte Hill',
    type: 'speech',
    status: 'completed',
    date: getRandomDate(31),
    screener: 'Dr. Sarah Johnson',
    result: 'Q',
    grade: 'K',
    schoolId: '4'
  },
  {
    id: 'se7',
    studentName: 'Henry Mitchell',
    type: 'hearing',
    status: 'scheduled',
    date: getRandomDate(0, 7),
    screener: 'Dr. Mike Wilson',
    grade: '4th',
    schoolId: '4'
  },
  {
    id: 'se8',
    studentName: 'Amelia Roberts',
    type: 'progress',
    status: 'completed',
    date: getRandomDate(11),
    screener: 'Dr. Lisa Anderson',
    result: 'P',
    grade: '2nd',
    schoolId: '4'
  },
  {
    id: 'se9',
    studentName: 'William Turner',
    type: 'speech',
    status: 'completed',
    date: getRandomDate(29),
    screener: 'Dr. Sarah Johnson',
    result: 'M',
    grade: '5th',
    schoolId: '4'
  },
  {
    id: 'se10',
    studentName: 'Harper Phillips',
    type: 'hearing',
    status: 'completed',
    date: getRandomDate(33),
    screener: 'Dr. Mike Wilson',
    result: 'NR',
    grade: '3rd',
    schoolId: '4'
  },

  // NVSS Therapy Center (School ID: 5)
  {
    id: 'tc1',
    studentName: 'Jayden Campbell',
    type: 'speech',
    status: 'completed',
    date: getRandomDate(25),
    screener: 'Dr. Lisa Martinez',
    result: 'C',
    grade: '7th',
    schoolId: '5'
  },
  {
    id: 'tc2',
    studentName: 'Aria Parker',
    type: 'hearing',
    status: 'completed',
    date: getRandomDate(20),
    screener: 'Dr. Jennifer Walsh',
    result: 'Q',
    grade: '4th',
    schoolId: '5'
  },
  {
    id: 'tc3',
    studentName: 'Grayson Evans',
    type: 'progress',
    status: 'in_progress',
    date: getRandomDate(1),
    screener: 'Dr. Lisa Martinez',
    grade: '10th',
    schoolId: '5'
  },
  {
    id: 'tc4',
    studentName: 'Luna Edwards',
    type: 'speech',
    status: 'scheduled',
    date: getRandomDate(0, 3),
    screener: 'Dr. Lisa Martinez',
    grade: '2nd',
    schoolId: '5'
  },
  {
    id: 'tc5',
    studentName: 'Sebastian Collins',
    type: 'hearing',
    status: 'completed',
    date: getRandomDate(15),
    screener: 'Dr. Jennifer Walsh',
    result: 'M',
    grade: '8th',
    schoolId: '5'
  },
  {
    id: 'tc6',
    studentName: 'Scarlett Stewart',
    type: 'progress',
    status: 'completed',
    date: getRandomDate(18),
    screener: 'Dr. Lisa Martinez',
    result: 'P',
    grade: '5th',
    schoolId: '5'
  },
  {
    id: 'tc7',
    studentName: 'Kai Sanchez',
    type: 'speech',
    status: 'completed',
    date: getRandomDate(32),
    screener: 'Dr. Lisa Martinez',
    result: 'Q',
    grade: '11th',
    schoolId: '5'
  },
  {
    id: 'tc8',
    studentName: 'Nova Morris',
    type: 'hearing',
    status: 'scheduled',
    date: getRandomDate(0, 5),
    screener: 'Dr. Jennifer Walsh',
    grade: '3rd',
    schoolId: '5'
  },
  {
    id: 'tc9',
    studentName: 'Felix Rogers',
    type: 'progress',
    status: 'completed',
    date: getRandomDate(9),
    screener: 'Dr. Lisa Martinez',
    result: 'C',
    grade: '9th',
    schoolId: '5'
  },
  {
    id: 'tc10',
    studentName: 'Iris Reed',
    type: 'speech',
    status: 'completed',
    date: getRandomDate(26),
    screener: 'Dr. Lisa Martinez',
    result: 'P',
    grade: '1st',
    schoolId: '5'
  },
  {
    id: 'tc11',
    studentName: 'Atlas Cook',
    type: 'hearing',
    status: 'cancelled',
    date: getRandomDate(8),
    screener: 'Dr. Jennifer Walsh',
    grade: '6th',
    schoolId: '5'
  },
  {
    id: 'tc12',
    studentName: 'Willow Bailey',
    type: 'progress',
    status: 'scheduled',
    date: getRandomDate(0, 6),
    screener: 'Dr. Lisa Martinez',
    grade: '12th',
    schoolId: '5'
  }
];

export const getScreeningsBySchool = (schoolId: string): Screening[] => {
  return mockScreenings.filter(screening => screening.schoolId === schoolId);
};

export const getAllScreenings = (): Screening[] => {
  return mockScreenings;
};
