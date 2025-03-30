import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, FlatList } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Define the history entry type
interface HistoryEntry {
  id: string;
  name: string;
  completionTime: string;
}

// Define navigation prop type
type HistoryScreenNavigationProp = StackNavigationProp<{ Home: undefined }>;

interface Props {
  navigation: HistoryScreenNavigationProp;
}

const HistoryScreen: React.FC<Props> = ({ navigation }) => {
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  // Load history from AsyncStorage on mount
  useEffect(() => {
    const loadHistory = async () => {
      try {
        const savedHistory = await AsyncStorage.getItem('history');
        if (savedHistory) {
          const parsedHistory: HistoryEntry[] = JSON.parse(savedHistory);
          // Ensure uniqueness by filtering duplicates based on id
          const uniqueHistory = parsedHistory.reduce((acc, current) => {
            const x = acc.find((item) => item.id === current.id);
            if (!x) {
              return acc.concat([current]);
            }
            return acc;
          }, [] as HistoryEntry[]);
          setHistory(uniqueHistory);
        }
      } catch (error) {
        console.error('Error loading history:', error);
      }
    };
    loadHistory();
  }, []);

  const renderHistoryItem = ({ item }: { item: HistoryEntry }) => (
    <View style={styles.historyItem}>
      <Text style={styles.historyText}>
        {item.name} - Completed: {new Date(item.completionTime).toLocaleString()}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Timer History</Text>
      {history.length === 0 ? (
        <Text style={styles.emptyText}>No completed timers yet!</Text>
      ) : (
        <FlatList
          data={history}
          renderItem={renderHistoryItem}
          keyExtractor={(item, index) => `${item.id}-${index}`} // Combine id with index for uniqueness
          style={styles.list}
        />
      )}
      <Button title="Back to Home" onPress={() => navigation.goBack()} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff', // Default light background
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#000',
  },
  list: {
    flex: 1,
  },
  historyItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderColor: '#ccc',
  },
  historyText: {
    color: '#000',
  },
  emptyText: {
    color: '#666',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
});

export default HistoryScreen;