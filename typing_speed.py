#!/usr/bin/env python3
"""Terminal-based typing speed tester with WPM and accuracy tracking."""

import time
import random
import sys
import os

WORD_POOL = [
    "the", "be", "to", "of", "and", "a", "in", "that", "have", "it",
    "for", "not", "on", "with", "he", "as", "you", "do", "at", "this",
    "but", "his", "by", "from", "they", "we", "say", "her", "she", "or",
    "an", "will", "my", "one", "all", "would", "there", "their", "what",
    "so", "up", "out", "if", "about", "who", "get", "which", "go", "me",
    "when", "make", "can", "like", "time", "no", "just", "him", "know",
    "take", "people", "into", "year", "your", "good", "some", "could",
    "them", "see", "other", "than", "then", "now", "look", "only", "come",
    "its", "over", "think", "also", "back", "after", "use", "two", "how",
    "our", "work", "first", "well", "way", "even", "new", "want", "because",
    "any", "these", "give", "day", "most", "us", "great", "between", "need",
    "large", "often", "hand", "high", "place", "hold", "turn", "follow",
    "came", "show", "form", "small", "set", "put", "end", "does", "another",
    "run", "long", "big", "down", "side", "number", "off", "always", "move",
    "play", "spell", "air", "away", "animal", "house", "point", "page",
    "letter", "found", "study", "still", "learn", "plant", "cover", "food",
    "sun", "four", "between", "state", "keep", "eye", "never", "last",
]

QUOTES = [
    "The only way to do great work is to love what you do.",
    "In the middle of every difficulty lies opportunity.",
    "It does not matter how slowly you go as long as you do not stop.",
    "Life is what happens when you are busy making other plans.",
    "The future belongs to those who believe in the beauty of their dreams.",
    "Success is not final failure is not fatal it is the courage to continue that counts.",
    "The quick brown fox jumps over the lazy dog near the river bank.",
    "Practice makes perfect and every expert was once a beginner who never gave up.",
    "Code is like humor when you have to explain it it is bad.",
    "First solve the problem then write the code as simply as you can.",
]

DIFFICULTY = {
    "easy":   {"words": 15, "label": "Easy   (15 words)"},
    "medium": {"words": 25, "label": "Medium (25 words)"},
    "hard":   {"words": 40, "label": "Hard   (40 words)"},
    "quote":  {"words":  0, "label": "Quote  (random)"},
}


def clear():
    os.system("cls" if os.name == "nt" else "clear")


def color(text, code):
    return f"\033[{code}m{text}\033[0m"


def green(t):  return color(t, "92")
def red(t):    return color(t, "91")
def yellow(t): return color(t, "93")
def cyan(t):   return color(t, "96")
def bold(t):   return color(t, "1")
def dim(t):    return color(t, "2")


def generate_text(mode: str) -> str:
    if mode == "quote":
        return random.choice(QUOTES)
    n = DIFFICULTY[mode]["words"]
    return " ".join(random.choices(WORD_POOL, k=n))


def calc_wpm(char_count: int, elapsed: float) -> float:
    if elapsed <= 0:
        return 0.0
    return (char_count / 5) / (elapsed / 60)


def calc_accuracy(target: str, typed: str) -> float:
    if not typed:
        return 0.0
    correct = sum(a == b for a, b in zip(target, typed))
    return correct / max(len(target), len(typed)) * 100


def display_comparison(target: str, typed: str):
    """Print target with correct chars in green and wrong in red."""
    result = []
    for i, ch in enumerate(target):
        if i >= len(typed):
            result.append(dim(ch))
        elif typed[i] == ch:
            result.append(green(ch))
        else:
            result.append(red(ch if ch != " " else "·"))
    print("".join(result))


def show_results(target: str, typed: str, elapsed: float, wpm: float):
    clear()
    accuracy = calc_accuracy(target, typed)
    correct_chars = sum(a == b for a, b in zip(target, typed))
    errors = len(typed) - correct_chars

    print(bold("\n  ══════════════════  RESULTS  ══════════════════\n"))
    print(f"  {bold('WPM')}        {cyan(f'{wpm:.1f}')}")
    print(f"  {bold('Accuracy')}   {green(f'{accuracy:.1f}%') if accuracy >= 90 else yellow(f'{accuracy:.1f}%') if accuracy >= 75 else red(f'{accuracy:.1f}%')}")
    print(f"  {bold('Time')}       {elapsed:.2f}s")
    print(f"  {bold('Chars')}      {correct_chars} correct / {red(str(errors)) if errors else green('0')} errors\n")

    print(bold("  Target:"))
    print("  ", end="")
    display_comparison(target, typed)
    print()

    if wpm >= 80:
        grade = green("Expert")
    elif wpm >= 60:
        grade = cyan("Proficient")
    elif wpm >= 40:
        grade = yellow("Intermediate")
    else:
        grade = dim("Beginner")

    print(f"  {bold('Grade')}      {grade}\n")
    print(bold("  ════════════════════════════════════════════════\n"))


def run_test(mode: str):
    target = generate_text(mode)

    clear()
    print(bold("\n  ══════════════  TYPING SPEED TEST  ══════════════\n"))
    print(f"  Mode: {cyan(DIFFICULTY[mode]['label'])}")
    print(f"\n  {bold('Type the text below. Press Enter when done.')}")
    print(f"  {dim('(Ctrl+C to cancel)')}\n")
    print("  " + dim("─" * 60))
    print(f"  {yellow(target)}")
    print("  " + dim("─" * 60))
    print()

    input("  Press Enter to start...")
    print("\033[1A\033[2K", end="")  # erase "press enter" line

    print(f"  {dim('Start typing:')}")
    print("  ", end="", flush=True)

    start = time.perf_counter()
    try:
        typed = input()
    except KeyboardInterrupt:
        print("\n\n  Cancelled.\n")
        return
    elapsed = time.perf_counter() - start

    wpm = calc_wpm(len(typed), elapsed)
    show_results(target, typed, elapsed, wpm)


def menu():
    clear()
    print(bold("\n  ╔══════════════════════════════════════╗"))
    print(bold("  ║       TYPING SPEED TESTER  v1.0      ║"))
    print(bold("  ╚══════════════════════════════════════╝\n"))
    print(f"  {bold('[1]')} {DIFFICULTY['easy']['label']}")
    print(f"  {bold('[2]')} {DIFFICULTY['medium']['label']}")
    print(f"  {bold('[3]')} {DIFFICULTY['hard']['label']}")
    print(f"  {bold('[4]')} {DIFFICULTY['quote']['label']}")
    print(f"  {bold('[q]')} Quit\n")

    choice = input("  Select an option: ").strip().lower()
    return choice


def main():
    mode_map = {"1": "easy", "2": "medium", "3": "hard", "4": "quote"}

    while True:
        choice = menu()
        if choice == "q":
            print("\n  Goodbye!\n")
            break
        elif choice in mode_map:
            run_test(mode_map[choice])
            input("  Press Enter to return to menu...")
        else:
            print(red("\n  Invalid choice. Try again."))
            time.sleep(1)


if __name__ == "__main__":
    main()
