import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import CreateScreen from '../screens/CreateScreen';
import TicketsScreen from '../screens/TicketScreen';
import ProfileScreen from '../screens/ProfileScreen';
import CustomTabBar from '../components/CustomTabBar';

const Tab = createBottomTabNavigator();

const MainTabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
      initialRouteName="Tickets"
    >
      <Tab.Screen name="Profile" component={ProfileScreen} />
      <Tab.Screen name="Tickets" component={TicketsScreen} />
      <Tab.Screen name="Create" component={CreateScreen} />
    </Tab.Navigator>
  );
};

export default MainTabNavigator;