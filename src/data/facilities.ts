export type Facility = {
  slug: 'university' | 'health-park' | 'club'
  tag: string
  name: string
  title: string
  hero: string
  intro: string
  overview: string
  stats: { value: number; dec?: number; label: string }[]
  space: { img: string; title: string; body: string; fit?: 'cover' | 'contain' }[]
  detailsTitle: string
  details: string[]
  cards?: { img: string; title: string; status: string; sub: string }[]
  marquee: string
  communityImg: string
  communityFit?: 'cover' | 'contain'
  community: string
  communityList: string[]
  footerTitle: string
}

export const FACILITIES: Facility[] = [
  {
    slug: 'university',
    tag: '01 · University',
    name: 'NewGiza University',
    title: 'ngu.',
    hero: 'ngu-building.jpg',
    intro: 'NewGiza University: eight schools on a 51.7-acre campus at the heart of NewGiza.',
    overview:
      'A campus built for 13,000 students, with schools spanning health sciences, engineering, business, technology and the arts.',
    stats: [
      { value: 13000, label: 'target number of students' },
      { value: 3970, label: 'current number of students' },
      { value: 51.7, dec: 1, label: 'acres total land area' },
      { value: 208460, label: 'm² total built-up area' },
    ],
    space: [
      { img: 'ngu-building.jpg', title: 'The main building', body: 'NGU’s signature facade at the campus entrance.' },
      { img: 'ngu-campus.jpg', title: 'The campus walk', body: 'Palm-lined walkways, fountains and landscaped courts.' },
      { img: 'ngu-sign.jpg', title: 'NewGiza University', body: 'Total footprint of 62,550 m².' },
    ],
    detailsTitle: 'schools of ngu.',
    details: [
      'School of Pharmacy',
      'School of Medicine',
      'School of Economics & Politics',
      'School of Engineering',
      'School of Business & Finance',
      'School of Information Technology',
      'School of Dentistry',
      'School of Fine Arts',
    ],
    marquee: 'ngu · community · ngu · community · ngu · community · ngu · community · ',
    communityImg: 'schools-students.jpg',
    community: 'Learning in NewGiza starts early. Alongside NGU, four international schools are set to reach 8,000 students.',
    communityList: [
      '4,000 NGU students today, 13,000 at full capacity',
      '4 international schools inside the community',
      '8,000 school students at completion',
      'Campus next to homes, clubs and Health Park',
    ],
    footerTitle: 'visit ngu.',
  },
  {
    slug: 'health-park',
    tag: '02 · Healthcare',
    name: 'NewGiza Health Park',
    title: 'health park.',
    hero: 'hospital.jpg',
    intro: 'A hospital and clinics campus on 27 acres, inside the community.',
    overview:
      'NewGiza Health Park brings a complete hospital and a large clinics campus together, set around landscaped gardens and water.',
    stats: [
      { value: 168, label: 'hospital beds' },
      { value: 478, label: 'clinics' },
      { value: 27, label: 'acres total land area' },
      { value: 118946, label: 'm² total built-up area' },
    ],
    space: [
      { img: 'hospital.jpg', title: 'The hospital', body: '168 beds. Project status: complete.' },
      { img: 'clinics.jpg', title: 'The clinics', body: 'Four buildings and 478 clinics in total.' },
      { img: 'healthpark-3d.png', title: 'The campus', body: 'Buildings arranged around a central landscaped park and lake.', fit: 'contain' },
    ],
    detailsTitle: 'project status.',
    details: [
      'Hospital: 168 beds — complete',
      'Clinics phase 1: 2 buildings + 240 clinics — complete',
      'Clinics phase 2: 2 buildings + 238 clinics — complete',
    ],
    cards: [
      { img: 'hospital.jpg', title: 'Hospital', status: 'Complete', sub: '168 beds' },
      { img: 'clinics.jpg', title: 'Clinics', status: 'Complete', sub: '478 clinics across 4 buildings' },
    ],
    marquee: 'health park · community · health park · community · health park · community · ',
    communityImg: 'healthpark-3d.png',
    communityFit: 'contain',
    community:
      'Healthcare is a few minutes from every NewGiza home, and serves the 188,000 residents of neighbouring compounds.',
    communityList: [
      'Hospital and clinics on one campus',
      '478 clinics open across 4 buildings',
      'Both clinic phases complete',
      'Landscaped gardens across the 27-acre site',
    ],
    footerTitle: 'visit health park.',
  },
  {
    slug: 'club',
    tag: '03 · Sport',
    name: 'NewGiza Sports Club',
    title: 'ngsc.',
    hero: 'ngsc-aerial.jpg',
    intro: 'NewGiza Sports Club, ACE Sports Club and an 18-hole golf course.',
    overview:
      'Two sports clubs and a championship-scale golf course give NewGiza residents space to train, play and spend the weekend outdoors.',
    stats: [
      { value: 10000, label: 'NGSC members' },
      { value: 21.5, dec: 1, label: 'acres NGSC land area' },
      { value: 16606, label: 'm² landscape & greenery' },
      { value: 18, label: 'golf holes' },
    ],
    space: [
      { img: 'ngsc-aerial.jpg', title: 'NewGiza Sports Club', body: 'Built-up area of 12,647 m². Project status: complete.' },
      { img: 'ace-plan.jpg', title: 'ACE Sports Club', body: '47,425 m² of courts, pitches and pools. Project status: complete.' },
      { img: 'golf.jpg', title: 'NewGiza Golf', body: '870,159 m² and 18 holes. Project status: complete.' },
    ],
    detailsTitle: 'ace sports club.',
    details: [
      'Main entrance & main building',
      'Community & services center',
      'Jogging track',
      '7-a-side football fields',
      'Padel courts',
      'Tennis courts',
      'Indoor sports hall',
      'Gymnastics, gym & lockers',
      'Olympic pool',
      'Kids’ building & playground',
      'F&B area',
      'Green yard',
    ],
    cards: [
      { img: 'ngsc-aerial.jpg', title: 'NGSC', status: 'Complete', sub: '21.5 acres · 10,000 users' },
      { img: 'ace-plan.jpg', title: 'ACE Sports Club', status: 'Complete', sub: '47,425 m² · 10,000 users' },
      { img: 'golf.jpg', title: 'NewGiza Golf', status: 'Complete', sub: '870,159 m² · 18 holes' },
    ],
    marquee: 'clubs · community · clubs · community · clubs · community · clubs · community · ',
    communityImg: 'golf.jpg',
    community:
      '10,000 family members already use NGSC, and ACE and the golf course add even more room to play across NewGiza.',
    communityList: [
      '10,000 family members in NGSC',
      'ACE Sports Club, complete',
      '18-hole golf course',
      'Clubs a short drive from every neighbourhood',
    ],
    footerTitle: 'visit the clubs.',
  },
]
