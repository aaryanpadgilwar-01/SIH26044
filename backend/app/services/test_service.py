import json
import logging
from datetime import datetime, timezone
from typing import Dict, List, Optional
from sqlalchemy.orm import Session
from backend.app.core.config import settings
from backend.app.models.models import Skill, SkillTest, TestAttempt, UserSkill

logger = logging.getLogger("skillmatrix.test_service")

# Curated fallback questions for core skills in case OpenAI API key is missing or rate limited
CURATED_FALLBACK_QUESTIONS: Dict[str, List[Dict]] = {
    "python": [
        {
            "id": 1,
            "question": "What is the primary difference between a list and a tuple in Python?",
            "options": [
                "Lists are immutable, tuples are mutable",
                "Lists are mutable, tuples are immutable",
                "Lists can only store integers, tuples can store any type",
                "Tuples are dynamically resized while lists are fixed length"
            ],
            "correct_index": 1,
            "explanation": "In Python, lists are mutable (can be changed in-place) while tuples are immutable."
        },
        {
            "id": 2,
            "question": "What does the Python GIL (Global Interpreter Lock) enforce?",
            "options": [
                "Only one thread can execute Python bytecode at a time",
                "Memory allocation is strictly thread-safe across multiple processes",
                "Python cannot run on multi-core processors",
                "Asynchronous event loops cannot perform I/O"
            ],
            "correct_index": 0,
            "explanation": "The GIL ensures that only one native thread executes Python bytecode at once."
        },
        {
            "id": 3,
            "question": "Which of the following creates a generator in Python?",
            "options": [
                "A function containing the 'yield' keyword",
                "A function decorated with @generator",
                "Any list comprehension inside square brackets",
                "A class implementing the __iter__ method only"
            ],
            "correct_index": 0,
            "explanation": "Any function containing the 'yield' statement returns a generator object."
        },
        {
            "id": 4,
            "question": "What is the time complexity of searching for a key in a Python dict on average?",
            "options": ["O(n)", "O(log n)", "O(1)", "O(n log n)"],
            "correct_index": 2,
            "explanation": "Python dictionaries are implemented as hash tables, giving O(1) average lookup time."
        },
        {
            "id": 5,
            "question": "Which decorator in Python is used to define a method that operates on the class itself?",
            "options": ["@staticmethod", "@classmethod", "@property", "@instancemethod"],
            "correct_index": 1,
            "explanation": "@classmethod receives the class object 'cls' as the first implicit argument."
        }
    ],
    "sql": [
        {
            "id": 1,
            "question": "Which SQL clause is used to filter records resulting from an aggregate function like COUNT()?",
            "options": ["WHERE", "HAVING", "GROUP BY", "ORDER BY"],
            "correct_index": 1,
            "explanation": "The HAVING clause was added to SQL because the WHERE keyword cannot be used with aggregate functions."
        },
        {
            "id": 2,
            "question": "What is the main difference between UNION and UNION ALL?",
            "options": [
                "UNION keeps duplicates, UNION ALL removes them",
                "UNION removes duplicate rows, UNION ALL preserves all rows including duplicates",
                "UNION works on different tables, UNION ALL works only on the same table",
                "UNION sorts descending, UNION ALL sorts ascending"
            ],
            "correct_index": 1,
            "explanation": "UNION performs duplicate elimination, whereas UNION ALL simply concatenates result sets."
        },
        {
            "id": 3,
            "question": "What type of index organizes physical data in the order of the indexed column(s)?",
            "options": ["Non-clustered Index", "Clustered Index", "Bitmap Index", "Full-text Index"],
            "correct_index": 1,
            "explanation": "A clustered index determines the physical order of data in the table (one per table)."
        },
        {
            "id": 4,
            "question": "What does the 'ACID' acronym stand for in relational database transactions?",
            "options": [
                "Atomicity, Consistency, Isolation, Durability",
                "Availability, Consistency, Integrity, Durability",
                "Accuracy, Concurrency, Isolation, Distribution",
                "Atomicity, Concurrency, Indexing, Durability"
            ],
            "correct_index": 0,
            "explanation": "ACID properties ensure reliable database transactions: Atomicity, Consistency, Isolation, Durability."
        },
        {
            "id": 5,
            "question": "Which JOIN returns all rows from the left table, and matching rows from the right table?",
            "options": ["INNER JOIN", "FULL OUTER JOIN", "LEFT JOIN (LEFT OUTER JOIN)", "CROSS JOIN"],
            "correct_index": 2,
            "explanation": "LEFT JOIN returns all records from the left table, and matched records from the right table."
        }
    ],
    "data structures": [
        {
            "id": 1,
            "question": "What is the worst-case lookup time in an unbalanced Binary Search Tree (BST)?",
            "options": ["O(1)", "O(log n)", "O(n)", "O(n^2)"],
            "correct_index": 2,
            "explanation": "When an unbalanced BST degenerates into a linked list, lookup degrades to O(n)."
        },
        {
            "id": 2,
            "question": "Which data structure is primarily used to implement Breadth-First Search (BFS)?",
            "options": ["Stack", "Queue", "Priority Queue", "Hash Map"],
            "correct_index": 1,
            "explanation": "BFS uses a FIFO Queue to visit nodes level by level."
        },
        {
            "id": 3,
            "question": "What is the amortized time complexity of an append operation in a dynamic array?",
            "options": ["O(1)", "O(n)", "O(log n)", "O(n log n)"],
            "correct_index": 0,
            "explanation": "While doubling the array capacity takes O(n), amortized over n insertions it is O(1)."
        },
        {
            "id": 4,
            "question": "Which data structure guarantees O(1) push, pop, and finding the minimum element?",
            "options": ["Standard Stack", "Min-Heap", "Min-Stack (with auxiliary stack)", "Deque"],
            "correct_index": 2,
            "explanation": "A Min-Stack maintains an auxiliary stack of minimums for O(1) min retrieval."
        },
        {
            "id": 5,
            "question": "What technique handles hash collisions by chaining colliding elements in a linked list?",
            "options": ["Open Addressing", "Linear Probing", "Separate Chaining", "Double Hashing"],
            "correct_index": 2,
            "explanation": "Separate chaining stores collisions in linked lists associated with each bucket."
        }
    ]
}

