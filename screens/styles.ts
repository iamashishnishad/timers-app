import { StyleSheet } from 'react-native';

export const createStyles = (theme: 'light' | 'dark') => StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    backgroundColor: theme === 'light' ? '#fff' : '#333',
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 100,
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