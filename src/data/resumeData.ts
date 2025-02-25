// Resume data for the portfolio
const resumeData = {
  personalInfo: {
    name: "STEVEN BROWN",
    title: "Full Stack Developer",
    birthYear: "1997",
    location: "United States",
    links: [{ label: "GitHub", url: "https://github.com/wickthumb" }],
  },
  workExperience: [
    {
      year: "September 2023 - Present",
      position: "Full Stack Developer",
      company: "Pavewise, Fargo, ND",
      description:
        "Building web apps for all construction companies to manage their projects. Making tech work for people who build actual roads.",
      links: [{ label: "Company Website", url: "https://pavewisepro.com" }],
      achievements: [
        "Built a testing suite that made sure our API wasn't garbage. Found and squashed bugs before they ruined someone's day.",
        "Created a system to grab weather data from everywhere - both APIs and actual weather stations - so construction crews know when they can work & for legal reasons.",
        "Replaced stacks of paper forms with voice-activated AI so construction workers can just talk instead of filling out boring paperwork.",
        "Created a camera feature that snaps photos of density gauges to auto-log readings directly onto interactive maps - no more clipboards or manual entry. Construction crews love it.",
        "Worked on some neat projects like PaveCool (calculates optimal paving temperatures based on weather conditions, air/surface temps, and mix properties), SpecChat (chat with construction specs), and other automation tools.",
      ],
      technologies: [
        "Ruby on Rails",
        "FastAPI",
        "React",
        "React Query",
        "TypeScript",
        "Material-UI",
        "PostgreSQL",
        "Python",
        "Ruby",
        "AWS",
        "GCP",
      ],
    },
    {
      year: "2021 - 2023",
      position: "Cross Country & Track Coach",
      company: "Valley City State University",
      description:
        "Provided coaching and mentorship to university students, developing training programs and strategies to improve performance.",
      links: [
        {
          label: "Athletics Page",
          url: "https://vcsuvikings.com/sports/mens-track-and-field/roster/coaches/steven-brown/238",
        },
      ],
    },
  ],
  projects: [
    {
      year: "May 2024 - Present",
      name: "TrackToolsPro.com",
      description:
        "Web application for college track coaches, automating training plans and athlete fitness level tracking. Implemented roster management, secure file sharing, and critical location sharing.",
      links: [{ label: "Website", url: "https://tracktoolspro.com" }],
      technologies: [
        "React",
        "Material-UI",
        "JavaScript",
        "Ruby on Rails",
        "Heroku",
        "Netlify",
        "Xai",
        "AWS",
      ],
    },
    {
      year: "January 2024",
      name: "Only30Minutes.com",
      description:
        "LLM-powered web application using Firebase serverless architecture. Created personalized, brief workouts delivered to users based on their location and available equipment.",
      links: [{ label: "Website", url: "https://only30minutes.com" }],
      technologies: ["Firebase", "React", "JavaScript", "Netlify", "Groq"],
    },
    {
      year: "January 2024",
      name: "AI Snow Tank",
      description:
        "Designed and built a modular snow-capable vehicle from the ground up, including 3D printing the shell, tank tracks, and wheels, as well as developing all necessary electronics and software.",
      links: [],
      technologies: ["Fusion360", "Python", "Flask", "Xai", "AgentXAI", "RP5"],
    },
    {
      year: "February 2024",
      name: "Presivid.com",
      description:
        "Creates natural-sounding narrated videos from PowerPoints and PDFs.",
      links: [{ label: "Website", url: "https://presivid.com" }],
      technologies: [
        "React",
        "Material-UI",
        "TypeScript",
        "Firebase",
        "Python",
        "OpenAI",
        "GCP",
      ],
    },
    {
      year: "20XX",
      name: "Synthwave OS",
      description:
        "A retro-futuristic interface system with interactive terminal and games, built with React and TypeScript.",
      links: [
        { label: "GitHub", url: "https://github.com/wickthumb/synthwave-os" },
      ],
      technologies: ["React", "TypeScript", "CSS", "JavaScript"],
    },
  ],
  skills: {
    programming: [
      "JavaScript",
      "TypeScript",
      "Python",
      "Ruby",
      "Java",
      "HTML",
      "CSS",
      "SQL",
    ],
    frameworks: [
      "React",
      "React Query",
      "Ruby on Rails",
      "FastAPI",
      "Express",
      "Next.js",
      "Material-UI",
      "NodeJS",
    ],
    tools: [
      "Git",
      "Docker",
      "AWS",
      "GCP",
      "Firebase",
      "MongoDB",
      "PostgreSQL",
      "Fusion 360",
      "Odoo",
      "Heroku",
      "Netlify",
    ],
    other: [
      "Responsive Design",
      "RESTful APIs",
      "Team Leadership",
      "Coaching",
      "Deep Learning",
      "AI Integration",
    ],
  },
  personalLife: [
    {
      year: "2015",
      event: "Graduated High School",
      description: "Completed secondary education and prepared for college.",
    },
    {
      year: "2015",
      event: "Moved to South Dakota",
      description: "Relocated to South Dakota to pursue higher education.",
    },
    {
      year: "2020",
      event: "Graduated College",
      description: "Earned Bachelor of Science in Exercise Science.",
    },
    {
      year: "2020",
      event: "Started 3D Printing Business",
      description:
        "Used stimulus check to purchase first 3D printer and launched a moderately successful Etsy shop.",
    },
    {
      year: "2021",
      event: "Got Married",
      description: "Tied the knot and started a new chapter in life.",
    },
    {
      year: "2021",
      event: "Began MBA Program",
      description:
        "Started a Master's in Business Administration before deciding to focus on programming instead.",
    },
    {
      year: "2022",
      event: "First Coaching Position",
      description:
        "Became a Graduate Assistant coach at the University of Mary.",
    },
    {
      year: "2023",
      event: "Full-time Coaching Position",
      description:
        "Accepted coaching role at Valley City State University where I applied programming knowledge to optimize processes.",
    },
    {
      year: "2023",
      event: "Welcomed Daughter",
      description: "Became a parent with the birth of my daughter.",
    },
    {
      year: "September 2023",
      event: "Joined Pavewise",
      description:
        "Started career as a Full Stack Developer at Pavewise in Fargo, ND after discovering my passion for coding.",
    },
  ],
};

export default resumeData;
