export interface Job {
  id: number;
  title: string;
  company: string;
  location: string;
  type: string; // Full-time, Part-time, Contract, etc.
  status: string; // Open, Closed, Paused
  salary: string;
  description: string;
  requirements: string;
  postedDate: string;
  applications: number;
}

export const JobList: Job[] = [
  {
    id: 1,
    title: 'Frontend Developer',
    company: 'Tech Solutions Inc.',
    location: 'New York, NY',
    type: 'Full-time',
    status: 'Open',
    salary: '$85,000 - $110,000',
    description: 'We are looking for a skilled Frontend Developer to join our team...',
    requirements: 'React, Angular, JavaScript, HTML5, CSS3',
    postedDate: '2023-10-15',
    applications: 24
  },
  {
    id: 2,
    title: 'Backend Engineer',
    company: 'Data Systems LLC',
    location: 'San Francisco, CA',
    type: 'Full-time',
    status: 'Open',
    salary: '$95,000 - $130,000',
    description: 'Join our backend team to develop scalable server applications...',
    requirements: 'Node.js, Python, SQL, REST APIs',
    postedDate: '2023-10-10',
    applications: 18
  },
  {
    id: 3,
    title: 'UI/UX Designer',
    company: 'Creative Minds',
    location: 'Remote',
    type: 'Contract',
    status: 'Paused',
    salary: '$45 - $65/hr',
    description: 'Design beautiful and functional user interfaces for our products...',
    requirements: 'Figma, Sketch, Adobe XD, UI Design',
    postedDate: '2023-10-05',
    applications: 32
  },
  {
    id: 4,
    title: 'DevOps Engineer',
    company: 'Cloud Services Corp',
    location: 'Austin, TX',
    type: 'Full-time',
    status: 'Closed',
    salary: '$105,000 - $140,000',
    description: 'Manage our cloud infrastructure and deployment pipelines...',
    requirements: 'AWS, Docker, Kubernetes, CI/CD',
    postedDate: '2023-09-28',
    applications: 15
  }
];
