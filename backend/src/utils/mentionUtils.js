export const extractMentions = (text) => {
    // Match @username pattern (alphanumeric, underscore, hyphen)
    const mentionRegex = /@([a-zA-Z0-9_\-]+)/g;
    const mentions = [];
    let match;

    while ((match = mentionRegex.exec(text)) !== null) {
        mentions.push(match[1]);
    }

    // Remove duplicates
    return [...new Set(mentions)];
};
