const pathways = {
  default: {
    title: "Choose a location to find a starting point.",
    body: "The result will show the local contact or pathway first. If the person feels physically unsafe now, call 000 or go to the nearest Emergency Department.",
    link: "",
  },
  sa: {
    title: "Adelaide PHN / South Australia",
    body: "This pathway can help people in the Adelaide region find the right eating disorder support and service navigation. Ask for help finding the next safe step, especially if the person has been discharged without an eating disorder plan.",
    link: "https://adelaidephn.com.au/our-work/programs-directory/right-care-right-place-eating-disorder-care-in-my-community-project",
  },
  vic: {
    title: "North Western Melbourne / Victoria",
    body: "This pathway is for North Western Melbourne. It can help connect the person, family, GP or treating team with eating disorder support and local service information.",
    link: "https://nwmphn.org.au/for-primary-care/clinical-support/eating-disorders/",
  },
  nt: {
    title: "Northern Territory: Top End and Central Australia",
    body: "In the NT, start by contacting the local eating disorder coordinator or asking the hospital, GP or mental health team to contact them. Ask for a written plan before discharge if the person is being sent home.",
    link: "https://nedc.com.au/phn/rcrp",
  },
  qld: {
    title: "Western Queensland",
    body: "For Western Queensland, use the listed pathway contact as the starting point for finding local eating disorder care coordination and the next safe service.",
    link: "https://nedc.com.au/phn/rcrp",
  },
  other: {
    title: "Elsewhere in Australia",
    body: "If the person is outside one of these regions, start with the GP, nearest Emergency Department, state eating disorder service, or NEDC service locator. If there is immediate medical danger, call 000 or go to hospital.",
    link: "https://nedc.com.au/",
  },
};

const fallbackCoordinatorData = {
  fetchedAt: "2026-07-07T13:45:00.000Z",
  sourceUrl: "https://nedc.com.au/phn/rcrp",
  contacts: [
    {
      region: "Adelaide",
      organisation: "Adelaide PHN / Neami National",
      name: "Dayna Jaeschke",
      role: "Project Lead",
      email: "Djaeschke@adelaidephn.com.au",
      phone: "",
      source: "NEDC Right Care Right Place",
    },
    {
      region: "North Western Melbourne",
      organisation: "North Western Melbourne PHN",
      name: "Cosette Boland",
      role: "Project Lead",
      email: "cosette.boland@nwmphn.org.au",
      phone: "",
      source: "NEDC Right Care Right Place",
    },
    {
      region: "Northern Territory - Top End",
      organisation: "Anglicare NT",
      name: "Kelly Mowat",
      role: "Eating Disorder Care Coordinator",
      email: "rightcarerightplace@anglicare-nt.org.au",
      alternateEmail: "kmowat@anglicarent.org.au",
      phone: "0499 820 563",
      source: "NEDC Right Care Right Place + Jacqui-supplied phone/direct contact",
      notes: "Jacqui supplied direct contact email kmowat@anglicarent.org.au.",
    },
    {
      region: "Northern Territory - Central Australia",
      organisation: "Alice Springs Hospital",
      name: "Grace Dwyer",
      role: "Eating Disorder Care Coordinator",
      email: "grace.dwyer@nt.gov.au",
      phone: "",
      source: "NEDC Right Care Right Place",
    },
    {
      region: "Western Queensland",
      organisation: "Western Queensland PHN / Vital Health",
      name: "Abby Smith",
      role: "Project Lead",
      email: "AbbyS@vitalhealthqld.com.au",
      phone: "",
      source: "NEDC Right Care Right Place",
    },
    {
      region: "Flinders University",
      organisation: "Flinders University",
      name: "Dr Madelaine de Valle",
      role: "Chief Investigator",
      email: "madelaine.devalle@flinders.edu.au",
      phone: "",
      source: "NEDC Right Care Right Place",
    },
    {
      region: "National RCRP enquiries",
      organisation: "NEDC",
      name: "",
      role: "General RCRP enquiries",
      email: "rcrp@nedc.com.au",
      phone: "",
      source: "NEDC Right Care Right Place",
    },
  ],
};

const select = document.querySelector("#region");
const result = document.querySelector("#pathwayResult");
const coordinatorContacts = document.querySelector("#coordinatorContacts");
const contactMeta = document.querySelector("#contactMeta");
const tabButtons = Array.from(document.querySelectorAll(".tab-button[role='tab']"));
const tabPanels = Array.from(document.querySelectorAll(".tab-panel[role='tabpanel']"));
let coordinatorData = fallbackCoordinatorData;

const regionCoordinatorMatch = {
  sa: (contact) => contact.region === "Adelaide",
  vic: (contact) => contact.region === "North Western Melbourne",
  nt: (contact) => contact.region && contact.region.startsWith("Northern Territory"),
  qld: (contact) => contact.region === "Western Queensland",
  other: (contact) => contact.region === "National RCRP enquiries",
};

function escapeHtml(value = "") {
  return String(value).replace(/[&<>"']/g, (character) => {
    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };
    return entities[character];
  });
}

function getCoordinatorsForRegion(key) {
  const contacts = Array.isArray(coordinatorData.contacts) ? coordinatorData.contacts : [];
  const matcher = regionCoordinatorMatch[key];
  return matcher ? contacts.filter(matcher) : [];
}

