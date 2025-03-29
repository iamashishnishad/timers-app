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
          setHistory(JSON.parse(savedHistory));
        }
      } catch (error) {
        console.error('Error loading history:', error);
      }
    };
    loadHistory();
  }, []);

  const renderHistoryItem = ({ item }: { item: HistoryEntry }) => (
    <View style={styles.historyItem}>
      <Text>
        {item.name} - Completed: {new Date(item.completionTime).toLocaleString()}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Timer History</Text>
      {history.length === 0 ? (
        <Text>No completed timers yet!</Text>
      ) : (
        <FlatList
          data={history}
          renderItem={renderHistoryItem}
          keyExtractor={(item) => item.id}
          style={styles.list}
        />
      )}
      <Button title="Back to Home" onPress={() => navigation.goBack()} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
  list: { flex: 1 },
  historyItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderColor: '#ccc',
  },
});

export default HistoryScreen;