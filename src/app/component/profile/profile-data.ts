export interface Profile {
  id: number;
  avatar: string;
  name: string;
  title: string;
  email: string;
  phone: string;
  location: string;
  bio: string;
  skills: string[];
  socialLinks: SocialLink[];
}

export interface SocialLink {
  platform: string;
  url: string;
  icon: string;
}

export const DefaultProfile: Profile = {
  id: 1,
  avatar: 'assets/images/users/user-profile.jpg',
  name: 'John Doe',
  title: 'Senior Software Developer',
  email: 'john.doe@example.com',
  phone: '+1 (555) 123-4567',
  location: 'San Francisco, CA',
  bio: 'Experienced software developer with 5+ years of expertise in Angular, React, and Node.js. Passionate about creating efficient, scalable web applications and mentoring junior developers.',
  skills: ['Angular', 'React', 'TypeScript', 'Node.js', 'Python', 'MongoDB', 'AWS'],
  socialLinks: [
    { platform: 'LinkedIn', url: 'https://linkedin.com/in/johndoe', icon: 'fab fa-linkedin' },
    { platform: 'GitHub', url: 'https://github.com/johndoe', icon: 'fab fa-github' },
    { platform: 'Twitter', url: 'https://twitter.com/johndoe', icon: 'fab fa-twitter' },
    { platform: 'Portfolio', url: 'https://johndoe.dev', icon: 'fas fa-globe' }
  ]
};

export const SocialPlatforms = [
  { name: 'LinkedIn', icon: 'fab fa-linkedin', placeholder: 'https://linkedin.com/in/username' },
  { name: 'GitHub', icon: 'fab fa-github', placeholder: 'https://github.com/username' },
  { name: 'Twitter', icon: 'fab fa-twitter', placeholder: 'https://twitter.com/username' },
  { name: 'Facebook', icon: 'fab fa-facebook', placeholder: 'https://facebook.com/username' },
  { name: 'Instagram', icon: 'fab fa-instagram', placeholder: 'https://instagram.com/username' },
  { name: 'Portfolio', icon: 'fas fa-globe', placeholder: 'https://yourwebsite.com' }
];
