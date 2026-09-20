/** What a provider is, and whether this machine holds the key to reach it. */
export const PROVIDER_LOCAL_LABEL = "ЛОКАЛЬНИЙ";
export const PROVIDER_REMOTE_LABEL = "ВІДДАЛЕНИЙ";
export const PROVIDER_KEY_WRITTEN_LABEL = "КЛЮЧ ВПИСАНО";
export const PROVIDER_NO_KEY_LABEL = "КЛЮЧА НЕМАЄ";
/** A provider whose address is the person's own — an endpoint of theirs — and nothing stands in the field yet. */
export const PROVIDER_NO_ADDRESS_LABEL = "АДРЕСИ НЕМАЄ";

/** A card nobody has typed into yet: every field stands empty and nothing of it is written. */
export const NOTHING_TYPED = {
  key: null,
  address: null,
};