def generate_questions_with_openai(skill_name: str) -> Optional[List[Dict]]:
    """
    Calls OpenAI API to generate multiple choice questions for a skill.
    """
    if not settings.OPENAI_API_KEY or len(settings.OPENAI_API_KEY.strip()) < 10:
        return None
        
    try:
        from openai import OpenAI
        client = OpenAI(api_key=settings.OPENAI_API_KEY)
        
        prompt = f"""
        Generate 5 challenging technical multiple-choice questions to verify proficiency in '{skill_name}'.
        Return ONLY valid JSON matching this structure:
        [
          {{
            "id": 1,
            "question": "Question text here?",
            "options": ["Option A", "Option B", "Option C", "Option D"],
            "correct_index": 0,
            "explanation": "Brief technical explanation why option A is correct."
          }}
        ]
        """
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are a senior technical interviewer crafting skill verification assessments. Return JSON array only."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.4,
            max_tokens=1500
        )
        content = response.choices[0].message.content.strip()
        # Clean markdown codeblocks if present
        if content.startswith("```"):
            content = content.split("```")[1]
            if content.startswith("json"):
                content = content[4:].strip()
        data = json.loads(content)
        if isinstance(data, list) and len(data) >= 3:
            return data
    except Exception as e:
        logger.warning(f"OpenAI test generation failed for {skill_name}: {e}")
    return None

