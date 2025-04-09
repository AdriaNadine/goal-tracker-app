import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, Alert, TextInput } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { auth, db } from '../config/firebase';
import { ScrollView } from 'react-native';
import { collection, addDoc, getDocs, query, where, doc, deleteDoc } from 'firebase/firestore';

const goalTemplates = [
  { name: 'Run 5K', category: 'Fitness', color: '#00FF00', answers: { what: 'Run a 5K', why: 'Improve health' } },
  { name: 'Finish Project', category: 'Work', color: '#FF0000', answers: { what: 'Complete work project', why: 'Advance career' } },
  { name: 'Read Book', category: 'Personal', color: '#0000FF', answers: { what: 'Read a book', why: 'Expand knowledge' } },
];

const colorOptions = [
  { label: 'Black', value: '#000000' },
  { label: 'Red', value: '#FF0000' },
  { label: 'Green', value: '#00FF00' },
  { label: 'Blue', value: '#0000FF' },
  { label: 'Mustard', value: '#FFD700' }, // Changed to golden yellow
  { label: 'Purple', value: '#800080' },
  { label: 'Orange', value: '#FF4500' }, // Changed to deeper orange-red
  { label: 'Magenta', value: '#C2185B' },
];

const CategoriesScreen = () => {
  const navigation = useNavigation();
  const [categories, setCategories] = useState([]);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryColor, setNewCategoryColor] = useState('#000000');
  const [showPicker, setShowPicker] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    if (!auth.currentUser) {
      navigation.navigate('SignIn');
      return;
    }

    setLoading(true);
    try {
      const q = query(
        collection(db, 'categories'),
        where('userId', '==', auth.currentUser.uid)
      );
      const querySnapshot = await getDocs(q);
      const userCategories = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setCategories(userCategories);
    } catch (error) {
      console.error('Error fetching categories:', error);
      Alert.alert('Error', 'Failed to fetch categories.');
    } finally {
      setLoading(false);
    }
  };

  const addCategory = async () => {
    if (!newCategoryName.trim()) {
      Alert.alert('Error', 'Please enter a category name.');
      return;
    }

    try {
      await addDoc(collection(db, 'categories'), {
        name: newCategoryName,
        color: newCategoryColor,
        userId: auth.currentUser.uid,
        createdAt: new Date().toISOString(),
      });
      setNewCategoryName('');
      setNewCategoryColor('#000000');
      fetchCategories();
    } catch (error) {
      console.error('Error adding category:', error);
      Alert.alert('Error', 'Failed to add category.');
    }
  };

  const deleteCategory = async (id) => {
    try {
      await deleteDoc(doc(db, 'categories', id));
      fetchCategories();
    } catch (error) {
      console.error('Error deleting category:', error);
      Alert.alert('Error', 'Failed to delete category.');
    }
  };

  const handleTemplatePress = (template) => {
    const category = { name: template.category, color: template.color };
    navigation.navigate('GoalsQuestions', { category, templateAnswers: template.answers });
  };

  const renderCategory = ({ item }) => (
    <TouchableOpacity
      style={[styles.categoryItem, { borderColor: item.color }]}
      onPress={() => navigation.navigate('GoalsQuestions', { category: item })}
    >
      <Text style={[styles.categoryText, { color: item.color }]}>
        {item.name}
      </Text>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => deleteCategory(item.id)}
      >
        <Text style={styles.deleteButtonText}>Delete</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderTemplate = ({ item }) => (
    <TouchableOpacity
      style={[styles.templateItem, { borderColor: item.color }]}
      onPress={() => handleTemplatePress(item)}
    >
      <Text style={[styles.templateText, { color: item.color }]}>
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  const getColorSquareStyle = (colorValue) => {
    switch (colorValue) {
      case '#000000': return styles.colorSquareBlack;
      case '#FF0000': return styles.colorSquareRed;
      case '#00FF00': return styles.colorSquareGreen;
      case '#0000FF': return styles.colorSquareBlue;
      case '#FFD700': return styles.colorSquareMustard; // Updated
      case '#800080': return styles.colorSquarePurple;
      case '#FF4500': return styles.colorSquareOrange; // Updated
      case '#C2185B': return styles.colorSquareMagenta;
      default: return styles.colorSquareBlack; // Fallback
    }
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={categories}
        keyExtractor={(item) => item.id}
        renderItem={renderCategory}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <>
            <Text style={styles.header}>Categories</Text>
            <Text style={styles.instruction}>
              Create a category to organize your goals. You can also use a template to get started quickly.
            </Text>
  
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="New category name"
                value={newCategoryName}
                onChangeText={setNewCategoryName}
              />
              <View style={styles.pickerContainer}>
                <Text style={styles.pickerLabel}>Select Color:</Text>
                <TouchableOpacity
                  style={styles.pickerButton}
                  onPress={() => setShowPicker(!showPicker)}
                >
                  <Text style={styles.pickerButtonText}>
                    {colorOptions.find((color) => color.value === newCategoryColor)?.label || 'Pick a color'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
  
            <TouchableOpacity style={styles.addButton} onPress={addCategory}>
              <Text style={styles.addButtonText}>Add Category</Text>
            </TouchableOpacity>
  
            {loading && (
              <Text style={{ textAlign: 'center', marginVertical: 20 }}>Loading categories...</Text>
            )}
          </>
        }
        ListEmptyComponent={
          !loading && <Text style={styles.emptyText}>No categories yet.</Text>
        }
        ListFooterComponent={
          <>
            <Text style={styles.sectionTitle}>Goal Templates</Text>
            <FlatList
              data={goalTemplates}
              keyExtractor={(item) => item.name}
              renderItem={renderTemplate}
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.templateList}
            />
          </>
        }
      />
  
      {/* 🔥 COLOR PICKER FLOATING ABOVE ALL */}
      {showPicker && (
        <View style={styles.absoluteOverlay}>
          <View style={styles.pickerDropdown}>
            {colorOptions.map(color => (
              <TouchableOpacity
                key={color.value}
                style={styles.pickerItem}
                onPress={() => {
                  setNewCategoryColor(color.value);
                  setShowPicker(false);
                }}
              >
                <Text style={styles.pickerItemText}>{color.label}</Text>
                <View style={getColorSquareStyle(color.value)} />
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
    backgroundColor: '#fff',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#007AFF',
    textAlign: 'center',
  },
  instruction: {
    fontSize: 14,
    color: '#555',
    textAlign: 'center',
    marginBottom: 10,
  },
  inputContainer: {
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    backgroundColor: '#fff',
    padding: 5,
    marginBottom: 15,
  },
  pickerLabel: {
    fontSize: 16,
    color: '#333',
    paddingLeft: 10,
    marginBottom: 5,
  },
  pickerButton: {
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    backgroundColor: '#f0f0f0',
  },
  pickerButtonText: {
    fontSize: 14,
    color: '#000',
    textAlign: 'center',
  },
  absoluteOverlay: {
    position: 'absolute',
    top: 150, // adjust as needed for vertical alignment
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 9999,
    elevation: 20,
  },
  
  pickerDropdown: {
    width: '90%',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    zIndex: 9999,
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    paddingVertical: 10,
  },
  pickerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  pickerItemText: {
    fontSize: 14,
    color: '#000',
    marginRight: 10,
  },
  colorSquareBlack: {
    width: 20,
    height: 20,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#000000',
  },
  colorSquareRed: {
    width: 20,
    height: 20,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#FF0000',
  },
  colorSquareGreen: {
    width: 20,
    height: 20,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#00FF00',
  },
  colorSquareBlue: {
    width: 20,
    height: 20,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#0000FF',
  },
  colorSquareMustard: {
    width: 20,
    height: 20,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#FFD700', // Golden yellow
  },
  colorSquarePurple: {
    width: 20,
    height: 20,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#800080',
  },
  colorSquareOrange: {
    width: 20,
    height: 20,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#FF4500', // Deeper orange-red
  },
  colorSquareMagenta: {
    width: 20,
    height: 20,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#C2185B',
  },
  addButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginVertical: 15,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 20,
  },
  categoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderWidth: 2,
    borderRadius: 5,
    marginBottom: 10,
    backgroundColor: '#f9f9f9',
  },
  categoryText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
    padding: 5,
    borderRadius: 3,
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
    color: '#007AFF',
  },
  templateList: {
    maxHeight: 100,
  },
  templateItem: {
    padding: 10,
    borderWidth: 2,
    borderRadius: 5,
    marginRight: 10,
    backgroundColor: '#f9f9f9',
  },
  templateText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 20,
  },
});

export default CategoriesScreen;