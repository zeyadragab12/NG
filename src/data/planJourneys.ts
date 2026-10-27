import type { Facility } from './facilities'

/** One step of a plan journey. side: 1 = plan on the right, -1 = left, 0 = centre. fx/fy: focus point in % of the plan image. */
export type PlanKey = {
  side: number
  s: number
  fx: number
  fy: number
  dim: number
  pin?: string
  short: string
  n: string
  title: string
  body: string
  link?: { to: string; label: string }
}

export type PlanJourney = { img: string; ar: number; cutout?: boolean; label: string; keys: PlanKey[] }

/**
 * Focus points are read off the plan images by eye (Health Park 3D plan, NGSC plan,
 * and estimated NewGiza masterplan spots for NGU). Confirm with the client before launch.
 */
export const PLAN_JOURNEYS: Record<Facility['slug'], PlanJourney> = {
  university: {
    img: 'newgiza-masterplan.png',
    ar: 957 / 1422,
    cutout: true,
    label: 'NGU in the NewGiza masterplan',
    keys: [
      { side: 0, s: 1, fx: 50, fy: 50, dim: 0, short: 'Overview', n: 'Where NGU sits', title: 'a campus inside a city.', body: 'NewGiza University sits within NewGiza, next to homes, healthcare, sport and shops.' },
      { side: 1, s: 2.3, fx: 72, fy: 18, dim: 1, pin: 'NGU', short: 'Campus', n: '01 — Campus', title: 'NewGiza University', body: '51.7 acres and 208,460 m² built-up, with eight schools from medicine to fine arts.' },
      { side: -1, s: 2.1, fx: 34, fy: 17, dim: 1, pin: 'Bricklane · Artlife', short: 'Student life', n: '02 — Student life', title: 'Bricklane and Artlife', body: 'Dining, retail, culture and cafés in the town centre and the mixed-use district.', link: { to: '/#artlife', label: 'See Artlife' } },
      { side: 1, s: 2.1, fx: 54, fy: 76, dim: 1, pin: 'Health Park', short: 'Medicine', n: '03 — Medicine', title: 'Learning next to care', body: 'The schools of medicine, pharmacy and dentistry share the community with a 168-bed hospital and 478 clinics.', link: { to: '/health-park', label: 'Explore Health Park' } },
      { side: -1, s: 2.1, fx: 77, fy: 46, dim: 1, pin: 'NGSC', short: 'Sport', n: '04 — Sport', title: 'Room to play', body: 'NewGiza Sports Club, ACE Sports Club and the 18-hole golf course are all inside NewGiza.', link: { to: '/club', label: 'Explore the clubs' } },
      { side: 0, s: 0.95, fx: 50, fy: 50, dim: 0, short: 'Growing', n: '05 — Growing', title: 'from 3,970 to 13,000 students.', body: 'Alongside NGU, four international schools are set to reach 8,000 students.' },
    ],
  },
  'health-park': {
    img: 'healthpark-3d.png',
    ar: 1486 / 1059,
    cutout: true,
    label: 'NewGiza Health Park plan',
    keys: [
      { side: 0, s: 1, fx: 56, fy: 55, dim: 0, short: 'Overview', n: 'The Health Park plan', title: 'a health park in a garden.', body: 'A 168-bed hospital and four clinic buildings around a central park and lake, on 27 acres.' },
      { side: 1, s: 1.9, fx: 40, fy: 54, dim: 1, pin: 'Hospital', short: 'Hospital', n: '01 — Hospital', title: 'The hospital', body: '168 beds. Complete and open.' },
      { side: -1, s: 1.8, fx: 63, fy: 38, dim: 1, pin: 'Clinic buildings', short: 'Clinics', n: '02 — Clinics', title: 'Four clinic buildings', body: '478 clinics across four buildings, all complete.' },
      { side: 1, s: 1.9, fx: 61, fy: 59, dim: 1, pin: 'Central park', short: 'Park', n: '03 — Landscape', title: 'A park at the centre', body: 'Every building opens onto landscaped gardens, walkways and a lake at the heart of the campus.' },
      { side: -1, s: 2, fx: 85, fy: 29, dim: 1, pin: 'Central services', short: 'Services', n: '04 — Services', title: 'Central services', body: 'A central services building supports the hospital and the clinics.' },
      { side: 0, s: 0.95, fx: 56, fy: 55, dim: 0, short: 'Overview', n: '05 — One campus', title: 'one campus for care.', body: 'Hospital and clinics together, a few minutes from every NewGiza home and serving 188,000 neighbours.' },
    ],
  },
  club: {
    img: 'ngsc-plan.png',
    ar: 1232 / 1277,
    cutout: true,
    label: 'NewGiza Sports Club plan',
    keys: [
      { side: 0, s: 1, fx: 52, fy: 50, dim: 0, short: 'Overview', n: 'NewGiza Sports Club', title: 'a club for the whole family.', body: '21.5 acres of pools, courts, pitches and gardens. Complete, with 10,000 members.' },
      { side: 1, s: 1.9, fx: 40, fy: 69, dim: 1, pin: 'Clubhouse', short: 'Clubhouse', n: '01 — Arrival', title: 'The clubhouse', body: 'Arrive by the main drive at the club’s main buildings, part of 12,647 m² built-up across the club.' },
      { side: -1, s: 1.8, fx: 29, fy: 28, dim: 1, pin: 'Pools', short: 'Pools', n: '02 — Water', title: 'Pools and water play', body: 'A lap pool, family pools and a water-play area for children.' },
      { side: 1, s: 2, fx: 49, fy: 31, dim: 1, pin: 'Tennis & padel', short: 'Courts', n: '03 — Courts', title: 'Tennis and padel courts', body: 'Rows of tennis and padel courts at the heart of the club.' },
      { side: -1, s: 1.8, fx: 77, fy: 28, dim: 1, pin: 'Pitch & track', short: 'Pitch', n: '04 — Pitch', title: 'Football pitch and running track', body: 'A full-size pitch ringed by a running track, with basketball courts beside it.' },
      { side: 1, s: 1.8, fx: 55, fy: 50, dim: 1, pin: 'Green heart', short: 'Green heart', n: '05 — Green heart', title: 'A green heart', body: '16,606 m² of landscape and greenery, with a central lawn for families and events.' },
      { side: 0, s: 0.95, fx: 52, fy: 50, dim: 0, short: 'And more', n: '06 — And more', title: 'and there is more.', body: 'ACE Sports Club and the 18-hole golf course are complete too, with even more room to play.' },
    ],
  },
}
