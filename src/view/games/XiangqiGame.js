import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  ImageBackground,
  TouchableOpacity,
  Modal,
  StatusBar,
  Dimensions,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icons from 'react-native-vector-icons/AntDesign';

const { width: W, height: H } = Dimensions.get('window');
const COLS = 9;
const ROWS = 10;

/** 棋盘图比例约 1024×1152，尽量占满屏 */
const BOARD_ASPECT = 1152 / 1024;
const CHROME = Platform.OS === 'ios' ? 148 : 132;
const maxBoardH = H - CHROME;
let BOARD_W = W - 6;
let BOARD_H = BOARD_W * BOARD_ASPECT;
if (BOARD_H > maxBoardH) {
  BOARD_H = maxBoardH;
  BOARD_W = BOARD_H / BOARD_ASPECT;
}

/** 贴图外框内边距（对齐生成棋盘的木框） */
const INSET_X = BOARD_W * 0.105;
const INSET_Y = BOARD_H * 0.095;
const GRID_W = BOARD_W - INSET_X * 2;
const GRID_H = BOARD_H - INSET_Y * 2;
const CELL_X = GRID_W / (COLS - 1);
const CELL_Y = GRID_H / (ROWS - 1);
/** 略大于格距，字更大、更好认 */
const PIECE = Math.min(CELL_X, CELL_Y) * 1.08;
const PIECE_FONT = Math.max(18, Math.round(PIECE * 0.52));

const IMG = {
  bg: require('../../asserts/images/xiangqi/bg.png'),
  board: require('../../asserts/images/xiangqi/board.png'),
};

const C = {
  ink: '#FFF5F0',
  rose: '#E85AB8',
  roseDeep: '#FF8AD4',
  mute: 'rgba(255,245,240,0.62)',
  soft: 'rgba(255,255,255,0.14)',
  face: '#FFF6E4',
  red: '#C41E3A',
  redDeep: '#8E1428',
  black: '#1C1C1C',
  gold: '#E8B84A',
  legal: 'rgba(232,184,74,0.9)',
  check: 'rgba(255,70,70,0.7)',
};

const RED = 'r';
const BLACK = 'b';

const LABELS = {
  rK: '帅', rA: '仕', rB: '相', rN: '马', rR: '车', rC: '炮', rP: '兵',
  bK: '将', bA: '士', bB: '象', bN: '马', bR: '车', bC: '炮', bP: '卒',
};

function emptyBoard() {
  return Array.from({ length: ROWS }, () => Array(COLS).fill(null));
}

function createStartBoard() {
  const b = emptyBoard();
  const place = (r, c, side, type) => {
    b[r][c] = { side, type };
  };
  const back = ['R', 'N', 'B', 'A', 'K', 'A', 'B', 'N', 'R'];
  for (let c = 0; c < 9; c++) place(0, c, BLACK, back[c]);
  place(2, 1, BLACK, 'C');
  place(2, 7, BLACK, 'C');
  for (let c = 0; c < 9; c += 2) place(3, c, BLACK, 'P');
  for (let c = 0; c < 9; c++) place(9, c, RED, back[c]);
  place(7, 1, RED, 'C');
  place(7, 7, RED, 'C');
  for (let c = 0; c < 9; c += 2) place(6, c, RED, 'P');
  return b;
}

function inBound(r, c) {
  return r >= 0 && r < ROWS && c >= 0 && c < COLS;
}

function inPalace(r, c, side) {
  if (c < 3 || c > 5) return false;
  if (side === RED) return r >= 7 && r <= 9;
  return r >= 0 && r <= 2;
}

function cloneBoard(board) {
  return board.map((row) => row.map((p) => (p ? { ...p } : null)));
}

function findKing(board, side) {
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const p = board[r][c];
      if (p && p.side === side && p.type === 'K') return { r, c };
    }
  }
  return null;
}

