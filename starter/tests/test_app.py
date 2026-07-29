import pytest

import app
import sudoku_logic


@pytest.fixture(autouse=True)
def reset_current_state():
    app.CURRENT['puzzle'] = None
    app.CURRENT['solution'] = None
    yield
    app.CURRENT['puzzle'] = None
    app.CURRENT['solution'] = None


def test_index_returns_html():
    client = app.app.test_client()
    response = client.get('/')

    assert response.status_code == 200
    assert b'<html' in response.data.lower()


def test_new_game_generates_puzzle_and_stores_solution():
    client = app.app.test_client()
    response = client.get('/new?clues=40')

    assert response.status_code == 200

    data = response.get_json()
    puzzle = data['puzzle']

    assert len(puzzle) == sudoku_logic.SIZE
    assert sum(cell != sudoku_logic.EMPTY for row in puzzle for cell in row) == 40
    assert app.CURRENT['solution'] is not None
    assert app.CURRENT['puzzle'] == puzzle


def test_new_game_respects_difficulty_easy():
    client = app.app.test_client()
    response = client.get('/new?difficulty=easy')
    assert response.status_code == 200
    data = response.get_json()
    puzzle = data['puzzle']
    assert sum(cell != sudoku_logic.EMPTY for row in puzzle for cell in row) == 45


def test_new_game_respects_difficulty_medium():
    client = app.app.test_client()
    response = client.get('/new?difficulty=medium')
    assert response.status_code == 200
    data = response.get_json()
    puzzle = data['puzzle']
    assert sum(cell != sudoku_logic.EMPTY for row in puzzle for cell in row) == 35


def test_new_game_respects_difficulty_hard():
    client = app.app.test_client()
    response = client.get('/new?difficulty=hard')
    assert response.status_code == 200
    data = response.get_json()
    puzzle = data['puzzle']
    assert sum(cell != sudoku_logic.EMPTY for row in puzzle for cell in row) == 30


def test_check_solution_returns_error_without_game():
    client = app.app.test_client()
    response = client.post('/check', json={'board': sudoku_logic.create_empty_board()})

    assert response.status_code == 400
    assert response.get_json() == {'error': 'No game in progress'}


def test_check_solution_returns_no_incorrect_for_correct_board():
    client = app.app.test_client()
    client.get('/new?clues=45')

    response = client.post('/check', json={'board': app.CURRENT['solution']})
    assert response.status_code == 200
    assert response.get_json() == {'incorrect': []}


def test_check_solution_reports_incorrect_cells():
    client = app.app.test_client()
    client.get('/new?clues=45')

    board = [row.copy() for row in app.CURRENT['solution']]
    board[0][0] = board[0][0] % sudoku_logic.SIZE + 1

    response = client.post('/check', json={'board': board})
    assert response.status_code == 200
    assert response.get_json() == {'incorrect': [[0, 0]]}
