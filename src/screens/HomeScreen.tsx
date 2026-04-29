import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import FormCard from '../components/FormCard';

const HomeScreen: React.FC = () => {
  const sampleForms = [
    { id: '1', title: 'Contact Form', description: 'Fill out your contact information and we will get back to you.'},
    { id: '2', title: 'Feedback Form',description: 'Help us improve by sharing your feedback and suggestions.' },
    { id: '3', title: 'Registration Form', description: 'Register for upcoming events and webinars.' },
    { id: '4', title: 'Survey Form', description: 'Participate in our quick survey and earn rewards.' },
    { id: '5', title: 'Contact Form', description: 'Fill out your contact information and we will get back to you.'},
    { id: '6', title: 'Feedback Form',description: 'Help us improve by sharing your feedback and suggestions.' },
    { id: '7', title: 'Registration Form', description: 'Register for upcoming events and webinars.' },
    { id: '8', title: 'Survey Form', description: 'Participate in our quick survey and earn rewards.' }
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f5f5f5" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Home</Text>
        <Text style={styles.headerSubtitle}>Available Forms</Text>
      </View>
      <ScrollView showsVerticalScrollIndicator={false}>
        {sampleForms.map((form) => (
          <FormCard
            key={form.id}
            title={form.title}
            description={form.description}
          />
        ))}
        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 12,
    backgroundColor: '#f5f5f5',
  },
  headerTitle: {
    fontSize: 34,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  bottomPadding: {
    height: 80,
  },
});

export default HomeScreen;