function flyingGeneralExposed(board) {
  const rk = findKing(board, RED);
  const bk = findKing(board, BLACK);
  if (!rk || !bk || rk.c !== bk.c) return false;
  const c = rk.c;
  const minR = Math.min(rk.r, bk.r);
  const maxR = Math.max(rk.r, bk.r);
  for (let r = minR + 1; r < maxR; r++) {
    if (board[r][c]) return false;
  }
  return true;
}

function isEnemy(board, r, c, side) {
  const p = board[r][c];
  return p && p.side !== side;
}

function isEmpty(board, r, c) {
  return !board[r][c];
}

function rawMoves(board, r, c) {
  const piece = board[r][c];
  if (!piece) return [];
  const { side, type } = piece;
  const moves = [];
  const push = (nr, nc) => {
    if (!inBound(nr, nc)) return;
    const t = board[nr][nc];
    if (!t || t.side !== side) moves.push({ r: nr, c: nc });
  };

  if (type === 'K') {
    [[0, 1], [0, -1], [1, 0], [-1, 0]].forEach(([dr, dc]) => {
      const nr = r + dr;
      const nc = c + dc;
      if (inPalace(nr, nc, side)) push(nr, nc);
    });
    return moves;
  }

  if (type === 'A') {
    [[1, 1], [1, -1], [-1, 1], [-1, -1]].forEach(([dr, dc]) => {
      const nr = r + dr;
      const nc = c + dc;
      if (inPalace(nr, nc, side)) push(nr, nc);
    });
    return moves;
  }

  if (type === 'B') {
    [[2, 2], [2, -2], [-2, 2], [-2, -2]].forEach(([dr, dc]) => {
      const nr = r + dr;
      const nc = c + dc;
      const er = r + dr / 2;
      const ec = c + dc / 2;
      if (!inBound(nr, nc) || board[er][ec]) return;
      if (side === RED && nr < 5) return;
      if (side === BLACK && nr > 4) return;
      push(nr, nc);
    });
    return moves;
  }

  if (type === 'N') {
    [
      { dr: -2, dc: -1, br: -1, bc: 0 },
      { dr: -2, dc: 1, br: -1, bc: 0 },
      { dr: 2, dc: -1, br: 1, bc: 0 },
      { dr: 2, dc: 1, br: 1, bc: 0 },
      { dr: -1, dc: -2, br: 0, bc: -1 },
      { dr: 1, dc: -2, br: 0, bc: -1 },
      { dr: -1, dc: 2, br: 0, bc: 1 },
      { dr: 1, dc: 2, br: 0, bc: 1 },
    ].forEach(({ dr, dc, br, bc }) => {
      if (!inBound(r + br, c + bc) || board[r + br][c + bc]) return;
      push(r + dr, c + dc);
    });
    return moves;
  }

  if (type === 'R') {
    [[0, 1], [0, -1], [1, 0], [-1, 0]].forEach(([dr, dc]) => {
      let nr = r + dr;
      let nc = c + dc;
      while (inBound(nr, nc)) {
        if (isEmpty(board, nr, nc)) moves.push({ r: nr, c: nc });
        else {
          if (isEnemy(board, nr, nc, side)) moves.push({ r: nr, c: nc });
          break;
        }
        nr += dr;
        nc += dc;
      }
    });
    return moves;
  }

  if (type === 'C') {
    [[0, 1], [0, -1], [1, 0], [-1, 0]].forEach(([dr, dc]) => {
      let nr = r + dr;
      let nc = c + dc;
      let jumped = false;
      while (inBound(nr, nc)) {
        if (!jumped) {
          if (isEmpty(board, nr, nc)) moves.push({ r: nr, c: nc });
          else jumped = true;
        } else {
          if (!isEmpty(board, nr, nc)) {
            if (isEnemy(board, nr, nc, side)) moves.push({ r: nr, c: nc });
            break;
          }
        }
        nr += dr;
        nc += dc;
      }
    });
    return moves;
  }

  if (type === 'P') {
    const forward = side === RED ? -1 : 1;
    push(r + forward, c);
    const crossed = (side === RED && r <= 4) || (side === BLACK && r >= 5);
    if (crossed) {
      push(r, c - 1);
      push(r, c + 1);
    }
  }

  return moves;
}

