import React, { createContext, useContext, useReducer, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme } from 'react-native';

interface Attendance {
  date: string;
  present: boolean;
}

interface Subject {
  id: string;
  name: string;
  attendance: Attendance[];
  totalClasses: number;
  attendedClasses: number;
  importance: string;
  hasUpcomingTest: boolean;
  professorStrictness: string;
}

interface AppState {
  subjects: Subject[];
  darkMode: boolean;
  notificationsEnabled: boolean;
}

interface AppContextType extends AppState {
  addSubject: (subject: Subject) => void;
  updateSubject: (subject: Subject) => void;
  deleteSubject: (id: string) => void;
  toggleDarkMode: () => void;
  toggleNotifications: () => void;
  resetAllData: () => void;
  isDarkMode: boolean;
}

const AppContext = createContext<AppContextType | null>(null);

const initialState: AppState = {
  subjects: [],
  darkMode: false,
  notificationsEnabled: true,
};

type AppAction =
  | { type: 'LOAD_DATA'; payload: AppState }
  | { type: 'ADD_SUBJECT'; payload: Subject }
  | { type: 'UPDATE_SUBJECT'; payload: Subject }
  | { type: 'DELETE_SUBJECT'; payload: string }
  | { type: 'TOGGLE_DARK_MODE' }
  | { type: 'TOGGLE_NOTIFICATIONS' }
  | { type: 'RESET_ALL_DATA' };

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'LOAD_DATA':
      return action.payload;
    case 'ADD_SUBJECT':
      return {
        ...state,
        subjects: [...state.subjects, action.payload],
      };
    case 'UPDATE_SUBJECT':
      return {
        ...state,
        subjects: state.subjects.map(subject =>
          subject.id === action.payload.id ? action.payload : subject
        ),
      };
    case 'DELETE_SUBJECT':
      return {
        ...state,
        subjects: state.subjects.filter(subject => subject.id !== action.payload),
      };
    case 'TOGGLE_DARK_MODE':
      return {
        ...state,
        darkMode: !state.darkMode,
      };
    case 'TOGGLE_NOTIFICATIONS':
      return {
        ...state,
        notificationsEnabled: !state.notificationsEnabled,
      };
    case 'RESET_ALL_DATA':
      return initialState;
    default:
      return state;
  }
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const systemColorScheme = useColorScheme();
  
  // Determine if dark mode should be active
  const isDarkMode = state.darkMode || systemColorScheme === 'dark';

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    saveData();
  }, [state]);

  const loadData = async () => {
    try {
      const savedData = await AsyncStorage.getItem('shouldIBunkData');
      if (savedData) {
        dispatch({ type: 'LOAD_DATA', payload: JSON.parse(savedData) });
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const saveData = async () => {
    try {
      await AsyncStorage.setItem('shouldIBunkData', JSON.stringify(state));
    } catch (error) {
      console.error('Error saving data:', error);
    }
  };

  const addSubject = (subject: Subject) => {
    dispatch({ type: 'ADD_SUBJECT', payload: subject });
  };

  const updateSubject = (subject: Subject) => {
    dispatch({ type: 'UPDATE_SUBJECT', payload: subject });
  };

  const deleteSubject = (id: string) => {
    dispatch({ type: 'DELETE_SUBJECT', payload: id });
  };

  const toggleDarkMode = () => {
    dispatch({ type: 'TOGGLE_DARK_MODE' });
  };

  const toggleNotifications = () => {
    dispatch({ type: 'TOGGLE_NOTIFICATIONS' });
  };

  const resetAllData = async () => {
    try {
      await AsyncStorage.removeItem('shouldIBunkData');
      dispatch({ type: 'RESET_ALL_DATA' });
    } catch (error) {
      console.error('Error resetting data:', error);
    }
  };

  return (
    <AppContext.Provider
      value={{
        ...state,
        isDarkMode,
        addSubject,
        updateSubject,
        deleteSubject,
        toggleDarkMode,
        toggleNotifications,
        resetAllData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
