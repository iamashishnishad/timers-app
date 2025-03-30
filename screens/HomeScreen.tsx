import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  TouchableOpacity,
  Modal,
  Switch,
  ScrollView,
  Appearance,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';
import { Timer, HistoryEntry } from './types';
import { createStyles } from './styles';
import {
  startTimer,
  pauseTimer,
  resetTimer,
  startAllInCategory,
  pauseAllInCategory,
  resetAllInCategory,
} from './timerUtils';

type HomeScreenNavigationProp = StackNavigationProp<{ History: undefined }>;

interface Props {
  navigation: HomeScreenNavigationProp;
}

const TimePickerModal: React.FC<{
  visible: boolean;
  onClose: () => void;
  onConfirm: (seconds: number) => void;
  theme: 'light' | 'dark';
}> = ({ visible, onClose, onConfirm, theme }) => {
  const [minutes, setMinutes] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const styles = createStyles(theme);

  const handleConfirm = () => {
    const totalSeconds = (minutes * 60) + seconds;
    onConfirm(totalSeconds);
    setMinutes(0);
    setSeconds(0);
    onClose();
  };

  // Generate arrays for picker items
  const minuteOptions = Array.from({ length: 60 }, (_, i) => i); // 0-59 minutes
  const secondOptions = Array.from({ length: 60 }, (_, i) => i); // 0-59 seconds

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalContainer}>
        <View style={[styles.modalContent, { paddingVertical: 40 }]}>
          <Text style={styles.modalText}>Select Duration</Text>
          <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
            <Picker
              selectedValue={minutes}
              onValueChange={(value) => setMinutes(value)}
              style={{ width: 100, color: theme === 'light' ? '#000' : '#fff' }}
            >
              {minuteOptions.map((min) => (
                <Picker.Item
                  key={min}
                  label={`${min.toString().padStart(2, '0')}m`}
                  value={min}
                />
              ))}
            </Picker>
            <Text style={[styles.modalText, { marginHorizontal: 10 }]}>:</Text>
            <Picker
              selectedValue={seconds}
              onValueChange={(value) => setSeconds(value)}
              style={{ width: 100, color: theme === 'light' ? '#000' : '#fff' }}
            >
              {secondOptions.map((sec) => (
                <Picker.Item
                  key={sec}
                  label={`${sec.toString().padStart(2, '0')}s`}
                  value={sec}
                />
              ))}
            </Picker>
          </View>
          <View style={{ flexDirection: 'row', marginTop: 20 }}>
            <TouchableOpacity style={styles.modalButton} onPress={handleConfirm}>
              <Text style={styles.modalButtonText}>Confirm</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, { marginLeft: 10, backgroundColor: '#666' }]}
              onPress={onClose}
            >
              <Text style={styles.modalButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const [timers, setTimers] = useState<Timer[]>([]);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [name, setName] = useState<string>('');
  const [duration, setDuration] = useState<number>(0);
  const [category, setCategory] = useState<string>('');
  const [halfwayAlert, setHalfwayAlert] = useState<boolean>(false);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [completedTimer, setCompletedTimer] = useState<Timer | null>(null);
  const [halfwayTimer, setHalfwayTimer] = useState<Timer | null>(null);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [halfwayModalVisible, setHalfwayModalVisible] = useState<boolean>(false);
  const [timePickerVisible, setTimePickerVisible] = useState<boolean>(false);
  const [theme, setTheme] = useState<'light' | 'dark'>(
    Appearance.getColorScheme() === 'dark' ? 'dark' : 'light'
  );
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string | null>(null);

  const themedStyles = createStyles(theme);

  useEffect(() => {
    const loadData = async () => {
      try {
        const savedTimers = await AsyncStorage.getItem('timers');
        if (savedTimers) setTimers(JSON.parse(savedTimers));
        const savedHistory = await AsyncStorage.getItem('history');
        if (savedHistory) setHistory(JSON.parse(savedHistory));
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    const saveTimers = async () => {
      try {
        await AsyncStorage.setItem('timers', JSON.stringify(timers));
      } catch (error) {
        console.error('Error saving timers:', error);
      }
    };
    if (timers.length > 0) saveTimers();
  }, [timers]);

  useEffect(() => {
    const saveHistory = async () => {
      try {
        await AsyncStorage.setItem('history', JSON.stringify(history));
      } catch (error) {
        console.error('Error saving history:', error);
      }
    };
    if (history.length > 0) saveHistory();
  }, [history]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimers((prevTimers) => {
        const updatedTimers = prevTimers.map((timer) => {
          if (timer.status === 'Running' && timer.remaining > 0) {
            const newRemaining = timer.remaining - 1;
            const halfwayPoint = Math.floor(timer.duration / 2);

            if (timer.halfwayAlert && newRemaining === halfwayPoint && !halfwayModalVisible) {
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

  const addTimer = () => {
    if (!name || duration === 0 || !category) return;

    const newTimer: Timer = {
      id: Date.now().toString(),
      name,
      duration,
      remaining: duration,
      category,
      status: 'Paused',
      halfwayAlert,
    };

    setTimers([...timers, newTimer]);
    setName('');
    setDuration(0);
    setCategory('');
    setHalfwayAlert(false);
  };

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');
  
  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) newExpanded.delete(category);
    else newExpanded.add(category);
    setExpandedCategories(newExpanded);
  };

  const getProgress = (timer: Timer): number => (timer.remaining / timer.duration) * 100;

  const formatDuration = (seconds: number): string => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  const groupedTimers = timers
    .filter(timer => !selectedCategoryFilter || timer.category === selectedCategoryFilter)
    .reduce((acc, timer) => {
      if (!acc[timer.category]) acc[timer.category] = [];
      acc[timer.category].push(timer);
      return acc;
    }, {} as Record<string, Timer[]>);

  const categories = Array.from(new Set(timers.map(timer => timer.category)));

  return (
    <ScrollView style={themedStyles.scrollContainer} contentContainerStyle={themedStyles.contentContainer}>
      <Text style={themedStyles.title}>Timer List</Text>
      <View style={themedStyles.switchContainer}>
        <Text style={themedStyles.switchText}>{theme === 'light' ? 'Light Mode' : 'Dark Mode'}</Text>
        <Switch value={theme === 'dark'} onValueChange={toggleTheme} />
      </View>
      <View style={themedStyles.form}>
        <TextInput
          style={themedStyles.input}
          placeholder="Timer Name"
          value={name}
          onChangeText={setName}
          placeholderTextColor={theme === 'light' ? '#999' : '#ccc'}
        />
        <TouchableOpacity
          style={themedStyles.input}
          onPress={() => setTimePickerVisible(true)}
        >
          <Text style={themedStyles.timerText}>
            {duration === 0 ? 'Set Duration (MM:SS)' : formatDuration(duration)}
          </Text>
        </TouchableOpacity>
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
      <View style={themedStyles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity style={themedStyles.filterButton} onPress={() => setSelectedCategoryFilter(null)}>
            <Text style={themedStyles.filterButtonText}>All</Text>
          </TouchableOpacity>
          {categories.map(cat => (
            <TouchableOpacity key={cat} style={themedStyles.filterButton} onPress={() => setSelectedCategoryFilter(cat)}>
              <Text style={themedStyles.filterButtonText}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
      {Object.keys(groupedTimers).length === 0 ? (
        <Text style={themedStyles.timerText}>No timers yet!</Text>
      ) : (
        Object.entries(groupedTimers).map(([category, categoryTimers]) => (
          <View key={category} style={themedStyles.categoryContainer}>
            <TouchableOpacity onPress={() => toggleCategory(category)} style={themedStyles.categoryHeader}>
              <Text style={themedStyles.categoryTitle}>{category} ({categoryTimers.length})</Text>
              <Text style={themedStyles.timerText}>{expandedCategories.has(category) ? '▼' : '▶'}</Text>
            </TouchableOpacity>
            <View style={themedStyles.bulkControls}>
              <TouchableOpacity onPress={() => setTimers(startAllInCategory(category, timers))} style={themedStyles.bulkButton}>
                <Text style={themedStyles.bulkButtonText}>Start All</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setTimers(pauseAllInCategory(category, timers))} style={themedStyles.bulkButton}>
                <Text style={themedStyles.bulkButtonText}>Pause All</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setTimers(resetAllInCategory(category, timers))} style={themedStyles.bulkButton}>
                <Text style={themedStyles.bulkButtonText}>Reset All</Text>
              </TouchableOpacity>
            </View>
            {expandedCategories.has(category) && (
              <View style={themedStyles.timerList}>
                {categoryTimers.map(timer => (
                  <View key={timer.id} style={themedStyles.timerItem}>
                    <Text style={themedStyles.timerText}>
                      {timer.name} - {formatDuration(timer.remaining)} - {timer.status}
                    </Text>
                    <View style={themedStyles.progressContainer}>
                      <View
                        style={[
                          themedStyles.progressBar,
                          {
                            width: `${getProgress(timer)}%`,
                            backgroundColor: timer.status === 'Completed' ? '#4caf50' : '#2196f3',
                          },
                        ]}
                      />
                    </View>
                    <View style={themedStyles.controls}>
                      <TouchableOpacity
                        onPress={() => setTimers(startTimer(timer.id, timers))}
                        disabled={timer.status === 'Running' || timer.status === 'Completed'}
                        style={[
                          themedStyles.button,
                          (timer.status === 'Running' || timer.status === 'Completed') && themedStyles.disabled,
                        ]}
                      >
                        <Text style={themedStyles.buttonText}>Start</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => setTimers(pauseTimer(timer.id, timers))}
                        disabled={timer.status !== 'Running'}
                        style={[themedStyles.button, timer.status !== 'Running' && themedStyles.disabled]}
                      >
                        <Text style={themedStyles.buttonText}>Pause</Text>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => setTimers(resetTimer(timer.id, timers))} style={themedStyles.button}>
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
      <Button title="Go to History" onPress={() => navigation.navigate('History')} />
      <Modal animationType="slide" transparent={true} visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
        <View style={themedStyles.modalContainer}>
          <View style={themedStyles.modalContent}>
            <Text style={themedStyles.modalText}>Congratulations! "{completedTimer?.name}" has completed!</Text>
            <TouchableOpacity style={themedStyles.modalButton} onPress={() => setModalVisible(false)}>
              <Text style={themedStyles.modalButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <Modal
        animationType="slide"
        transparent={true}
        visible={halfwayModalVisible}
        onRequestClose={() => setHalfwayModalVisible(false)}
      >
        <View style={themedStyles.modalContainer}>
          <View style={themedStyles.modalContent}>
            <Text style={themedStyles.modalText}>Halfway there! "{halfwayTimer?.name}" is at 50%.</Text>
            <TouchableOpacity style={themedStyles.modalButton} onPress={() => setHalfwayModalVisible(false)}>
              <Text style={themedStyles.modalButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <TimePickerModal
        visible={timePickerVisible}
        onClose={() => setTimePickerVisible(false)}
        onConfirm={(seconds) => setDuration(seconds)}
        theme={theme}
      />
    </ScrollView>
  );
};

export default HomeScreen;