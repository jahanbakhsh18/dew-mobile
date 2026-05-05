import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  TouchableOpacity,
} from 'react-native';
import SamplePopup from '../components/SamplePopup';
import { SafeAreaView } from 'react-native-safe-area-context';

interface Ticket {
  id: string;
  title: string;
  status: 'open' | 'in-progress' | 'resolved';
  date: string;
}

const TicketScreen: React.FC = () => {
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const tickets: Ticket[] = [
    { id: '1', title: 'Login Issue', status: 'open', date: '2024-01-15' },
    { id: '2', title: 'Payment Failed', status: 'in-progress', date: '2024-01-14' },
    { id: '3', title: 'Feature Request', status: 'resolved', date: '2024-01-10' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return '#FF3B30';
      case 'in-progress': return '#FF9500';
      case 'resolved': return '#34C759';
      default: return '#8E8E93';
    }
  };

  const handleTicketPress = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setModalVisible(true);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f5f5f5" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Tickets</Text>
        <Text style={styles.headerSubtitle}>Your support requests</Text>
      </View>
      <ScrollView showsVerticalScrollIndicator={false}>
        {tickets.map((ticket) => (
          <TouchableOpacity
            key={ticket.id}
            style={styles.ticketCard}
            onPress={() => handleTicketPress(ticket)}
          >
            <View style={styles.ticketContent}>
              <Text style={styles.ticketTitle}>{ticket.title}</Text>
              <Text style={styles.ticketDate}>{ticket.date}</Text>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(ticket.status) }]}>
                <Text style={styles.statusText}>{ticket.status}</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
        <View style={styles.bottomPadding} />
      </ScrollView>
      
      {selectedTicket && (
        <SamplePopup
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          title={`Ticket: ${selectedTicket.title}`}
          message={`Status: ${selectedTicket.status}\nDate: ${selectedTicket.date}\n\nThis is a sample ticket detail view. In the full implementation, you would see the complete conversation and ticket history here.`}
        />
      )}
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
  ticketCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  ticketContent: {
    gap: 8,
  },
  ticketTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  ticketDate: {
    fontSize: 12,
    color: '#8E8E93',
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 4,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  bottomPadding: {
    height: 80,
  },
});

export default TicketScreen;