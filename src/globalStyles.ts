import { StyleSheet, Platform } from 'react-native';

export const Colors = {
  primary: '#0E7A85',      // Dew teal — primary brand accent
  primaryDark: '#0A5C64',  // pressed / emphasis state
  primaryMuted: '#7FB8B4', // desaturated teal — disabled/incomplete states
  primaryTint: '#E3F3F2',  // pale teal — badges, selected backgrounds, gradients
  secondary: '#5B6B79',    // slate — secondary text (kept name for compatibility)
  textMuted: '#5B6B79',
  background: '#F4F8F8',   // cool off-white app background
  white: '#FFFFFF',
  lightGray: '#EEF3F3',
  border: '#DCE6E6',
  inputBackground: '#FAFDFD',
  shadow: '#0B2E30',
  danger: '#D0483F',
  warning: '#D89A34',
  success: '#2C8F63',
  text: '#101827',         // near-ink, used for primary text
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

export const Shadows = {
  card: {
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  raised: {
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 18,
    elevation: 6,
  },
} as const;

// ----- Layout -----
export const Layout = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  safeArea: {
    flex: 1,
    backgroundColor: Colors.primary,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loginContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
});

// ----- Card -----
export const Card = StyleSheet.create({
  default: {
    backgroundColor: Colors.white,
    borderRadius: Spacing.lg,
    padding: Spacing.xl,
    ...Shadows.card,
  },
  ticket: {
    backgroundColor: Colors.white,
    borderRadius: Spacing.md,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    ...Shadows.card,
  },
});

// ----- Input -----
export const Input = StyleSheet.create({
  default: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Spacing.sm,
    padding: Spacing.md,
    fontSize: 16,
    backgroundColor: Colors.inputBackground,
    color: Colors.text,
  },
  search: {
    backgroundColor: Colors.white,
    borderRadius: Spacing.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    fontSize: 15,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.border,
  },
});

// ----- Badge -----
export const Badge = StyleSheet.create({
  default: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: 999,
    alignSelf: 'flex-start',
  },
  text: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '600',
  },
});

// ----- Modal -----
export const ModalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(16, 24, 39, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    backgroundColor: Colors.white,
    borderRadius: Spacing.lg,
    width: '90%',
    maxHeight: '80%',
    padding: Spacing.xl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 10
  },
  closeText: {
    fontSize: 18,
    color: Colors.secondary,
  },
  footer: {
    flexDirection: 'row',
    padding: Spacing.xl,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    gap: Spacing.md,
  },
  button: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: Spacing.sm,
    backgroundColor: Colors.lightGray,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: Colors.primary,
  },
  buttonText: {
    fontSize: 16,
    color: Colors.secondary,
    fontWeight: '600',
  },
  primaryButtonText: {
    color: Colors.white,
  },
});

// ----- Header -----
export const Header = StyleSheet.create({
  container: {
    padding: Spacing.xl,
    paddingTop: Platform.OS === 'ios' ? 60 : 50,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: Colors.text,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 13,
    color: Colors.secondary,
    fontWeight: '500',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.lg,
  },
});

// ----- Empty State -----
export const EmptyState = StyleSheet.create({
  container: {
    padding: Spacing.xxxl,
    alignItems: 'center',
  },
  text: {
    fontSize: 15,
    color: Colors.secondary,
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  actionButton: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.primaryTint,
    borderRadius: 999,
  },
  actionText: {
    color: Colors.primaryDark,
    fontSize: 14,
    fontWeight: '600',
  },
});

// ----- Detail (for detail screens) -----
export const Detail = StyleSheet.create({
  section: {
    marginBottom: Spacing.xxl,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.secondary,
    marginBottom: Spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  text: {
    fontSize: 15,
    color: Colors.text,
    lineHeight: 21,
    marginBottom: Spacing.xs,
  },
  expiredText: {
    color: Colors.danger,
    fontWeight: '600',
  },
});

// ----- Filter (for filter modals / dropdowns) -----
export const Filter = StyleSheet.create({
  group: {
    marginBottom: Spacing.lg,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: Spacing.sm,
    color: Colors.secondary,
  },
  pickerContainer: {
    backgroundColor: Colors.inputBackground,
    borderRadius: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    height: 50,
    justifyContent: 'center',
  },
  picker: {
    height: 50,
    color: Colors.textMuted,
    marginLeft: 5
  },
  sortRow: {
    flexDirection: 'row',
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.xl,
  },
  resetButton: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: Spacing.sm,
    backgroundColor: Colors.lightGray,
    alignItems: 'center',
  },
  resetButtonText: {
    color: Colors.secondary,
    fontSize: 14,
    fontWeight: '600',
  },
  applyButton: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: Spacing.sm,
    backgroundColor: Colors.primary,
    alignItems: 'center',
  },
  applyButtonText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
});

// ----- Buttons -----
export const Buttons = StyleSheet.create({
  primary: {
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: Spacing.sm,
    alignItems: 'center',
    marginTop: Spacing.md,
  },
  outline: {
    backgroundColor: Colors.white,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: Spacing.sm,
    alignItems: 'center',
    marginTop: Spacing.md,
  },
});

// ----- Typography -----
export const Typography = StyleSheet.create({
  headlineLarge: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.text,
    letterSpacing: -0.4,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: Colors.white,
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.85)',
    fontWeight: '500',
  },
  headline: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.text,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 15,
    color: Colors.secondary,
  },
  body: {
    fontSize: 15,
    color: Colors.text,
  },
  caption: {
    fontSize: 12,
    color: Colors.secondary,
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primaryDark,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.white,
  },
  buttonOutlineText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary,
  },
});

// Re-export everything as a single object if desired
const GlobalStyles = {
  Colors,
  Spacing,
  Shadows,
  Layout,
  Card,
  Input,
  Badge,
  ModalStyles,
  Header,
  EmptyState,
  Detail,
  Filter,
  Buttons,
  Typography,
};
export default GlobalStyles;