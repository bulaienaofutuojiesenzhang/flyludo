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
const SIZE = 8;
const CHROME = Platform.OS === 'ios' ? 170 : 150;
const BOARD = Math.min(W - 16, H - CHROME, 400);
const CELL = BOARD / SIZE;
const DISC = CELL * 0.78;

const C = {
  ink: '#FFF5F0',
  mute: 'rgba(255,245,240,0.62)',
  soft: 'rgba(255,255,255,0.14)',
  rose: '#E85AB8',
  roseDeep: '#FF8AD4',
  green: '#2F8A5A',
  greenDeep: '#1E5C3A',
  black: '#1A1A1A',
  white: '#FFFAF5',
  hint: 'rgba(255,230,120,0.85)',
  last: '#FFE08A',
};

const DIRS = [
  [-1, -1], [-1, 0], [-1, 1],
  [0, -1],           [0, 1],
  [1, -1],  [1, 0],  [1, 1],
];

function createStartBoard() {
  const b = Array.from({ length: SIZE }, () => Array(SIZE).fill(0));
  b[3][3] = 2;
  b[3][4] = 1;
  b[4][3] = 1;
  b[4][4] = 2;
  return b;
}

function inBound(r, c) {
  return r >= 0 && r < SIZE && c >= 0 && c < SIZE;
}

function flipsAt(board, r, c, player) {
  if (board[r][c] !== 0) return [];
  const opp = player === 1 ? 2 : 1;
  const flips = [];
  for (let i = 0; i < DIRS.length; i++) {
    const [dr, dc] = DIRS[i];
    let nr = r + dr;
    let nc = c + dc;
    const line = [];
    while (inBound(nr, nc) && board[nr][nc] === opp) {
      line.push([nr, nc]);
      nr += dr;
      nc += dc;
    }
    if (line.length && inBound(nr, nc) && board[nr][nc] === player) {
      for (let k = 0; k < line.length; k++) flips.push(line[k]);
    }
  }
  return flips;
}

function validMoves(board, player) {
  const moves = [];
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      if (flipsAt(board, r, c, player).length) moves.push({ r, c });
    }
  }
  return moves;
}

function countDiscs(board) {
  let black = 0;
  let white = 0;
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      if (board[r][c] === 1) black++;
      else if (board[r][c] === 2) white++;
    }
  }
  return { black, white };
}

class OthelloGame extends React.Component {
  constructor(props) {
    super(props);
    this.state = this.freshState();
  }

  freshState = () => {
    const board = createStartBoard();
    return {
      board,
      turn: 1,
      moves: validMoves(board, 1),
      winner: null,
      modalVisible: false,
      passHint: '',
      lastMove: null,
      history: [],
    };
  };

  restart = () => {
    this.setState(this.freshState());
  };

  undo = () => {
    const { history, winner } = this.state;
    if (!history.length || winner !== null) return;
    const prev = history[history.length - 1];
    this.setState({ ...prev, history: history.slice(0, -1), modalVisible: false });
  };

  endGame = (board) => {
    const { black, white } = countDiscs(board);
    let winner = 0;
    if (black > white) winner = 1;
    else if (white > black) winner = 2;
    this.setState({
      board,
      winner,
      moves: [],
      modalVisible: true,
      passHint: '',
    });
  };

  switchTurn = (board, fromPlayer, lastMove, historySnap) => {
    const next = fromPlayer === 1 ? 2 : 1;
    const nextMoves = validMoves(board, next);
    if (nextMoves.length) {
      this.setState({
        board,
        turn: next,
        moves: nextMoves,
        passHint: '',
        lastMove,
        history: historySnap,
      });
      return;
    }
    const backMoves = validMoves(board, fromPlayer);
    if (backMoves.length) {
      this.setState({
        board,
        turn: fromPlayer,
        moves: backMoves,
        passHint: `${next === 1 ? '黑方' : '白方'}无棋可走，跳过`,
        lastMove,
        history: historySnap,
      });
      return;
    }
    this.setState({ lastMove, history: historySnap });
    this.endGame(board);
  };

  place = (r, c) => {
    const { board, turn, winner, moves, lastMove, history, passHint } = this.state;
    if (winner !== null) return;
    const ok = moves.some((m) => m.r === r && m.c === c);
    if (!ok) return;

    const flips = flipsAt(board, r, c, turn);
    const next = board.map((row) => row.slice());
    next[r][c] = turn;
    for (let i = 0; i < flips.length; i++) {
      const [fr, fc] = flips[i];
      next[fr][fc] = turn;
    }
    const snap = [
      ...history,
      { board, turn, moves, lastMove, passHint, winner: null },
    ];
    this.switchTurn(next, turn, { r, c }, snap);
  };

