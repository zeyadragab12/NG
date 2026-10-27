/**
 * Places on the masterplan cutout (newgiza-masterplan.png), in % of the image.
 * APPROXIMATE: estimated from the plan image. Confirm every position with the client.
 */
export type Place = { label: string; x: number; y: number }

export const PLACES = {
  ngu: { label: 'NGU', x: 72, y: 17 },
  health: { label: 'HEALTH PARK', x: 54, y: 77 },
  ngsc: { label: 'NGSC', x: 78, y: 46 },
  golf: { label: 'GOLF', x: 50, y: 42 },
  artlife: { label: 'BRICKLANE · ARTLIFE', x: 34, y: 16 },
  schools: { label: 'SCHOOLS', x: 26, y: 63 },
  ivoryhill: { label: 'IVORY HILL', x: 14, y: 50 },
  districtone: { label: 'DISTRICT ONE', x: 22, y: 74 },
  goldcliff: { label: 'GOLDCLIFF', x: 82, y: 60 },
  collection: { label: 'THE COLLECTION', x: 60, y: 28 },
  forty4: { label: 'THEFORTY4', x: 44, y: 56 },
  kings: { label: 'KINGS COLLECTION', x: 40, y: 34 },
  all: { label: 'NEWGIZA · 1,544 ACRES', x: 50, y: 50 },
} satisfies Record<string, Place>

export type PlaceId = keyof typeof PLACES
