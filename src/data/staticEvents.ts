// Static events data for fast loading on participant landing page
// This provides immediate UI rendering without database queries

export interface StaticEvent {
  id: string;
  title: string;
  description: string;
  category: string;
  startDate: string;
  endDate: string;
  location: string;
  maxParticipants: number;
  registrationDeadline: string;
  status: "published" | "ongoing" | "completed" | "draft";
  organizer: {
    name: string;
    email?: string;
  };
  judges?: Array<{
    name: string;
    profile?: {
      firstName?: string;
    };
  }>;
  requirements: string[];
  prizes: Array<{
    position: string;
    prize: string;
    amount?: number;
  }>;
  eventImage?: string;
  registrationFee?: number;
  paymentLink?: string;
  participantRegistrationUrl?: string;
  tags: string[];
  websiteUrl?: string; // For the Visit button to redirect to specific event webpage
}

// Static events that load immediately for better performance
export const staticEvents: StaticEvent[] = [
  {
    id: "hackathon-2024",
    title: "SuperNova Hackathon 2024",
    description: "48-hour coding marathon where brilliant minds come together to build innovative solutions to real-world problems. This flagship event brings together the most talented developers, designers, and entrepreneurs.",
    category: "Hackathon", 
    startDate: "2024-10-15T09:00:00.000Z",
    endDate: "2024-10-17T17:00:00.000Z",
    location: "Tech Hub Campus, Auditorium Complex",
    maxParticipants: 500,
    registrationDeadline: "2024-10-10T23:59:59.000Z",
    status: "published",
    organizer: {
      name: "SuperNova Tech Team",
      email: "hackathon@supernova.edu"
    },
    judges: [
      { name: "Dr. Sarah Chen", profile: { firstName: "Sarah" } },
      { name: "Alex Rodriguez", profile: { firstName: "Alex" } },
      { name: "Prof. Michael Zhang", profile: { firstName: "Michael" } }
    ],
    requirements: [
      "Basic programming knowledge",
      "Team of 2-4 members",
      "Laptop with development environment",
      "Valid student ID"
    ],
    prizes: [
      { position: "1st Place", prize: "₹50,000 + Internship Opportunities", amount: 50000 },
      { position: "2nd Place", prize: "₹30,000 + Tech Swag", amount: 30000 },
      { position: "3rd Place", prize: "₹15,000 + Certificates", amount: 15000 }
    ],
    eventImage: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&h=600&fit=crop",
    registrationFee: 0,
    tags: ["Hackathon", "Programming", "Innovation", "Team Event"],
    websiteUrl: "https://hackathon.supernova.edu/2024"
  },
  {
    id: "web-dev-contest-2024",
    title: "Web Development Championship",
    description: "Showcase your frontend and full-stack development skills in this comprehensive web development competition. Build responsive, modern web applications using the latest technologies.",
    category: "Web Development",
    startDate: "2024-10-20T10:00:00.000Z",
    endDate: "2024-10-20T18:00:00.000Z",
    location: "Computer Lab Block A & B",
    maxParticipants: 200,
    registrationDeadline: "2024-10-18T23:59:59.000Z",
    status: "published",
    organizer: {
      name: "Web Dev Society",
      email: "webdev@supernova.edu"
    },
    judges: [
      { name: "Emma Johnson", profile: { firstName: "Emma" } },
      { name: "David Kim", profile: { firstName: "David" } }
    ],
    requirements: [
      "HTML, CSS, JavaScript knowledge",
      "Experience with modern frameworks",
      "Own laptop required",
      "Portfolio of previous work (optional)"
    ],
    prizes: [
      { position: "Winner", prize: "₹25,000 + Job Interview Fast-track", amount: 25000 },
      { position: "Runner-up", prize: "₹15,000 + Course Vouchers", amount: 15000 },
      { position: "Best Design", prize: "₹10,000 + Design Tools License", amount: 10000 }
    ],
    eventImage: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&h=600&fit=crop",
    registrationFee: 100,
    tags: ["Web Development", "Frontend", "JavaScript", "React"],
    websiteUrl: "https://webdev.supernova.edu/championship"
  },
  {
    id: "ai-ml-symposium-2024",
    title: "AI & Machine Learning Symposium",
    description: "Dive into the world of artificial intelligence and machine learning. Present your AI models, participate in ML challenges, and learn from industry experts about the future of AI.",
    category: "AI/ML",
    startDate: "2024-10-25T09:00:00.000Z",
    endDate: "2024-10-26T17:00:00.000Z",
    location: "Innovation Center, Main Auditorium",
    maxParticipants: 300,
    registrationDeadline: "2024-10-22T23:59:59.000Z",
    status: "published",
    organizer: {
      name: "AI Research Lab",
      email: "aiml@supernova.edu"
    },
    judges: [
      { name: "Dr. Priya Sharma", profile: { firstName: "Priya" } },
      { name: "James Wilson", profile: { firstName: "James" } },
      { name: "Dr. Raj Patel", profile: { firstName: "Raj" } }
    ],
    requirements: [
      "Python programming experience",
      "Basic ML/AI concepts knowledge",
      "Jupyter Notebook setup",
      "Dataset for presentation (if applicable)"
    ],
    prizes: [
      { position: "Best Model", prize: "₹40,000 + Research Opportunity", amount: 40000 },
      { position: "Innovation Award", prize: "₹25,000 + Publication Support", amount: 25000 },
      { position: "People's Choice", prize: "₹15,000 + Conference Tickets", amount: 15000 }
    ],
    eventImage: "https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=800&h=600&fit=crop",
    registrationFee: 200,
    tags: ["AI", "Machine Learning", "Data Science", "Python"],
    websiteUrl: "https://ai.supernova.edu/symposium"
  },
  {
    id: "mobile-app-challenge-2024",
    title: "Mobile App Development Challenge",
    description: "Create innovative mobile applications for Android and iOS platforms. Focus on user experience, performance, and solving real-world problems through mobile technology.",
    category: "Mobile Development",
    startDate: "2024-11-01T09:00:00.000Z",
    endDate: "2024-11-02T18:00:00.000Z",
    location: "Mobile Development Lab",
    maxParticipants: 150,
    registrationDeadline: "2024-10-28T23:59:59.000Z",
    status: "published",
    organizer: {
      name: "Mobile Dev Club",
      email: "mobile@supernova.edu"
    },
    judges: [
      { name: "Lisa Anderson", profile: { firstName: "Lisa" } },
      { name: "Ryan Murphy", profile: { firstName: "Ryan" } }
    ],
    requirements: [
      "Android Studio or Xcode setup",
      "Mobile development experience",
      "Testing device (Android/iOS)",
      "UI/UX design basics"
    ],
    prizes: [
      { position: "Best App", prize: "₹30,000 + Play Store Publishing", amount: 30000 },
      { position: "Best UX", prize: "₹20,000 + Design Workshop", amount: 20000 },
      { position: "Most Innovative", prize: "₹15,000 + Startup Mentorship", amount: 15000 }
    ],
    eventImage: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&h=600&fit=crop",
    registrationFee: 150,
    tags: ["Mobile Development", "Android", "iOS", "App Development"],
    websiteUrl: "https://mobile.supernova.edu/challenge"
  },
  {
    id: "cybersecurity-ctf-2024", 
    title: "Cybersecurity Capture The Flag",
    description: "Test your cybersecurity skills in this intense Capture The Flag competition. Solve security challenges, find vulnerabilities, and demonstrate your ethical hacking abilities.",
    category: "Cybersecurity",
    startDate: "2024-11-05T18:00:00.000Z",
    endDate: "2024-11-06T02:00:00.000Z",
    location: "Security Lab & Online Platform",
    maxParticipants: 100,
    registrationDeadline: "2024-11-03T23:59:59.000Z",
    status: "published",
    organizer: {
      name: "CyberSec Society",
      email: "cybersec@supernova.edu"
    },
    judges: [
      { name: "Dr. Kevin Black", profile: { firstName: "Kevin" } },
      { name: "Maria Santos", profile: { firstName: "Maria" } }
    ],
    requirements: [
      "Basic networking knowledge",
      "Linux command line familiarity",
      "Security tools experience (optional)",
      "VPN client setup"
    ],
    prizes: [
      { position: "CTF Champion", prize: "₹35,000 + Security Certification", amount: 35000 },
      { position: "Runner-up", prize: "₹20,000 + Security Course", amount: 20000 },
      { position: "Best Newcomer", prize: "₹10,000 + Mentorship", amount: 10000 }
    ],
    eventImage: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&h=600&fit=crop",
    registrationFee: 50,
    tags: ["Cybersecurity", "CTF", "Ethical Hacking", "Networking"],
    websiteUrl: "https://security.supernova.edu/ctf"
  },
  {
    id: "data-science-olympics-2024",
    title: "Data Science Olympics",
    description: "Compete in various data science challenges including data analysis, visualization, and predictive modeling. Work with real-world datasets to solve business problems.",
    category: "Data Science",
    startDate: "2024-11-10T10:00:00.000Z", 
    endDate: "2024-11-11T16:00:00.000Z",
    location: "Data Analytics Center",
    maxParticipants: 250,
    registrationDeadline: "2024-11-07T23:59:59.000Z",
    status: "published",
    organizer: {
      name: "Data Science Institute",
      email: "datascience@supernova.edu"
    },
    judges: [
      { name: "Dr. Anna Lee", profile: { firstName: "Anna" } },
      { name: "Robert Taylor", profile: { firstName: "Robert" } },
      { name: "Sophie Chen", profile: { firstName: "Sophie" } }
    ],
    requirements: [
      "Python or R programming",
      "Data analysis libraries knowledge",
      "Statistics fundamentals",
      "Visualization tools experience"
    ],
    prizes: [
      { position: "Data Champion", prize: "₹45,000 + Industry Internship", amount: 45000 },
      { position: "Analytics Expert", prize: "₹30,000 + Conference Pass", amount: 30000 },
      { position: "Visualization Master", prize: "₹18,000 + Tools License", amount: 18000 }
    ],
    eventImage: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop",
    registrationFee: 120,
    tags: ["Data Science", "Analytics", "Python", "Statistics"],
    websiteUrl: "https://datascience.supernova.edu/olympics"
  }
];

// Helper function to get events by status
export const getEventsByStatus = (status: string) => {
  return staticEvents.filter(event => event.status === status);
};

// Helper function to get published events (most commonly used)
export const getPublishedEvents = () => {
  return getEventsByStatus("published");
};

// Helper function to get event by ID
export const getEventById = (id: string) => {
  return staticEvents.find(event => event.id === id);
};