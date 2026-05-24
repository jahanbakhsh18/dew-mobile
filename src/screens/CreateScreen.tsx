import React, { useState, useEffect, useRef } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert, Image, 
  ActivityIndicator, FlatList, KeyboardAvoidingView, Platform, StatusBar, Animated, Keyboard
} from 'react-native';
import { Dropdown } from '../components/Dropdown';
import ticketService from '../services/ticket.service';
import FileUploadService from '../services/file-upload.service';
import { useFileUpload } from '../hooks/useFileUpload';
import { SafeAreaView } from 'react-native-safe-area-context';
import gs from '../globalStyles';

const CreateScreen: React.FC = () => {
  const [selectedSystem, setSelectedSystem] = useState<string | number>('');
  const [selectedSystemData, setSelectedSystemData] = useState<any>(null);
  const [selectedProblem, setSelectedProblem] = useState<string | number>('');
  const [selectedProblemData, setSelectedProblemData] = useState<any>(null);
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [isFileListExpanded, setIsFileListExpanded] = useState(true);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const { uploadedFiles, isUploading, uploadFile, removeFile, getFilesPathJson } = useFileUpload();
  const scrollViewRef = useRef<ScrollView>(null);
  const descriptionInputRef = useRef<TextInput>(null);
  
  const fileListAnimation = new Animated.Value(0);

  useEffect(() => {
    Animated.spring(fileListAnimation, {
      toValue: uploadedFiles.length,
      friction: 8,
      tension: 40,
      useNativeDriver: true,
    }).start();
  }, [uploadedFiles.length]);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => {
      setKeyboardVisible(true);
    });
    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardVisible(false);
    });

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  const handleSystemChange = (value: string | number, item?: any) => {
    setSelectedSystem(value);
    setSelectedSystemData(item);
    setSelectedProblem('');
    setSelectedProblemData(null);
  };

  const handleProblemChange = (value: string | number, item?: any) => {
    setSelectedProblem(value);
    setSelectedProblemData(item);
  };

  const handlePickImage = async () => {
    Keyboard.dismiss();
    const image = await FileUploadService.pickImage();
    if (image) {
      await uploadFile(image);
    }
  };

  const handlePickDocument = async () => {
    Keyboard.dismiss();
    const file = await FileUploadService.pickFile();
    if (file) {
      await uploadFile(file);
    }
  };

  const handleTakePhoto = async () => {
    Keyboard.dismiss();
    const photo = await FileUploadService.takePhoto();
    if (photo) {
      await uploadFile(photo);
    }
  };

  const getProgress = () => {
    let progress = 0;
    if (selectedSystem) progress += 33;
    if (selectedProblem) progress += 33;
    if (description && description.trim().length > 0) progress += 17;
    if (uploadedFiles.length > 0) progress += 17;
    return progress;
  };

  const handleSubmit = async () => {
    Keyboard.dismiss();
    
    if (!selectedSystem) {
      Alert.alert('Error', 'Please select a system');
      return;
    }

    if (!selectedProblem) {
      Alert.alert('Error', 'Please select a problem');
      return;
    }

    setSubmitting(true);
    try {
      const filesPathJson = getFilesPathJson();
      console.log('filesPathJson', filesPathJson);

      const response = await ticketService.createTicket({
        SystemId: selectedSystem,
        ProblemId: selectedProblem,
        Description: description,
        FilesPath: filesPathJson || '',
        LastActionId: "1",
        StatusId: "1"
      });

      console.log('Submitting ticket:', response);
      Alert.alert('Success', 'Ticket created successfully');

      // Reset form
      setSelectedSystem('');
      setSelectedSystemData(null);
      setSelectedProblem('');
      setSelectedProblemData(null);
      setDescription('');

    } catch (error) {
      Alert.alert('Error', 'Failed to create ticket');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDescriptionFocus = () => {
    setTimeout(() => {
      scrollViewRef.current?.scrollTo({
        y: 280,
        animated: true
      });
    }, 100);
  };

  const renderFileItem = ({ item }: { item: any }) => (
    <View style={styles.fileItem}>
      {item.temporaryFile?.IsImage ? (
        <Image
          source={{ uri: item.temporaryFile?.TemporaryFile ? `http://10.238.249.122:5000/${item.temporaryFile.TemporaryFile}` : undefined }}
          style={styles.filePreview}
        />
      ) : (
        <View style={styles.fileIcon}>
          <Text style={styles.fileIconText}>📄</Text>
        </View>
      )}
      <View style={styles.fileInfo}>
        <Text style={styles.fileName} numberOfLines={1}>
          {item.originalName}
        </Text>
        <Text style={styles.fileSize}>
          {item.temporaryFile?.Size ? (item.temporaryFile.Size / 1024).toFixed(2) : '0'} KB
        </Text>
      </View>
      {item.uploading ? (
        <ActivityIndicator size="small" color="#007AFF" />
      ) : (
        <TouchableOpacity onPress={() => removeFile(item.originalName)} style={styles.removeButton}>
          <Text style={styles.removeButtonText}>✕</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <SafeAreaView style={gs.Layout.safeArea}>
      <StatusBar 
        barStyle="dark-content" 
        backgroundColor="#f8fafc"
        translucent={false}
      />
      
      <KeyboardAvoidingView 
        style={styles.keyboardAvoidingView} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <View style={styles.fixedHeader}>
          <Text style={styles.headerTitle}>Create New Ticket</Text>
          
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${getProgress()}%` }]} />
            </View>
            <View style={styles.progressTextContainer}>
              <Text style={styles.progressText}>
                {getProgress() === 100 ? '✓ Complete' : `${getProgress()}% Complete`}
              </Text>
              <Text style={styles.progressHint}>
                {getProgress() === 100 
                  ? 'Ready to submit!' 
                  : getProgress() < 66 
                    ? 'Please select system and problem' 
                    : 'Almost there!'}
              </Text>
            </View>
          </View>
        </View>

        <ScrollView 
          ref={scrollViewRef}
          style={styles.container}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          scrollEnabled={true}
          keyboardDismissMode="interactive"
        >
          <View style={styles.content}>
            <View style={styles.dropdownContainer}>
              <Dropdown
                cacheKey="ticket_systems"
                url="DynamicData/Lookup.Ticket.System?v=639147054752297896"
                selectedValue={selectedSystem}
                onValueChange={handleSystemChange}
                label="System"
                placeholder="Select a system"
                required
                parentValue={''}
                parentFilterField={''}
              />
            </View>

            <View style={styles.dropdownContainer}>
              <Dropdown
                cacheKey="ticket_problems"
                url="DynamicData/Lookup.Ticket.Problem?v=639147054752297833"
                selectedValue={selectedProblem}
                onValueChange={handleProblemChange}
                label="Problem"
                placeholder="Select a problem"
                required
                parentValue={selectedSystem}
                parentFilterField='SystemId'
                disabled={!selectedSystem}
              />
            </View>

            <View style={styles.inputContainer}>
              <View style={styles.labelRow}>
                <Text style={styles.inputLabel}>Description</Text>
                <Text style={styles.optionalLabel}>Optional</Text>
              </View>
              {description.length > 0 && (
                <TouchableOpacity 
                  onPress={() => setDescription('')} 
                  style={styles.clearDescriptionButton}
                >
                  <Text style={styles.clearDescriptionText}>Clear</Text>
                </TouchableOpacity>
              )}
              <TextInput
                ref={descriptionInputRef}
                style={styles.textArea}
                multiline
                numberOfLines={4}
                value={description}
                onChangeText={setDescription}
                onFocus={handleDescriptionFocus}
                placeholder="Provide additional details about the problem..."
                placeholderTextColor="#9ca3af"
                textAlignVertical="top"
                returnKeyType="done"
                blurOnSubmit={true}
              />
              <Text style={styles.characterCount}>
                {description.length} characters
              </Text>
            </View>

            <View style={styles.attachmentSection}>
              <Text style={styles.label}>Attachments</Text>
              <Text style={styles.labelSubtext}>
                Add images, documents, or take photos to provide more context
              </Text>

              <View style={styles.buttonRow}>
                <TouchableOpacity 
                  style={styles.attachmentButton} 
                  onPress={handlePickImage}
                  activeOpacity={0.7}
                >
                  <Text style={styles.attachmentButtonIcon}>🖼️</Text>
                  <Text style={styles.attachmentButtonText}>Image</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.attachmentButton} 
                  onPress={handleTakePhoto}
                  activeOpacity={0.7}
                >
                  <Text style={styles.attachmentButtonIcon}>📸</Text>
                  <Text style={styles.attachmentButtonText}>Camera</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.attachmentButton} 
                  onPress={handlePickDocument}
                  activeOpacity={0.7}
                >
                  <Text style={styles.attachmentButtonIcon}>📎</Text>
                  <Text style={styles.attachmentButtonText}>File</Text>
                </TouchableOpacity>
              </View>

              {uploadedFiles.length > 0 && (
                <Animated.View 
                  style={[
                    styles.fileSection,
                    {
                      opacity: fileListAnimation.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, 1]
                      })
                    }
                  ]}
                >
                  <TouchableOpacity 
                    style={styles.fileSectionHeader}
                    onPress={() => setIsFileListExpanded(!isFileListExpanded)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.fileListTitle}>
                      Uploaded Files ({uploadedFiles.length})
                    </Text>
                    <Text style={styles.expandIcon}>
                      {isFileListExpanded ? '▼' : '▶'}
                    </Text>
                  </TouchableOpacity>
                  
                  {isFileListExpanded && (
                    <View style={styles.fileList}>
                      <FlatList
                        data={uploadedFiles}
                        renderItem={renderFileItem}
                        keyExtractor={(item, index) => `${item.originalName}-${index}`}
                        scrollEnabled={false}
                      />
                    </View>
                  )}
                </Animated.View>
              )}

              {uploadedFiles.length === 0 && !isUploading && (
                <View style={styles.emptyFilesContainer}>
                  <Text style={styles.emptyFilesIcon}>📎</Text>
                  <Text style={styles.emptyFilesText}>No files attached yet</Text>
                  <Text style={styles.emptyFilesSubtext}>
                    Use the buttons above to add images or documents
                  </Text>
                </View>
              )}

              {isUploading && (
                <View style={styles.uploadingContainer}>
                  <ActivityIndicator size="small" color="#007AFF" />
                  <Text style={styles.uploadingText}>Uploading file...</Text>
                </View>
              )}
            </View>
            <View style={styles.bottomPadding} />
          </View>
        </ScrollView>

        <View style={[
          styles.stickyButtonContainer,
          keyboardVisible && styles.stickyButtonContainerWithKeyboard
        ]}>
          <TouchableOpacity
            style={[
              styles.submitButton, 
              submitting && styles.submitButtonDisabled,
              (getProgress() < 66) && styles.submitButtonIncomplete
            ]}
            onPress={handleSubmit}
            disabled={submitting || getProgress() < 66}
            activeOpacity={0.8}
          >
            {submitting ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <Text style={styles.submitButtonText}>
                Create Ticket
              </Text>
            )}
          </TouchableOpacity>
          {getProgress() < 66 && getProgress() > 0 && (
            <Text style={styles.submitHint}>
              ⚠️ Please complete required fields (System & Problem)
            </Text>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  keyboardAvoidingView: {
    flex: 1,
  },
  fixedHeader: {
    backgroundColor: '#f8fafc',
    paddingTop: Platform.OS === 'ios' ? 0 : 8,
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    zIndex: 10,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 16,
    letterSpacing: -0.5,
  },
  progressContainer: {
    marginBottom: 4,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#e5e7eb',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 3,
  },
  progressTextContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  progressText: {
    fontSize: 13,
    color: '#374151',
    fontWeight: '600',
  },
  progressHint: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '400',
  },
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  dropdownContainer: {
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 20,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  optionalLabel: {
    fontSize: 12,
    color: '#9ca3af',
    fontWeight: '500',
  },
  clearDescriptionButton: {
    position: 'absolute',
    top: 0,
    right: 0,
    zIndex: 1,
  },
  clearDescriptionText: {
    fontSize: 13,
    color: '#007AFF',
    fontWeight: '500',
  },
  textArea: {
    backgroundColor: '#ffffff',
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#111827',
    minHeight: 100,
    textAlignVertical: 'top',
  },
  characterCount: {
    fontSize: 11,
    color: '#9ca3af',
    marginTop: 6,
    textAlign: 'right',
  },
  attachmentSection: {
    marginTop: 8,
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    color: '#374151',
  },
  labelSubtext: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    gap: 12,
  },
  attachmentButton: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    flex: 1,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  attachmentButtonIcon: {
    fontSize: 18,
  },
  attachmentButtonText: {
    color: '#374151',
    fontSize: 14,
    fontWeight: '600',
  },
  fileSection: {
    marginTop: 16,
    marginBottom: 8,
  },
  fileSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  fileListTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  expandIcon: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '600',
  },
  fileList: {
    marginTop: 8,
  },
  fileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 12,
    borderRadius: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  filePreview: {
    width: 44,
    height: 44,
    borderRadius: 8,
    marginRight: 12,
  },
  fileIcon: {
    width: 44,
    height: 44,
    borderRadius: 8,
    marginRight: 12,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fileIconText: {
    fontSize: 22,
  },
  fileInfo: {
    flex: 1,
  },
  fileName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1f2937',
    marginBottom: 2,
  },
  fileSize: {
    fontSize: 12,
    color: '#9ca3af',
  },
  removeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#ef4444',
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyFilesContainer: {
    alignItems: 'center',
    paddingVertical: 40,
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderStyle: 'dashed',
  },
  emptyFilesIcon: {
    fontSize: 48,
    marginBottom: 12,
    opacity: 0.5,
  },
  emptyFilesText: {
    fontSize: 15,
    color: '#6b7280',
    fontWeight: '500',
    marginBottom: 4,
  },
  emptyFilesSubtext: {
    fontSize: 13,
    color: '#9ca3af',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  uploadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 12,
  },
  uploadingText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  stickyButtonContainer: {
    backgroundColor: '#f8fafc',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 8,
  },
  stickyButtonContainerWithKeyboard: {
    paddingBottom: Platform.OS === 'ios' ? 20 : 12,
  },
  submitButton: {
    backgroundColor: '#007AFF',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
    minHeight: 56,
    marginBottom: 60
  },
  submitButtonDisabled: {
    backgroundColor: '#9ca3af',
    shadowOpacity: 0,
  },
  submitButtonIncomplete: {
    backgroundColor: '#93c5fd',
    shadowOpacity: 0.1,
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  submitHint: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 8,
  },
  bottomPadding: {
    height: 20,
  },
});

export default CreateScreen;