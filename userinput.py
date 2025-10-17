#!/usr/bin/env python3
"""
User Input Script
Run this to provide instructions to the AI assistant.
Usage: python userinput.py
"""

user_input = input("Enter your instructions: ")
print("\n" + "="*50)
print("USER INPUT: Do you need me to go and run the extras you added in database-setup.sql? because i havent setup psql locally to be able to run that and i think i probably need to go do it piecewise in dbeaver to make sure it gets done properly and without errors before this will work properly.")
print("="*50)
print(user_input)
print("="*50)
