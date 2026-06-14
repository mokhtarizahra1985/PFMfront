const SOURCE_ACCOUNT_PREFIX = '[حساب:';

export function buildContributionNote(
  sourceAccountId: string | undefined,
  userNote: string | undefined,
): string | undefined {
  const trimmedNote = userNote?.trim() ?? '';
  if (!sourceAccountId) {
    return trimmedNote || undefined;
  }
  const prefix = `${SOURCE_ACCOUNT_PREFIX}${sourceAccountId}]`;
  if (!trimmedNote) {
    return prefix;
  }
  return `${prefix} ${trimmedNote}`;
}

export function parseContributionNote(note: string | null | undefined): {
  sourceAccountId?: string;
  userNote?: string;
} {
  if (!note) {
    return {};
  }

  const match = note.match(/^\[حساب:([^\]]+)\]\s*(.*)$/s);
  if (!match) {
    return { userNote: note };
  }

  const sourceAccountId = match[1]?.trim();
  const userNote = match[2]?.trim();
  return {
    sourceAccountId: sourceAccountId || undefined,
    userNote: userNote || undefined,
  };
}
