import React from 'react';
import { View, Text, StyleSheet, StatusBar, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useAuth } from '../contexts/AuthContext';
import { Colors, Spacing, Typography, Layout, Shadows } from '../globalStyles';

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
    <SafeAreaView style={Layout.container} edges={['bottom']}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primaryDark} />
      <ScrollView showsVerticalScrollIndicator={false}>
        <LinearGradient
          colors={[Colors.primaryDark, Colors.primary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <View style={styles.avatarRing}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {user?.username?.charAt(0).toUpperCase() || 'U'}
              </Text>
            </View>
          </View>
          <Text style={styles.userName}>{user?.username || 'User'}</Text>
          <Text style={styles.userMeta}>Signed in</Text>
        </LinearGradient>

        <View style={styles.menuSection}>
          <Text style={styles.sectionEyebrow}>Settings</Text>
          <View style={styles.menuCard}>
            {menuItems.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.menuItem,
                  index === menuItems.length - 1 && styles.menuItemLast,
                ]}
                onPress={item.onPress}
                activeOpacity={0.7}
              >
                <View style={styles.menuIconWrap}>
                  <Icon name={item.icon} size={20} color={Colors.primary} />
                </View>
                <Text style={styles.menuItemText}>{item.title}</Text>
                <Icon name="chevron-right" size={20} color={Colors.secondary} />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} activeOpacity={0.7}>
          <Icon name="logout" size={20} color={Colors.danger} />
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
    paddingTop: Spacing.xxxl + Spacing.xl,
    paddingBottom: Spacing.xxxl,
    borderBottomLeftRadius: Spacing.xl,
    borderBottomRightRadius: Spacing.xl,
    marginBottom: Spacing.xl,
  },
  avatarRing: {
    width: 108,
    height: 108,
    borderRadius: 54,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  avatar: {
    width: 92,
    height: 92,
    borderRadius: 46,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.raised,
  },
  avatarText: {
    fontSize: 40,
    fontWeight: '700',
    color: Colors.primary,
  },
  userName: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.white,
  },
  userMeta: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  sectionEyebrow: {
    ...Typography.eyebrow,
    marginHorizontal: Spacing.xl,
    marginBottom: Spacing.sm,
  },
  menuSection: {
    marginBottom: Spacing.xl,
  },
  menuCard: {
    backgroundColor: Colors.white,
    borderRadius: Spacing.lg,
    marginHorizontal: Spacing.lg,
    overflow: 'hidden',
    ...Shadows.card,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGray,
  },
  menuItemLast: {
    borderBottomWidth: 0,
  },
  menuIconWrap: {
    width: 36,
    height: 36,
    borderRadius: Spacing.sm,
    backgroundColor: Colors.primaryTint,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  menuItemText: {
    flex: 1,
    fontSize: 15,
    color: Colors.text,
    fontWeight: '500',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white,
    marginHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: Spacing.md,
    gap: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  logoutText: {
    fontSize: 15,
    color: Colors.danger,
    fontWeight: '600',
  },
  bottomPadding: {
    height: 100,
  },
});

export default ProfileScreen;