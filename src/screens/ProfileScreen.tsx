import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, StatusBar, TouchableOpacity, Alert, ScrollView, Linking, Image, ActivityIndicator, } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useAuth } from '../contexts/AuthContext';
import { Colors, Spacing, Typography, Layout, Shadows } from '../globalStyles';
import DeviceInfo from 'react-native-device-info';
import Popup from '../components/Popup';
import { API_URL } from '../config';

const GITHUB_OWNER = 'jahanbakhsh18';
const GITHUB_REPO = 'dew-mobile';

const ProfileScreen: React.FC = () => {
  const { userInfo, getUserInfo, logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [isCheckingUpdate, setIsCheckingUpdate] = useState(false);
  const [helpPopupVisible, setHelpPopupVisible] = useState(false);

  const developerInfo = {
    name: 'Mojtaba Jahanbakhsh',
    email: 'moj.jahanbakhsh@gmail.com',
    repository: `https://github.com/${GITHUB_OWNER}/${GITHUB_REPO}`,
    appVersion: DeviceInfo.getVersion(),
  };

  useEffect(() => {
    const fetchUserInfo = async () => {
      setLoading(true);
      try {
        await getUserInfo();
      } catch (error) {
        console.error('Failed to fetch user info:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchUserInfo();
  }, []);

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

  const checkForUpdates = async () => {
    if (isCheckingUpdate) return;
    setIsCheckingUpdate(true);

    try {
      const currentVersion = DeviceInfo.getVersion();
      const response = await fetch(
        `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/releases/latest`
      );
      if (!response.ok) {
        throw new Error('Failed to fetch latest release');
      }
      const release = await response.json();
      const latestVersion = release.tag_name.replace(/^v/, '');
      const isNewer = latestVersion > currentVersion;

      if (isNewer) {
        const apkAsset = release.assets.find((asset: any) =>
          asset.name.endsWith('.apk')
        );
        const downloadUrl = apkAsset ? apkAsset.browser_download_url : release.html_url;

        Alert.alert(
          'Update Available',
          `Version ${latestVersion} is available. You are on ${currentVersion}.`,
          [
            { text: 'Later', style: 'cancel' },
            {
              text: 'Download',
              onPress: () => {
                Linking.openURL(downloadUrl).catch(() =>
                  Alert.alert('Error', 'Could not open download link.')
                );
              },
            },
          ]
        );
      } else {
        Alert.alert('Up to Date', `You already have the latest version (${currentVersion}).`);
      }
    } catch (error) {
      Alert.alert('Error', 'Could not check for updates. Please try again later.');
      console.error(error);
    } finally {
      setIsCheckingUpdate(false);
    }
  };

  const menuItems = [
    { icon: 'person', title: 'Account Settings', onPress: () => Alert.alert('Coming Soon', 'Account settings will be available soon') },
    { icon: 'notifications', title: 'Notifications', onPress: () => Alert.alert('Coming Soon', 'Notification settings will be available soon') },
    //{ icon: 'security', title: 'Security', onPress: () => Alert.alert('Coming Soon', 'Security settings will be available soon') },
    { icon: 'update', title: 'App Updates', onPress: checkForUpdates },
    { icon: 'help', title: 'Help & Support', onPress: () => setHelpPopupVisible(true) }
  ];

  const getFullImageUrl = (imagePath: string) => {
    if (!imagePath) return null;
    console.log(`${API_URL.replace(/\/$/, '')}/${imagePath}`);
    return `${API_URL.replace(/\/$/, '')}/upload/${imagePath}`;
  };

  const userDisplayName = userInfo?.DisplayName || userInfo?.Username || 'User';
  const userAvatarInitial = userDisplayName.charAt(0).toUpperCase();
  const userImageUrl = userInfo?.UserImage ? getFullImageUrl(userInfo.UserImage) : null;
  const roleNames = userInfo?.RoleNames?.join(', ') || 'No roles assigned';

  return (
    <SafeAreaView style={Layout.container} edges={['bottom']}>
      <StatusBar barStyle="light-content" />
      <ScrollView showsVerticalScrollIndicator={false}>
        <LinearGradient
          colors={[Colors.primary, Colors.primary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <View style={styles.avatarRing}>
            {loading ? (
              <View style={styles.avatar}>
                <ActivityIndicator size="large" color={Colors.primary} />
              </View>
            ) : userImageUrl ? (
              <Image source={{ uri: userImageUrl }} style={styles.avatarImage} />
            ) : (
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{userAvatarInitial}</Text>
              </View>
            )}
          </View>
          {loading ? (
            <ActivityIndicator size="small" color={Colors.white} style={{ marginTop: 8 }} />
          ) : (
            <>
              <Text style={styles.userName}> {userDisplayName} </Text>
              <Text style={styles.userMeta}> @{userInfo?.Username || 'Unknown'} </Text>
              {roleNames ? <Text style={styles.userRole}> ROLE: {roleNames}</Text> : null}
            </>
          )}
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
                disabled={item.title === 'App Updates' && isCheckingUpdate}
              >
                <View style={styles.menuIconWrap}>
                  <Icon name={item.icon} size={20} color={Colors.primary} />
                </View>
                <Text style={styles.menuItemText}>
                  {item.title === 'App Updates' && isCheckingUpdate
                    ? 'Checking...'
                    : item.title}
                </Text>
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

      <Popup
        visible={helpPopupVisible}
        onClose={() => setHelpPopupVisible(false)}
        title="Help & Support"
        message={`\n` +
          `${developerInfo.name}\n\n` +
          `${developerInfo.email}\n` +
          `${developerInfo.repository}\n\n` +
          `App Version: ${developerInfo.appVersion}
        `}
      />
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
  avatarImage: {
    width: 92,
    height: 92,
    borderRadius: 46,
    resizeMode: 'cover',
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
  userRole: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 4,
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
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