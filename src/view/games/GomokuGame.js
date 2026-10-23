import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Modal,
  StatusBar,
  Dimensions,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icons from 'react-native-vector-icons/AntDesign';

const { width: W, height: H } = Dimensions.get('window');
const SIZE = 15;
const CHROME = Platform.OS === 'ios' ? 160 : 140;
const BOARD = Math.min(W - 12, H - CHROME, 420);
const CELL = BOARD / (SIZE - 1);
const STONE = CELL * 0.88;

const C = {
  ink: '#FFF5F0',
  mute: 'rgba(255,245,240,0.62)',
  soft: 'rgba(255,255,255,0.14)',
  rose: '#E85AB8',
  roseDeep: '#FF8AD4',
  wood: '#D4A574',
  woodDeep: '#8B5A2B',
  line: 'rgba(60,35,15,0.55)',
  black: '#1A1A1A',
  white: '#FFFAF5',
  last: '#FF4D6A',
};

const emptyBoard = () =>
  Array.from({ length: SIZE }, () => Array(SIZE).fill(0));

function checkWin(board, r, c, player) {
  const dirs = [
    [0, 1],
    [1, 0],
    [1, 1],
    [1, -1],
  ];
  for (let d = 0; d < dirs.length; d++) {
    const [dr, dc] = dirs[d];
    let count = 1;
    for (let s = 1; s < 5; s++) {
      const nr = r + dr * s;
      const nc = c + dc * s;
      if (nr < 0 || nr >= SIZE || nc < 0 || nc >= SIZE || board[nr][nc] !== player) break;
      count++;
    }
    for (let s = 1; s < 5; s++) {
      const nr = r - dr * s;
      const nc = c - dc * s;
      if (nr < 0 || nr >= SIZE || nc < 0 || nc >= SIZE || board[nr][nc] !== player) break;
      count++;
    }
    if (count >= 5) return true;
  }
  return false;
}

function isBoardFull(board) {
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      if (board[r][c] === 0) return false;
    }
  }
  return true;
}

class GomokuGame extends React.Component {
  constructor(props) {
    super(props);
    this.state = this.freshState();
  }

  freshState = () => ({
    board: emptyBoard(),
    turn: 1,
    lastMove: null,
    winner: null, // 1 | 2 | 0 draw
    modalVisible: false,
    history: [],
  });

  restart = () => {
    this.setState(this.freshState());
  };

  undo = () => {
    const { history, winner } = this.state;
    if (!history.length || winner !== null) return;
    const prev = history[history.length - 1];
    this.setState({
      board: prev.board,
      turn: prev.turn,
      lastMove: prev.lastMove,
      history: history.slice(0, -1),
    });
  };

  place = (r, c) => {
    const { board, turn, winner, history, lastMove } = this.state;
    if (winner !== null || board[r][c] !== 0) return;

    const next = board.map((row) => row.slice());
    next[r][c] = turn;
    const won = checkWin(next, r, c, turn);
    const full = !won && isBoardFull(next);
    const end = won || full;

    this.setState({
      board: next,
      lastMove: { r, c },
      turn: end ? turn : turn === 1 ? 2 : 1,
      winner: won ? turn : full ? 0 : null,
      modalVisible: end,
      history: [...history, { board, turn, lastMove }],
    });
  };

  renderGridLines() {
    const lines = [];
    for (let i = 0; i < SIZE; i++) {
      lines.push(
        <View key={`h${i}`} style={[styles.hLine, { top: i * CELL, width: BOARD }]} />,
      );
      lines.push(
        <View key={`v${i}`} style={[styles.vLine, { left: i * CELL, height: BOARD }]} />,
      );
    }
    [[3, 3], [3, 11], [7, 7], [11, 3], [11, 11]].forEach(([r, c], idx) => {
      lines.push(
        <View
          key={`s${idx}`}
          style={[styles.star, { left: c * CELL - 3.5, top: r * CELL - 3.5 }]}
        />,
      );
    });
    return lines;
  }

  renderStones() {
    const { board, lastMove } = this.state;
    const stones = [];
    for (let r = 0; r < SIZE; r++) {
      for (let c = 0; c < SIZE; c++) {
        const v = board[r][c];
        if (!v) continue;
        const isLast = lastMove && lastMove.r === r && lastMove.c === c;
        const isBlack = v === 1;
        stones.push(
          <View
            key={`p${r}_${c}`}
            style={[
              styles.stone,
              isBlack ? styles.stoneBlack : styles.stoneWhite,
              {
                left: c * CELL - STONE / 2,
                top: r * CELL - STONE / 2,
              },
              isLast && styles.stoneLast,
            ]}
          >
            <View style={[styles.stoneShine, isBlack && styles.stoneShineDark]} />
            {isLast ? <View style={styles.lastDot} /> : null}
          </View>,
        );
      }
    }
    return stones;
  }

  renderTouchCells() {
    const cells = [];
    for (let r = 0; r < SIZE; r++) {
      for (let c = 0; c < SIZE; c++) {
        cells.push(
          <TouchableOpacity
            key={`t${r}_${c}`}
            activeOpacity={0.35}
            style={[
              styles.touchCell,
              {
                left: c * CELL - CELL / 2,
                top: r * CELL - CELL / 2,
                width: CELL,
                height: CELL,
              },
            ]}
            onPress={() => this.place(r, c)}
          />,
        );
      }
    }
    return cells;
  }