def get_or_create_skill_test(db: Session, skill_id: int) -> Optional[SkillTest]:
    """
    Retrieves cached skill test from skill_tests or generates and caches a new one.
    """
    skill = db.query(Skill).filter(Skill.id == skill_id).first()
    if not skill:
        return None
        
    existing_test = db.query(SkillTest).filter(SkillTest.skill_id == skill_id).first()
    if existing_test and existing_test.questions:
        return existing_test
        
    # Attempt OpenAI generation
    questions = generate_questions_with_openai(skill.name)
    
    # Fallback to curated questions or generate standard questions
    if not questions:
        skill_key = skill.name.lower()
        if skill_key in CURATED_FALLBACK_QUESTIONS:
            questions = CURATED_FALLBACK_QUESTIONS[skill_key]
        else:
            # Generic realistic fallback for any skill
            questions = [
                {
                    "id": 1,
                    "question": f"Which core architectural principle is central to effective practice in {skill.name}?",
                    "options": [
                        "High coupling and low cohesion",
                        "Modularity, separation of concerns, and testability",
                        "Monolithic code execution without error boundaries",
                        "Hardcoded configurations inside business logic"
                    ],
                    "correct_index": 1,
                    "explanation": f"In {skill.name}, modularity and clean separation of concerns enable maintainable systems."
                },
                {
                    "id": 2,
                    "question": f"What is the industry best practice for performance optimization in {skill.name}?",
                    "options": [
                        "Premature manual micro-benchmarking without profiling",
                        "Profiling bottlenecks, reducing redundant I/O, and caching hot paths",
                        "Disabling error logging in production environments",
                        "Increasing thread counts arbitrarily without concurrency limits"
                    ],
                    "correct_index": 1,
                    "explanation": "Profiling and targeted caching are standard performance best practices."
                },
                {
                    "id": 3,
                    "question": f"When debugging a critical failure in {skill.name}, which step should be taken first?",
                    "options": [
                        "Restarting production servers blindly",
                        "Inspecting stack traces, telemetry logs, and isolating reproducing conditions",
                        "Modifying random configuration parameters",
                        "Deleting index tables and rebuilding data"
                    ],
                    "correct_index": 1,
                    "explanation": "Root cause analysis starts by analyzing logs, stack traces, and reproducing conditions."
                },
                {
                    "id": 4,
                    "question": f"How is security typically hardened when implementing {skill.name} in enterprise applications?",
                    "options": [
                        "Exposing secrets in public version control repositories",
                        "Applying principle of least privilege, input sanitization, and secure credential storage",
                        "Granting administrative database permissions to all service accounts",
                        "Disabling SSL/TLS certificates on internal endpoints"
                    ],
                    "correct_index": 1,
                    "explanation": "Principle of least privilege and rigorous input validation are foundational security measures."
                },
                {
                    "id": 5,
                    "question": f"Which metric is most critical for evaluating test coverage and reliability in {skill.name}?",
                    "options": [
                        "Line count of test files",
                        "Automated unit, integration, and regression test pass rates under edge cases",
                        "Number of comments written inside source files",
                        "Execution speed regardless of test assertion validity"
                    ],
                    "correct_index": 1,
                    "explanation": "Comprehensive unit, integration, and edge-case testing ensures long-term software quality."
                }
            ]
            
    # Cache into skill_tests table
    skill_test = SkillTest(skill_id=skill.id, questions=questions)
    db.add(skill_test)
    db.commit()
    db.refresh(skill_test)
    return skill_test

def grade_skill_test(db: Session, user_id: int, skill_id: int, answers: Dict[str, int]) -> Dict:
    """
    Grades submitted answers, records test_attempt, and updates user_skill to 'verified' if passed.
    """
    skill_test = db.query(SkillTest).filter(SkillTest.skill_id == skill_id).first()
    if not skill_test or not skill_test.questions:
        raise ValueError("No test available for this skill")
        
    questions = skill_test.questions
    total_count = len(questions)
    correct_count = 0
    
    for q in questions:
        qid = str(q.get("id"))
        user_choice = answers.get(qid)
        if user_choice is not None and user_choice == q.get("correct_index"):
            correct_count += 1
            
    score = (correct_count / total_count) * 100.0 if total_count > 0 else 0.0
    passed = score >= settings.TEST_PASS_THRESHOLD
    
    # Record test attempt
    attempt = TestAttempt(
        user_id=user_id,
        skill_id=skill_id,
        score=score,
        passed=passed,
        verified_at=datetime.now(timezone.utc) if passed else None
    )
    db.add(attempt)
    
    # Update or add UserSkill status
    user_skill = db.query(UserSkill).filter(
        UserSkill.user_id == user_id,
        UserSkill.skill_id == skill_id
    ).first()
    
    if passed:
        if user_skill:
            user_skill.status = "verified"
            user_skill.source = "test"
        else:
            db.add(UserSkill(
                user_id=user_id,
                skill_id=skill_id,
                status="verified",
                source="test"
            ))
            
    db.commit()
    
    skill = db.query(Skill).filter(Skill.id == skill_id).first()
    skill_name = skill.name if skill else f"Skill #{skill_id}"
    
    return {
        "skill_id": skill_id,
        "skill_name": skill_name,
        "score": round(score, 1),
        "passed": passed,
        "threshold": settings.TEST_PASS_THRESHOLD,
        "correct_count": correct_count,
        "total_count": total_count,
        "status": "verified" if passed else (user_skill.status if user_skill else "present"),
        "message": f"Congratulations! You scored {round(score, 1)}% and verified your skill in {skill_name}!" if passed else f"You scored {round(score, 1)}%. A minimum of {int(settings.TEST_PASS_THRESHOLD)}% is required to verify."
    }
