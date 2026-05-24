/**
 * SPDX-License-Identifier: Apache-2.0
 */

import { NCERTChapter, YogaSequence, ScheduleEvent } from './types';

export const NCERT_DATA: NCERTChapter[] = [
  {
    id: 'math-ch1',
    subject: 'Math',
    number: 1,
    title: 'Knowing Our Numbers',
    topics: ['Comparing Numbers', 'Large Numbers in Practice', 'Using Brackets', 'Roman Numerals'],
    notesSnippet: 'We use the Hindu-Arabic numeral system where place value is key. 1 Lakh = 100,000 and 1 Crore = 10,000,000. Roman numerals use symbols: I=1, V=5, X=10, L=50, C=100, D=500, M=1000.',
    practiceQuestions: [
      {
        id: 'math-q1',
        question: 'Write the numeral for: Seventy-three lakh seventy-five thousand three hundred seven.',
        hints: [
          'Remember the Indian Place Value chart: Crores, Ten-Lakhs, Lakhs, Ten-Thousands, Thousands, Hundreds, Tens, Ones.',
          'Identify seventy-three lakh: 73,00,000.',
          'Identify seventy-five thousand: 75,000, and three hundred seven: 307.',
          'Combine them safely placing commas: 73,75,307.'
        ],
        solution: '73,75,307'
      },
      {
        id: 'math-q2',
        question: 'Solve using bracket expansion: 7 × 109.',
        hints: [
          'Can you turn 109 into a sum of simple numbers? For example, (100 + 9).',
          'Now write the formula as: 7 × (100 + 9).',
          'Use Distributive Law: (7 × 100) + (7 × 9).',
          'Calculate parts: 700 + 63, then add them up.'
        ],
        solution: '7 × 109 = 7 × (100 + 9) = (7 × 100) + (7 × 9) = 700 + 63 = 763.'
      }
    ]
  },
  {
    id: 'math-ch11',
    subject: 'Math',
    number: 11,
    title: 'Algebra',
    topics: ['Matchstick Patterns', 'Variables', 'Expressions with Variables', 'Equations'],
    notesSnippet: 'Algebra introduces variables—unknown values represented by letters like x, y, n. A variable does not have a fixed value; it can take different values. We can form rules for patterns using variables.',
    practiceQuestions: [
      {
        id: 'math-q3',
        question: 'Find the rule for the matchstick pattern of the letter L (it takes 2 matchsticks per L). Find how many matches are needed for n letters of L.',
        hints: [
          'If we need 1 letter L, we use 2 matchsticks.',
          'If we need 2 letters of L, we use 2 × 2 = 4 matchsticks.',
          'If we need 3 letters of L, we use 3 × 2 = 6 matchsticks.',
          'The number of sticks is always twice the number of letters (n). So, what is the variable rule?'
        ],
        solution: 'Number of matchsticks required = 2n, where n is the number of Ls to be made.'
      }
    ]
  },
  {
    id: 'science-ch1',
    subject: 'Science',
    number: 1,
    title: 'Components of Food',
    topics: ['Carbohydrates & Fats', 'Proteins', 'Vitamins & Minerals', 'Balanced Diet'],
    notesSnippet: 'Nutrients in food keep us healthy. Carbohydrates and Fats give our body energy. Proteins are for growth and body repair. Vitamins protect our body against disease. Iodine, Copper, Water, and Dietary Fibers are also essential.',
    practiceQuestions: [
      {
        id: 'sci-q1',
        question: 'Which nutrient is tested using Copper Sulphate and Caustic Soda solutions, turning the fluid violet?',
        hints: [
          'Think about energy vs. body-building nutrients.',
          'Carbohydrates are tested with Iodine solution (turns blue-black). Starch is a carb.',
          'Violet color with Caustic Soda specifically tests for proteins in food items like milk or egg white.',
          'So the answer is Proteins.'
        ],
        solution: 'Proteins. They produce a violet colour when tested with dilute copper sulphate and sodium hydroxide (caustic soda) solutions.'
      }
    ]
  },
  {
    id: 'science-ch8',
    subject: 'Science',
    number: 8,
    title: 'Light, Shadows and Reflections',
    topics: ['Opaque, Transparent & Translucent', 'What are Shadows?', 'Pinhole Camera', 'Mirrors & Reflections'],
    notesSnippet: 'Light travels in a straight line. Opaque materials do not allow light to pass. Transparent allow light clearly. Translucent partial. An obstacle in front of light creates a dark region called a Shadow.',
    practiceQuestions: [
      {
        id: 'sci-q2',
        question: 'Why does a pinhole camera construct an inverted (upside down) image of a distant tree?',
        hints: [
          'Think about how light travels. Does it bend or follow straight lines?',
          'Light rays from the top of the tree travel in straight lines through the tiny pinhole.',
          'They hit the bottom of the translucent screen. Rays from the bottom of the tree hit the top of the screen.',
          'Because light travels strictly in straight lines, the crossing rays invert the image.'
        ],
        solution: 'Inverted image is formed because light travels in straight lines. Light from the top of the object passes through the pinhole and travels straight to hit the bottom of the screen, and vice versa.'
      }
    ]
  }
];

