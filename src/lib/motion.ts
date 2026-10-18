/** Motion tokens shared by Motion components. Keep in sync with --ease-smooth in globals.css. */
export const ease = [0.22, 1, 0.36, 1] as const;

export const duration = {
  /** Page content entering after navigation */
  page: 0.6,
  /** Content scrolling into view */
  reveal: 0.7,
  /** Home hero entrance */
  hero: 0.8,
} as const;
