import React from 'react';
import { StyleSheet, SafeAreaView, StatusBar, Text, TextInput, TouchableOpacity, FlatList } from 'react-native';
import { View } from 'native-base';
import Icons from 'react-native-vector-icons/AntDesign';
import { Colors, Metrics } from '../../theme';
import { AppDialog, ToastService } from '../../component';

class TruthOrDareList extends React.Component {
  constructor(props) {
    super(props);
    
    const { truths = [], dares = [], mode = 'truth' } = this.props.route?.params || {};
    
    this.state = {
      activeTab: mode === 'dare' ? 'dare' : 'truth', // 根据模式设置默认标签
      truths: [...truths],
      dares: [...dares],
      editingIndex: -1,
      editingText: '',
      newItemText: '',
    };
  }

  // 切换标签
  switchTab = (tab) => {
    this.setState({ 
      activeTab: tab,
      editingIndex: -1,
      editingText: '',
    });
  }

  // 开始编辑
  startEdit = (index, text) => {
    this.setState({
      editingIndex: index,
      editingText: text,
    });
  }

  // 保存编辑
  saveEdit = () => {
    const { activeTab, editingIndex, editingText, truths, dares } = this.state;
    
    if (!editingText.trim()) {
      ToastService.warn('内容不能为空');
      return;
    }

    if (activeTab === 'truth') {
      truths[editingIndex] = editingText.trim();
      this.setState({ truths, editingIndex: -1, editingText: '' });
    } else {
      dares[editingIndex] = editingText.trim();
      this.setState({ dares, editingIndex: -1, editingText: '' });
    }
  }

  // 取消编辑
  cancelEdit = () => {
    this.setState({
      editingIndex: -1,
      editingText: '',
    });
  }

  // 删除项目
  deleteItem = async (index) => {
    const { activeTab, truths, dares } = this.state;
    const ok = await AppDialog.confirm({
      title: '确认删除',
      message: '确定要删除这条题目吗？',
      cancelText: '取消',
      confirmText: '删除',
    });
    if (!ok) return;
    if (activeTab === 'truth') {
      truths.splice(index, 1);
      this.setState({ truths });
    } else {
      dares.splice(index, 1);
      this.setState({ dares });
    }
  }

  // 添加新项目
  addNewItem = () => {
    const { activeTab, newItemText, truths, dares } = this.state;
    
    if (!newItemText.trim()) {
      ToastService.warn('内容不能为空');
      return;
    }

    if (activeTab === 'truth') {
      this.setState({
        truths: [...truths, newItemText.trim()],
        newItemText: '',
      });
    } else {
      this.setState({
        dares: [...dares, newItemText.trim()],
        newItemText: '',
      });
    }
  }

  // 保存并返回
  saveAndGoBack = () => {
    const { truths, dares } = this.state;
    const onUpdate = this.props.route?.params?.onUpdate;
    
    if (onUpdate) {
      onUpdate(truths, dares);
    }
    
    this.props.navigation.goBack();
  }

  // 渲染列表项
  renderItem = ({ item, index }) => {
    const { editingIndex, editingText } = this.state;
    const isEditing = editingIndex === index;

    return (
      <View style={styles.listItem}>
        {isEditing ? (
          // 编辑模式
          <View style={styles.editContainer}>
            <TextInput
              style={styles.editInput}
              value={editingText}
              onChangeText={(text) => this.setState({ editingText: text })}
              multiline
              autoFocus
            />
            <View style={styles.editButtons}>
              <TouchableOpacity 
                style={[styles.editButton, styles.saveButton]}
                onPress={this.saveEdit}
              >
                <Text style={styles.editButtonText}>保存</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.editButton, styles.cancelButton]}
                onPress={this.cancelEdit}
              >
                <Text style={styles.editButtonText}>取消</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          // 显示模式
          <View style={styles.itemContent}>
            <Text style={styles.itemIndex}>{index + 1}.</Text>
            <Text style={styles.itemText}>{item}</Text>
            <View style={styles.itemActions}>
              <TouchableOpacity 
                onPress={() => this.startEdit(index, item)}
                style={styles.actionButton}
              >
                <Icons name="edit" size={18} color={Colors.subject} />
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={() => this.deleteItem(index)}
                style={styles.actionButton}
              >
                <Icons name="delete" size={18} color="#FF4757" />
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    );
  }

  render() {
    const { activeTab, truths, dares, newItemText } = this.state;
    const currentList = activeTab === 'truth' ? truths : dares;

    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="white" />
        
        {/* 头部 */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => this.props.navigation.goBack()}
          >
            <Icons name="left" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>题库管理</Text>
          <TouchableOpacity 
            style={styles.saveButton}
            onPress={this.saveAndGoBack}
          >
            <Text style={styles.saveText}>保存</Text>
          </TouchableOpacity>
        </View>

        {/* 标签切换 */}
        <View style={styles.tabContainer}>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'truth' && styles.activeTab]}
            onPress={() => this.switchTab('truth')}
          >
            <Text style={[styles.tabText, activeTab === 'truth' && styles.activeTabText]}>
              💭 真心话 ({truths.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'dare' && styles.activeTab]}
            onPress={() => this.switchTab('dare')}
          >
            <Text style={[styles.tabText, activeTab === 'dare' && styles.activeTabText]}>
              ⚡ 大冒险 ({dares.length})
            </Text>
          </TouchableOpacity>
        </View>

        {/* 添加新项 */}
        <View style={styles.addContainer}>
          <TextInput
            style={styles.addInput}
            placeholder={`添加新的${activeTab === 'truth' ? '真心话' : '大冒险'}...`}
            value={newItemText}
            onChangeText={(text) => this.setState({ newItemText: text })}
            multiline
          />
          <TouchableOpacity 
            style={styles.addButton}
            onPress={this.addNewItem}
          >
            <Icons name="plus" size={24} color="#FFF" />
          </TouchableOpacity>
        </View>

        {/* 列表 */}
        <FlatList
          data={currentList}
          keyExtractor={(item, index) => `${activeTab}-${index}`}
          renderItem={this.renderItem}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>暂无题目，快来添加吧～</Text>
            </View>
          }
        />
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 12,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  saveButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: Colors.subject,
    borderRadius: 15,
  },
  saveText: {
    fontSize: 12,
    color: '#FFF',
    fontWeight: 'bold',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: Colors.subject,
  },
  tabText: {
    fontSize: 16,
    color: '#999',
  },
  activeTabText: {
    color: Colors.subject,
    fontWeight: 'bold',
  },
  addContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginBottom: 10,
    gap: 10,
  },
  addInput: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 10,
    fontSize: 14,
    maxHeight: 80,
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.subject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingHorizontal: 15,
  },
  listItem: {
    backgroundColor: '#FFF',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
  },
  itemContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  itemIndex: {
    fontSize: 14,
    color: '#999',
    marginRight: 10,
    marginTop: 2,
  },
  itemText: {
    flex: 1,
    fontSize: 15,
    color: '#333',
    lineHeight: 22,
  },
  itemActions: {
    flexDirection: 'row',
    gap: 10,
    marginLeft: 10,
  },
  actionButton: {
    padding: 5,
  },
  editContainer: {
    gap: 10,
  },
  editInput: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    minHeight: 60,
    textAlignVertical: 'top',
  },
  editButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  editButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 15,
  },

  cancelButton: {
    backgroundColor: '#999',
  },
  editButtonText: {
    fontSize: 14,
    color: '#FFF',
    fontWeight: 'bold',
  },
  emptyContainer: {
    paddingVertical: 50,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
  },
});

export default TruthOrDareList;