  renderBoard() {
    const { board, moves, winner, lastMove } = this.state;
    const hintSet = {};
    if (winner === null) {
      moves.forEach((m) => {
        hintSet[`${m.r}_${m.c}`] = true;
      });
    }

    const rows = [];
    for (let r = 0; r < SIZE; r++) {
      const cells = [];
      for (let c = 0; c < SIZE; c++) {
        const v = board[r][c];
        const hint = hintSet[`${r}_${c}`];
        const isLast = lastMove && lastMove.r === r && lastMove.c === c;
        cells.push(
          <TouchableOpacity
            key={`c${r}_${c}`}
            activeOpacity={0.7}
            style={styles.cell}
            onPress={() => this.place(r, c)}
          >
            {v === 1 || v === 2 ? (
              <View
                style={[
                  styles.disc,
                  v === 1 ? styles.discBlack : styles.discWhite,
                  isLast && styles.discLast,
                ]}
              >
                <View style={[styles.discShine, v === 1 && styles.discShineDark]} />
              </View>
            ) : hint ? (
              <View style={styles.hint} />
            ) : null}
          </TouchableOpacity>,
        );
      }
      rows.push(
        <View key={`r${r}`} style={styles.row}>
          {cells}
        </View>,
      );
    }
    return rows;
  }

  render() {
    const { turn, winner, modalVisible, passHint, board, history } = this.state;
    const { black, white } = countDiscs(board);
    const turnLabel = turn === 1 ? '黑方' : '白方';
    let resultText = '平局';
    if (winner === 1) resultText = '黑方获胜';
    if (winner === 2) resultText = '白方获胜';

    return (
      <View style={styles.root}>
        <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
        <SafeAreaView edges={['top', 'bottom']} style={styles.safe}>
          <View style={styles.topBar}>
            <TouchableOpacity
              style={styles.iconBtn}
              onPress={() => this.props.navigation.goBack()}
            >
              <Icons name="left" size={22} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.title}>黑白棋</Text>
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

          <View style={styles.scoreRow}>
            <View style={[styles.scoreCard, turn === 1 && styles.scoreActive]}>
              <View style={[styles.miniDisc, styles.discBlack]} />
              <Text style={styles.scoreNum}>{black}</Text>
              <Text style={styles.scoreLabel}>黑</Text>
            </View>
            <Text style={styles.turnHint}>
              {winner !== null ? '对局结束' : `${turnLabel}行棋`}
            </Text>
            <View style={[styles.scoreCard, turn === 2 && styles.scoreActive]}>
              <View style={[styles.miniDisc, styles.discWhite]} />
              <Text style={styles.scoreNum}>{white}</Text>
              <Text style={styles.scoreLabel}>白</Text>
            </View>
          </View>

          {passHint ? <Text style={styles.passHint}>{passHint}</Text> : null}

          <View style={styles.boardStage}>
            <View style={styles.boardFrame}>
              <View style={[styles.board, { width: BOARD, height: BOARD }]}>
                {this.renderBoard()}
              </View>
            </View>
          </View>

          <Text style={styles.tip}>亮点为可落子位置 · 黑先 · 可悔棋</Text>
        </SafeAreaView>

        <Modal visible={modalVisible} transparent animationType="fade">
          <View style={styles.modalMask}>
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>{resultText}</Text>
              <Text style={styles.modalSub}>
                黑 {black} · 白 {white}
              </Text>
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
  root: { flex: 1, backgroundColor: '#0d1a14' },
  safe: { flex: 1 },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  topRight: { flexDirection: 'row' },
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
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 14,
    marginBottom: 6,
  },
  scoreCard: {
    minWidth: 88,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.28)',
  },
  scoreActive: {
    backgroundColor: 'rgba(232,90,184,0.28)',
    borderWidth: 1,
    borderColor: 'rgba(255,138,212,0.45)',
  },
  miniDisc: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 8,
  },
  scoreNum: {
    fontSize: 20,
    fontWeight: '800',
    color: '#fff',
    marginRight: 4,
  },
  scoreLabel: { fontSize: 13, color: C.mute, fontWeight: '600' },
  turnHint: { fontSize: 13, color: C.roseDeep, fontWeight: '700' },
  passHint: {
    textAlign: 'center',
    color: C.roseDeep,
    fontSize: 13,
    marginBottom: 4,
    fontWeight: '600',
  },
  boardStage: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  boardFrame: {
    padding: 12,
    borderRadius: 18,
    backgroundColor: C.greenDeep,
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
    backgroundColor: C.green,
    borderRadius: 10,
    overflow: 'hidden',
  },
  row: { flexDirection: 'row' },
  cell: {
    width: CELL,
    height: CELL,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.22)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  disc: {
    width: DISC,
    height: DISC,
    borderRadius: DISC / 2,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.3,
        shadowRadius: 2,
        shadowOffset: { width: 0, height: 1 },
      },
      android: { elevation: 3 },
    }),
  },
  discBlack: {
    backgroundColor: '#1C1C1C',
    borderWidth: 1,
    borderColor: '#000',
  },
  discWhite: {
    backgroundColor: '#FFFDF8',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.12)',
  },
  discShine: {
    position: 'absolute',
    top: DISC * 0.14,
    left: DISC * 0.18,
    width: DISC * 0.34,
    height: DISC * 0.22,
    borderRadius: DISC * 0.16,
    backgroundColor: 'rgba(255,255,255,0.55)',
  },
  discShineDark: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  discLast: {
    borderWidth: 2.5,
    borderColor: C.last,
  },
  hint: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: C.hint,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.55)',
  },
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
    backgroundColor: '#14261C',
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

export default OthelloGame;
