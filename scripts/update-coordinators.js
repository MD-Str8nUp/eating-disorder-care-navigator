#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const SOURCE_URL = "https://nedc.com.au/phn/rcrp";
const OUT_FILE = path.resolve(__dirname, "../data/coordinators.json");

const FALLBACK_PHONE_BY_NAME = {
  "Kelly Mowat": "0499 820 563",
};

const EXTRA_NOTES_BY_NAME = {
  "Kelly Mowat": "Jacqui supplied direct contact email kmowat@anglicarent.org.au.",
};

const EXTRA_EMAIL_BY_NAME = {
  "Kelly Mowat": "kmowat@anglicarent.org.au",
};

const SECTIONS = [
  { key: "Adelaide", start: "Adelaide", end: "North Western Melbourne" },
  { key: "North Western Melbourne", start: "North Western Melbourne", end: "Northern Territory" },
  { key: "Northern Territory", start: "Northern Territory", end: "Western Queensland" },
  { key: "Western Queensland", start: "Western Queensland", end: "Flinders University" },
  { key: "Flinders University", start: "Flinders University", end: "Stepped System of Care" },
];

function decodeEntities(value) {
  return value
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/\s+/g, " ")
    .trim();
}

function htmlToText(html) {
  return decodeEntities(
    html
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/(p|div|li|h[1-6]|section|article)>/gi, "\n")
      .replace(/<[^>]+>/g, " ")
      .replace(/[ \t]+\n/g, "\n")
      .replace(/\n[ \t]+/g, "\n")
      .replace(/\n{2,}/g, "\n")
  );
}

function sliceSection(text, section) {
  const partners = text.indexOf("Project Implementation Partners");
  const scoped = partners === -1 ? text : text.slice(partners);
  const start = scoped.indexOf(section.start);
  if (start === -1) return "";
  const end = scoped.indexOf(section.end, start + section.start.length);
  return scoped.slice(start, end === -1 ? undefined : end);
}

function findEmail(block) {
  const match = block.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
  return match ? match[0].replace(/[.,;]+$/, "") : "";
}

function contactFromBlock({ region, organisation, block, defaultRole }) {
  const contactMatch = block.match(/contact\s+([^,.\n]+)(?:,\s*([^.\n]+?))?(?:\.|\s+E:|\s+at\s+)/i);
  const name = contactMatch ? contactMatch[1].replace(/^Chief investigator,\s*/i, "").trim() : "";
  const role = contactMatch && contactMatch[2] ? contactMatch[2].trim() : defaultRole;
  const email = findEmail(block);
  if (!name && !email) return null;
  return {
    region,
    organisation,
    name,
    role,
    email,
    phone: name ? FALLBACK_PHONE_BY_NAME[name] || "" : "",
    source: "NEDC Right Care Right Place",
    ...(name && EXTRA_EMAIL_BY_NAME[name] ? { alternateEmail: EXTRA_EMAIL_BY_NAME[name] } : {}),
    ...(name && EXTRA_NOTES_BY_NAME[name] ? { notes: EXTRA_NOTES_BY_NAME[name] } : {}),
  };
}

function parseContacts(text) {
  const contacts = [];

  const adelaide = sliceSection(text, SECTIONS[0]);
  const adelaideContact = contactFromBlock({
    region: "Adelaide",
    organisation: "Adelaide PHN / Neami National",
    block: adelaide,
    defaultRole: "Project Lead",
  });
  if (adelaideContact) contacts.push(adelaideContact);

  const nwm = sliceSection(text, SECTIONS[1]);
  const nwmContact = contactFromBlock({
    region: "North Western Melbourne",
    organisation: "North Western Melbourne PHN",
    block: nwm,
    defaultRole: "Project Lead",
  });
  if (nwmContact) contacts.push(nwmContact);

  const nt = sliceSection(text, SECTIONS[2]);
  const topEnd = nt.match(/Top End[\s\S]*?For more information, contact\s+([^.\n]+)[\s\S]*?E:\s*([A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,})/i);
  if (topEnd) {
    contacts.push({
      region: "Northern Territory - Top End",
      organisation: "Anglicare NT",
      name: topEnd[1].trim(),
      role: "Eating Disorder Care Coordinator",
      email: topEnd[2],
      phone: FALLBACK_PHONE_BY_NAME[topEnd[1].trim()] || "",
      source: "NEDC Right Care Right Place + Jacqui-supplied phone/direct contact",
      alternateEmail: EXTRA_EMAIL_BY_NAME[topEnd[1].trim()] || "",
      notes: EXTRA_NOTES_BY_NAME[topEnd[1].trim()] || "",
    });
  }
  const central = nt.match(/Central[\s\S]*?For more information, contact\s+([^.\n]+?)\s+at\s+([^.\n]+)[\s\S]*?E:\s*([A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,})/i);
  if (central) {
    contacts.push({
      region: "Northern Territory - Central Australia",
      organisation: central[2].trim(),
      name: central[1].trim(),
      role: "Eating Disorder Care Coordinator",
      email: central[3],
      phone: "",
      source: "NEDC Right Care Right Place",
    });
  }

  const qld = sliceSection(text, SECTIONS[3]);
  const qldContact = contactFromBlock({
    region: "Western Queensland",
    organisation: "Western Queensland PHN / Vital Health",
    block: qld,
    defaultRole: "Project Lead",
  });
  if (qldContact) contacts.push(qldContact);

  const flinders = sliceSection(text, SECTIONS[4]);
  const flindersMatch = flinders.match(/Contact\s+Chief investigator,\s+([^.\n]+)[\s\S]*?E:\s*([A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,})/i);
  if (flindersMatch) {
    contacts.push({
      region: "Flinders University",
      organisation: "Flinders University",
      name: flindersMatch[1].trim(),
      role: "Chief Investigator",
      email: flindersMatch[2],
      phone: "",
      source: "NEDC Right Care Right Place",
    });
  }

  const generalMatch = text.match(/For any queries, contact via email at\s+([A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,})/i);
  if (generalMatch) {
    contacts.push({
      region: "National RCRP enquiries",
      organisation: "NEDC",
      name: "",
      role: "General RCRP enquiries",
      email: generalMatch[1],
      phone: "",
      source: "NEDC Right Care Right Place",
    });
  }

  return contacts;
}

async function main() {
  const response = await fetch(SOURCE_URL, {
    headers: {
      "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "accept-language": "en-AU,en;q=0.9",
      "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
    },
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch ${SOURCE_URL}: HTTP ${response.status}`);
  }
  const html = await response.text();
  const text = htmlToText(html);
  const contacts = parseContacts(text);
  if (contacts.length < 5) {
    throw new Error(`Expected at least 5 RCRP contacts, found ${contacts.length}`);
  }
  const data = {
    fetchedAt: new Date().toISOString(),
    sourceUrl: SOURCE_URL,
    contacts,
  };
  fs.mkdirSync(path.dirname(OUT_FILE), { recursive: true });
  fs.writeFileSync(OUT_FILE, `${JSON.stringify(data, null, 2)}\n`);
  console.log(`Updated ${OUT_FILE}`);
  console.log(`Contacts: ${contacts.map((contact) => contact.region).join(", ")}`);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