export const YOGA_DATA: YogaSequence[] = [
  {
    id: 'yoga-seq1',
    title: 'Morning Panda Rise',
    emoji: '🐼🧘',
    durationMinutes: 6,
    description: 'Waken up your muscles like bamboo swaying in the early mountain breeze.',
    safetyTips: [
      'Do not strain your lower back; bend your knees slightly if needed.',
      'Breathe naturally through your nose.',
      'Ask a coach or parent if you feel any sharp pull.'
    ],
    poses: [
      {
        name: 'Mountain Pose (Tadasana)',
        benefits: 'Improves posture, strengthens knees/thighs, and builds deep steady focus.',
        durationSeconds: 60,
        emoji: '🏔️',
        steps: [
          'Stand erect with feet slightly apart, hands by your side.',
          'Interlock fingers, raise arms upwards, palms facing sky.',
          'Raise heels slowly, stand on toes, stretch whole body up.',
          'Hold with soft steady breathing.'
        ]
      },
      {
        name: 'Panda Tree Balance (Vrikshasana)',
        benefits: 'Enhances physical balance, focus, leg strength, and mental stability.',
        durationSeconds: 60,
        emoji: '🌳',
        steps: [
          'Stand straight. Lift your right leg and place the foot on your inner left thigh.',
          'Combine your hands in Namaste pose above your head or on your chest.',
          'Gaze at a single point on the wall for balance.',
          'Repeat on the next leg.'
        ]
      },
      {
        name: 'Gentle Forward Fold (Uttanasana)',
        benefits: 'Relaxes head & brain, stretches calves/hamstrings, and triggers peaceful focus.',
        durationSeconds: 60,
        emoji: '🌿',
        steps: [
          'Stand straight. Inhale and raise your arms up.',
          'Exhale and slowly bend forward from the hips.',
          'Let your hands relax towards floor or hold your ankles.',
          'Let your neck hang relaxed.'
        ]
      }
    ]
  },
  {
    id: 'yoga-seq2',
    title: 'Mind Reset & Exam Focus',
    emoji: '🧠✨',
    durationMinutes: 8,
    description: 'Boost focus, soothe exam anxiety, and clear brain fatigue in minutes.',
    safetyTips: [
      'Only hold static postures where comfortable.',
      'Avoid force-holding your breath if uncomfortable.'
    ],
    poses: [
      {
        name: 'Cobra Bamboo Lift (Bhujangasana)',
        benefits: 'Opens chest, relieves shoulder and back strain of continuous desk study.',
        durationSeconds: 45,
        emoji: '🐍',
        steps: [
          'Lie comfortable on your stomach, forehead on floor.',
          'Place hands beside your chest.',
          'Inhale and gently lift your head, chest, and upper abdomen like a cobra.',
          'Keep elbows bent and shoulders relaxed away from ears.'
        ]
      },
      {
        name: 'Panda Forest Child Pose (Balasana)',
        benefits: 'Deeply calming for nerves, back stretch, absolute mental reset.',
        durationSeconds: 90,
        emoji: '👶',
        steps: [
          'Kneel on the floor, sit back on your heels.',
          'Lower your forehead to the floor.',
          'Extend your arms forward or lay them beside your thighs palms up.',
          'Breathe into your back and rest completely.'
        ]
      }
    ]
  },
  {
    id: 'yoga-seq3',
    title: 'CBSE Regional Championship Prep',
    emoji: '🏆🔥',
    durationMinutes: 10,
    description: 'Special sequences with holds for district & state school yoga competitions.',
    safetyTips: [
      'Practice holds strictly with warm-up beforehand.',
      'Ensure safety mats are present. Never force your body!'
    ],
    poses: [
      {
        name: 'Perfect Lotus Hold (Padmasana)',
        benefits: 'Classic competition base. Calms mind, opens hips, aligns spinal column.',
        durationSeconds: 120,
        emoji: '🪷',
        steps: [
          'Sit on floor. Place right foot on left thigh, then left foot on right thigh.',
          'Keep spine erect, chest open.',
          'Place hands on knees in Jnana Mudra (index touching thumb).',
          'Practice 2 minutes of quiet, slow breathing.'
        ]
      },
      {
        name: 'Steady Triangle (Trikonasana)',
        benefits: 'Enhances absolute alignment, precise geometry score in school sports meets.',
        durationSeconds: 60,
        emoji: '📐',
        steps: [
          'Stand with feet broad apart under shoulders.',
          'Turn your right foot out to 90 degrees.',
          'Inhale to stretch arms wide, bend sideways to your right hand touching ankle or foot.',
          'Keep left hand pointing absolutely straight to sky. Turn face to left palm.'
        ]
      }
    ]
  }
];

export const DEFAULT_SCHEDULE: ScheduleEvent[] = [
  {
    id: 'e1',
    title: 'Panda Mountain Morning Stretch Yo',
    time: '06:00 AM',
    durationMinutes: 15,
    category: 'yoga',
    done: false
  },
  {
    id: 'e2',
    title: 'School Preparation & Morning Meal',
    time: '07:00 AM',
    durationMinutes: 60,
    category: 'school',
    done: false
  },
  {
    id: 'e3',
    title: 'CBSE School Interactive Classes',
    time: '08:30 AM',
    durationMinutes: 360,
    category: 'school',
    done: false
  },
  {
    id: 'e4',
    title: 'Post-School Rest & Panda Snack Time',
    time: '03:15 PM',
    durationMinutes: 45,
    category: 'rest',
    done: false
  },
  {
    id: 'e5',
    title: 'NCERT Ch 1 / Ch 11 Math Problem Solving',
    time: '04:00 PM',
    durationMinutes: 50,
    category: 'study',
    done: false
  },
  {
    id: 'e6',
    title: 'Fun Craft, Drawing, or Clay Modeling',
    time: '05:30 PM',
    durationMinutes: 30,
    category: 'craft',
    done: false
  },
  {
    id: 'e7',
    title: 'Panda Relaxing Breathing Rest',
    time: '08:00 PM',
    durationMinutes: 10,
    category: 'yoga',
    done: false
  }
];
