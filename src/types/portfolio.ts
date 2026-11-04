export type PresetProjectCategory =
  | 'Modern Villas'
  | 'Multi-Story RC'
  | 'Turnkey Homes'
  | 'Structural & BIM';

export type ProjectCategory = 'All' | PresetProjectCategory | (string & {});

export type ProjectPublishStatus = 'published' | 'draft';

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
  category: string;
  location: string;
  year: string;
  role: string;
  budget: string;
  image: string;
  status?: ProjectPublishStatus;
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
    resumeUrl?: string;
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

export type InquiryStatus = 'new' | 'reviewed' | 'archived';

export interface ContactInquiry {
  id: string;
  name: string;
  contact: string;
  message: string;
  status: InquiryStatus;
  createdAt: string;
}
