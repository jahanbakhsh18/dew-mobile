import { StyleSheet } from 'react-native';

export const Colors = {
    primary: '#3b82f6',
    secondary: '#64748b',
    background: '#f8fafc',
    text: '#1e293b',
    white: '#ffffff',
};

export const Typography = {
    headline: {
        fontSize: 24,
        fontWeight: 'bold' as const,
        color: Colors.text,
    },
    body: {
        fontSize: 16,
        color: Colors.text,
    },
    caption: {
        fontSize: 12,
        color: Colors.secondary,
    },
};

export const Layout = {
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
};

export const Buttons = {
    primary: {
        backgroundColor: Colors.primary,
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 8,
        alignItems: 'center' as const,
    },
    primaryText: {
        color: Colors.white,
        fontSize: 16,
        fontWeight: '600' as const,
    },
};

const GlobalStyles = {
    Colors,
    Typography,
    Layout,
    Buttons,
};

export default GlobalStyles;