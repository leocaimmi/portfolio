/** The ceiling every field shares. Nothing sent here needs more room. */
const FIELD_MAX = 500;

/**
 * Field limits, shared by the form and the endpoint.
 *
 * Exported so the inputs can advertise the same `maxLength` the server
 * enforces, instead of letting someone write past the limit and discover it
 * only after pressing send.
 *
 * An address is capped below the shared ceiling because the standard puts a
 * hard bound at 254 characters: anything longer is not a long address, it is
 * not an address.
 *
 * Kept apart from the schema, with nothing imported, because the form needs
 * these numbers to render and the schema only to submit. Reading them from the
 * schema's module put the whole validation library on the page's critical path
 * for four integers.
 */
export const CONTACT_LIMITS = {
  nameMax: FIELD_MAX,
  emailMax: 254,
  messageMin: 20,
  messageMax: FIELD_MAX,
} as const;
