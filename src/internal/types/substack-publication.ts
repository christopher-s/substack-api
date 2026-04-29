/**
 * Raw API response shape for publications - flattened
 */
export interface SubstackPublication {
  name: string
  hostname: string
  subdomain: string
  logo_url?: string
  description?: string
}
