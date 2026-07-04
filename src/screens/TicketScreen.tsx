import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator,
  RefreshControl, TextInput, Modal, ScrollView, Alert, StatusBar, Platform
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import ticketService from '../services/ticket.service';
import { Ticket } from '../types/ticket.types';
import { Dropdown } from '../components/Dropdown';
import LinearGradient from 'react-native-linear-gradient';

const TicketScreen: React.FC = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);

  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [filters, setFilters] = useState({
    statusId: '' as string | number,
    systemId: '' as string | number,
    problemId: '',
    sortBy: 'DateCreated',
    sortOrder: 'DESC' as 'ASC' | 'DESC',
    take: 100
  });

  const [tempFilters, setTempFilters] = useState(filters);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [ticketDetails, setTicketDetails] = useState<any>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchBarVisible, setIsSearchBarVisible] = useState(false);
  const scrollY = useRef(0);

  useEffect(() => {
    fetchTickets();
  }, [filters.statusId, filters.systemId, filters.problemId, filters.sortBy, filters.sortOrder]);

  const fetchTickets = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    setError(null);

    try {
      const response = await ticketService.getTicketList({
        statusId: filters.statusId.toString(),
        systemId: filters.systemId.toString(),
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

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchTickets(false);
    setRefreshing(false);
  }, [filters]);

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

  const handleTicketPress = async (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setModalVisible(true);
    await fetchTicketDetails(ticket.Id);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setSelectedTicket(null);
    setTicketDetails(null);
  };

  const openFilterModal = () => {
    setTempFilters(filters);
    setFilterModalVisible(true);
  };

  const applyFilters = () => {
    setFilters(tempFilters);
    setFilterModalVisible(false);
    fetchTickets();
  };

  const resetFilters = () => {
    const resetValues = {
      statusId: '',
      systemId: '',
      problemId: '',
      sortBy: 'DateCreated',
      sortOrder: 'DESC' as const,
      take: 100
    };
    setTempFilters(resetValues);
    setFilters(resetValues);
    setFilterModalVisible(false);
  };

  const handleScroll = (event: any) => {
    const currentScrollY = event.nativeEvent.contentOffset.y;
    scrollY.current = currentScrollY;
    const threshold = 50;
    setIsSearchBarVisible(currentScrollY > threshold);
  };

  const filteredTickets = tickets.filter(ticket =>
    searchQuery === '' ||
    ticket.ProblemName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ticket.SystemName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ticket.CreatorUsername?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ticket.Id.toString().includes(searchQuery)
  );

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
      <StatusBar barStyle="dark-content" backgroundColor="#007AFF" />

      <LinearGradient
        colors={['#007AFF', '#F3F4F6', '#F9FAFC', '#FFFFFF']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.3, y: 1 }}
        style={styles.gradient}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Tickets</Text>
          {/* <View style={styles.headerActions}> */}
          <Text style={styles.headerSubtitle}>Total: {totalCount} tickets</Text>
          <View style={styles.iconButtons}>
            <TouchableOpacity style={styles.iconButton} onPress={openFilterModal}>
              <Text style={styles.iconButtonText}>🔍</Text>
            </TouchableOpacity>
          </View>
          {/* </View> */}
        </View>

        {isSearchBarVisible && (
          <View style={styles.stickySearchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search by ID, problem, system, or creator..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#999"
              autoFocus={false}
            />
          </View>
        )}

        <Modal
          animationType="slide"
          transparent={true}
          visible={filterModalVisible}
          onRequestClose={() => setFilterModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.filterModalContainer}>
              <View style={styles.filterModalHeader}>
                <Text style={styles.filterModalTitle}>Filter Tickets</Text>
                <TouchableOpacity onPress={() => setFilterModalVisible(false)}>
                  <Text style={styles.closeModalText}>✕</Text>
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.filterModalContent}>
                <View style={styles.filterGroup}>
                  <Dropdown
                    cacheKey="workflow_status"
                    url="DynamicData/Lookup.Workflow.Status"
                    selectedValue={tempFilters.statusId}
                    onValueChange={(value) => setTempFilters({ ...tempFilters, statusId: value })}
                    label="Status"
                    placeholder="Select a status"
                    required={false}
                    parentValue={''}
                    parentFilterField={''}
                  />
                </View>

                <View style={styles.filterGroup}>
                  <Dropdown
                    cacheKey="ticket_systems"
                    url="DynamicData/Lookup.Ticket.System?v=639147054752297896"
                    selectedValue={tempFilters.systemId}
                    onValueChange={(value) => setTempFilters({ ...tempFilters, systemId: value })}
                    label="System"
                    placeholder="Select a system"
                    required={false}
                    parentValue={''}
                    parentFilterField={''}
                  />
                </View>

                <View style={styles.filterGroup}>
                  <Text style={styles.filterLabel}>Sort By</Text>
                  <View style={styles.sortRow}>
                    <View style={[styles.pickerContainer, { flex: 4, marginRight: 8 }]}>
                      <Picker
                        selectedValue={tempFilters.sortBy}
                        onValueChange={(value) => setTempFilters({ ...tempFilters, sortBy: value })}
                        style={styles.picker}
                      >
                        <Picker.Item label="Date Created" value="DateCreated" />
                        <Picker.Item label="Expire Date" value="ExpireDate" />
                        <Picker.Item label="Status" value="StatusName" />
                      </Picker>
                    </View>
                    <View style={[styles.pickerContainer, { flex: 3 }]}>
                      <Picker
                        selectedValue={tempFilters.sortOrder}
                        onValueChange={(value) => setTempFilters({ ...tempFilters, sortOrder: value })}
                        style={styles.picker}
                      >
                        <Picker.Item label="Newest" value="DESC" />
                        <Picker.Item label="Oldest" value="ASC" />
                      </Picker>
                    </View>
                  </View>
                </View>
              </ScrollView>

              <View style={styles.filterModalActions}>
                <TouchableOpacity style={styles.resetButton} onPress={resetFilters}>
                  <Text style={styles.resetButtonText}>Reset</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.applyButton} onPress={applyFilters}>
                  <Text style={styles.applyButtonText}>Apply Filters</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View >
        </Modal >

        {/* Ticket List */}
        {
          error ? (
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
              refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.listContent}
              onScroll={handleScroll}
              scrollEventThrottle={16}
              ListEmptyComponent={() => (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>No tickets found</Text>
                  <TouchableOpacity style={styles.resetFiltersButton} onPress={resetFilters}>
                    <Text style={styles.resetFiltersText}>Reset Filters</Text>
                  </TouchableOpacity>
                </View>
              )}
            />
          )
        }

        {/* Ticket Details Modal */}
        <Modal
          animationType="slide"
          transparent={false}
          visible={modalVisible}
          onRequestClose={handleCloseModal}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Ticket #{selectedTicket?.Id}</Text>
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

                      {ticketDetails && ticketDetails.Entity && (
                        <View style={styles.detailSection}>
                          <Text style={styles.sectionTitle}>Description</Text>
                          <Text style={styles.detailText}>
                            {ticketDetails.Entity.Description || 'No description available'}
                          </Text>
                        </View>
                      )}

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
                                  onPress={() => Alert.alert('File', `Download: ${file.OriginalName}`)}
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

            <View style={styles.modalFooter}>
              <TouchableOpacity style={[styles.modalButton, styles.primaryButton]}>
                <Text style={[styles.modalButtonText, styles.primaryButtonText]}>Add Comment</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalButton, styles.primaryButton]}>
                <Text style={[styles.modalButtonText, styles.primaryButtonText]}>Update Status</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

      </LinearGradient>
    </View >
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    //backgroundColor: '#F5F5F5',
  },
  gradient: {
    flex: 1,
  },
  header: {
    //backgroundColor: '#FFFFFF',
    padding: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 50,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
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
  iconButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  iconButton: {
    paddingHorizontal: 8,
  },
  iconButtonText: {
    fontSize: 20,
  },
  stickySearchContainer: {
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
  // Filter Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterModalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    width: '90%',
    maxHeight: '80%',
    padding: 20,
  },
  filterModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  filterModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  closeModalText: {
    fontSize: 20,
    color: '#666',
  },
  filterModalContent: {
    maxHeight: '75%',
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
  filterModalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
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