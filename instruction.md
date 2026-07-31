# GitHub Copilot Instructions

## Project Overview

This project is a Flask-based Sudoku web application that has been refactored from a legacy codebase into a modern, modular application using GitHub Copilot.

## Coding Standards

- Follow modern Python and Flask best practices.
- Keep functions small, modular, and reusable.
- Use meaningful variable and function names.
- Add comments only where they improve readability.
- Preserve existing functionality unless explicitly requested.
- Handle errors gracefully.
- Avoid duplicate code.
- Keep JavaScript modular and easy to understand.
- Write clean, responsive CSS.

## Project Requirements

When generating code, ensure that:

- Sudoku puzzles always have a unique solution.
- Difficulty levels (Easy, Medium, Hard) are preserved.
- Prefilled cells remain locked.
- Invalid moves provide immediate visual feedback.
- Hint functionality fills one correct empty cell and locks it.
- The timer starts automatically and stops when the puzzle is solved.
- The leaderboard stores the Top 10 fastest times using browser localStorage.
- Dark mode and responsive design continue to work correctly.
- Existing tests continue to pass after any changes.

## Testing

Before suggesting major refactoring:

- Preserve all existing functionality.
- Ensure compatibility with the existing pytest test suite.
- Prefer incremental improvements over large rewrites.

## General Guidance

Explain significant code changes before implementing them.

Prefer maintainable, readable, production-quality code over overly complex solutions.