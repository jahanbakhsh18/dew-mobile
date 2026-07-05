import React from 'react';
import { View, Text, StyleSheet, StatusBar, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useAuth } from '../contexts/AuthContext';
import { Colors, Spacing, Typography, Layout, Card, Buttons } from '../globalStyles';

const ProfileScreen: React.FC = () => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => logout()
        },
      ]
    );
  };

  const menuItems = [
    { icon: 'person', title: 'Account Settings', onPress: () => Alert.alert('Coming Soon', 'Account settings will be available soon') },
    { icon: 'notifications', title: 'Notifications', onPress: () => Alert.alert('Coming Soon', 'Notification settings will be available soon') },
    { icon: 'security', title: 'Security', onPress: () => Alert.alert('Coming Soon', 'Security settings will be available soon') },
    { icon: 'help', title: 'Help & Support', onPress: () => Alert.alert('Coming Soon', 'Help center will be available soon') }
  ];

  return (
    <SafeAreaView style={Layout.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {user?.username?.charAt(0).toUpperCase() || 'U'}
              </Text>
            </View>
          </View>
          <Text style={Typography.headline}>{user?.username || 'User'}</Text>
          <Text style={Typography.caption}>user@example.com</Text>
        </View>

        <View style={styles.menuSection}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.menuItem}
              onPress={item.onPress}
              activeOpacity={0.7}
            >
              <Icon name={item.icon} size={24} color={Colors.primary} />
              <Text style={styles.menuItemText}>{item.title}</Text>
              <Icon name="chevron-right" size={20} color={Colors.secondary} />
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} activeOpacity={0.7}>
          <Icon name="logout" size={24} color={Colors.danger} />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    paddingTop: Spacing.xxxl + Spacing.xl, // ~60
    paddingBottom: Spacing.xxl,
    backgroundColor: Colors.white,
    borderBottomLeftRadius: Spacing.xxl,
    borderBottomRightRadius: Spacing.xxl,
    marginBottom: Spacing.xl,
  },
  avatarContainer: {
    marginBottom: Spacing.lg,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  avatarText: {
    fontSize: 48,
    fontWeight: '600',
    color: Colors.white,
  },
  menuSection: {
    backgroundColor: Colors.white,
    borderRadius: Spacing.lg,
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.sm,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGray,
  },
  menuItemText: {
    flex: 1,
    fontSize: 16,
    color: Colors.text,
    marginLeft: Spacing.md,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white,
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: 12,
    gap: Spacing.sm,
  },
  logoutText: {
    fontSize: 16,
    color: Colors.danger,
    fontWeight: '600',
  },
  bottomPadding: {
    height: 100,
  },
});

export default ProfileScreen;