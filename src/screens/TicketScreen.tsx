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
import { 
  Colors, Spacing, Typography, Layout, Card, Input, Badge, ModalStyles,
  Header, EmptyState, Detail, Filter, Buttons, Shadows } from '../globalStyles';

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

  const filteredTickets = tickets.filter((ticket) =>
      searchQuery === '' ||
      ticket.ProblemName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.SystemName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.CreatorUsername?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.Id.toString().includes(searchQuery)
  );

  const renderTicketItem = ({ item }: { item: Ticket }) => (
    <TouchableOpacity
      style={Card.ticket}
      onPress={() => handleTicketPress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.ticketHeader}>
        <Text style={styles.ticketId}>Ticket #{item.Id}</Text>
        <View style={[Badge.default, { backgroundColor: item.TimeFlagColor || Colors.secondary }]}>
          <Text style={Badge.text}>{item.StatusName}</Text>
        </View>
      </View>

      <Text style={styles.problemName}>{item.ProblemName}</Text>

      <View style={styles.ticketFooter}>
        <View style={Layout.row}>
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
      <View style={Layout.centered}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={[Typography.body, { marginTop: Spacing.md }]}>Loading tickets...</Text>
      </View>
    );
  }

  return (
    <View style={Layout.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.primary} />
      <LinearGradient
        colors={[Colors.primary, '#F3F4F6', '#F9FAFC', Colors.white]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.3, y: 1 }}
        style={styles.gradient}
      >
        <View style={Header.container}>
          <Text style={Header.title}>Tickets</Text>
          <View style={Header.actions}>
            <Text style={Header.subtitle}>Total: {totalCount}</Text>
            <TouchableOpacity onPress={openFilterModal}>
              <Text style={styles.filterIcon}>🔍</Text>
            </TouchableOpacity>
          </View>
        </View>

        {isSearchBarVisible && (
          <View style={styles.stickySearchContainer}>
            <TextInput
              style={Input.search}
              placeholder="Search by ID, problem, system, or creator..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor={Colors.secondary}
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
          <View style={ModalStyles.overlay}>
            <View style={ModalStyles.container}>
              <View style={ModalStyles.header}>
                <Text style={Typography.headline}>Filter Tickets</Text>
                <TouchableOpacity onPress={() => setFilterModalVisible(false)} style={ModalStyles.closeButton}>
                  <Text style={ModalStyles.closeText}>✕</Text>
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.filterModalContent}>
                <View style={Filter.group}>
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

                <View style={Filter.group}>
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

                <View style={Filter.group}>
                  <Text style={Filter.label}>Sort By</Text>
                  <View style={Filter.sortRow}>
                    <View style={[Filter.pickerContainer, { flex: 4, marginRight: Spacing.sm }]}>
                      <Picker
                        selectedValue={tempFilters.sortBy}
                        onValueChange={(value) => setTempFilters({ ...tempFilters, sortBy: value })}
                        style={Filter.picker}
                      >
                        <Picker.Item label="Date Created" value="DateCreated" />
                        <Picker.Item label="Expire Date" value="ExpireDate" />
                        <Picker.Item label="Status" value="StatusName" />
                      </Picker>
                    </View>
                    <View style={[Filter.pickerContainer, { flex: 3 }]}>
                      <Picker
                        selectedValue={tempFilters.sortOrder}
                        onValueChange={(value) => setTempFilters({ ...tempFilters, sortOrder: value })}
                        style={Filter.picker}
                      >
                        <Picker.Item label="Newest" value="DESC" />
                        <Picker.Item label="Oldest" value="ASC" />
                      </Picker>
                    </View>
                  </View>
                </View>
              </ScrollView>

              <View style={Filter.actions}>
                <TouchableOpacity style={Filter.resetButton} onPress={resetFilters}>
                  <Text style={Filter.resetButtonText}>Reset</Text>
                </TouchableOpacity>
                <TouchableOpacity style={Filter.applyButton} onPress={applyFilters}>
                  <Text style={Filter.applyButtonText}>Apply Filters</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Ticket List */}
        {error ? (
          <View style={Layout.centered}>
            <Text style={[Typography.body, { color: Colors.danger, marginBottom: Spacing.md }]}>
              {error}
            </Text>
            <TouchableOpacity style={Buttons.primary} onPress={() => fetchTickets()}>
              <Text style={Typography.buttonText}>Retry</Text>
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
              <View style={EmptyState.container}>
                <Text style={EmptyState.text}>No tickets found</Text>
                <TouchableOpacity style={EmptyState.actionButton} onPress={resetFilters}>
                  <Text style={EmptyState.actionText}>Reset Filters</Text>
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
            <View style={ModalStyles.header}>
              <Text style={[Typography.headline, { fontSize: 20 }]}>Ticket #{selectedTicket?.Id}</Text>
              <TouchableOpacity onPress={handleCloseModal} style={ModalStyles.closeButton}>
                <Text style={ModalStyles.closeText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent}>
              {detailsLoading ? (
                <View style={Layout.centered}>
                  <ActivityIndicator size="large" color={Colors.primary} />
                  <Text style={[Typography.body, { marginTop: Spacing.md }]}>Loading details...</Text>
                </View>
              ) : (
                selectedTicket && (
                  <>
                    <View style={Detail.section}>
                      <Text style={Detail.sectionTitle}>Status</Text>
                      <View style={[Badge.default, { backgroundColor: selectedTicket.TimeFlagColor || Colors.secondary }]}>
                        <Text style={Badge.text}>{selectedTicket.StatusName}</Text>
                      </View>
                    </View>

                    <View style={Detail.section}>
                      <Text style={Detail.sectionTitle}>Problem</Text>
                      <Text style={Detail.text}>{selectedTicket.ProblemName}</Text>
                    </View>

                    <View style={Detail.section}>
                      <Text style={Detail.sectionTitle}>System</Text>
                      <Text style={Detail.text}>{selectedTicket.SystemName}</Text>
                    </View>

                    <View style={Detail.section}>
                      <Text style={Detail.sectionTitle}>Created By</Text>
                      <Text style={Detail.text}>{selectedTicket.CreatorUsername}</Text>
                    </View>

                    <View style={Detail.section}>
                      <Text style={Detail.sectionTitle}>Timeline</Text>
                      <Text style={Detail.text}>
                        🕐 Created: {new Date(selectedTicket.DateCreated).toLocaleString()}
                      </Text>
                      {selectedTicket.DateUpdated && (
                        <Text style={Detail.text}>
                          🔄 Updated: {new Date(selectedTicket.DateUpdated).toLocaleString()}
                        </Text>
                      )}
                      {selectedTicket.ExpireDate && (
                        <Text
                          style={[
                            Detail.text,
                            new Date(selectedTicket.ExpireDate) < new Date() && Detail.expiredText,
                          ]}
                        >
                          ⏰ Expires: {new Date(selectedTicket.ExpireDate).toLocaleString()}
                        </Text>
                      )}
                      {selectedTicket.DateClosed && (
                        <Text style={Detail.text}>
                          ✅ Closed: {new Date(selectedTicket.DateClosed).toLocaleString()}
                        </Text>
                      )}
                    </View>

                    {ticketDetails?.Entity && (
                      <>
                        <View style={Detail.section}>
                          <Text style={Detail.sectionTitle}>Description</Text>
                          <Text style={Detail.text}>
                            {ticketDetails.Entity.Description || 'No description available'}
                          </Text>
                        </View>

                        {ticketDetails.Entity.FilesPath && (
                          <View style={Detail.section}>
                            <Text style={Detail.sectionTitle}>Attachments</Text>
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
                                return <Text style={Detail.text}>No attachments</Text>;
                              }
                            })()}
                          </View>
                        )}
                      </>
                    )}
                  </>
                )
              )}
            </ScrollView>

            <View style={ModalStyles.footer}>
              <TouchableOpacity style={[ModalStyles.button, ModalStyles.primaryButton]}>
                <Text style={[ModalStyles.buttonText, ModalStyles.primaryButtonText]}>Add Comment</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[ModalStyles.button, ModalStyles.primaryButton]}>
                <Text style={[ModalStyles.buttonText, ModalStyles.primaryButtonText]}>Update Status</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  stickySearchContainer: {
    backgroundColor: Colors.white,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  filterIcon: {
    fontSize: 20,
    paddingHorizontal: Spacing.sm,
  },
  filterModalContent: {
    maxHeight: '75%',
  },
  ticketHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  ticketId: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  problemName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  ticketFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  systemIcon: {
    fontSize: 14,
    marginRight: Spacing.xs,
  },
  systemName: {
    fontSize: 13,
    color: Colors.secondary,
  },
  creator: {
    fontSize: 13,
    color: Colors.secondary,
  },
  metaInfo: {
    borderTopWidth: 1,
    borderTopColor: Colors.lightGray,
    paddingTop: Spacing.sm,
  },
  date: {
    fontSize: 11,
    color: Colors.secondary,
    marginBottom: 2,
  },
  expired: {
    color: Colors.danger,
  },
  listContent: {
    padding: Spacing.lg,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  modalContent: {
    flex: 1,
    padding: Spacing.xl,
  },
  fileItem: {
    backgroundColor: Colors.lightGray,
    padding: Spacing.md,
    borderRadius: 8,
    marginBottom: Spacing.sm,
  },
  fileName: {
    fontSize: 14,
    color: Colors.primary,
  },
});

export default TicketScreen;