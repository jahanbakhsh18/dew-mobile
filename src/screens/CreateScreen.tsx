import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert } from 'react-native';
import { Dropdown } from '../components/Dropdown';
import { useAuth } from '../contexts/AuthContext';
import { CreateTicketRequest } from '../types/ticket.types';
import ticketService from '../services/ticketService';

const CreateScreen: React.FC = () => {
  const { user } = useAuth();
  const [selectedSystem, setSelectedSystem] = useState<string | number>('');
  const [selectedSystemData, setSelectedSystemData] = useState<any>(null);
  const [selectedProblem, setSelectedProblem] = useState<string | number>('');
  const [selectedProblemData, setSelectedProblemData] = useState<any>(null);
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

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

  const handleSubmit = async () => {
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
      const response = await ticketService.createTicket({
        SystemId: selectedSystem,
        ProblemId: selectedProblem,
        Description: description,
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

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Create New Ticket</Text>

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

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Description (Optional)</Text>
          <TextInput
            style={styles.textArea}
            multiline
            numberOfLines={4}
            value={description}
            onChangeText={setDescription}
            placeholder="Provide additional details about the problem..."
            placeholderTextColor="#9ca3af"
            textAlignVertical="top"
          />
        </View>

        <TouchableOpacity
          style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={submitting}
        >
          <Text style={styles.submitButtonText}>
            {submitting ? 'Creating Ticket...' : 'Create Ticket'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  content: {
    marginTop: 50,
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 24,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
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
  submitButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonDisabled: {
    backgroundColor: '#9ca3af',
    shadowOpacity: 0,
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default CreateScreen;

/*
import { useState } from 'react';
import { View } from 'react-native';
import FloatingLabelInput from '../components/FloatingLabelInput';
import { SafeAreaView } from 'react-native-safe-area-context';

const App = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ padding: 20 }}>
        <FloatingLabelInput
          label="Full Name"
          value={name}
          onChangeText={setName}
        />
        
        <FloatingLabelInput
          label="Email Address"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        
        <FloatingLabelInput
          label="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
      </View>
    </SafeAreaView>
  );
};

export default App;
*/