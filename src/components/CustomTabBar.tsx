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
    Profile: { icon: 'person', label: 'Profile' },
    Tickets: { icon: 'confirmation-num', label: 'Tickets' },
    Home: { icon: 'home', label: 'Home' },
  };

  return (
    <View style={[
      styles.container,
      { paddingBottom: insets.bottom > 0 ? insets.bottom : 10 }
    ]}>
      <View style={styles.tabBar}>
        {state.routes.map((route: any, index: number) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;
          const config = tabConfig[route.name as keyof typeof tabConfig];

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return (
            <TouchableOpacity
              key={route.key}
              onPress={onPress}
              style={styles.tabItem}
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
        })}
      </View>
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
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.90)',
    borderRadius: 30,
    marginHorizontal: 90,
    paddingHorizontal: 30,
    paddingVertical: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
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
  iconContainer: {
    padding: 8,
    borderRadius: 30,
  },
  activeIconContainer: {
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
  },
});

export default CustomTabBar;