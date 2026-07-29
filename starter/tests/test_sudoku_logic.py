import random

import sudoku_logic


def test_create_empty_board():
    board = sudoku_logic.create_empty_board()
    assert len(board) == sudoku_logic.SIZE
    assert all(len(row) == sudoku_logic.SIZE for row in board)
    assert all(cell == sudoku_logic.EMPTY for row in board for cell in row)


def test_is_safe_checks_row_column_and_box():
    board = sudoku_logic.create_empty_board()
    board[0][0] = 5

    assert not sudoku_logic.is_safe(board, 0, 1, 5)
    assert not sudoku_logic.is_safe(board, 1, 0, 5)
    assert not sudoku_logic.is_safe(board, 1, 1, 5)
    assert sudoku_logic.is_safe(board, 1, 1, 6)


def test_fill_board_completes_valid_solution():
    board = sudoku_logic.create_empty_board()
    random.seed(0)
    assert sudoku_logic.fill_board(board)

    expected = list(range(1, sudoku_logic.SIZE + 1))
    assert all(sorted(row) == expected for row in board)
    assert all(sorted(board[row][col] for row in range(sudoku_logic.SIZE)) == expected for col in range(sudoku_logic.SIZE))

    for box_row in range(0, sudoku_logic.SIZE, 3):
        for box_col in range(0, sudoku_logic.SIZE, 3):
            box_values = []
            for row in range(box_row, box_row + 3):
                for col in range(box_col, box_col + 3):
                    box_values.append(board[row][col])
            assert sorted(box_values) == expected


def test_generate_puzzle_returns_puzzle_and_solution_consistency():
    random.seed(0)
    puzzle, solution = sudoku_logic.generate_puzzle(clues=35)

    assert len(puzzle) == sudoku_logic.SIZE
    assert len(solution) == sudoku_logic.SIZE
    assert sum(cell != sudoku_logic.EMPTY for row in puzzle for cell in row) == 35
    assert all(cell != sudoku_logic.EMPTY for row in solution for cell in row)

    for row in range(sudoku_logic.SIZE):
        for col in range(sudoku_logic.SIZE):
            if puzzle[row][col] != sudoku_logic.EMPTY:
                assert puzzle[row][col] == solution[row][col]


def test_generate_puzzle_has_unique_solution():
    random.seed(1)
    puzzle, solution = sudoku_logic.generate_puzzle(clues=35)
    assert sudoku_logic.count_solutions(puzzle, limit=2) == 1
