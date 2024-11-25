/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * This includes a Discord theme color palette for both light and dark modes.
 */

// Discord color palette
const discordLight = {
  text: '#2C2F33',
  background: '#FFFFFF',
  tint: '#7289DA', // Discord blue
  icon: '#99AAB5',
  tabIconDefault: '#99AAB5',
  tabIconSelected: '#fff',
};

const discordDark = {
  text: '#FFFFFF',
  background: '#23272A',
  tint: '#7289DA', // Discord blue
  icon: '#99AAB5',
  tabIconDefault: '#99AAB5',
  tabIconSelected: '#fff',
};

export const Colors = {
  light: {
    ...discordLight,
    // Other light mode colors can be added here
  },
  dark: {
    ...discordDark,
    // Other dark mode colors can be added here
  },
};
