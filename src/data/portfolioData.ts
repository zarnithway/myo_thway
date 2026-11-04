import type { PortfolioData } from '../types/portfolio';

export const portfolioData: PortfolioData = {
  profile: {
    name: 'Myo Thway',
    shortName: 'MYO THWAY',
    credentials: 'R.S.E.',
    title: 'Lead Civil & Structural Engineer',
    company: 'UMT Construction Group',
    companyLogo: '/images/umt-logo-mark.png',
    avatar: '/images/profile-myo-thway.svg',
    tagline:
      'Engineering enduring residential homes with structural precision and minimalist architectural clarity.',
    bio: 'Registered Senior Engineer (R.S.E.) and B.E. (Civil) graduate from Yangon Technological University (YTU). Based in Mandalay, Myanmar and leading UMT Construction Group — specializing in seismic-resilient reinforced concrete residences, modern villas, and end-to-end turnkey home construction.',
    location: 'Mandalay, Myanmar • UMT Construction Group HQ',
    shortLocation: 'Mandalay, Myanmar',
    availability: 'Lead Engineer • UMT Construction Group',
    email: 'myothway@umtconstruction.com',
    phone: '+95 95230680',
    linkedin: 'https://linkedin.com',
    licenseNumber: 'Registered Senior Engineer (R.S.E.) • B.E. (Civil), YTU',
  },
  metrics: [
    {
      value: 'R.S.E.',
      label: 'Certified Senior Engineer',
      detail: 'Myanmar Engineering Council',
    },
    {
      value: 'B.E. Civil',
      label: 'YTU Graduate',
      detail: 'Yangon Technological Univ.',
    },
    {
      value: 'UMT Lead',
      label: 'Mandalay Practice',
      detail: 'Design-Build & Structural QA',
    },
    {
      value: '100%',
      label: 'Seismic & Code QA',
      detail: 'MNBC 2020 & ACI 318 Compliant',
    },
  ],
  projects: [
    {
      id: 'mingalar-cantilever-residence',
      code: 'UMT-01',
      title: 'Mingalar Modern Cantilevered RC Residence',
      category: 'Modern Villas',
      location: 'Chanmyathazi, Mandalay',
      year: '2025',
      role: 'Lead Engineer & Project Head (UMT)',
      budget: '4,850 Sq.Ft',
      image: '/images/villa-cantilever.jpg',
      gallery: [
        {
          src: '/images/villa-cantilever.jpg',
          caption: 'Primary Front Elevation & 4.2m Cantilever Terrace',
        },
        {
          src: '/images/interior-staircase-rc.jpg',
          caption: 'Column-Free Open Living & Kitchen Span',
        },
        {
          src: '/images/villa-terrace-evening.jpg',
          caption: 'Evening Courtyard Veranda & Glazing Framing',
        },
        {
          src: '/images/facade-concrete-detail.jpg',
          caption: 'Timber & Architectural Concrete Entry Volume',
        },
        {
          src: '/images/interior-living-glass.jpg',
          caption: 'Upper Lounge Natural Daylight Glazing',
        },
        {
          src: '/images/structural-bim-frame.jpg',
          caption: 'Seismic SMRF Concrete Frame & Facade Geometry',
        },
      ],
      summary:
        '3.5-story contemporary reinforced concrete villa featuring a 4.2m cantilevered upper terrace, double-height glass living hall, and architectural fair-faced concrete planes.',
      challenge:
        'Achieving a sleek, column-free corner glass living room and deep balcony overhang while satisfying Mandalay high-seismic Zone V ductile detailing and lateral drift limits.',
      solution:
        'Engineered a Special Moment-Resisting RC Frame (SMRF) with tapered cantilever transfer beams in ETABS, paired with high-ductility confinement ties and low-shrinkage concrete curing.',
      outcomes: [
        'Zero long-term cantilever slab cracking or noticeable deflection (< L/600 verified).',
        'Completed structural framing and architectural finishing 3 weeks ahead of homeowner handover schedule.',
        'Full R.S.E. structural calculation package approved seamlessly through MCDC municipal permitting.',
      ],
      standards: ['MNBC 2020 (Zone V)', 'ACI 318-19', 'ASCE 7 Seismic'],
      software: ['CSI ETABS', 'CSI SAFE', 'AutoCAD', 'Revit Structure'],
      specs: [
        { label: 'Structure', value: '3.5-Story SMRF' },
        { label: 'Cantilever', value: '4.2m Overhang' },
        { label: 'Concrete Grade', value: '30 MPa (Grade 30)' },
        { label: 'Delivery', value: 'Turnkey Villa' },
      ],
    },
    {
      id: 'chanayethazan-urban-residence',
      code: 'UMT-02',
      title: 'Chanayethazan Multi-Family Urban Residence',
      category: 'Multi-Story RC',
      location: 'Chanayethazan, Mandalay',
      year: '2024',
      role: 'R.S.E. Structural & Construction Lead',
      budget: '11,200 Sq.Ft',
      image: '/images/rc-residence-yangon.jpg',
      gallery: [
        {
          src: '/images/rc-residence-yangon.jpg',
          caption: 'Street Elevation & Recessed Solar-Shading Balconies',
        },
        {
          src: '/images/pyigyidagun-apartment.jpg',
          caption: 'Multi-Story RC Frame & Cantilevered Slab Alignment',
        },
        {
          src: '/images/interior-living-glass.jpg',
          caption: 'Typical Apartment Living Unit & Acoustic Slab Finish',
        },
        {
          src: '/images/interior-staircase-rc.jpg',
          caption: 'Penthouse Open-Plan Interior & Concealed MEP Risers',
        },
        {
          src: '/images/facade-concrete-detail.jpg',
          caption: 'Ground-Level Entry & Boundary Setback Detailing',
        },
      ],
      summary:
        '6-story modern residential apartment building engineered on bored pile foundations with ground-level parking and recessed solar-shading glass facades.',
      challenge:
        'Tight urban Mandalay plot adjacency to neighboring buildings requiring vibration-free foundation installation, high-seismic shear resistance, and strict verticality control.',
      solution:
        'Designed rotary bored cast-in-situ RC piles with SAFE mat-cap interaction modeling, ductile shear-wall core, and staged boundary monitoring throughout excavation.',
      outcomes: [
        'Zero settlement or vibration impact on adjacent boundary walls during foundation works.',
        'Passed 100% of 7-day and 28-day concrete cylinder compression and rebar mill-certificate audits.',
        'Delivered refined minimalist facade with concealed MEP risers and acoustic floor slabs.',
      ],
      standards: ['MNBC 2020', 'MCDC Building Rules', 'ACI 318'],
      software: ['ETABS', 'SAFE', 'AutoCAD Detailing', 'MS Project'],
      specs: [
        { label: 'Height', value: '6 Stories + Penthouse' },
        { label: 'Foundation', value: 'Bored RC Piles' },
        { label: 'Lateral System', value: 'Dual Shear-Frame' },
        { label: 'QA Record', value: '100% Cube Pass' },
      ],
    },
    {
      id: 'patheingyi-courtyard-home',
      code: 'UMT-03',
      title: 'Patheingyi Minimalist Courtyard Family Home',
      category: 'Turnkey Homes',
      location: 'Patheingyi, Mandalay',
      year: '2024',
      role: 'Turnkey Construction Lead (UMT)',
      budget: '3,900 Sq.Ft',
      image: '/images/courtyard-house.jpg',
      gallery: [
        {
          src: '/images/courtyard-house.jpg',
          caption: 'Courtyard Facade & Thermally Insulated Roof Overhang',
        },
        {
          src: '/images/interior-staircase-rc.jpg',
          caption: 'Cross-Ventilated Indoor-Outdoor Living Pavilion',
        },
        {
          src: '/images/villa-terrace-evening.jpg',
          caption: 'Dusk Garden Courtyard & Low-E Sliding Doors',
        },
        {
          src: '/images/interior-living-glass.jpg',
          caption: 'Family Lounge & Custom Turnkey Millwork',
        },
        {
          src: '/images/facade-concrete-detail.jpg',
          caption: 'Elevated Plinth & Driveway Hardscape Drainage',
        },
      ],
      summary:
        'End-to-end design-build family residence combining passive cross-ventilation, thermally insulated roof slabs for Mandalay summers, and floor-to-ceiling glass courtyard openings.',
      challenge:
        'Delivering transparent BOQ cost certainty across material markets while ensuring cool indoor thermal performance during Mandalay peak dry-season heat.',
      solution:
        'Implemented UMT Construction Group phased procurement, cavity-wall & roof thermal insulation, elevated plinth damp-proofing, and double-glazed low-E architectural openings.',
      outcomes: [
        'Delivered within 1.5% of initial signed Bill of Quantities (BOQ) budget.',
        'Significantly reduced peak afternoon indoor heat gain via deep structural eaves and insulated roof assembly.',
        'Backed by UMT Construction Group structural & waterproofing workmanship warranty.',
      ],
      standards: ['MNBC Residential', 'ASTM Material QA', 'UMT QA/QC'],
      software: ['AutoCAD', 'Revit', 'Excel BOQ Matrix', 'MS Project'],
      specs: [
        { label: 'Plot Area', value: "60' × 80' Plot" },
        { label: 'Scope', value: 'Full Turnkey PAE' },
        { label: 'Budget Variance', value: '< 1.5% BOQ' },
        { label: 'Thermal Spec', value: 'Low-E + Roof Insul.' },
      ],
    },
    {
      id: 'mahaaungmyay-bim-twin-villas',
      code: 'UMT-04',
      title: 'Mahaaungmyay Twin Residence Structural & BIM',
      category: 'Structural & BIM',
      location: 'Mahaaungmyay, Mandalay',
      year: '2023',
      role: 'Lead Structural Engineer (R.S.E.)',
      budget: '7,400 Sq.Ft',
      image: '/images/structural-bim-frame.jpg',
      gallery: [
        {
          src: '/images/structural-bim-frame.jpg',
          caption: 'Completed Twin RC Frame & Architectural Concrete Planes',
        },
        {
          src: '/images/facade-concrete-detail.jpg',
          caption: 'Double-Height Glazed Portal & Cladding Alignment',
        },
        {
          src: '/images/interior-staircase-rc.jpg',
          caption: 'Split-Level Slab & Clash-Free Concealed AC Ducting',
        },
        {
          src: '/images/villa-cantilever.jpg',
          caption: 'Cantilevered Upper Balcony & Seismic Joint Detailing',
        },
        {
          src: '/images/interior-living-glass.jpg',
          caption: 'Finished Interior Volume Verified Against LOD 350 BIM',
        },
      ],
      summary:
        'Coordinated 3D Revit structural modeling, seismic bar-bending schedules, and site execution for a pair of contemporary 3-story residences.',
      challenge:
        'Complex split-level architectural floor plates and concealed floating staircases required clash-free coordination with air-conditioning ducts and sanitary piping prior to slab pours.',
      solution:
        'Modeled full LOD 350 seismic reinforcement and structural framing in Revit + ETABS, resolving 34 beam-sleeve penetrations digitally before steel fabrication on site.',
      outcomes: [
        'Reduced on-site rebar wastage below 3.2% through optimized bar-bending schedules.',
        'Eliminated post-pour core-drilling across all primary transfer beams.',
        'Set benchmark digital workflow for UMT Construction Group residential projects in Mandalay.',
      ],
      standards: ['ACI 315 Detailing', 'ACI 318', 'MNBC 2020'],
      software: ['Revit Structure', 'ETABS', 'AutoCAD Structural'],
      specs: [
        { label: 'Configuration', value: 'Twin 3-Story RC' },
        { label: 'BIM Level', value: 'LOD 350 Rebar' },
        { label: 'Rebar Waste', value: '< 3.2% On-Site' },
        { label: 'Sign-Off', value: 'R.S.E. Certified' },
      ],
    },
    {
      id: 'aungmyaythazan-pavilion-villa',
      code: 'UMT-05',
      title: 'Mandalay Hill Foothills Pavilion Villa',
      category: 'Modern Villas',
      location: 'Aungmyaythazan, Mandalay',
      year: '2025',
      role: 'Lead Engineer & Turnkey Head (UMT)',
      budget: '4,200 Sq.Ft',
      image: '/images/mandalay-hill-villa.jpg',
      gallery: [
        {
          src: '/images/mandalay-hill-villa.jpg',
          caption: 'Slim 3.6m Horizontal Roof Slab & Poolside Pavilion',
        },
        {
          src: '/images/villa-terrace-evening.jpg',
          caption: 'Twilight Veranda & Cornerless Sliding Glazing',
        },
        {
          src: '/images/interior-staircase-rc.jpg',
          caption: 'Open Pavilion Dining & Timber Feature Wall',
        },
        {
          src: '/images/facade-concrete-detail.jpg',
          caption: 'Forecourt Arrival & Post-Tensioned Canopy Edge',
        },
        {
          src: '/images/interior-living-glass.jpg',
          caption: 'Master Wing Interior & Acoustic Glazing',
        },
      ],
      summary:
        'Clean horizontal RC roof-slab pavilion residence with cornerless sliding glass openings, shaded poolside veranda, and seismic tie-beam mat footings.',
      challenge:
        'Creating a slender, crisp white architectural roof eave with wide corner openings while resisting lateral torsion under Mandalay Zone V seismic loading.',
      solution:
        'Balanced torsional eccentricity using concealed L-shaped ductile RC shear walls at the rear service core and post-tensioned edge bands along the terrace canopy.',
      outcomes: [
        'Achieved razor-sharp architectural concrete fascia alignment within 3mm tolerance.',
        'Zero waterproofing seepage across flat roof slab after full monsoon cycle.',
        'Handed over turnkey interior & exterior package on schedule.',
      ],
      standards: ['MNBC 2020 (Zone V)', 'ACI 318-19', 'ASTM Waterproofing'],
      software: ['CSI ETABS', 'CSI SAFE', 'AutoCAD', 'MS Project'],
      specs: [
        { label: 'Structure', value: '2.5-Story RC' },
        { label: 'Eave Span', value: '3.6m Slim Slab' },
        { label: 'Foundation', value: 'Raft + Tie-Beam' },
        { label: 'Delivery', value: 'Turnkey PAE' },
      ],
    },
    {
      id: 'pyigyidagun-multi-story-rc',
      code: 'UMT-06',
      title: 'Pyigyidagun Five-Story Residential Complex',
      category: 'Multi-Story RC',
      location: 'Pyigyidagun, Mandalay',
      year: '2024',
      role: 'R.S.E. Structural & Site Lead',
      budget: '9,800 Sq.Ft',
      image: '/images/pyigyidagun-apartment.jpg',
      gallery: [
        {
          src: '/images/pyigyidagun-apartment.jpg',
          caption: 'Five-Story Special Moment Frame Exterior Elevation',
        },
        {
          src: '/images/rc-residence-yangon.jpg',
          caption: 'Cantilevered RC Balconies & Steel Guardrail Detailing',
        },
        {
          src: '/images/interior-living-glass.jpg',
          caption: 'Upper-Floor Residential Unit Interior Handover',
        },
        {
          src: '/images/interior-staircase-rc.jpg',
          caption: 'Full-Height Window Bays & Flat-Slab Soffit Finish',
        },
        {
          src: '/images/structural-bim-frame.jpg',
          caption: 'Ductile Perimeter Frame & Masonry Isolation Jointing',
        },
      ],
      summary:
        '5-story multi-unit residential building featuring cantilevered steel-railed RC balconies, ground-level commercial/parking bay, and seismic moment framing.',
      challenge:
        'Avoiding soft-story irregularity across the open ground-floor parking bays in a high-seismic urban corridor.',
      solution:
        'Detailed closely spaced confining hoops in ground-story RC columns per ACI 318 Chapter 18 Special Moment Frame provisions, paired with perimeter masonry infill isolation gaps.',
      outcomes: [
        'Eliminated soft-story drift concentration in nonlinear pushover verification.',
        'Completed all 5 floor slab pours on 18-day cycle intervals with 100% cube strength compliance.',
        'Approved smoothly under MCDC multi-story engineering inspection.',
      ],
      standards: ['MNBC 2020', 'MCDC Permit Code', 'ACI 318 Ch.18'],
      software: ['ETABS', 'SAFE', 'AutoCAD Detailing'],
      specs: [
        { label: 'Height', value: '5 Stories RC' },
        { label: 'Frame Type', value: 'Special Moment' },
        { label: 'Concrete', value: '32 MPa Ready-Mix' },
        { label: 'Cycle Time', value: '18 Days / Floor' },
      ],
    },
    {
      id: 'amarapura-estate-residence',
      code: 'UMT-07',
      title: 'Amarapura Contemporary Family Estate',
      category: 'Turnkey Homes',
      location: 'Amarapura, Mandalay',
      year: '2023',
      role: 'Lead Civil Engineer (UMT)',
      budget: '5,300 Sq.Ft',
      image: '/images/amarapura-residence.jpg',
      gallery: [
        {
          src: '/images/amarapura-residence.jpg',
          caption: 'Travertine & Architectural RC Front Estate Elevation',
        },
        {
          src: '/images/villa-terrace-evening.jpg',
          caption: 'Landscaped Rear Lawn & Covered Outdoor Dining Deck',
        },
        {
          src: '/images/facade-concrete-detail.jpg',
          caption: 'Raised +1.05m Plinth & Engineered Storm Detention Court',
        },
        {
          src: '/images/interior-staircase-rc.jpg',
          caption: 'Main Residence Reception, Kitchen & Courtyard View',
        },
        {
          src: '/images/interior-living-glass.jpg',
          caption: 'Upper Master Suite Lounge & Acoustic Glazing',
        },
      ],
      summary:
        'Two-story luxury family residence combining travertine-clad RC volumes, cantilevered upper master suite balcony, and engineered site drainage.',
      challenge:
        'Expansive silty-clay subgrade near seasonal floodplain required differential-settlement control and elevated moisture protection.',
      solution:
        'Constructed compacted granular sub-base replacement beneath a rigid grid strip-footing network with +1.05m raised plinth beams and perimeter storm detention.',
      outcomes: [
        'Zero differential settlement or hairline plaster cracking across wide stone-clad facades.',
        'Delivered full architectural, structural, electrical, and sanitary scope under single UMT contract.',
      ],
      standards: ['MNBC Residential', 'ACI 318', 'UMT Turnkey QA'],
      software: ['CSI SAFE', 'ETABS', 'AutoCAD', 'Excel BOQ'],
      specs: [
        { label: 'Plot Size', value: "80' × 100' Plot" },
        { label: 'Plinth Level', value: '+1.05m Elevated' },
        { label: 'Subgrade', value: 'Engineered Fill' },
        { label: 'Contract', value: 'Turnkey Design-Build' },
      ],
    },
    {
      id: 'pyinoolwin-highland-residence',
      code: 'UMT-08',
      title: 'Pyin Oo Lwin Highland RC & Timber-Clad Home',
      category: 'Structural & BIM',
      location: 'Pyin Oo Lwin, Mandalay Region',
      year: '2023',
      role: 'Lead Structural & BIM Engineer (R.S.E.)',
      budget: '4,600 Sq.Ft',
      image: '/images/pyinoolwin-bim-house.jpg',
      gallery: [
        {
          src: '/images/pyinoolwin-bim-house.jpg',
          caption: 'Sloped-Site RC Frame & Composite Louver Facade',
        },
        {
          src: '/images/facade-concrete-detail.jpg',
          caption: 'Stepped Retaining Wall & Timber-Clad Upper Volume',
        },
        {
          src: '/images/villa-terrace-evening.jpg',
          caption: 'Highland Evening Terrace & Split-Level Garden',
        },
        {
          src: '/images/interior-staircase-rc.jpg',
          caption: 'Warm Timber & Concrete Interior Living Hall',
        },
        {
          src: '/images/interior-living-glass.jpg',
          caption: 'Upper Study Overlooking Pine Foothills',
        },
      ],
      summary:
        'Sloped-site modern residence integrating RC structural framing, composite architectural louver facade, and 3D BIM terrain-footing coordination.',
      challenge:
        'Stepped hillside topography with 2.4m natural grade drop required stepped foundation footings and retaining wall integration without over-excavation.',
      solution:
        'Modeled existing survey contours and stepped RC footings in Revit Structure, coordinating retaining toe-slabs directly with ground-floor architectural split levels.',
      outcomes: [
        'Cut earthwork excavation and retaining concrete volume by 19% through 3D BIM terrain optimization.',
        'Seamless shop-drawing execution for architectural steel-and-composite facade subframes.',
      ],
      standards: ['MNBC 2020', 'ASCE 7', 'ACI 318'],
      software: ['Revit Structure', 'ETABS', 'AutoCAD Civil'],
      specs: [
        { label: 'Topography', value: '2.4m Stepped Slope' },
        { label: 'Earthwork Save', value: '-19% Concrete/Cut' },
        { label: 'BIM Model', value: '3D Terrain + RC' },
        { label: 'Sign-Off', value: 'R.S.E. Certified' },
      ],
    },
  ],
  competencies: [
    {
      id: 'disciplines',
      code: 'SEC 01',
      title: 'Residential & Structural Engineering',
      subtitle: 'UMT Core Delivery Scope',
      items: [
        'Turnkey Home Construction (PAE & Labor)',
        'Seismic-Resilient RC & Steel Villa Design',
        'Pile, Mat & Isolated Footing Foundations',
        'Ductile Frame Detailing & Retrofitting',
        'Detailed BOQ Estimation & Cost Control',
        'On-Site Concrete, Rebar & Finishing QA/QC',
      ],
    },
    {
      id: 'software',
      code: 'SEC 02',
      title: 'Analysis, CAD & BIM Stack',
      subtitle: 'Design & Construction Management',
      items: [
        'CSI ETABS (3D Seismic Frame Analysis)',
        'CSI SAFE (Slab, Mat & Footing Design)',
        'AutoCAD (Architectural & Rebar Detailing)',
        'Autodesk Revit Structure (3D BIM Coordination)',
        'MS Project & Construction Scheduling',
        'Total Station Surveying & Leveling Control',
      ],
    },
    {
      id: 'standards',
      code: 'SEC 03',
      title: 'Codes, Licensure & QA Standards',
      subtitle: 'Compliance & Structural Safety',
      items: [
        'Myanmar National Building Code (MNBC 2020)',
        'ACI 318 Ductile Structural Concrete Code',
        'ASCE 7 High-Seismic & Wind Load Provisions',
        'MCDC / Municipal Permit Submission Drawings',
        'ASTM Concrete Slump, Cube & Rebar Testing',
        'R.S.E. Certified Structural Sign-Off',
      ],
    },
  ],
  experience: [
    {
      period: 'CURRENT — LEAD',
      elevation: 'EL. +12.00m',
      role: 'Lead Civil & Structural Engineer',
      organization: 'UMT Construction Group',
      location: 'Mandalay, Myanmar',
      summary:
        'Directing structural engineering, client consultation, BOQ budgeting, and turnkey site execution for modern private residences, villas, and multi-story RC homes across Mandalay.',
      highlights: [
        'Lead R.S.E. overseeing high-seismic structural safety, foundation design, and quality benchmarks across all UMT residential projects.',
        'Integrated transparent milestone reporting, architectural finishing standards, and zero-defect handover checklists for homeowners.',
      ],
    },
    {
      period: 'PRIOR PRACTICE',
      elevation: 'EL. +06.00m',
      role: 'Senior Structural & Project Civil Engineer',
      organization: 'Residential & Commercial Building Practice',
      location: 'Mandalay, Myanmar',
      summary:
        'Managed structural modeling, MCDC municipal permit packages, and multi-disciplinary M&E coordination for urban residential buildings and custom homes.',
      highlights: [
        'Completed ETABS/SAFE seismic structural design and site supervision for multi-story RC residential structures under MNBC & ACI codes.',
        'Directed subcontractor teams, bar-bending verification, and concrete pour quality control.',
      ],
    },
    {
      period: 'FOUNDATION',
      elevation: 'EL. +00.00m',
      role: 'Civil Engineer (Site & Structural Design)',
      organization: 'Engineering & Construction Operations',
      location: 'Myanmar',
      summary:
        'Built hands-on field expertise in setting-out, soil & foundation works, reinforced concrete framing, and residential architectural finishing after graduating from YTU.',
      highlights: [
        'Established rigorous site inspection routines for footing excavation, rebar placement, formwork alignment, and waterproofing.',
      ],
    },
  ],
  credentials: [
    {
      code: 'LIC-RSE',
      title: 'Registered Senior Engineer (R.S.E.)',
      issuer: 'Myanmar Engineering Council (MEC)',
      year: 'Certified',
      status: 'Active Senior Engineering Registration',
    },
    {
      code: 'EDU-YTU',
      title: 'Bachelor of Engineering — B.E. (Civil)',
      issuer: 'Yangon Technological University (YTU)',
      year: 'Graduated',
      status: 'Civil Engineering Alma Mater',
    },
    {
      code: 'LEAD-UMT',
      title: 'Lead — UMT Construction Group',
      issuer: 'Mandalay, Myanmar • Design-Build Practice',
      year: 'Present',
      status: 'Turnkey Home & Villa Construction',
    },
    {
      code: 'STD-MNBC',
      title: 'High-Seismic RC Design & MNBC / ACI Compliance',
      issuer: 'Continuing Professional Development (CPD)',
      year: 'Verified',
      status: 'Mandalay Seismic Zone Structural QA',
    },
  ],
};
