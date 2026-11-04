export type ProjectCategory =
  | 'All'
  | 'Modern Villas'
  | 'Multi-Story RC'
  | 'Turnkey Homes'
  | 'Structural & BIM';

export interface ProjectSpec {
  label: string;
  value: string;
}

export interface ProjectGalleryItem {
  src: string;
  caption?: string;
}

export interface CivilProject {
  id: string;
  code: string;
  title: string;
  category: Exclude<ProjectCategory, 'All'>;
  location: string;
  year: string;
  role: string;
  budget: string;
  image: string;
  gallery?: (string | ProjectGalleryItem)[];
  summary: string;
  challenge: string;
  solution: string;
  outcomes: string[];
  standards: string[];
  software: string[];
  specs: ProjectSpec[];
}

export interface ImpactMetric {
  value: string;
  label: string;
  detail: string;
}

export interface CompetencyGroup {
  id: string;
  code: string;
  title: string;
  subtitle: string;
  items: string[];
}

export interface ExperienceItem {
  period: string;
  elevation: string;
  role: string;
  organization: string;
  location: string;
  summary: string;
  highlights: string[];
}

export interface CredentialItem {
  code: string;
  title: string;
  issuer: string;
  year: string;
  status: string;
}

export interface PortfolioData {
  profile: {
    name: string;
    shortName: string;
    credentials: string;
    title: string;
    company: string;
    companyLogo: string;
    avatar: string;
    tagline: string;
    bio: string;
    location: string;
    shortLocation: string;
    availability: string;
    email: string;
    phone: string;
    linkedin: string;
    licenseNumber: string;
  };
  metrics: ImpactMetric[];
  projects: CivilProject[];
  competencies: CompetencyGroup[];
  experience: ExperienceItem[];
  credentials: CredentialItem[];
}
