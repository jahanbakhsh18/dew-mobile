import React from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

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
    Home: { icon: 'add-circle-outline', label: 'Add', position: 'center' },
    Tickets: { icon: 'confirmation-num', label: 'Tickets', position: 'right' }
  };

  // Reorder tabs for better layout (left, center, right)
  const orderedRoutes = [...state.routes].sort((a, b) => {
    const order = { Profile: 0, Tickets: 1, Home: 2 };
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
            color={isFocused ? '#007AFF' : '#8E8E93'}
          />
        </View>
      </TouchableOpacity>
    );
  };

  const renderCenterFab = () => {
    const homeRoute = state.routes.find((r: any) => r.name === 'Home');
    const isFocused = state.index === state.routes.findIndex((r: any) => r.name === 'Home');
    const config = tabConfig.Home;

    return (
      <TouchableOpacity
        key="center-fab"
        onPress={() => onPress('Home', isFocused)}
        style={styles.fabContainer}
        activeOpacity={0.8}
      >
        <View style={[
          styles.fabIconContainer,
          isFocused && styles.fabActiveIconContainer
        ]}>
          <Icon
            name={config.icon}
            size={36} // Slightly larger for better visibility
            color={isFocused ? '#007AFF' : '#FFFFFF'}
          />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[
      styles.container,
      { paddingBottom: insets.bottom > 0 ? insets.bottom : 10 }
    ]}>
      <View style={styles.tabBar}>
        {/* Left tabs (Profile and Tickets) */}
        {orderedRoutes
          .filter(route => route.name !== 'Home')
          .map((route, index) => renderLeftTab(route, index))}
      </View>
      
      {/* Center FAB - rendered outside the tab bar */}
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
    marginVertical: 5,
    shadowColor: '#000',
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
    paddingVertical: 8,
  },
  profileTabItem: {
    marginRight: 40,
  },
  ticketsTabItem: {
    marginLeft: 40,
  },
  iconContainer: {
    padding: 10, // Slightly larger tap area
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
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 12,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.95)',
  },
  fabActiveIconContainer: {
    backgroundColor: '#FFFFFF',
    borderColor: '#007AFF',
    borderWidth: 2,
  },
});

export default CustomTabBar;