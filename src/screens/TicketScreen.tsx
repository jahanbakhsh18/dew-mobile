import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  TextInput,
  Modal,
  ScrollView,
  Alert,
  StatusBar,
  Platform,
} from 'react-native';
//import { Picker } from '@react-native-picker/picker';
import ticketService from '../services/ticketService';
import { Ticket, TicketListResponse, TicketDetailResponse } from '../types/ticketTypes';

const TicketScreen: React.FC = () => {
  // State for ticket list
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  
  // State for filters
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    statusId: '',
    systemId: '',
    problemId: '',
    sortBy: 'DateCreated',
    sortOrder: 'DESC' as 'ASC' | 'DESC',
    take: 100
  });
  
  // State for modal
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [ticketDetails, setTicketDetails] = useState<any>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  
  // State for search
  const [searchQuery, setSearchQuery] = useState('');

    // Available options
  const statusOptions = [
    { id: '', name: 'All Statuses' },
    { id: '1', name: 'Open' },
    { id: '2', name: 'In Progress' },
    { id: '3', name: 'Resolved' },
    { id: '4', name: 'Closed' },
  ];
  
  const systemOptions = [
    { id: '', name: 'All Systems' },
    { id: '1', name: 'System 1' },
    { id: '2', name: 'System 2' },
    { id: '3', name: 'System 3' },
  ];
  
  const sortOptions = [
    { value: 'DateCreated', label: 'Date Created' },
    { value: 'ExpireDate', label: 'Expire Date' },
    { value: 'StatusName', label: 'Status' },
  ];
  
  const sortOrderOptions = [
    { value: 'DESC', label: 'Newest First' },
    { value: 'ASC', label: 'Oldest First' },
  ];

  // Fetch tickets on component mount and when filters change
  useEffect(() => {
    fetchTickets();
  }, [filters.statusId, filters.systemId, filters.problemId, filters.sortBy, filters.sortOrder]);

  // Fetch ticket list with current filters
  const fetchTickets = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    setError(null);
    
    try {
      const response = await ticketService.getTicketList({
        statusId: filters.statusId,
        systemId: filters.systemId,
        problemId: filters.problemId,
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder,
        take: filters.take
      });
      
      setTickets(response.Entities || []);
      setTotalCount(response.TotalCount || 0);
    } catch (err: any) {
      console.error('Error fetching tickets:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to load tickets';
      setError(errorMessage);
      Alert.alert('Error', errorMessage);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  // Pull-to-refresh handler
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchTickets(false);
    setRefreshing(false);
  }, [filters]);

  // Fetch ticket details when modal opens
  const fetchTicketDetails = async (ticketId: number) => {
    setDetailsLoading(true);
    setTicketDetails(null);
    
    try {
      const response = await ticketService.getTicketDetails(ticketId);
      setTicketDetails(response);
    } catch (err: any) {
      console.error('Error fetching ticket details:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to load ticket details';
      Alert.alert('Error', errorMessage);
    } finally {
      setDetailsLoading(false);
    }
  };

  // Handle ticket press
  const handleTicketPress = async (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setModalVisible(true);
    await fetchTicketDetails(ticket.Id);
  };

  // Close modal
  const handleCloseModal = () => {
    setModalVisible(false);
    setSelectedTicket(null);
    setTicketDetails(null);
  };

  // Apply filters
  const applyFilters = () => {
    setShowFilters(false);
    fetchTickets();
  };

  // Reset filters
  const resetFilters = () => {
    setFilters({
      statusId: '',
      systemId: '',
      problemId: '',
      sortBy: 'DateCreated',
      sortOrder: 'DESC',
      take: 100
    });
    setShowFilters(false);
  };

  // Filter tickets locally for search
  const filteredTickets = tickets.filter(ticket =>
    searchQuery === '' ||
    ticket.ProblemName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ticket.SystemName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ticket.CreatorUsername?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ticket.Id.toString().includes(searchQuery)
  );

  // Render individual ticket item
  const renderTicketItem = ({ item }: { item: Ticket }) => (
    <TouchableOpacity
      style={styles.ticketCard}
      onPress={() => handleTicketPress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.ticketHeader}>
        <Text style={styles.ticketId}>Ticket #{item.Id}</Text>
        <View style={[styles.statusBadge, { backgroundColor: item.TimeFlagColor || '#9E9E9E' }]}>
          <Text style={styles.statusText}>{item.StatusName}</Text>
        </View>
      </View>
      
      <Text style={styles.problemName}>{item.ProblemName}</Text>
      
      <View style={styles.ticketFooter}>
        <View style={styles.systemInfo}>
          <Text style={styles.systemIcon}>🏢</Text>
          <Text style={styles.systemName}>{item.SystemName}</Text>
        </View>
        <Text style={styles.creator}>👤 {item.CreatorUsername}</Text>
      </View>
      
      <View style={styles.metaInfo}>
        <Text style={styles.date}>
          📅 Created: {new Date(item.DateCreated).toLocaleDateString()}
        </Text>
        {item.ExpireDate && (
          <Text style={[styles.date, new Date(item.ExpireDate) < new Date() && styles.expired]}>
            ⏰ Expires: {new Date(item.ExpireDate).toLocaleDateString()}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );

  // Loading state
  if (loading && tickets.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading tickets...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Tickets</Text>
        <View style={styles.headerActions}>
          <Text style={styles.headerSubtitle}>
            Total: {totalCount} tickets
          </Text>
          <TouchableOpacity 
            style={styles.filterButton} 
            onPress={() => setShowFilters(!showFilters)}
          >
            <Text style={styles.filterButtonText}>
              {showFilters ? '▼' : '⚙️'} Filters
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="🔍 Search by ID, problem, system, or creator..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#999"
        />
      </View>
      
      {/* Filters Panel */}
      {showFilters && (
        <View style={styles.filtersPanel}>
          <Text style={styles.filtersTitle}>Filter Tickets</Text>
          
          <View style={styles.filterGroup}>
            <Text style={styles.filterLabel}>Status</Text>
            <View style={styles.pickerContainer}>
              {/* <Picker
                selectedValue={filters.statusId}
                onValueChange={(value) => setFilters({...filters, statusId: value})}
                style={styles.picker}
              >
                <Picker.Item label="All Statuses" value="" />
                <Picker.Item label="Open" value="1" />
                <Picker.Item label="In Progress" value="2" />
                <Picker.Item label="Resolved" value="3" />
                <Picker.Item label="Closed" value="4" />
              </Picker> */}
            </View>
          </View>
          
          <View style={styles.filterGroup}>
            <Text style={styles.filterLabel}>System</Text>
            <View style={styles.pickerContainer}>
              {/* <Picker
                selectedValue={filters.systemId}
                onValueChange={(value) => setFilters({...filters, systemId: value})}
                style={styles.picker}
              >
                <Picker.Item label="All Systems" value="" />
                <Picker.Item label="System 1" value="1" />
                <Picker.Item label="System 2" value="2" />
              </Picker> */}
            </View>
          </View>
          
          <View style={styles.filterGroup}>
            <Text style={styles.filterLabel}>Sort By</Text>
            <View style={styles.sortRow}>
              <View style={[styles.pickerContainer, { flex: 2, marginRight: 8 }]}>
                {/* <Picker
                  selectedValue={filters.sortBy}
                  onValueChange={(value) => setFilters({...filters, sortBy: value})}
                  style={styles.picker}
                >
                  <Picker.Item label="Date Created" value="DateCreated" />
                  <Picker.Item label="Expire Date" value="ExpireDate" />
                  <Picker.Item label="Status" value="StatusName" />
                </Picker> */}
              </View>
              <View style={[styles.pickerContainer, { flex: 1 }]}>
                {/* <Picker
                  selectedValue={filters.sortOrder}
                  onValueChange={(value) => setFilters({...filters, sortOrder: value})}
                  style={styles.picker}
                >
                  <Picker.Item label="DESC" value="DESC" />
                  <Picker.Item label="ASC" value="ASC" />
                </Picker> */}
              </View>
            </View>
          </View>
          
          <View style={styles.filterActions}>
            <TouchableOpacity style={styles.resetButton} onPress={resetFilters}>
              <Text style={styles.resetButtonText}>Reset</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.applyButton} onPress={applyFilters}>
              <Text style={styles.applyButtonText}>Apply Filters</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
      
      {/* Ticket List */}
      {error ? (
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => fetchTickets()}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filteredTickets}
          renderItem={renderTicketItem}
          keyExtractor={(item) => item.Id.toString()}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No tickets found</Text>
              <TouchableOpacity 
                style={styles.resetFiltersButton}
                onPress={resetFilters}
              >
                <Text style={styles.resetFiltersText}>Reset Filters</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      )}
      
      {/* Ticket Details Modal */}
      <Modal
        animationType="slide"
        transparent={false}
        visible={modalVisible}
        onRequestClose={handleCloseModal}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              Ticket #{selectedTicket?.Id}
            </Text>
            <TouchableOpacity onPress={handleCloseModal} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent}>
            {detailsLoading ? (
              <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#007AFF" />
                <Text style={styles.loadingText}>Loading details...</Text>
              </View>
            ) : (
              <>
                {selectedTicket && (
                  <>
                    <View style={styles.detailSection}>
                      <Text style={styles.sectionTitle}>Status</Text>
                      <View style={[styles.detailStatusBadge, { backgroundColor: selectedTicket.TimeFlagColor || '#9E9E9E' }]}>
                        <Text style={styles.detailStatusText}>{selectedTicket.StatusName}</Text>
                      </View>
                    </View>
                    
                    <View style={styles.detailSection}>
                      <Text style={styles.sectionTitle}>Problem</Text>
                      <Text style={styles.detailText}>{selectedTicket.ProblemName}</Text>
                    </View>
                    
                    <View style={styles.detailSection}>
                      <Text style={styles.sectionTitle}>System</Text>
                      <Text style={styles.detailText}>{selectedTicket.SystemName}</Text>
                    </View>
                    
                    <View style={styles.detailSection}>
                      <Text style={styles.sectionTitle}>Created By</Text>
                      <Text style={styles.detailText}>{selectedTicket.CreatorUsername}</Text>
                    </View>
                    
                    <View style={styles.detailSection}>
                      <Text style={styles.sectionTitle}>Timeline</Text>
                      <Text style={styles.detailText}>
                        🕐 Created: {new Date(selectedTicket.DateCreated).toLocaleString()}
                      </Text>
                      {selectedTicket.DateUpdated && (
                        <Text style={styles.detailText}>
                          🔄 Updated: {new Date(selectedTicket.DateUpdated).toLocaleString()}
                        </Text>
                      )}
                      {selectedTicket.ExpireDate && (
                        <Text style={[
                          styles.detailText,
                          new Date(selectedTicket.ExpireDate) < new Date() && styles.expiredText
                        ]}>
                          ⏰ Expires: {new Date(selectedTicket.ExpireDate).toLocaleString()}
                        </Text>
                      )}
                      {selectedTicket.DateClosed && (
                        <Text style={styles.detailText}>
                          ✅ Closed: {new Date(selectedTicket.DateClosed).toLocaleString()}
                        </Text>
                      )}
                    </View>
                    
                    {/* Additional details from Retrieve endpoint */}
                    {ticketDetails && ticketDetails.Entity && (
                      <View style={styles.detailSection}>
                        <Text style={styles.sectionTitle}>Description</Text>
                        <Text style={styles.detailText}>
                          {ticketDetails.Entity.Description || 'No description available'}
                        </Text>
                      </View>
                    )}
                    
                    {/* Files Section */}
                    {ticketDetails && ticketDetails.Entity && ticketDetails.Entity.FilesPath && (
                      <View style={styles.detailSection}>
                        <Text style={styles.sectionTitle}>Attachments</Text>
                        {(() => {
                          try {
                            const files = JSON.parse(ticketDetails.Entity.FilesPath);
                            return files.map((file: any, index: number) => (
                              <TouchableOpacity
                                key={index}
                                style={styles.fileItem}
                                onPress={() => {
                                  Alert.alert('File', `Download: ${file.OriginalName}`);
                                }}
                              >
                                <Text style={styles.fileName}>📎 {file.OriginalName}</Text>
                              </TouchableOpacity>
                            ));
                          } catch {
                            return <Text style={styles.detailText}>No attachments</Text>;
                          }
                        })()}
                      </View>
                    )}
                  </>
                )}
              </>
            )}
          </ScrollView>
          
          {/* Modal Footer */}
          <View style={styles.modalFooter}>
            <TouchableOpacity style={styles.modalButton} onPress={handleCloseModal}>
              <Text style={styles.modalButtonText}>Close</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.modalButton, styles.primaryButton]}>
              <Text style={[styles.modalButtonText, styles.primaryButtonText]}>
                Add Comment
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.modalButton, styles.primaryButton]}>
              <Text style={[styles.modalButtonText, styles.primaryButtonText]}>
                Update Status
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  headerActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#F0F0F0',
    borderRadius: 8,
  },
  filterButtonText: {
    fontSize: 14,
    color: '#007AFF',
  },
  searchContainer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  searchInput: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  filtersPanel: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  filtersTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  filterGroup: {
    marginBottom: 16,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
    color: '#666',
  },
  pickerContainer: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  picker: {
    height: 50,
  },
  sortRow: {
    flexDirection: 'row',
  },
  filterActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  resetButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#F0F0F0',
    alignItems: 'center',
  },
  resetButtonText: {
    color: '#666',
    fontSize: 14,
    fontWeight: '600',
  },
  applyButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#007AFF',
    alignItems: 'center',
  },
  applyButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  listContent: {
    padding: 16,
  },
  ticketCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  ticketHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  ticketId: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  problemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  ticketFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  systemInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  systemIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  systemName: {
    fontSize: 13,
    color: '#666',
  },
  creator: {
    fontSize: 13,
    color: '#666',
  },
  metaInfo: {
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingTop: 8,
  },
  date: {
    fontSize: 11,
    color: '#999',
    marginBottom: 2,
  },
  expired: {
    color: '#FF6B6B',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: '#666',
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 16,
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    color: '#999',
    fontSize: 16,
    marginBottom: 12,
  },
  resetFiltersButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#F0F0F0',
    borderRadius: 8,
  },
  resetFiltersText: {
    color: '#007AFF',
    fontSize: 14,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    backgroundColor: '#FFFFFF',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 20,
    color: '#666',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  detailSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 4,
  },
  expiredText: {
    color: '#FF6B6B',
    fontWeight: '500',
  },
  detailStatusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  detailStatusText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  fileItem: {
    backgroundColor: '#F5F5F5',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  fileName: {
    fontSize: 14,
    color: '#007AFF',
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#F0F0F0',
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#007AFF',
  },
  modalButtonText: {
    fontSize: 16,
    color: '#666',
  },
  primaryButtonText: {
    color: '#FFFFFF',
  },
});

export default TicketScreen;

/*
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
*/