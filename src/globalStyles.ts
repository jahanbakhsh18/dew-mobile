import { StyleSheet, Platform } from 'react-native';

export const Colors = {
  primary: '#007AFF',
  secondary: '#64748b',
  background: '#f8fafc',
  text: '#1e293b',
  white: '#ffffff',
  lightGray: '#f5f5f5',
  border: '#ddd',
  inputBackground: '#fafafa',
  shadow: '#000',
  danger: '#FF6B6B',
  success: '#34C759',
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
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
    backgroundColor: Colors.background,
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
    backgroundColor: Colors.lightGray,
    justifyContent: 'center',
    padding: Spacing.xl,
  },
});

// ----- Card -----
export const Card = StyleSheet.create({
  default: {
    backgroundColor: Colors.white,
    borderRadius: 10,
    padding: Spacing.xl,
    ...Shadows.card,
  },
  ticket: {
    backgroundColor: Colors.white,
    borderRadius: 12,
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
    borderRadius: 8,
    padding: Spacing.md,
    fontSize: 16,
    backgroundColor: Colors.inputBackground,
    color: Colors.text,
  },
  search: {
    backgroundColor: Colors.lightGray,
    borderRadius: 8,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    fontSize: 16,
    color: Colors.text,
  },
});

// ----- Badge -----
export const Badge = StyleSheet.create({
  default: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: 6,
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
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    backgroundColor: Colors.white,
    borderRadius: 12,
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
  },
  closeText: {
    fontSize: 20,
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
    borderRadius: 8,
    backgroundColor: Colors.lightGray,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: Colors.primary,
  },
  buttonText: {
    fontSize: 16,
    color: Colors.secondary,
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
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.white,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.text,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.secondary,
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
    fontSize: 16,
    color: Colors.secondary,
    marginBottom: Spacing.md,
  },
  actionButton: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.lightGray,
    borderRadius: 8,
  },
  actionText: {
    color: Colors.primary,
    fontSize: 14,
  },
});

// ----- Detail (for detail screens) -----
export const Detail = StyleSheet.create({
  section: {
    marginBottom: Spacing.xxl,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  text: {
    fontSize: 14,
    color: Colors.secondary,
    lineHeight: 20,
    marginBottom: Spacing.xs,
  },
  expiredText: {
    color: Colors.danger,
    fontWeight: '500',
  },
});

// ----- Filter (for filter modals / dropdowns) -----
export const Filter = StyleSheet.create({
  group: {
    marginBottom: Spacing.lg,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: Spacing.sm,
    color: Colors.secondary,
  },
  pickerContainer: {
    backgroundColor: Colors.inputBackground,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    height: 50,
    justifyContent: 'center',
  },
  picker: {
    height: 50,
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
    borderRadius: 8,
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
    borderRadius: 8,
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
    borderRadius: 8,
    alignItems: 'center',
    marginTop: Spacing.md,
  },
  outline: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.primary,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: Spacing.md,
  },
});

// ----- Typography -----
export const Typography = StyleSheet.create({
  headlineLarge: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.text,
    textAlign: 'center',
  },
  headline: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.secondary,
    textAlign: 'center',
  },
  body: {
    fontSize: 16,
    color: Colors.text,
  },
  caption: {
    fontSize: 12,
    color: Colors.secondary,
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