  render() {
    const { turn, winner, modalVisible, history } = this.state;
    const turnLabel = turn === 1 ? '黑方' : '白方';
    let winLabel = '平局';
    if (winner === 1) winLabel = '黑方获胜';
    if (winner === 2) winLabel = '白方获胜';

    return (
      <View style={styles.root}>
        <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
        <SafeAreaView edges={['top', 'bottom']} style={styles.safe}>
          <View style={styles.topBar}>
            <TouchableOpacity
              style={styles.iconBtn}
              onPress={() => this.props.navigation.goBack()}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Icons name="left" size={22} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.title}>五子棋</Text>
            <View style={styles.topRight}>
              <TouchableOpacity
                style={[styles.iconBtn, !history.length && styles.iconBtnDisabled]}
                onPress={this.undo}
                disabled={!history.length || winner !== null}
              >
                <Icons name="back" size={18} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconBtn} onPress={this.restart}>
                <Icons name="reload1" size={18} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.turnWrap}>
            <View style={[styles.turnChip, turn === 1 && styles.turnActive]}>
              <View style={[styles.miniStone, styles.stoneBlack]} />
              <Text style={[styles.turnText, turn === 1 && styles.turnTextActive]}>黑方</Text>
            </View>
            <Text style={styles.turnHint}>
              {winner !== null ? '对局结束' : `${turnLabel}落子`}
            </Text>
            <View style={[styles.turnChip, turn === 2 && styles.turnActive]}>
              <View style={[styles.miniStone, styles.stoneWhite]} />
              <Text style={[styles.turnText, turn === 2 && styles.turnTextActive]}>白方</Text>
            </View>
          </View>

          <View style={styles.boardStage}>
            <View style={styles.boardFrame}>
              <View style={[styles.board, { width: BOARD, height: BOARD }]}>
                {this.renderGridLines()}
                {this.renderStones()}
                {this.renderTouchCells()}
              </View>
            </View>
          </View>

          <Text style={styles.tip}>连成五子即胜 · 黑先 · 可悔棋</Text>
        </SafeAreaView>

        <Modal visible={modalVisible} transparent animationType="fade">
          <View style={styles.modalMask}>
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>{winLabel}</Text>
              <Text style={styles.modalSub}>再来一局，或返回首页</Text>
              <TouchableOpacity style={styles.primaryBtn} onPress={this.restart}>
                <Text style={styles.primaryBtnText}>再来一局</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.ghostBtn}
                onPress={() => {
                  this.setState({ modalVisible: false });
                  this.props.navigation.goBack();
                }}
              >
                <Text style={styles.ghostBtnText}>返回</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#1a0c14' },
  safe: { flex: 1 },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  topRight: { flexDirection: 'row', gap: 8 },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: C.soft,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 6,
  },
  iconBtnDisabled: { opacity: 0.35 },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: C.ink,
    letterSpacing: 2,
  },
  turnWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 14,
    marginBottom: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.28)',
  },
  turnChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  turnActive: { backgroundColor: 'rgba(232,90,184,0.28)' },
  miniStone: {
    width: 14,
    height: 14,
    borderRadius: 7,
    marginRight: 6,
  },
  turnText: { fontSize: 14, color: C.mute, fontWeight: '600' },
  turnTextActive: { color: '#fff', fontWeight: '800' },
  turnHint: { fontSize: 13, color: C.roseDeep, fontWeight: '700' },
  boardStage: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  boardFrame: {
    padding: 14,
    borderRadius: 18,
    backgroundColor: C.woodDeep,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.4,
        shadowRadius: 16,
        shadowOffset: { width: 0, height: 8 },
      },
      android: { elevation: 8 },
    }),
  },
  board: {
    backgroundColor: C.wood,
    borderRadius: 4,
  },
  hLine: {
    position: 'absolute',
    left: 0,
    height: StyleSheet.hairlineWidth * 2,
    backgroundColor: C.line,
  },
  vLine: {
    position: 'absolute',
    top: 0,
    width: StyleSheet.hairlineWidth * 2,
    backgroundColor: C.line,
  },
  star: {
    position: 'absolute',
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: 'rgba(60,35,15,0.75)',
  },
  stone: {
    position: 'absolute',
    width: STONE,
    height: STONE,
    borderRadius: STONE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.35,
        shadowRadius: 3,
        shadowOffset: { width: 0, height: 2 },
      },
      android: { elevation: 4 },
    }),
  },
  stoneBlack: {
    backgroundColor: '#222',
    borderWidth: 1,
    borderColor: '#000',
  },
  stoneWhite: {
    backgroundColor: '#FFFDF8',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.18)',
  },
  stoneShine: {
    position: 'absolute',
    top: STONE * 0.14,
    left: STONE * 0.18,
    width: STONE * 0.32,
    height: STONE * 0.22,
    borderRadius: STONE * 0.16,
    backgroundColor: 'rgba(255,255,255,0.55)',
  },
  stoneShineDark: {
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  stoneLast: {
    borderWidth: 2,
    borderColor: C.last,
  },
  lastDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: C.last,
  },
  touchCell: { position: 'absolute' },
  tip: {
    textAlign: 'center',
    marginBottom: 10,
    fontSize: 12,
    color: C.mute,
  },
  modalMask: {
    flex: 1,
    backgroundColor: 'rgba(10,4,16,0.62)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 28,
  },
  modalCard: {
    width: '100%',
    maxWidth: 320,
    backgroundColor: '#2A1420',
    borderRadius: 22,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  modalTitle: { fontSize: 22, fontWeight: '800', color: '#fff', marginBottom: 8 },
  modalSub: { fontSize: 14, color: C.mute, marginBottom: 22 },
  primaryBtn: {
    width: '100%',
    backgroundColor: C.rose,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 10,
  },
  primaryBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  ghostBtn: {
    width: '100%',
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  ghostBtnText: { color: '#fff', fontSize: 15, fontWeight: '600' },
});

export default GomokuGame;
