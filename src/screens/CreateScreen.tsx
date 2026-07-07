import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert, Image,
  ActivityIndicator, FlatList, KeyboardAvoidingView, Platform, StatusBar, Animated, Keyboard
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Dropdown } from '../components/Dropdown';
import ticketService from '../services/ticket.service';
import FileUploadService from '../services/file-upload.service';
import { useFileUpload } from '../hooks/useFileUpload';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, Typography, Layout, Shadows } from '../globalStyles';
import { API_URL } from '../config'

const CreateScreen: React.FC = () => {
  const [selectedSystem, setSelectedSystem] = useState<string | number>('');
  const [selectedProblem, setSelectedProblem] = useState<string | number>('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [isFileListExpanded, setIsFileListExpanded] = useState(true);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const { uploadedFiles, isUploading, uploadFile, removeFile, getFilesPathJson } = useFileUpload();
  const scrollViewRef = useRef<ScrollView>(null);
  const descriptionInputRef = useRef<TextInput>(null);

  // Fixed: previously re-created every render, which reset the animation.
  const fileListAnimation = useRef(new Animated.Value(0)).current;

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

  const handleSystemChange = (value: string | number) => {
    setSelectedSystem(value);
    setSelectedProblem('');
  };

  const handleProblemChange = (value: string | number) => {
    setSelectedProblem(value);
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

      await ticketService.createTicket({
        SystemId: selectedSystem,
        ProblemId: selectedProblem,
        Description: description,
        FilesPath: filesPathJson || '',
        LastActionId: '1',
        StatusId: '1',
      });

      Alert.alert('Success', 'Ticket created successfully');

      // Reset form
      setSelectedSystem('');
      setSelectedProblem('');
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
          source={{ uri: item.temporaryFile?.TemporaryFile ? `${API_URL}/${item.temporaryFile.TemporaryFile}` : undefined }}
          style={styles.filePreview}
        />
      ) : (
        <View style={styles.fileIcon}>
          <Icon name="insert-drive-file" size={22} color={Colors.primary} />
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
        <ActivityIndicator size="small" color={Colors.primary} />
      ) : (
        <TouchableOpacity onPress={() => removeFile(item.originalName)} style={styles.removeButton}>
          <Icon name="close" size={16} color={Colors.white} />
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <SafeAreaView style={Layout.safeArea}>
      <StatusBar barStyle="light-content" />

      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <View style={styles.fixedHeader}>
          <Text style={Typography.headerTitle}>New ticket</Text>

          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${getProgress()}%` }]} />
            </View>
            <View style={styles.progressTextContainer}>
              <Text style={styles.progressText}>
                {getProgress() === 100 ? 'Ready to submit' : `${getProgress()}% complete`}
              </Text>
              <Text style={styles.progressHint}>
                {getProgress() === 100
                  ? 'All set!'
                  : getProgress() < 66
                    ? 'Select a system and problem'
                    : 'Almost there'}
              </Text>
            </View>
          </View>
        </View>

        <ScrollView
          ref={scrollViewRef}
          style={Layout.container}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
        >
          <View style={styles.content}>
            <Text style={styles.sectionEyebrow}>Details</Text>
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
                parentFilterField="SystemId"
                disabled={!selectedSystem}
              />
            </View>

            <View style={styles.inputContainer}>
              <View style={styles.labelRow}>
                <Text style={styles.inputLabel}>Description</Text>
                {description.length > 0 && (
                  <TouchableOpacity onPress={() => setDescription('')} style={styles.clearDescriptionButton}>
                    <Text style={styles.clearDescriptionText}>Clear</Text>
                  </TouchableOpacity>
                )}
              </View>
              <TextInput
                ref={descriptionInputRef}
                style={styles.textArea}
                multiline
                numberOfLines={4}
                value={description}
                onChangeText={setDescription}
                onFocus={handleDescriptionFocus}
                placeholder="Provide additional details about the problem..."
                placeholderTextColor={Colors.secondary}
                textAlignVertical="top"
                returnKeyType="done"
              />
              <Text style={styles.characterCount}>{description.length} characters</Text>
            </View>

            <View style={styles.attachmentSection}>
              <Text style={styles.sectionEyebrow}>Attachments</Text>
              <Text style={[Typography.caption, { marginBottom: Spacing.md }]}>
                Add images, documents, or take photos to provide more context
              </Text>

              <View style={styles.buttonRow}>
                <TouchableOpacity style={styles.attachmentButton} onPress={handlePickImage} activeOpacity={0.7}>
                  <Icon name="image" size={20} color={Colors.primary} />
                  <Text style={styles.attachmentButtonText}>Image</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.attachmentButton} onPress={handleTakePhoto} activeOpacity={0.7}>
                  <Icon name="photo-camera" size={20} color={Colors.primary} />
                  <Text style={styles.attachmentButtonText}>Camera</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.attachmentButton} onPress={handlePickDocument} activeOpacity={0.7}>
                  <Icon name="attach-file" size={20} color={Colors.primary} />
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
                    <Text style={styles.fileListTitle}>Uploaded files ({uploadedFiles.length})</Text>
                    <Icon
                      name={isFileListExpanded ? 'expand-less' : 'expand-more'}
                      size={22}
                      color={Colors.secondary}
                    />
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
                  <Icon name="attach-file" size={32} color={Colors.secondary} style={{ opacity: 0.5 }} />
                  <Text style={styles.emptyFilesText}>No files attached yet</Text>
                  <Text style={styles.emptyFilesSubtext}>
                    Use the buttons above to add images or documents
                  </Text>
                </View>
              )}

              {isUploading && (
                <View style={styles.uploadingContainer}>
                  <ActivityIndicator size="small" color={Colors.primary} />
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
              <ActivityIndicator size="small" color={Colors.white} />
            ) : (
              <Text style={styles.submitButtonText}>
                Create ticket
              </Text>
            )}
          </TouchableOpacity>
          {/* {getProgress() < 66 && getProgress() > 0 && (
            <Text style={styles.submitHint}>
              Complete the required fields (system & problem) to continue
            </Text>
          )} */}
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
    backgroundColor: Colors.primary,
    paddingTop: Platform.OS === 'ios' ? 0 : Spacing.sm,
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    zIndex: 10,
  },
  progressContainer: {
    marginTop: Spacing.md,
  },
  progressBar: {
    height: 6,
    backgroundColor: Colors.lightGray,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primaryMuted,
    borderRadius: 3,
  },
  progressTextContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  progressText: {
    fontSize: 13,
    color: Colors.primaryTint,
    fontWeight: '600',
  },
  progressHint: {
    fontSize: 12,
    color: Colors.primaryTint,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xl,
  },
  sectionEyebrow: {
    ...Typography.eyebrow,
    marginBottom: Spacing.md,
  },
  dropdownContainer: {
    marginBottom: Spacing.lg,
  },
  inputContainer: {
    marginBottom: Spacing.xl,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  clearDescriptionButton: {
    zIndex: 1,
  },
  clearDescriptionText: {
    fontSize: 13,
    color: Colors.primary,
    fontWeight: '500',
  },
  textArea: {
    backgroundColor: Colors.white,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: Spacing.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    fontSize: 16,
    color: Colors.text,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  characterCount: {
    fontSize: 11,
    color: Colors.secondary,
    marginTop: Spacing.xs,
    textAlign: 'right',
  },
  attachmentSection: {
    marginTop: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.lg,
    gap: Spacing.md,
  },
  attachmentButton: {
    backgroundColor: Colors.white,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: Spacing.md,
    flex: 1,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.card,
  },
  attachmentButtonText: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  fileSection: {
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  fileSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  fileListTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  fileList: {
    marginTop: Spacing.sm,
  },
  fileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    padding: Spacing.md,
    borderRadius: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filePreview: {
    width: 44,
    height: 44,
    borderRadius: Spacing.sm,
    marginRight: Spacing.md,
  },
  fileIcon: {
    width: 44,
    height: 44,
    borderRadius: Spacing.sm,
    marginRight: Spacing.md,
    backgroundColor: Colors.primaryTint,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fileInfo: {
    flex: 1,
  },
  fileName: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text,
    marginBottom: 2,
  },
  fileSize: {
    fontSize: 12,
    color: Colors.secondary,
  },
  removeButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.danger,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyFilesContainer: {
    alignItems: 'center',
    paddingVertical: Spacing.xxxl,
    backgroundColor: Colors.white,
    borderRadius: Spacing.md,
    marginTop: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    borderStyle: 'dashed',
  },
  emptyFilesText: {
    fontSize: 15,
    color: Colors.secondary,
    fontWeight: '500',
    marginTop: Spacing.md,
    marginBottom: Spacing.xs,
  },
  emptyFilesSubtext: {
    fontSize: 13,
    color: Colors.secondary,
    textAlign: 'center',
    paddingHorizontal: Spacing.xl,
  },
  uploadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.lg,
    gap: Spacing.md,
  },
  uploadingText: {
    fontSize: 14,
    color: Colors.secondary,
    fontWeight: '500',
  },
  stickyButtonContainer: {
    backgroundColor: Colors.background,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 8,
  },
  stickyButtonContainerWithKeyboard: {
    paddingBottom: Platform.OS === 'ios' ? Spacing.xl : Spacing.md,
  },
  submitButton: {
    backgroundColor: Colors.primary,
    borderRadius: Spacing.md,
    paddingVertical: Spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
    minHeight: 56,
    marginBottom: 60,
  },
  submitButtonDisabled: {
    backgroundColor: Colors.secondary,
    shadowOpacity: 0,
  },
  submitButtonIncomplete: {
    backgroundColor: Colors.primaryMuted,
    shadowOpacity: 0.1,
  },
  submitButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
  submitHint: {
    fontSize: 12,
    color: Colors.secondary,
    textAlign: 'center',
    marginTop: Spacing.sm,
  },
  bottomPadding: {
    height: Spacing.xl,
  },
});

export default CreateScreen;
