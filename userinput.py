#!/usr/bin/env python3
"""
User Input Script
Run this to provide instructions to the AI assistant.
Usage: python userinput.py
"""

user_input = input("Enter your instructions: The plan you outlined in bugfix_plan_comprehensive.md looks great and the suggested courses of action seems good too. go ahead and proceed with as many phases as you can feasibly do in one go, following the plan outlined in the plan md. You do not need to pause after phase 1 is complete. do as much as you can before features are dependent on previous ones being complete and we should do segmented testing. if that is the case, work around it and continue on all other features that can be completed without needing to test, and then return to me with all that needs testing before moving on. Prompte me for userinput.py whenever you need my feedback.")
print("\n" + "="*50)
print("USER INPUT:")
print("="*50)
print(user_input)
print("="*50)
