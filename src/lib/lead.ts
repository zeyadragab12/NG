export type Interest = 'Residential' | 'Artlife & offices' | 'NGU' | 'Health Park' | 'Clubs'

export type Lead = {
  name: string
  phone: string
  email: string
  interest: Interest
  message: string
}

export type LeadErrors = Partial<Record<keyof Lead, string>>

export function validateLead(lead: Lead): LeadErrors {
  const errors: LeadErrors = {}
  if (lead.name.trim().length < 2) errors.name = 'Please enter your full name.'
  const digits = lead.phone.replace(/\D/g, '')
  if (!/^\+?[\d\s()-]+$/.test(lead.phone.trim()) || digits.length < 8 || digits.length > 15)
    errors.phone = 'Please enter a valid phone number, for example 010 1234 5678.'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(lead.email.trim())) errors.email = 'Please enter a valid email address.'
  if (lead.message.length > 600) errors.message = 'Please keep the message under 600 characters.'
  return errors
}

/**
 * NOT CONNECTED YET. The handoff lists the CRM endpoint as "to be defined".
 * Replace this body with the real request (e.g. POST to the CRM / a server
 * function) before launch; until then nothing leaves the browser.
 */
export async function submitLead(_lead: Lead): Promise<void> {
  return Promise.resolve()
}
