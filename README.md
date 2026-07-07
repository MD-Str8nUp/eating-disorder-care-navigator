# Right Care, Right Place ED Navigation Prototype

Static website prototype for Australian severe eating disorder care navigation.

## Purpose

This site is for families, supporters, GPs and hospital staff when someone with a severe eating disorder, very low BMI, rapid weight loss, medical instability or repeated discharge risk may need medical or hospital-level assessment.

It is not a medical advice site and is not an official NEDC, PHN or hospital website.

## Source base

- NEDC Right Care Right Place: https://nedc.com.au/phn/rcrp
- NEDC Stepped System of Care / Service Locator / Treatment Options / Get Help: https://nedc.com.au/
- Adelaide PHN RCRP page: https://adelaidephn.com.au/our-work/programs-directory/right-care-right-place-eating-disorder-care-in-my-community-project
- NWMPHN eating disorder pathway page: https://nwmphn.org.au/for-primary-care/clinical-support/eating-disorders/
- InsideOut admission guideline resource: https://insideoutinstitute.org.au/resource-library/guidelines-for-the-admission-of-children-and-young-people-with-an-eating-disorder
- NT pathway contact supplied by Jacqui: Kelly Mowat, Eating Disorder Coordinator, Anglicare NT, kmowat@anglicarent.org.au, 0499 820 563

## Files

- `index.html`
- `styles.css`
- `script.js`
- `data/coordinators.json`
- `scripts/update-coordinators.js`

Open `index.html` in a browser for local preview.

## Coordinator refresh

The coordinator section is data-backed. It loads:

```text
data/coordinators.json
```

Refresh the coordinator data from the NEDC Right Care Right Place page with:

```bash
node sites/right-care-right-place-ed/scripts/update-coordinators.js
```

The updater reads `https://nedc.com.au/phn/rcrp`, extracts the current Project Implementation Partners contacts, and writes the refreshed JSON file. Jacqui-supplied NT phone/direct-contact details for Kelly Mowat are preserved because NEDC may not publish the phone number.

Recommended schedule: weekly, Monday morning Australia/Sydney, plus manual refresh before any public launch or major campaign.

OpenClaw cron job:

- Name: `Right Care Right Place coordinator refresh`
- ID: `a6c74314-5633-4800-86f8-0cce7643da9c`
- Schedule: Mondays 8:30am Australia/Sydney
- Behaviour: refresh data, validate the site, commit changed coordinator data if contacts change, notify Jacqui only on contact changes or errors.
