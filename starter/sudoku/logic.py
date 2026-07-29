import copy
import random

SIZE = 9
EMPTY = 0


def deep_copy(board):
    return copy.deepcopy(board)


def create_empty_board():
    return [[EMPTY for _ in range(SIZE)] for _ in range(SIZE)]


def is_safe(board, row, col, num):
    # Check row and column
    for x in range(SIZE):
        if board[row][x] == num or board[x][col] == num:
            return False
    # Check 3x3 box
    start_row = row - row % 3
    start_col = col - col % 3
    for i in range(3):
        for j in range(3):
            if board[start_row + i][start_col + j] == num:
                return False
    return True


def fill_board(board):
    for row in range(SIZE):
        for col in range(SIZE):
            if board[row][col] == EMPTY:
                possible = list(range(1, SIZE + 1))
                random.shuffle(possible)
                for candidate in possible:
                    if is_safe(board, row, col, candidate):
                        board[row][col] = candidate
                        if fill_board(board):
                            return True
                        board[row][col] = EMPTY
                return False
    return True


def find_empty_cell(board):
    best_cell = None
    best_options = None
    for row in range(SIZE):
        for col in range(SIZE):
            if board[row][col] == EMPTY:
                options = [num for num in range(1, SIZE + 1) if is_safe(board, row, col, num)]
                if best_options is None or len(options) < len(best_options):
                    best_cell = (row, col)
                    best_options = options
                    if len(best_options) == 1:
                        return best_cell[0], best_cell[1], best_options
    if best_cell is None:
        return None
    return best_cell[0], best_cell[1], best_options


def count_solutions(board, limit=2):
    next_cell = find_empty_cell(board)
    if next_cell is None:
        return 1
    row, col, options = next_cell
    count = 0
    for num in options:
        board[row][col] = num
        count += count_solutions(board, limit)
        board[row][col] = EMPTY
        if count >= limit:
            return count
    return count


def remove_cells(board, clues):
    target_removed = SIZE * SIZE - clues
    positions = [(row, col) for row in range(SIZE) for col in range(SIZE)]
    random.shuffle(positions)
    removed = 0
    progress = True

    while removed < target_removed and progress:
        progress = False
        for row, col in positions[:]:
            if removed >= target_removed:
                break
            if board[row][col] == EMPTY:
                continue
            backup = board[row][col]
            board[row][col] = EMPTY
            if count_solutions(board, limit=2) == 1:
                removed += 1
                positions.remove((row, col))
                progress = True
            else:
                board[row][col] = backup

    return removed == target_removed


def generate_puzzle(clues=35):
    while True:
        board = create_empty_board()
        fill_board(board)
        solution = deep_copy(board)
        if remove_cells(board, clues):
            puzzle = deep_copy(board)
            return puzzle, solution
