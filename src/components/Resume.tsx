import React, { useState } from "react";
import theme from "./style/theme";
import resumeData from "../data/resumeData";
import "./style/Resume.css";

// Define types for links
interface Link {
  label: string;
  url: string;
}

// Define props for SectionHeader component
interface SectionHeaderProps {
  title: string;
  color: string;
  isOpen: boolean;
  toggleFn: () => void;
}

const Resume = () => {
  // State for collapsible sections
  const [sectionsOpen, setSectionsOpen] = useState({
    personalInfo: true,
    workExperience: true,
    projects: true,
    skills: true,
    personalLife: true,
  });

  // Toggle section visibility
  const toggleSection = (section: keyof typeof sectionsOpen) => {
    setSectionsOpen({
      ...sectionsOpen,
      [section]: !sectionsOpen[section],
    });
  };

  // Render link chips
  const renderLinks = (links: Link[] | undefined) => {
    if (!links || links.length === 0) return null;

    return (
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: theme.spacing.xs,
          marginTop: theme.spacing.xs,
          marginBottom: theme.spacing.sm,
        }}
      >
        {links.map((link: Link, index: number) => (
          <a
            key={`link-${index}`}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            style={{ textDecoration: "none" }}
          >
            <span
              style={{
                backgroundColor: theme.colors.accent6,
                color: theme.textColors.inverse,
                padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
                borderRadius: theme.borders.radius.sm,
                fontSize: theme.fonts.size.xs,
                display: "flex",
                alignItems: "center",
                gap: theme.spacing.xs,
                cursor: "pointer",
                transition: "all 0.2s ease",
                boxShadow: "0 0 5px " + theme.colors.accent6,
              }}
              onMouseOver={(e) => {
                const target = e.currentTarget;
                target.style.boxShadow = "0 0 10px " + theme.colors.accent6;
                target.style.transform = "translateY(-2px)";
              }}
              onMouseOut={(e) => {
                const target = e.currentTarget;
                target.style.boxShadow = "0 0 5px " + theme.colors.accent6;
                target.style.transform = "translateY(0)";
              }}
            >
              {link.label}
            </span>
          </a>
        ))}
      </div>
    );
  };

  // Section header with collapsible functionality
  const SectionHeader: React.FC<SectionHeaderProps> = ({
    title,
    color,
    isOpen,
    toggleFn,
  }) => (
    <div
      onClick={toggleFn}
      style={{
        display: "flex",
        alignItems: "center",
        cursor: "pointer",
        marginBottom: theme.spacing.md,
      }}
    >
      <h3
        style={{
          color: color,
          fontFamily: theme.fonts.family.heading,
          fontSize: theme.fonts.size.lg,
          textShadow: "0 0 5px " + color,
          margin: 0,
          display: "flex",
          alignItems: "center",
        }}
      >
        &gt; {title} {isOpen ? "[-]" : "[+]"}
      </h3>
    </div>
  );

  return (
    <div
      style={{
        backgroundColor: theme.colors.backgroundDark,
        border: `${theme.borders.width.medium} ${theme.borders.style.solid} ${theme.colors.accent2}`,
        borderRadius: theme.borders.radius.md,
        padding: theme.spacing.lg,
        boxShadow: theme.shadows.neon.blue,
        position: "relative",
        height: "100%",
        minHeight: "250px",
      }}
    >
      <div
        style={{
          backgroundColor: theme.colors.accent2,
          padding: theme.spacing.xs,
          marginBottom: theme.spacing.md,
          borderTopLeftRadius: theme.borders.radius.sm,
          borderTopRightRadius: theme.borders.radius.sm,
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
        }}
      >
        <p
          style={{
            margin: 0,
            color: theme.textColors.inverse,
            fontSize: theme.fonts.size.sm,
            textAlign: "center",
          }}
        >
          RESUME.SYS
        </p>
      </div>

      <div
        className="resume-content"
        style={{
          marginTop: theme.spacing.xl,
          height: "calc(100% - 40px)",
          overflowY: "auto",
          paddingRight: theme.spacing.md,
        }}
      >
        {/* Personal Info Section */}
        <div
          style={{
            marginBottom: theme.spacing.xl,
            borderBottom: `${theme.borders.width.thin} ${theme.borders.style.solid} ${theme.colors.accent2}`,
            paddingBottom: theme.spacing.md,
          }}
        >
          <h2
            style={{
              color: theme.colors.primary,
              fontFamily: theme.fonts.family.heading,
              fontSize: theme.fonts.size.xl,
              marginBottom: theme.spacing.sm,
              textShadow: theme.shadows.neon.pink,
            }}
          >
            {resumeData.personalInfo.name}
          </h2>
          <p
            style={{
              color: theme.colors.secondary,
              fontSize: theme.fonts.size.lg,
              marginBottom: theme.spacing.xs,
            }}
          >
            {resumeData.personalInfo.title}
          </p>
          <p
            style={{
              color: theme.textColors.secondary,
              fontSize: theme.fonts.size.md,
            }}
          >
            <span style={{ color: theme.colors.accent6 }}>LOCATION: </span>
            {resumeData.personalInfo.location}
          </p>
          <p
            style={{
              color: theme.textColors.secondary,
              fontSize: theme.fonts.size.md,
              marginBottom: theme.spacing.sm,
            }}
          >
            <span style={{ color: theme.colors.accent6 }}>BIRTH_YEAR: </span>
            {resumeData.personalInfo.birthYear}
          </p>
          {renderLinks(resumeData.personalInfo.links)}
        </div>

        {/* Timeline Section */}
        <div className="timeline">
          {/* Work Experience Section */}
          <div
            style={{
              marginBottom: theme.spacing.xl,
            }}
          >
            <SectionHeader
              title="WORK_EXPERIENCE"
              color={theme.colors.accent2}
              isOpen={sectionsOpen.workExperience}
              toggleFn={() => toggleSection("workExperience")}
            />

            {sectionsOpen.workExperience &&
              resumeData.workExperience.map((work, index) => (
                <div key={`work-${index}`} className="timeline-item">
                  <div
                    className="timeline-dot"
                    style={{
                      backgroundColor: theme.colors.accent2,
                      boxShadow: "0 0 10px " + theme.colors.accent2,
                    }}
                  />
                  <p
                    style={{
                      color: theme.colors.accent2,
                      fontSize: theme.fonts.size.md,
                      fontWeight: theme.fonts.weight.bold,
                      marginBottom: theme.spacing.xs,
                    }}
                  >
                    {work.year}
                  </p>
                  <h4
                    style={{
                      color: theme.textColors.primary,
                      fontSize: theme.fonts.size.md,
                      marginBottom: theme.spacing.xs,
                    }}
                  >
                    {work.position}
                  </h4>
                  <p
                    style={{
                      color: theme.colors.secondary,
                      fontSize: theme.fonts.size.md,
                      marginBottom: theme.spacing.xs,
                    }}
                  >
                    {work.company}
                  </p>
                  <p
                    style={{
                      color: theme.textColors.secondary,
                      fontSize: theme.fonts.size.sm,
                      marginBottom:
                        work.achievements || work.technologies || work.links
                          ? theme.spacing.xs
                          : 0,
                    }}
                  >
                    {work.description}
                  </p>
                  {renderLinks(work.links)}
                  {work.achievements && (
                    <ul
                      style={{
                        color: theme.textColors.secondary,
                        fontSize: theme.fonts.size.sm,
                        marginBottom: work.technologies ? theme.spacing.xs : 0,
                        paddingLeft: theme.spacing.lg,
                      }}
                    >
                      {work.achievements.map((achievement, achieveIndex) => (
                        <li
                          key={`achievement-${index}-${achieveIndex}`}
                          style={{
                            marginBottom: theme.spacing.xs,
                          }}
                        >
                          {achievement}
                        </li>
                      ))}
                    </ul>
                  )}
                  {work.technologies && (
                    <div
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: theme.spacing.xs,
                        marginTop: theme.spacing.xs,
                      }}
                    >
                      {work.technologies.map((tech, techIndex) => (
                        <span
                          key={`work-tech-${index}-${techIndex}`}
                          style={{
                            backgroundColor: theme.colors.accent2,
                            color: theme.textColors.inverse,
                            padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
                            borderRadius: theme.borders.radius.sm,
                            fontSize: theme.fonts.size.xs,
                          }}
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
          </div>

          {/* Projects Section */}
          <div
            style={{
              marginBottom: theme.spacing.xl,
            }}
          >
            <SectionHeader
              title="PROJECTS"
              color={theme.colors.accent3}
              isOpen={sectionsOpen.projects}
              toggleFn={() => toggleSection("projects")}
            />

            {sectionsOpen.projects &&
              resumeData.projects.map((project, index) => (
                <div key={`project-${index}`} className="timeline-item">
                  <div
                    className="timeline-dot"
                    style={{
                      backgroundColor: theme.colors.accent3,
                      boxShadow: "0 0 10px " + theme.colors.accent3,
                    }}
                  />
                  <p
                    style={{
                      color: theme.colors.accent3,
                      fontSize: theme.fonts.size.md,
                      fontWeight: theme.fonts.weight.bold,
                      marginBottom: theme.spacing.xs,
                    }}
                  >
                    {project.year}
                  </p>
                  <h4
                    style={{
                      color: theme.textColors.primary,
                      fontSize: theme.fonts.size.md,
                      marginBottom: theme.spacing.xs,
                    }}
                  >
                    {project.name}
                  </h4>
                  <p
                    style={{
                      color: theme.textColors.secondary,
                      fontSize: theme.fonts.size.sm,
                      marginBottom: theme.spacing.xs,
                    }}
                  >
                    {project.description}
                  </p>
                  {renderLinks(project.links)}
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: theme.spacing.xs,
                    }}
                  >
                    {project.technologies.map((tech, techIndex) => (
                      <span
                        key={`tech-${index}-${techIndex}`}
                        style={{
                          backgroundColor: theme.colors.accent3,
                          color: theme.textColors.inverse,
                          padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
                          borderRadius: theme.borders.radius.sm,
                          fontSize: theme.fonts.size.xs,
                        }}
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
          </div>

          {/* Skills Section */}
          <div
            style={{
              marginBottom: theme.spacing.xl,
            }}
          >
            <SectionHeader
              title="SKILLS"
              color={theme.colors.accent4}
              isOpen={sectionsOpen.skills}
              toggleFn={() => toggleSection("skills")}
            />

            {sectionsOpen.skills && (
              <>
                <div
                  style={{
                    marginBottom: theme.spacing.md,
                  }}
                >
                  <h4
                    style={{
                      color: theme.colors.accent4,
                      fontSize: theme.fonts.size.md,
                      marginBottom: theme.spacing.sm,
                    }}
                  >
                    Programming Languages
                  </h4>
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: theme.spacing.xs,
                    }}
                  >
                    {resumeData.skills.programming.map((skill, index) => (
                      <span
                        key={`prog-${index}`}
                        style={{
                          backgroundColor: theme.colors.accent4,
                          color: theme.textColors.inverse,
                          padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
                          borderRadius: theme.borders.radius.sm,
                          fontSize: theme.fonts.size.xs,
                        }}
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
                <div
                  style={{
                    marginBottom: theme.spacing.md,
                  }}
                >
                  <h4
                    style={{
                      color: theme.colors.accent4,
                      fontSize: theme.fonts.size.md,
                      marginBottom: theme.spacing.sm,
                    }}
                  >
                    Frameworks & Libraries
                  </h4>
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: theme.spacing.xs,
                    }}
                  >
                    {resumeData.skills.frameworks.map((skill, index) => (
                      <span
                        key={`frame-${index}`}
                        style={{
                          backgroundColor: theme.colors.accent4,
                          color: theme.textColors.inverse,
                          padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
                          borderRadius: theme.borders.radius.sm,
                          fontSize: theme.fonts.size.xs,
                        }}
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
                <div
                  style={{
                    marginBottom: theme.spacing.md,
                  }}
                >
                  <h4
                    style={{
                      color: theme.colors.accent4,
                      fontSize: theme.fonts.size.md,
                      marginBottom: theme.spacing.sm,
                    }}
                  >
                    Tools & Platforms
                  </h4>
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: theme.spacing.xs,
                    }}
                  >
                    {resumeData.skills.tools.map((skill, index) => (
                      <span
                        key={`tool-${index}`}
                        style={{
                          backgroundColor: theme.colors.accent4,
                          color: theme.textColors.inverse,
                          padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
                          borderRadius: theme.borders.radius.sm,
                          fontSize: theme.fonts.size.xs,
                        }}
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <h4
                    style={{
                      color: theme.colors.accent4,
                      fontSize: theme.fonts.size.md,
                      marginBottom: theme.spacing.sm,
                    }}
                  >
                    Other Skills
                  </h4>
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: theme.spacing.xs,
                    }}
                  >
                    {resumeData.skills.other.map((skill, index) => (
                      <span
                        key={`other-${index}`}
                        style={{
                          backgroundColor: theme.colors.accent4,
                          color: theme.textColors.inverse,
                          padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
                          borderRadius: theme.borders.radius.sm,
                          fontSize: theme.fonts.size.xs,
                        }}
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Personal Life Section */}
          <div>
            <SectionHeader
              title="PERSONAL_LIFE"
              color={theme.colors.accent5}
              isOpen={sectionsOpen.personalLife}
              toggleFn={() => toggleSection("personalLife")}
            />

            {sectionsOpen.personalLife &&
              resumeData.personalLife.map((life, index) => (
                <div key={`life-${index}`} className="timeline-item">
                  <div
                    className="timeline-dot"
                    style={{
                      backgroundColor: theme.colors.accent5,
                      boxShadow: "0 0 10px " + theme.colors.accent5,
                    }}
                  />
                  <p
                    style={{
                      color: theme.colors.accent5,
                      fontSize: theme.fonts.size.md,
                      fontWeight: theme.fonts.weight.bold,
                      marginBottom: theme.spacing.xs,
                    }}
                  >
                    {life.year}
                  </p>
                  <h4
                    style={{
                      color: theme.textColors.primary,
                      fontSize: theme.fonts.size.md,
                      marginBottom: theme.spacing.xs,
                    }}
                  >
                    {life.event}
                  </h4>
                  <p
                    style={{
                      color: theme.textColors.secondary,
                      fontSize: theme.fonts.size.sm,
                    }}
                  >
                    {life.description}
                  </p>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Resume;
