import React from 'react';
import { View, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Spacing } from '../globalStyles';

interface TabBarProps {
  state: any;
  descriptors: any;
  navigation: any;
}

const CustomTabBar: React.FC<TabBarProps> = ({ state, descriptors, navigation }) => {
  const insets = useSafeAreaInsets();

  // Tab configuration with icons
  const tabConfig = {
    Profile: { icon: 'person', label: 'Profile', position: 'left' },
    Create: { icon: 'add-circle-outline', label: 'Add', position: 'center' },
    Tickets: { icon: 'confirmation-num', label: 'Tickets', position: 'right' }
  };

  // Reorder tabs for better layout (left, center, right)
  const orderedRoutes = [...state.routes].sort((a, b) => {
    const order = { Profile: 0, Tickets: 1, Create: 2 };
    return order[a.name as keyof typeof order] - order[b.name as keyof typeof order];
  });

  const onPress = (routeName: string, isFocused: boolean) => {
    const event = navigation.emit({
      type: 'tabPress',
      target: state.routes.find((r: any) => r.name === routeName)?.key,
      canPreventDefault: true,
    });

    if (!isFocused && !event.defaultPrevented) {
      navigation.navigate(routeName);
    }
  };

  const renderLeftTab = (route: any, index: number) => {
    const isFocused = state.index === state.routes.findIndex((r: any) => r.name === route.name);
    const config = tabConfig[route.name as keyof typeof tabConfig];

    return (
      <TouchableOpacity
        key={route.key}
        onPress={() => onPress(route.name, isFocused)}
        style={[
          styles.tabItem,
          route.name === 'Profile' && styles.profileTabItem,
          route.name === 'Tickets' && styles.ticketsTabItem,
        ]}
        activeOpacity={0.7}
      >
        <View style={[
          styles.iconContainer,
          isFocused && styles.activeIconContainer
        ]}>
          <Icon
            name={config.icon}
            size={24}
            color={isFocused ? Colors.primary : Colors.secondary}
          />
        </View>
      </TouchableOpacity>
    );
  };

  const renderCenterFab = () => {
    const isFocused = state.index === state.routes.findIndex((r: any) => r.name === 'Create');
    const config = tabConfig.Create;

    return (
      <TouchableOpacity
        key="center-fab"
        onPress={() => onPress('Create', isFocused)}
        style={styles.fabContainer}
        activeOpacity={0.8}
      >
        <View style={[
          styles.fabIconContainer,
          isFocused && styles.fabActiveIconContainer
        ]}>
          <Icon
            name={config.icon}
            size={36}
            color={isFocused ? Colors.primary : Colors.white}
          />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[
      styles.container,
      { paddingBottom: insets.bottom > 0 ? insets.bottom : Spacing.md }
    ]}>
      <View style={styles.tabBar}>
        {orderedRoutes.filter(route => route.name !== 'Create').map((route, index) => renderLeftTab(route, index))}
      </View>
      {renderCenterFab()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 35,
    marginHorizontal: 70,
    marginVertical: Spacing.xs,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 15,
    elevation: 8,
    ...Platform.select({
      ios: {
        backdropFilter: 'blur(10px)',
      },
    }),
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.sm,
  },
  profileTabItem: {
    marginRight: 40,
  },
  ticketsTabItem: {
    marginLeft: 40,
  },
  iconContainer: {
    padding: Spacing.md, // Slightly larger tap area
    borderRadius: 30,
  },
  activeIconContainer: {
    backgroundColor: 'rgba(0, 122, 255, 0.15)',
  },
  // FAB styles
  fabContainer: {
    position: 'absolute',
    top: 1, // Move FAB higher to create more separation
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10, // Ensure FAB stays on top
  },
  fabIconContainer: {
    width: 65,
    height: 65,
    borderRadius: 32.5,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 12,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.95)',
  },
  fabActiveIconContainer: {
    backgroundColor: Colors.white,
    borderColor: Colors.primary,
    borderWidth: 2,
  },
});

export default CustomTabBar;