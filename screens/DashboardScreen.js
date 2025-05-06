import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Alert } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { auth, db } from '../config/firebase';
import { signOut } from 'firebase/auth';
import { collection, query, where, getDocs, doc, deleteDoc } from 'firebase/firestore';
import usePremiumStatus from '../hooks/usePremiumStatus';
import SignInScreen from './SignInScreen';
import { Ionicons } from '@expo/vector-icons';

const motivationalQuotes = [
  "Small steps every day lead to big results.",
  "The body achieves what the mind believes.",
  "Success is the sum of small efforts, repeated day in and day out.",
  "You don’t have to be great to start, but you have to start to be great.",
  "The future belongs to those who believe in the beauty of their dreams.",
];

const DashboardScreen = () => {
  const navigation = useNavigation();
  const [userEmail, setUserEmail] = useState('');
  const [goals, setGoals] = useState([]);
  const [steps, setSteps] = useState([]);
  const [quote, setQuote] = useState('');
  const [isPremium] = usePremiumStatus();

  const fetchData = async () => {
    if (auth.currentUser) {
      const goalsQuery = query(
        collection(db, 'goals'),
        where('userId', '==', auth.currentUser.uid)
      );
      const goalsSnapshot = await getDocs(goalsQuery);
      const userGoals = goalsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      const completedSnapshot = await getDocs(
        query(collection(db, 'completedGoals'), where('userId', '==', auth.currentUser.uid))
      );
      const completedGoalIds = completedSnapshot.docs.map(doc => doc.id);
      const activeGoals = userGoals.filter(goal => !completedGoalIds.includes(goal.id));
      setGoals(activeGoals);

      const stepsQuery = query(
        collection(db, 'steps'),
        where('userId', '==', auth.currentUser.uid)
      );
      const stepsSnapshot = await getDocs(stepsQuery);
      const userSteps = stepsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setSteps(userSteps);
    }
  };

  useEffect(() => {
    console.log("Using Firebase Project ID:", process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID);
 
    if (auth.currentUser) {
      setUserEmail(auth.currentUser.email || 'No email available');
      fetchData();
    }

    setQuote(motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)]);
  }, [navigation]);

  useFocusEffect(
    React.useCallback(() => {
      if (auth.currentUser) {
        fetchData();
      }
      setQuote(motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)]);
    }, [])
  );

  const handleLogout = async () => {
    try {
      await signOut(auth);
      console.log("✅ User successfully signed out.");
      setUserEmail('');
      setGoals([]);
      setSteps([]);
      if (navigation && navigation.navigate) {
        navigation.navigate('Welcome');
      }
    } catch (error) {
      console.error('Logout error:', error);
      Alert.alert('Error', 'Failed to log out.');
    }
  };

  const handleEditGoal = async (goal) => {
    if (!isPremium && goals.length >= 3)      {
      Alert.alert(
        'Limit Reached',
        'Free users can only create 3 goals. Upgrade to Goal Master for unlimited goals.'
      );
      return;
    }

    if (!isPremium && steps.length >= 5)      {
      Alert.alert(
        'Limit Reached',
        'Free users can only create 5 steps. Upgrade to Goal Master for unlimited steps.'
      );
      return;
    }

    const category = {
      id: goal.categoryId || 'unknown',
      name: goal.categoryName || 'Unknown',
      color: goal.categoryColor || '#000000',
    };
    navigation.navigate('Goals', { category, goalToEdit: goal });
  };

  const handleDeleteGoal = async (goalId) => {
    try {
      const goal = goals.find(g => g.id === goalId);
      await deleteDoc(doc(db, 'goals', goalId));
      const goalSteps = steps.filter(step => step.categoryColor === goal.categoryColor);
      for (const step of goalSteps) {
        await deleteDoc(doc(db, 'steps', step.id));
      }
      fetchData();
    } catch (error) {
      console.error('Error deleting goal:', error);
      Alert.alert('Error', 'Failed to delete goal.');
    }
  };

  const handleCategoryPress = (categoryName) => {
    if (!isPremium && getCategorySummary().length >= 1)      {
      Alert.alert(
        'Limit Reached',
        'Free users can only have 1 category. Upgrade to Goal Master for unlimited access.'
      );
      return;
    }
    navigation.navigate('Categories');  // Updated navigation to Categories tab
  };

  const getCategorySummary = () => {
    const categoryMap = {};
    goals.forEach(goal => {
      const category = goal.categoryName || 'Uncategorized';
      if (!categoryMap[category]) {
        categoryMap[category] = { goals: 0, completedSteps: 0, totalSteps: 0, color: goal.categoryColor };
      }
      categoryMap[category].goals += 1;
      const goalSteps = steps.filter(step => step.goalId === goal.id); // Filter by goalId
      categoryMap[category].completedSteps += goalSteps.filter(step => step.completed).length;
      categoryMap[category].totalSteps += goalSteps.length;
    });
  
    return Object.entries(categoryMap).map(([name, data]) => ({
      name,
      goals: data.goals,
      progress: data.totalSteps > 0 ? Math.round((data.completedSteps / data.totalSteps) * 100) : 0,
      color: data.color,
    }));
  };

  const renderCategoryItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.categoryItem, { borderColor: item.color }]}
      onPress={() => handleCategoryPress(item.name)}
    >
      <Text style={[styles.categoryText, { color: item.color }]} allowFontScaling={true}>
        {item.name}
      </Text>
      <Text style={styles.categoryDetail} allowFontScaling={true}>
        {`${item.goals} Goal${item.goals !== 1 ? 's' : ''}, ${item.progress}% Complete`}
      </Text>
      <TouchableOpacity
        style={styles.viewGoalsButton}
        onPress={() => navigation.navigate('Progress', { categoryFilter: item.name })}
      >
        <Text style={styles.viewGoalsButtonText} allowFontScaling={true}>View Goals</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderGoalItem = ({ item }) => (
    <View style={[styles.goalItem, { borderColor: item.categoryColor }]}>
      <Text style={[styles.goalText, { color: item.categoryColor }]} allowFontScaling={true}>
        Goal: {item.answers.what || 'No goal'}
      </Text>
      <Text style={styles.goalDetail} allowFontScaling={true}>Why: {item.answers.why || 'No reason'}</Text>
      <Text style={styles.goalDetail} allowFontScaling={true}>Category: {item.categoryName}</Text>
      <View style={styles.goalActions}>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => handleEditGoal(item)}
        >
          <Text style={styles.editButtonText} allowFontScaling={true}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDeleteGoal(item.id)}
        >
          <Text style={styles.deleteButtonText} allowFontScaling={true}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        ListHeaderComponent={
          <>
            <View style={styles.headerRow}>
              <Text style={styles.header} allowFontScaling={true}>Dashboard</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Settings')}>
                <Ionicons name="settings-outline" size={24} color="#007AFF" />
              </TouchableOpacity>
            </View>
            <Text style={styles.quote} allowFontScaling={true}>{`Today’s Motivation: "${quote}"`}</Text>
            <Text style={styles.userInfo} allowFontScaling={true}>Welcome, {userEmail}!</Text>
            <Text style={styles.sectionTitle} allowFontScaling={true}>Your Categories</Text>
          </>
        }
        data={getCategorySummary()}
        keyExtractor={(item) => item.name}
        renderItem={renderCategoryItem}
        ListEmptyComponent={<Text style={styles.emptyText} allowFontScaling={true}>No goals yet. Start by setting a goal!</Text>}
        ListFooterComponent={
          <>
            <Text style={styles.sectionTitle} allowFontScaling={true}>Your Goals</Text>
            <FlatList
              data={goals}
              keyExtractor={(item) => item.id}
              renderItem={renderGoalItem}
              ListEmptyComponent={<Text style={styles.emptyText} allowFontScaling={true}>No goals yet.</Text>}
              scrollEnabled={false}
            />
            {!isPremium && (
              <>
                {(getCategorySummary().length >= 1 || goals.length >= 3 || steps.length >= 5) && (
                  <Text style={{ fontSize: 14, color: 'red', marginBottom: 10, textAlign: 'center' }} allowFontScaling={true}>
                    🔒 Free plan limit reached:
                    {getCategorySummary().length >= 1 ? "\n- 1 category" : ""}
                    {goals.length >= 3 ? "\n- 3 goals" : ""}
                    {steps.length >= 5 ? "\n- 5 steps" : ""}
                    {"\nUpgrade to Goal Master to unlock unlimited tracking."}
                  </Text>
                )}
              </>
            )}
            <TouchableOpacity
              style={styles.button}
              onPress={() => navigation.navigate('GuidedMeditation')}
            >
              <Text style={styles.buttonText} allowFontScaling={true}>Start Guided Meditation</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.logoutButton}
              onPress={handleLogout}
            >
              <Text style={styles.logoutText} allowFontScaling={true}>Logout</Text>
            </TouchableOpacity>
          </>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 50,
    backgroundColor: '#f5f5f5',
  },
  scrollContainer: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingBottom: 30,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#007AFF',
  },
  quote: {
    fontSize: 20,
    fontStyle: 'italic',
    fontWeight: 'bold',
    color: '#007AAA',
    backgroundColor: '#E6F0FF',
    borderRadius: 10,
    padding: 20,
    marginVertical: 10,
    textAlign: 'center',
    borderWidth: 1,
    borderColor: '#007AFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 4,
  },
  userInfo: {
    fontSize: 15,
    marginBottom: 10,
    color: '#333',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#007AFF',
  },
  categoryList: {
    flex: 0.5,
    marginBottom: 10,
  },
  categoryItem: {
    padding: 5,
    borderWidth: 2,
    borderRadius: 15,
    marginBottom: 10,
    backgroundColor: '#fff',
  },
  categoryText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  categoryDetail: {
    fontSize: 14,
    color: '#555',
    marginTop: 5,
  },
  viewGoalsButton: {
    backgroundColor: '#007AFF',
    padding: 5,
    borderRadius: 3,
    marginTop: 5,
    alignSelf: 'flex-end',
  },
  viewGoalsButtonText: {
    color: '#fff',
    fontSize: 12,
  },
  goalList: {
    flex: 0.5,
  },
  goalItem: {
    padding: 10,
    borderWidth: 5,
    borderRadius: 5,
    marginBottom: 10,
    backgroundColor: '#fff',
  },
  goalText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  goalDetail: {
    fontSize: 16,
    color: '#555',
    marginTop: 5,
  },
  goalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 5,
  },
  editButton: {
    backgroundColor: '#FFA500',
    padding: 5,
    borderRadius: 3,
    marginLeft: 5,
  },
  editButtonText: {
    color: '#fff',
    fontSize: 12,
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
    padding: 5,
    borderRadius: 3,
    marginLeft: 5,
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 12,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 20,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    width: '80%',
    marginVertical: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  logoutButton: {
    backgroundColor: '#FF3B30',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    width: '80%',
    marginTop: 20,
  },
  logoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 15,
  },
  tabButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#007AFF',
    borderRadius: 8,
  },
  tabText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default DashboardScreen;