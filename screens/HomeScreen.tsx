import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Switch,
  ScrollView,
  Alert,
  Appearance,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Clipboard from '@react-native-clipboard/clipboard';


// Define the timer type
interface Timer {
  id: string;
  name: string;
  duration: number;
  remaining: number;
  category: string;
  status: 'Running' | 'Paused' | 'Completed';
  halfwayAlert: boolean;
}

// Define the history entry type
interface HistoryEntry {
  id: string;
  name: string;
  completionTime: string;
}

// Define navigation prop type
type HomeScreenNavigationProp = StackNavigationProp<{ History: undefined }>;

interface Props {
  navigation: HomeScreenNavigationProp;
}

const HomeScreen1: React.FC<Props> = ({ navigation }) => {
  const [timers, setTimers] = useState<Timer[]>([]);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [name, setName] = useState<string>('');
  const [duration, setDuration] = useState<string>('');
  const [category, setCategory] = useState<string>('');
  const [halfwayAlert, setHalfwayAlert] = useState<boolean>(false);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set()
  );
  const [completedTimer, setCompletedTimer] = useState<Timer | null>(null);
  const [halfwayTimer, setHalfwayTimer] = useState<Timer | null>(null);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [halfwayModalVisible, setHalfwayModalVisible] =
    useState<boolean>(false);
  const [theme, setTheme] = useState<'light' | 'dark'>(
    Appearance.getColorScheme() === 'dark' ? 'dark' : 'light'
  );
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<
    string | null
  >(null);

  // Load timers and history from AsyncStorage on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const savedTimers = await AsyncStorage.getItem('timers');
        if (savedTimers) {
          setTimers(JSON.parse(savedTimers));
        }
        const savedHistory = await AsyncStorage.getItem('history');
        if (savedHistory) {
          setHistory(JSON.parse(savedHistory));
        }
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };
    loadData();
  }, []);

  // Save timers to AsyncStorage whenever they change
  useEffect(() => {
    const saveTimers = async () => {
      try {
        await AsyncStorage.setItem('timers', JSON.stringify(timers));
      } catch (error) {
        console.error('Error saving timers:', error);
      }
    };
    if (timers.length > 0) {
      saveTimers();
    }
  }, [timers]);

  // Save history to AsyncStorage whenever it changes
  useEffect(() => {
    const saveHistory = async () => {
      try {
        await AsyncStorage.setItem('history', JSON.stringify(history));
      } catch (error) {
        console.error('Error saving history:', error);
      }
    };
    if (history.length > 0) {
      saveHistory();
    }
  }, [history]);

  // Add new timer
  const addTimer = () => {
    if (!name || !duration || !category) return;

    const parsedDuration = parseInt(duration);
    if (isNaN(parsedDuration)) return;

    const newTimer: Timer = {
      id: Date.now().toString(),
      name,
      duration: parsedDuration,
      remaining: parsedDuration,
      category,
      status: 'Paused',
      halfwayAlert,
    };

    setTimers([...timers, newTimer]);
    setName('');
    setDuration('');
    setCategory('');
    setHalfwayAlert(false);
  };

  // Individual timer control functions
  const startTimer = (id: string) => {
    setTimers((prevTimers) =>
      prevTimers.map((timer) =>
        timer.id === id && timer.status !== 'Completed'
          ? { ...timer, status: 'Running' }
          : timer
      )
    );
  };

  const pauseTimer = (id: string) => {
    setTimers((prevTimers) =>
      prevTimers.map((timer) =>
        timer.id === id && timer.status === 'Running'
          ? { ...timer, status: 'Paused' }
          : timer
      )
    );
  };

  const resetTimer = (id: string) => {
    setTimers((prevTimers) =>
      prevTimers.map((timer) =>
        timer.id === id
          ? { ...timer, remaining: timer.duration, status: 'Paused' }
          : timer
      )
    );
  };

  // Bulk action functions
  const startAllInCategory = (category: string) => {
    setTimers((prevTimers) =>
      prevTimers.map((timer) =>
        timer.category === category && timer.status !== 'Completed'
          ? { ...timer, status: 'Running' }
          : timer
      )
    );
  };

  const pauseAllInCategory = (category: string) => {
    setTimers((prevTimers) =>
      prevTimers.map((timer) =>
        timer.category === category && timer.status === 'Running'
          ? { ...timer, status: 'Paused' }
          : timer
      )
    );
  };

  const resetAllInCategory = (category: string) => {
    setTimers((prevTimers) =>
      prevTimers.map((timer) =>
        timer.category === category
          ? { ...timer, remaining: timer.duration, status: 'Paused' }
          : timer
      )
    );
  };

  // Export history to clipboard with debugging
  const exportHistory = () => {
    if (!history.length) {
      Alert.alert('No Data', 'There is no history to export.');
      return;
    }
    // try {
    //   const jsonContent = JSON.stringify(history, null, 2);
    //   Clipboard.setString(jsonContent);
    //   Clipboard.getString().then((content) => {
    //     if (content === jsonContent) {
    //       Alert.alert('Success', 'History copied to clipboard!');
    //     } else {
    //       Alert.alert('Error', 'Failed to copy history to clipboard.');
    //     }
    //   });
    // } catch (error) {
    //   console.error('Error exporting history:', error);
    //   Alert.alert('Error', 'An error occurred while exporting history.');
    // }
  };

  // Toggle theme
  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  // Countdown logic with completion and halfway alerts
  useEffect(() => {
    const interval = setInterval(() => {
      setTimers((prevTimers) => {
        const updatedTimers = prevTimers.map((timer) => {
          if (timer.status === 'Running' && timer.remaining > 0) {
            const newRemaining = timer.remaining - 1;
            const halfwayPoint = Math.floor(timer.duration / 2);

            if (
              timer.halfwayAlert &&
              newRemaining === halfwayPoint &&
              !halfwayModalVisible
            ) {
              setHalfwayTimer(timer);
              setHalfwayModalVisible(true);
            }

            if (newRemaining === 0) {
              const completed = { ...timer, remaining: 0, status: 'Completed' };
              setCompletedTimer(completed);
              setModalVisible(true);
              setHistory((prevHistory) => [
                ...prevHistory,
                {
                  id: completed.id,
                  name: completed.name,
                  completionTime: new Date().toISOString(),
                },
              ]);
            }

            return {
              ...timer,
              remaining: newRemaining,
              status: newRemaining === 0 ? 'Completed' : 'Running',
            };
          }
          return timer;
        });
        return updatedTimers;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timers, halfwayModalVisible]);

  // Group timers by category and apply filter
  const groupedTimers = timers
    .filter(
      (timer) =>
        !selectedCategoryFilter || timer.category === selectedCategoryFilter
    )
    .reduce((acc, timer) => {
      if (!acc[timer.category]) {
        acc[timer.category] = [];
      }
      acc[timer.category].push(timer);
      return acc;
    }, {} as Record<string, Timer[]>);

  // Get unique categories for filter
  const categories = Array.from(new Set(timers.map((timer) => timer.category)));

  // Toggle category expansion
  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  // Calculate progress percentage
  const getProgress = (timer: Timer): number => {
    return (timer.remaining / timer.duration) * 100;
  };

  // Dynamic styles based on theme
  const themedStyles = StyleSheet.create({
    scrollContainer: {
      flexGrow: 1, // Ensures ScrollView content can grow beyond screen height
      backgroundColor: theme === 'light' ? '#fff' : '#333',
    },
    contentContainer: {
      padding: 20,
      paddingBottom: 100, // Extra padding to ensure bottom content is scrollable
    },
    title: {
      fontSize: 20,
      fontWeight: 'bold',
      marginBottom: 10,
      color: theme === 'light' ? '#000' : '#fff',
    },
    form: {
      marginBottom: 20,
    },
    input: {
      borderWidth: 1,
      borderColor: theme === 'light' ? '#ccc' : '#555',
      padding: 8,
      marginBottom: 10,
      color: theme === 'light' ? '#000' : '#fff',
      backgroundColor: theme === 'light' ? '#fff' : '#444',
    },
    switchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 10,
    },
    switchText: {
      color: theme === 'light' ? '#000' : '#fff',
    },
    filterContainer: {
      marginBottom: 10,
    },
    filterButton: {
      padding: 10,
      backgroundColor: theme === 'light' ? '#e0e0e0' : '#666',
      borderRadius: 5,
      marginRight: 10,
    },
    filterButtonText: {
      color: theme === 'light' ? '#000' : '#fff',
    },
    categoryContainer: {
      marginBottom: 15,
    },
    categoryHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      padding: 10,
      backgroundColor: theme === 'light' ? '#f0f0f0' : '#555',
      borderRadius: 5,
    },
    categoryTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      color: theme === 'light' ? '#000' : '#fff',
    },
    bulkControls: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingHorizontal: 10,
      paddingVertical: 5,
    },
    bulkButton: {
      padding: 5,
      backgroundColor: theme === 'light' ? '#d0d0d0' : '#666',
      borderRadius: 5,
    },
    bulkButtonText: {
      color: theme === 'light' ? '#000' : '#fff',
    },
    timerList: {
      paddingLeft: 10,
    },
    timerItem: {
      padding: 10,
      borderBottomWidth: 1,
      borderColor: theme === 'light' ? '#ccc' : '#555',
      marginBottom: 10,
    },
    timerText: {
      color: theme === 'light' ? '#000' : '#fff',
    },
    progressContainer: {
      height: 10,
      backgroundColor: theme === 'light' ? '#e0e0e0' : '#666',
      borderRadius: 5,
      marginTop: 5,
      overflow: 'hidden',
    },
    progressBar: {
      height: '100%',
    },
    controls: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 5,
    },
    button: {
      padding: 5,
      backgroundColor: theme === 'light' ? '#e0e0e0' : '#666',
      borderRadius: 5,
    },
    buttonText: {
      color: theme === 'light' ? '#000' : '#fff',
    },
    disabled: {
      backgroundColor: theme === 'light' ? '#f0f0f0' : '#555',
      opacity: 0.5,
    },
    modalContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
      width: 300,
      padding: 20,
      backgroundColor: theme === 'light' ? 'white' : '#444',
      borderRadius: 10,
      alignItems: 'center',
    },
    modalText: {
      fontSize: 18,
      marginBottom: 15,
      textAlign: 'center',
      color: theme === 'light' ? '#000' : '#fff',
    },
    modalButton: {
      padding: 10,
      backgroundColor: '#2196f3',
      borderRadius: 5,
    },
    modalButtonText: {
      color: '#fff',
    },
  });

  return (
    <ScrollView
      style={themedStyles.scrollContainer}
      contentContainerStyle={themedStyles.contentContainer}
    >
      <Text style={themedStyles.title}>Timer List</Text>
      {/* Theme Toggle */}
      <View style={themedStyles.switchContainer}>
        <Text style={themedStyles.switchText}>
          {theme === 'light' ? 'Light Mode' : 'Dark Mode'}
        </Text>
        <Switch value={theme === 'dark'} onValueChange={toggleTheme} />
      </View>
      {/* Add Timer Form */}
      <View style={themedStyles.form}>
        <TextInput
          style={themedStyles.input}
          placeholder="Timer Name"
          value={name}
          onChangeText={setName}
          placeholderTextColor={theme === 'light' ? '#999' : '#ccc'}
        />
        <TextInput
          style={themedStyles.input}
          placeholder="Duration (seconds)"
          value={duration}
          onChangeText={setDuration}
          keyboardType="numeric"
          placeholderTextColor={theme === 'light' ? '#999' : '#ccc'}
        />
        <TextInput
          style={themedStyles.input}
          placeholder="Category"
          value={category}
          onChangeText={setCategory}
          placeholderTextColor={theme === 'light' ? '#999' : '#ccc'}
        />
        <View style={themedStyles.switchContainer}>
          <Text style={themedStyles.switchText}>Halfway Alert</Text>
          <Switch value={halfwayAlert} onValueChange={setHalfwayAlert} />
        </View>
        <Button title="Add Timer" onPress={addTimer} />
      </View>
      {/* Category Filter */}
      <View style={themedStyles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity
            style={themedStyles.filterButton}
            onPress={() => setSelectedCategoryFilter(null)}
          >
            <Text style={themedStyles.filterButtonText}>All</Text>
          </TouchableOpacity>
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={themedStyles.filterButton}
              onPress={() => setSelectedCategoryFilter(cat)}
            >
              <Text style={themedStyles.filterButtonText}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
      {/* Grouped Timer List */}
      {Object.keys(groupedTimers).length === 0 ? (
        <Text style={themedStyles.timerText}>No timers yet!</Text>
      ) : (
        Object.entries(groupedTimers).map(([category, categoryTimers]) => (
          <View key={category} style={themedStyles.categoryContainer}>
            <TouchableOpacity
              onPress={() => toggleCategory(category)}
              style={themedStyles.categoryHeader}
            >
              <Text style={themedStyles.categoryTitle}>
                {category} ({categoryTimers.length})
              </Text>
              <Text style={themedStyles.timerText}>
                {expandedCategories.has(category) ? '▼' : '▶'}
              </Text>
            </TouchableOpacity>
            <View style={themedStyles.bulkControls}>
              <TouchableOpacity
                onPress={() => startAllInCategory(category)}
                style={themedStyles.bulkButton}
              >
                <Text style={themedStyles.bulkButtonText}>Start All</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => pauseAllInCategory(category)}
                style={themedStyles.bulkButton}
              >
                <Text style={themedStyles.bulkButtonText}>Pause All</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => resetAllInCategory(category)}
                style={themedStyles.bulkButton}
              >
                <Text style={themedStyles.bulkButtonText}>Reset All</Text>
              </TouchableOpacity>
            </View>
            {expandedCategories.has(category) && (
              <View style={themedStyles.timerList}>
                {categoryTimers.map((timer) => (
                  <View key={timer.id} style={themedStyles.timerItem}>
                    <Text style={themedStyles.timerText}>
                      {timer.name} - {timer.remaining}s - {timer.status}
                    </Text>
                    <View style={themedStyles.progressContainer}>
                      <View
                        style={[
                          themedStyles.progressBar,
                          {
                            width: `${getProgress(timer)}%`,
                            backgroundColor:
                              timer.status === 'Completed'
                                ? '#4caf50'
                                : '#2196f3',
                          },
                        ]}
                      />
                    </View>
                    <View style={themedStyles.controls}>
                      <TouchableOpacity
                        onPress={() => startTimer(timer.id)}
                        disabled={
                          timer.status === 'Running' ||
                          timer.status === 'Completed'
                        }
                        style={[
                          themedStyles.button,
                          (timer.status === 'Running' ||
                            timer.status === 'Completed') &&
                            themedStyles.disabled,
                        ]}
                      >
                        <Text style={themedStyles.buttonText}>Start</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => pauseTimer(timer.id)}
                        disabled={timer.status !== 'Running'}
                        style={[
                          themedStyles.button,
                          timer.status !== 'Running' && themedStyles.disabled,
                        ]}
                      >
                        <Text style={themedStyles.buttonText}>Pause</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => resetTimer(timer.id)}
                        style={themedStyles.button}
                      >
                        <Text style={themedStyles.buttonText}>Reset</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>
        ))
      )}
      <Button
        title="Go to History"
        onPress={() => navigation.navigate('History')}
      />
      {/* <Button title="Export History to Clipboard" onPress={exportHistory} /> */}
      {/* Completion Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={themedStyles.modalContainer}>
          <View style={themedStyles.modalContent}>
            <Text style={themedStyles.modalText}>
              Congratulations! "{completedTimer?.name}" has completed!
            </Text>
            <TouchableOpacity
              style={themedStyles.modalButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={themedStyles.modalButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      {/* Halfway Alert Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={halfwayModalVisible}
        onRequestClose={() => setHalfwayModalVisible(false)}
      >
        <View style={themedStyles.modalContainer}>
          <View style={themedStyles.modalContent}>
            <Text style={themedStyles.modalText}>
              Halfway there! "{halfwayTimer?.name}" is at 50%.
            </Text>
            <TouchableOpacity
              style={themedStyles.modalButton}
              onPress={() => setHalfwayModalVisible(false)}
            >
              <Text style={themedStyles.modalButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

export default HomeScreen1;