function applyMove(board, from, to) {
  const next = cloneBoard(board);
  next[to.r][to.c] = next[from.r][from.c];
  next[from.r][from.c] = null;
  return next;
}

function isInCheck(board, side) {
  if (flyingGeneralExposed(board)) return true;
  const king = findKing(board, side);
  if (!king) return true;
  const opp = side === RED ? BLACK : RED;
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const p = board[r][c];
      if (!p || p.side !== opp) continue;
      if (rawMoves(board, r, c).some((m) => m.r === king.r && m.c === king.c)) {
        return true;
      }
    }
  }
  return false;
}

function legalMoves(board, r, c) {
  const piece = board[r][c];
  if (!piece) return [];
  const side = piece.side;
  return rawMoves(board, r, c).filter((to) => {
    const next = applyMove(board, { r, c }, to);
    if (!findKing(next, side)) return false;
    return !isInCheck(next, side);
  });
}

function hasAnyLegalMove(board, side) {
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const p = board[r][c];
      if (p && p.side === side && legalMoves(board, r, c).length) return true;
    }
  }
  return false;
}

class XiangqiGame extends React.Component {
  constructor(props) {
    super(props);
    this.state = this.freshState();
  }

  freshState = () => {
    const board = createStartBoard();
    return {
      board,
      turn: RED,
      selected: null,
      legal: [],
      inCheck: false,
      winner: null,
      winReason: '',
      modalVisible: false,
    };
  };

  restart = () => {
    this.setState(this.freshState());
  };

  onCellPress = (r, c) => {
    const { board, turn, selected, legal, winner } = this.state;
    if (winner) return;

    const piece = board[r][c];

    if (selected) {
      const isLegal = legal.some((m) => m.r === r && m.c === c);
      if (isLegal) {
        this.doMove(selected, { r, c });
        return;
      }
      if (piece && piece.side === turn) {
        this.setState({
          selected: { r, c },
          legal: legalMoves(board, r, c),
        });
        return;
      }
      this.setState({ selected: null, legal: [] });
      return;
    }

    if (piece && piece.side === turn) {
      this.setState({
        selected: { r, c },
        legal: legalMoves(board, r, c),
      });
    }
  };

  doMove = (from, to) => {
    const { board, turn } = this.state;
    const next = applyMove(board, from, to);
    const opp = turn === RED ? BLACK : RED;

    if (!findKing(next, opp)) {
      this.setState({
        board: next,
        selected: null,
        legal: [],
        turn,
        inCheck: false,
        winner: turn,
        winReason: '将死',
        modalVisible: true,
      });
      return;
    }

    const oppInCheck = isInCheck(next, opp);
    if (!hasAnyLegalMove(next, opp)) {
      this.setState({
        board: next,
        selected: null,
        legal: [],
        turn: opp,
        inCheck: oppInCheck,
        winner: turn,
        winReason: oppInCheck ? '将死' : '困毙',
        modalVisible: true,
      });
      return;
    }

    this.setState({
      board: next,
      selected: null,
      legal: [],
      turn: opp,
      inCheck: oppInCheck,
    });
  };

  pieceKey = (p) => (p ? `${p.side}${p.type}` : '');

  cellCenter = (r, c) => ({
    x: INSET_X + c * CELL_X,
    y: INSET_Y + r * CELL_Y,
  });

