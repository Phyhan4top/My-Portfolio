import { portfolioSchema, type PortfolioData } from "@shared/schema";

export type Problem = { path: string; message: string };

const isLink = (value: string) => /^(https?:\/\/|mailto:|\/)/.test(value);

/**
 * Checks beyond the schema, in the words of the form. The schema protects the
 * data's shape; these catch what would look broken on the published site.
 */
export function findProblems(draft: PortfolioData): Problem[] {
  const problems: Problem[] = [];
  const need = (value: string, path: string, message: string) => {
    if (!value.trim()) problems.push({ path, message });
  };
  const needLink = (value: string, path: string, message: string) => {
    if (!isLink(value.trim())) problems.push({ path, message });
  };

  const { identity, intro, practice, projects, record, toolkit, contact } = draft;

  need(identity.fullName, "identity.fullName", "Profile: add your full name.");
  need(identity.shortName, "identity.shortName", "Profile: add a short name.");
  need(identity.title, "identity.title", "Profile: add your job title.");
  if (!/^\S+@\S+\.\S+$/.test(identity.email)) {
    problems.push({ path: "identity.email", message: "Profile: enter a valid email address." });
  }
  needLink(identity.cvUrl, "identity.cvUrl", "Profile: the CV needs a link or an uploaded file.");
  identity.socials.forEach((social, index) => {
    need(social.label, `identity.socials.${index}.label`, `Profile: social link ${index + 1} needs a name.`);
    needLink(social.href, `identity.socials.${index}.href`, `Profile: social link ${index + 1} needs a full address, starting https://.`);
  });

  need(intro.statement, "intro.statement", "Intro: add your statement.");
  intro.emphasis.forEach((phrase, index) => {
    if (!phrase.trim() || !intro.statement.includes(phrase)) {
      problems.push({
        path: `intro.emphasis.${index}`,
        message: `Intro: underlined phrase ${index + 1} must match the statement word for word.`,
      });
    }
  });

  practice.paragraphs.forEach((paragraph, index) =>
    need(paragraph, `practice.paragraphs.${index}`, `About: paragraph ${index + 1} is empty.`),
  );
  need(practice.portrait.src, "practice.portrait.src", "About: add a portrait.");
  need(practice.portrait.alt, "practice.portrait.alt", "About: describe the portrait for screen readers.");
  practice.notes.forEach((note, index) => {
    need(note.title, `practice.notes.${index}.title`, `About: working note ${index + 1} needs a title.`);
    need(note.body, `practice.notes.${index}.body`, `About: working note ${index + 1} needs some text.`);
  });

  const slugs = new Set<string>();
  projects.forEach((project, index) => {
    const name = project.name.trim() || `Project ${index + 1}`;
    const at = `projects.${index}`;
    need(project.name, `${at}.name`, `${name}: add a name.`);
    need(project.summary, `${at}.summary`, `${name}: add a summary.`);
    if (!/^[a-z0-9-]+$/.test(project.slug)) {
      problems.push({ path: `${at}.slug`, message: `${name}: the page address can only use lowercase letters, numbers and dashes.` });
    } else if (slugs.has(project.slug)) {
      problems.push({ path: `${at}.slug`, message: `${name}: another project already uses this page address.` });
    }
    slugs.add(project.slug);
    project.links.forEach((link, linkIndex) => {
      need(link.label, `${at}.links.${linkIndex}.label`, `${name}: link ${linkIndex + 1} needs a name.`);
      needLink(link.href, `${at}.links.${linkIndex}.href`, `${name}: link ${linkIndex + 1} needs a full address, starting https://.`);
    });
    project.images.forEach((image, imageIndex) => {
      need(image.src, `${at}.images.${imageIndex}.src`, `${name}: image ${imageIndex + 1} has no file.`);
      need(image.alt, `${at}.images.${imageIndex}.alt`, `${name}: describe image ${imageIndex + 1} for screen readers.`);
    });
    project.challenges.forEach((challenge, challengeIndex) => {
      need(challenge.title, `${at}.challenges.${challengeIndex}.title`, `${name}: hard part ${challengeIndex + 1} needs a title.`);
      need(challenge.body, `${at}.challenges.${challengeIndex}.body`, `${name}: hard part ${challengeIndex + 1} needs some text.`);
    });
  });

  record.roles.forEach((role, index) => {
    const name = role.role.trim() || `Job ${index + 1}`;
    const at = `record.roles.${index}`;
    need(role.role, `${at}.role`, `Experience: job ${index + 1} needs a title.`);
    need(role.company, `${at}.company`, `${name}: add the company.`);
    if (!/^\d{4}-\d{2}$/.test(role.start)) {
      problems.push({ path: `${at}.start`, message: `${name}: choose a start month.` });
    }
    if (role.end !== null && !/^\d{4}-\d{2}$/.test(role.end)) {
      problems.push({ path: `${at}.end`, message: `${name}: choose an end month, or tick “I still work here”.` });
    }
    if (role.end && role.start && role.end < role.start) {
      problems.push({ path: `${at}.end`, message: `${name}: the end month is before the start month.` });
    }
    if (role.companyUrl?.trim()) {
      needLink(role.companyUrl, `${at}.companyUrl`, `${name}: the company website needs a full address, starting https://.`);
    }
  });

  toolkit.forEach((group, index) => {
    need(group.group, `toolkit.${index}.group`, `Skills: group ${index + 1} needs a name.`);
    group.items.forEach((item, itemIndex) =>
      need(item.name, `toolkit.${index}.items.${itemIndex}.name`, `Skills: ${group.group || `group ${index + 1}`}, skill ${itemIndex + 1} needs a name.`),
    );
  });

  need(contact.heading, "contact.heading", "Contact: add a heading.");
  need(contact.body, "contact.body", "Contact: add some text.");

  // Anything the friendlier checks didn't cover still has to fit the schema.
  const parsed = portfolioSchema.safeParse(draft);
  if (!parsed.success) {
    const known = new Set(problems.map((problem) => problem.path));
    for (const issue of parsed.error.issues) {
      const path = issue.path.join(".");
      if (!known.has(path)) problems.push({ path, message: `${path}: ${issue.message}` });
    }
  }

  return problems;
}