function renderSelectedCoordinators(key) {
  const contacts = getCoordinatorsForRegion(key);
  if (!contacts.length) return "";

  const coordinatorList = contacts
    .map((contact) => {
      const label = contact.name || contact.role || "RCRP contact";
      const region = contact.region ? ` <span>${escapeHtml(contact.region)}</span>` : "";
      const email = contact.alternateEmail || contact.email;
      const emailLink = email ? ` <a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a>` : "";
      const phoneLink = contact.phone
        ? ` <a href="tel:${contact.phone.replace(/\s+/g, "")}">${escapeHtml(contact.phone)}</a>`
        : "";
      return `<li><strong>${escapeHtml(label)}</strong>${region}${emailLink}${phoneLink}</li>`;
    })
    .join("");

  return `
    <div class="selected-coordinators">
      <p>Who to contact first</p>
      <ul>${coordinatorList}</ul>
    </div>
  `;
}

function renderPathway(key) {
  const pathway = pathways[key] || pathways.default;
  const coordinators = renderSelectedCoordinators(key);
  const link = pathway.link
    ? `<p><a class="button secondary inline" href="${pathway.link}">Open contact/pathway page</a></p>`
    : "";
  result.innerHTML = `<h3>${pathway.title}</h3>${coordinators}<p>${pathway.body}</p>${link}`;
}

function activateTab(panelId, shouldFocus = false) {
  const activeButton = tabButtons.find((button) => button.dataset.tabTarget === panelId);
  const activePanel = tabPanels.find((panel) => panel.id === panelId);
  if (!activeButton || !activePanel) return;

  tabButtons.forEach((button) => {
    const selected = button === activeButton;
    button.setAttribute("aria-selected", selected ? "true" : "false");
    button.tabIndex = selected ? 0 : -1;
  });

  tabPanels.forEach((panel) => {
    panel.hidden = panel !== activePanel;
  });

  if (shouldFocus) activeButton.focus();
}

function activateTabForHash(hash) {
  if (!hash || hash === "#") return false;
  let target = null;
  try {
    target = document.querySelector(hash);
  } catch {
    return false;
  }
  const panel = target ? target.closest(".tab-panel") : null;
  if (!panel) return false;
  activateTab(panel.id);
  return true;
}

tabButtons.forEach((button, index) => {
  button.addEventListener("click", () => activateTab(button.dataset.tabTarget));

  button.addEventListener("keydown", (event) => {
    const keyActions = {
      ArrowRight: () => (index + 1) % tabButtons.length,
      ArrowDown: () => (index + 1) % tabButtons.length,
      ArrowLeft: () => (index - 1 + tabButtons.length) % tabButtons.length,
      ArrowUp: () => (index - 1 + tabButtons.length) % tabButtons.length,
      Home: () => 0,
      End: () => tabButtons.length - 1,
    };
    if (!keyActions[event.key]) return;
    event.preventDefault();
    const nextIndex = keyActions[event.key]();
    activateTab(tabButtons[nextIndex].dataset.tabTarget, true);
  });
});

document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener("click", () => {
    activateTabForHash(link.hash);
  });
});

activateTabForHash(window.location.hash);

window.addEventListener("hashchange", () => {
  activateTabForHash(window.location.hash);
});

if (select && result) {
  select.addEventListener("change", (event) => renderPathway(event.target.value));
}

document.querySelectorAll(".copy-button").forEach((button) => {
  button.addEventListener("click", async () => {
    const target = document.getElementById(button.dataset.copyTarget);
    if (!target) return;
    try {
      await navigator.clipboard.writeText(target.textContent.trim());
      button.textContent = "Copied";
      setTimeout(() => {
        button.textContent = "Copy handover text";
      }, 1800);
    } catch {
      button.textContent = "Select and copy below";
    }
  });
});

function formatDate(value) {
  if (!value) return "date unavailable";
  return new Intl.DateTimeFormat("en-AU", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function renderCoordinators(data, sourceLabel = "live data") {
  if (!coordinatorContacts || !contactMeta) return;
  const contacts = Array.isArray(data.contacts) ? data.contacts : [];
  contactMeta.textContent = `Last refreshed: ${formatDate(data.fetchedAt)} from ${sourceLabel}.`;
  coordinatorContacts.innerHTML = contacts
    .map((contact) => {
      const name = contact.name ? `<h3>${contact.name}</h3>` : `<h3>${contact.role}</h3>`;
      const role = contact.name ? `<p class="contact-role">${contact.role || ""}</p>` : "";
      const email = contact.email
        ? `<a href="mailto:${contact.email}">${contact.email}</a>`
        : "";
      const alternateEmail = contact.alternateEmail
        ? `<a href="mailto:${contact.alternateEmail}">${contact.alternateEmail}</a>`
        : "";
      const phone = contact.phone
        ? `<a href="tel:${contact.phone.replace(/\s+/g, "")}">${contact.phone}</a>`
        : "";
      const notes = contact.notes ? `<p class="contact-notes">${contact.notes}</p>` : "";
      return `
        <article class="region coordinator">
          <p class="contact-region">${contact.region}</p>
          ${name}
          ${role}
          <p>${contact.organisation || ""}</p>
          <div class="contact-links">${email}${alternateEmail}${phone}</div>
          ${notes}
          <p class="contact-source">${contact.source || ""}</p>
        </article>
      `;
    })
    .join("");
}

async function loadCoordinatorContacts() {
  if (!coordinatorContacts || !contactMeta) return;
  try {
    const response = await fetch("data/coordinators.json", { cache: "no-store" });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    coordinatorData = data;
    renderCoordinators(data, "NEDC refresh data");
  } catch {
    coordinatorData = fallbackCoordinatorData;
    renderCoordinators(fallbackCoordinatorData, "built-in fallback data");
  }
  if (select && result) renderPathway(select.value);
}

loadCoordinatorContacts();