  renderPiecesAndTouch() {
    const { board, selected, legal, turn, inCheck } = this.state;
    const legalSet = {};
    legal.forEach((m) => {
      legalSet[`${m.r}_${m.c}`] = true;
    });
    const kingPos = inCheck ? findKing(board, turn) : null;
    const hit = Math.max(CELL_X, CELL_Y) * 0.98;

    const nodes = [];
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const p = board[r][c];
        const key = `${r}_${c}`;
        const { x, y } = this.cellCenter(r, c);
        const isSel = selected && selected.r === r && selected.c === c;
        const isLegal = !!legalSet[key];
        const isCheckKing = kingPos && kingPos.r === r && kingPos.c === c;

        nodes.push(
          <TouchableOpacity
            key={key}
            activeOpacity={0.7}
            onPress={() => this.onCellPress(r, c)}
            style={[
              styles.pointHit,
              {
                left: x - hit / 2,
                top: y - hit / 2,
                width: hit,
                height: hit,
              },
            ]}
          >
            {isLegal && !p ? <View style={styles.legalDot} /> : null}
            {isLegal && p ? <View style={styles.legalRing} /> : null}
            {p ? (
              <View
                style={[
                  styles.pieceWrap,
                  p.side === RED ? styles.pieceRed : styles.pieceBlack,
                  isSel && styles.pieceSelected,
                  isCheckKing && styles.pieceCheck,
                ]}
              >
                <View
                  style={[
                    styles.pieceInner,
                    p.side === RED ? styles.pieceInnerRed : styles.pieceInnerBlack,
                  ]}
                >
                  <Text
                    style={[
                      styles.pieceText,
                      { color: p.side === RED ? C.red : C.black },
                    ]}
                    allowFontScaling={false}
                  >
                    {LABELS[this.pieceKey(p)]}
                  </Text>
                </View>
              </View>
            ) : null}
          </TouchableOpacity>,
        );
      }
    }
    return nodes;
  }

  render() {
    const { turn, inCheck, winner, winReason, modalVisible } = this.state;
    const turnLabel = turn === RED ? '红方' : '黑方';
    const winLabel =
      winner === RED ? '红方获胜' : winner === BLACK ? '黑方获胜' : '';

    return (
      <View style={styles.root}>
        <StatusBar
          translucent
          backgroundColor="transparent"
          barStyle="light-content"
        />
        <ImageBackground source={IMG.bg} style={styles.bg} resizeMode="cover">
          <View style={styles.bgDim} />
          <SafeAreaView edges={['top', 'bottom']} style={styles.safe}>
            <View style={styles.topBar}>
              <TouchableOpacity
                style={styles.iconBtn}
                onPress={() => this.props.navigation.goBack()}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Icons name="left" size={22} color="#fff" />
              </TouchableOpacity>
              <Text style={styles.title}>中国象棋</Text>
              <TouchableOpacity
                style={styles.iconBtn}
                onPress={this.restart}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Icons name="reload1" size={20} color="#fff" />
              </TouchableOpacity>
            </View>

            <View style={styles.turnWrap}>
              <View style={[styles.turnChip, turn === RED && styles.turnActive]}>
                <View style={[styles.turnDot, { backgroundColor: '#C23A2B' }]} />
                <Text style={[styles.turnText, turn === RED && styles.turnTextActive]}>
                  红方
                </Text>
              </View>
              <Text style={styles.turnHint}>
                {winner
                  ? '对局结束'
                  : inCheck
                    ? `${turnLabel}被将军`
                    : `${turnLabel}行棋`}
              </Text>
              <View style={[styles.turnChip, turn === BLACK && styles.turnActive]}>
                <View style={[styles.turnDot, { backgroundColor: '#1A1A1A' }]} />
                <Text style={[styles.turnText, turn === BLACK && styles.turnTextActive]}>
                  黑方
                </Text>
              </View>
            </View>

            <View style={styles.boardStage}>
              <View style={[styles.boardGlow, { width: BOARD_W + 10, height: BOARD_H + 10 }]} />
              <View style={[styles.boardFrame, { width: BOARD_W, height: BOARD_H }]}>
                <Image source={IMG.board} style={styles.boardImg} resizeMode="stretch" />
                {this.renderPiecesAndTouch()}
              </View>
            </View>

            <Text style={styles.tip}>先点棋子再点落点 · 红先</Text>
          </SafeAreaView>
        </ImageBackground>

        <Modal visible={modalVisible} transparent animationType="fade">
          <View style={styles.modalMask}>
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>{winLabel}</Text>
              <Text style={styles.modalSub}>{winReason || '对局结束'}</Text>
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
  root: { flex: 1, backgroundColor: '#1a0820' },
  bg: { flex: 1 },
  bgDim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(12,4,18,0.42)',
  },
  safe: { flex: 1 },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: C.soft,
    alignItems: 'center',
    justifyContent: 'center',
  },
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
    marginBottom: 6,
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
    gap: 6,
  },
  turnActive: {
    backgroundColor: 'rgba(232,90,184,0.28)',
  },
  turnDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  turnText: {
    fontSize: 14,
    fontWeight: '600',
    color: C.mute,
  },
  turnTextActive: {
    color: '#fff',
    fontWeight: '800',
  },
  turnHint: {
    fontSize: 13,
    color: C.roseDeep,
    fontWeight: '700',
  },
  boardStage: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boardGlow: {
    position: 'absolute',
    borderRadius: 22,
    backgroundColor: 'rgba(255,180,80,0.12)',
  },
  boardFrame: {
    borderRadius: 16,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.45,
        shadowRadius: 18,
        shadowOffset: { width: 0, height: 10 },
      },
      android: { elevation: 10 },
    }),
  },
  boardImg: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  pointHit: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pieceWrap: {
    width: PIECE,
    height: PIECE,
    borderRadius: PIECE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: C.face,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.35,
        shadowRadius: 3,
        shadowOffset: { width: 0, height: 2 },
      },
      android: { elevation: 5 },
    }),
  },
  pieceRed: {
    borderWidth: 3,
    borderColor: C.red,
  },
  pieceBlack: {
    borderWidth: 3,
    borderColor: C.black,
  },
  pieceInner: {
    width: PIECE - 10,
    height: PIECE - 10,
    borderRadius: (PIECE - 10) / 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: C.face,
    borderWidth: 1.5,
  },
  pieceInnerRed: {
    borderColor: 'rgba(196,30,58,0.35)',
  },
  pieceInnerBlack: {
    borderColor: 'rgba(28,28,28,0.28)',
  },
  pieceText: {
    fontSize: PIECE_FONT,
    fontWeight: '900',
    includeFontPadding: false,
    textAlign: 'center',
    ...Platform.select({
      ios: { fontFamily: 'PingFangSC-Semibold' },
      android: { fontFamily: 'sans-serif-medium' },
    }),
  },
  pieceSelected: {
    transform: [{ scale: 1.1 }],
    borderColor: C.gold,
    borderWidth: 3.5,
  },
  pieceCheck: {
    borderColor: '#FF4D4F',
    borderWidth: 3.5,
  },
  legalDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: C.legal,
    borderWidth: 2,
    borderColor: '#fff',
  },
  legalRing: {
    position: 'absolute',
    width: PIECE + 10,
    height: PIECE + 10,
    borderRadius: (PIECE + 10) / 2,
    borderWidth: 3,
    borderColor: C.gold,
  },
  tip: {
    textAlign: 'center',
    marginBottom: 8,
    marginTop: 4,
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
  modalTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 8,
  },
  modalSub: {
    fontSize: 14,
    color: C.mute,
    marginBottom: 22,
  },
  primaryBtn: {
    width: '100%',
    backgroundColor: C.rose,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 10,
  },
  primaryBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  ghostBtn: {
    width: '100%',
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  ghostBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
});

export default XiangqiGame;
