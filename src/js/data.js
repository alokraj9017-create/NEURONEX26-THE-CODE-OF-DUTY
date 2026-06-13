// AuraTutor Course Curriculum Library
// Supports multi-subject queries and natural language keyword mappings

export const SUBJECTS_DB = {
    computer_science: {
        title: "Computer Science",
        icon: "code",
        concepts: {
            bst_intro: {
                id: "bst_intro",
                title: "Binary Search Trees",
                difficulty: "medium",
                explanations: {
                    standard: `A **Binary Search Tree (BST)** is a node-based binary tree data structure where:
* The **left subtree** of a node contains only keys **less than** the parent key.
* The **right subtree** contains only keys **greater than** the parent key.
This structure enables efficient searching, inserting, and deleting in **O(log n)** time.`,
                    simplified: `Imagine a phone book. To search for a name, you open it in the middle. If the name is alphabetically earlier, you look in the left half; if later, you look in the right. 
A BST is this exact system: smaller numbers go **Left**, larger numbers go **Right**.`,
                    advanced: `Mathematically, a BST represents a recursive invariant. For any node $V$, all elements in the left subtree $T_L$ satisfy $\\text{Key}(U) < \\text{Key}(V)$ and all elements in the right subtree $T_R$ satisfy $\\text{Key}(W) > \\text{Key}(V)$. If unbalanced, height degenerates to $O(n)$, else bounded by $O(\\log n)$.`
                },
                question: {
                    text: "If a BST has root node 10, where would you insert a node with value 7?",
                    options: [
                        "In the left subtree of 10",
                        "In the right subtree of 10",
                        "It replaces 10",
                        "A BST cannot contain 7 and 10"
                    ],
                    correctAnswer: 0,
                    hints: ["Compare 7 and 10. Since 7 is smaller, where should it go?", "Smaller values are always directed to the left subtree."],
                    simplifiedVariant: {
                        text: "True or False: In a BST, a node with value 5 is placed to the LEFT of its parent node 12.",
                        options: ["True", "False"],
                        correctAnswer: 0,
                        hints: ["5 is smaller than 12. Does it go left? Yes."]
                    },
                    advancedVariant: {
                        text: "Given a BST with root 10. Left child is 5, right child is 15. If we insert 8, what path does it take?",
                        options: [
                            "10 -> Left (5) -> Right child of 5",
                            "10 -> Right (15) -> Left child of 15",
                            "10 -> Left (5) -> Left child of 5",
                            "Attaches directly to 10"
                        ],
                        correctAnswer: 0,
                        hints: ["Compare 8 to 10 (go left to 5). Compare 8 to 5 (go right)."]
                    }
                }
            },
            recursion: {
                id: "recursion",
                title: "Recursion & Call Stacks",
                difficulty: "medium",
                explanations: {
                    standard: `**Recursion** is a programming technique where a function calls itself to solve a smaller instance of the same problem. 
Every recursive function requires:
1. A **Base Case**: The condition to stop calling itself.
2. A **Recursive Case**: Calling itself with modified arguments moving closer to the base case.`,
                    simplified: `Think of recursion like Russian Nesting Dolls (Matryoshka). To find a tiny prize in the center, you open a doll (recursive step) to find a smaller doll inside. You repeat this until you reach the smallest doll that cannot be opened (the Base Case!).`,
                    advanced: `Recursion relies on the execution stack frame. Each self-call pushes a new frame onto the thread's call stack, storing local variables and return addresses. Without a proper base case, stack allocation exceeds system memory boundaries, causing a Stack Overflow ($O(d)$ auxiliary space, where $d$ is recursion depth).`
                },
                question: {
                    text: "What happens if a recursive function does not have a base case?",
                    options: [
                        "It runs instantly and returns null",
                        "It loops infinitely until a Stack Overflow occurs",
                        "It compiles into a standard while loop",
                        "The compiler refuses to run it"
                    ],
                    correctAnswer: 1,
                    hints: ["Without a base case, there is no stopping condition.", "The function will keep calling itself, piling frames on the call stack until memory runs out."],
                    simplifiedVariant: {
                        text: "True or False: A recursive function is simply a function that calls ITSELF.",
                        options: ["True", "False"],
                        correctAnswer: 0,
                        hints: ["Does a recursive function call itself? Yes, that is the definition."]
                    },
                    advancedVariant: {
                        text: "What is the space complexity of a recursive Fibonacci function calculating Fib(n) recursively without memoization?",
                        options: [
                            "O(n) auxiliary space for stack depth",
                            "O(1) auxiliary space",
                            "O(2^n) auxiliary space",
                            "O(log n) auxiliary space"
                        ],
                        correctAnswer: 0,
                        hints: ["The space complexity is determined by the maximum depth of the call stack recursion tree.", "Max depth of stack is O(n), even though the time complexity is O(2^n)."]
                    }
                }
            },
            databases: {
                id: "databases",
                title: "Relational Databases & SQL",
                difficulty: "easy",
                explanations: {
                    standard: `A **Relational Database** organizes data into tables consisting of rows and columns. We query this data using **SQL (Structured Query Language)**.
Tables are linked using keys:
* **Primary Key**: Uniquely identifies a row in a table.
* **Foreign Key**: A column that references the primary key of another table to create a relationship.`,
                    simplified: `Think of a database like an Excel workbook. Each sheet is a table. If sheet 1 lists Customers with customer IDs, and sheet 2 lists Orders, you can link Orders to Customers using the customer ID. That shared ID links the sheets!`,
                    advanced: `Relational databases enforce **ACID properties** (Atomicity, Consistency, Isolation, Durability) to guarantee transactional integrity. Tabular relations are mathematically modeled on relational algebra. Join operations map Cartesian products filtered by relational key criteria.`
                },
                question: {
                    text: "Which SQL clause is used to filter rows returned by a query based on a condition?",
                    options: [
                        "SELECT",
                        "ORDER BY",
                        "WHERE",
                        "GROUP BY"
                    ],
                    correctAnswer: 2,
                    hints: ["Think of where you specify conditions (e.g. status = 'active').", "The clause starts with W. 'SELECT * FROM users WHERE age > 18'."],
                    simplifiedVariant: {
                        text: "True or False: SQL is the language we use to speak to and retrieve data from databases.",
                        options: ["True", "False"],
                        correctAnswer: 0,
                        hints: ["SQL stands for Structured Query Language. It queries databases."]
                    },
                    advancedVariant: {
                        text: "In database normalization, what does the Third Normal Form (3NF) require?",
                        options: [
                            "No transitive dependencies (all non-key columns depend only on the primary key)",
                            "No partial dependencies on composite keys",
                            "Eliminating duplicate values into columns",
                            "Enforcing relational integrity triggers"
                        ],
                        correctAnswer: 0,
                        hints: ["2NF removes partial dependencies. 3NF removes transitive dependencies.", "In 3NF, columns must depend 'on the key, the whole key, and nothing but the key'."]
                    }
                }
            }
        }
    },
    physics: {
        title: "Physics",
        icon: "bolt",
        concepts: {
            gravity: {
                id: "gravity",
                title: "Gravity & Spacetime",
                difficulty: "easy",
                explanations: {
                    standard: `**Gravity** is the force that pulls objects toward one another.
* **Newtonian view**: Gravity is an attractive force between two masses, proportional to their mass and inversely proportional to the square of the distance between them.
* **Einstein's view (Relativity)**: Gravity is not a force, but the warping/curvature of Spacetime caused by mass and energy.`,
                    simplified: `Imagine a stretched trampoline. If you place a heavy bowling ball in the center, it creates a deep dip. If you roll a marble on the trampoline, it rolls toward the bowling ball. 
That dip is curved spacetime! Mass (like the Earth) curves spacetime, pulling objects (like you) toward it.`,
                    advanced: `Einstein's Field Equations, $G_{\\mu\\nu} + \\Lambda g_{\\mu\\nu} = \\frac{8\\pi G}{c^4} T_{\\mu\\nu}$, dictate how energy-momentum curves the metric tensor of spacetime. Gravity is geodesic motion in pseudo-Riemannian manifolds.`
                },
                question: {
                    text: "According to Einstein's General Relativity, what actually causes gravity?",
                    options: [
                        "Invisible electromagnetic lines of force",
                        "The curvature of spacetime caused by mass and energy",
                        "Centrifugal forces from Earth's rotation",
                        "A constant stream of subatomic particles called gravitons"
                    ],
                    correctAnswer: 1,
                    hints: ["Remember the trampoline analogy.", "Spacetime bends around heavy objects. This bending curves the path of traveling matter."],
                    simplifiedVariant: {
                        text: "True or False: Heavy objects like the Sun curve the fabric of space, pulling lighter objects toward them.",
                        options: ["True", "False"],
                        correctAnswer: 0,
                        hints: ["Yes! Mass curves space, creating the effect we call gravity."]
                    },
                    advancedVariant: {
                        text: "What does the Equivalence Principle in General Relativity state?",
                        options: [
                            "The gravitational mass of an object is equal to its inertial mass (acceleration is indistinguishable from gravity)",
                            "Light and mass experience equal gravitational attraction",
                            "Relativistic speed slows time equally in all frames",
                            "Space and time coordinate values are mathematically equivalent"
                        ],
                        correctAnswer: 0,
                        hints: ["Think of standing in a closed elevator. Can you tell if you are resting on Earth or accelerating in space?", "Local acceleration is completely indistinguishable from a gravitational field."]
                    }
                }
            },
            quantum: {
                id: "quantum",
                title: "Quantum Mechanics",
                difficulty: "hard",
                explanations: {
                    standard: `**Quantum Mechanics** is the branch of physics dealing with the behavior of matter and light at atomic and subatomic scales. Key properties:
* **Wave-Particle Duality**: Particles (like electrons) behave like waves, and waves (like light) behave like particles (photons).
* **Superposition**: A system can exist in multiple states simultaneously until it is observed.`,
                    simplified: `Imagine a spinning coin. While it's spinning, it is both heads AND tails at the same time. Only when you slap your hand down and stop it (make a measurement) does it choose to be heads or tails. 
Subatomic particles do this! They live in many states at once until we observe them.`,
                    advanced: `Quantum systems are represented as state vectors in Hilbert spaces, governed by the Schrödinger Equation: $i\\hbar\\frac{\\partial}{\\partial t}|\\psi(t)\\rangle = \\hat{H}|\\psi(t)\\rangle$. Measurement collapses the wave function probability densities according to Born's Rule.`
                },
                question: {
                    text: "What is Wave-Particle Duality?",
                    options: [
                        "Matter splits into waves and particles when reaching speed of light",
                        "Subatomic entities exhibit properties of both waves and particles",
                        "Gravity waves colliding with light particles",
                        "A quantum computer running two programs"
                    ],
                    correctAnswer: 1,
                    hints: ["Think about light behaving as photons and waves.", "Particles can create interference patterns like waves, and waves can collide like billiard balls (particles)."],
                    simplifiedVariant: {
                        text: "True or False: Quantum particles can exist in multiple options at once until we check on them.",
                        options: ["True", "False"],
                        correctAnswer: 0,
                        hints: ["Yes, this is called quantum superposition (like the spinning coin)."]
                    },
                    advancedVariant: {
                        text: "According to Heisenberg's Uncertainty Principle, what two properties of a particle cannot be measured simultaneously with infinite precision?",
                        options: [
                            "Position and Momentum (Velocity)",
                            "Energy and Charge",
                            "Spin orientation and Mass",
                            "Frequency and Wavelength"
                        ],
                        correctAnswer: 0,
                        hints: ["$\\Delta x \\cdot \\Delta p \\ge \\frac{\\hbar}{2}$.", "The more accurately you measure where a particle is, the less accurately you can know how fast it is moving."]
                    }
                }
            },
            photosynthesis: {
                id: "photosynthesis",
                title: "Photosynthesis",
                difficulty: "easy",
                explanations: {
                    standard: `**Photosynthesis** is the chemical process used by plants, algae, and some bacteria to convert light energy (usually solar) into chemical energy (glucose), using carbon dioxide and water:
$$6\\text{CO}_2 + 6\\text{H}_2\\text{O} + \\text{Light} \\rightarrow \\text{C}_6\\text{H}_{12}\\text{O}_6 + 6\\text{O}_2$$
This process occurs in the cell organelles called **chloroplasts**, which contain the green pigment **chlorophyll**.`,
                    simplified: `Think of a plant cell like a solar-powered kitchen. Water comes from the roots, carbon dioxide from the air. Chlorophyll is the solar panel that traps sunlight, using that electricity to bake water and air into sugar (food) and oxygen (which it breathes out!).`,
                    advanced: `Photosynthesis is divided into light-dependent reactions (photolysis of water in thylakoid membranes, synthesizing ATP and NADPH via Photosystems I and II) and light-independent reactions (the Calvin Cycle in the stroma, fixing CO2 into G3P using RuBisCO).`
                },
                question: {
                    text: "Where do the light-dependent reactions of photosynthesis take place in a plant cell?",
                    options: [
                        "In the Stroma of chloroplasts",
                        "In the Thylakoid membranes of chloroplasts",
                        "In the Mitochondria matrix",
                        "In the Cell Wall pores"
                    ],
                    correctAnswer: 1,
                    hints: ["Light-dependent reactions require chlorophyll, which is packed into stacked disks.", "These stacked disks are called thylakoids. The Calvin Cycle occurs in the surrounding fluid (stroma)."],
                    simplifiedVariant: {
                        text: "True or False: Plants absorb carbon dioxide and release oxygen during photosynthesis.",
                        options: ["True", "False"],
                        correctAnswer: 0,
                        hints: ["Yes! Plants clean the air by absorbing CO2 and giving us oxygen."]
                    },
                    advancedVariant: {
                        text: "Which enzyme is responsible for catalyzing the first major step of carbon fixation in the Calvin Cycle?",
                        options: [
                            "RuBisCO (Ribulose-1,5-bisphosphate carboxylase-oxygenase)",
                            "ATP Synthase",
                            "PEP Carboxylase",
                            "Glucose-6-phosphate dehydrogenase"
                        ],
                        correctAnswer: 0,
                        hints: ["It is widely considered the most abundant enzyme on Earth.", "It fixes gaseous CO2 to RuBP."]
                    }
                }
            }
        }
    },
    mathematics: {
        title: "Mathematics",
        icon: "calculate",
        concepts: {
            calculus: {
                id: "calculus",
                title: "Calculus & Derivatives",
                difficulty: "hard",
                explanations: {
                    standard: `**Calculus** is the mathematical study of continuous change. It has two main branches:
1. **Differential Calculus (Derivatives)**: Measures the rate of change of a quantity. Geometrically, it is the slope of the tangent line to a curve at a point.
2. **Integral Calculus (Integrals)**: Calculates the accumulation of quantities, representing the area under a curve.`,
                    simplified: `Imagine driving a car. Your speedometer shows your speed at this exact second—not your average speed, but your instantaneous rate of change. 
Finding that speed at an exact instant is what a **Derivative** does! An **Integral** does the opposite: it adds up all your speeds over time to find how far you traveled.`,
                    advanced: `The Derivative of a function $f(x)$ is defined as the limit: $f'(x) = \\lim_{h \\to 0} \\frac{f(x+h) - f(x)}{h}$. The Fundamental Theorem of Calculus establishes integration as the inverse operator of differentiation: $\\int_a^b f(x)dx = F(b) - F(a)$ where $F'(x) = f(x)$.`
                },
                question: {
                    text: "Geometrically, what does the Derivative of a function at a point represent?",
                    options: [
                        "The total area under the curve",
                        "The slope of the tangent line to the curve at that point",
                        "The coordinate coordinates of the y-intercept",
                        "The average value of the function over an interval"
                    ],
                    correctAnswer: 1,
                    hints: ["Think of a hillslope. The derivative tells you how steep it is at a single spot.", "The tangent line touches the curve at exactly one point. The derivative is the slope of this line."],
                    simplifiedVariant: {
                        text: "True or False: If a car is accelerating, the derivative of its position over time tells us its speed.",
                        options: ["True", "False"],
                        correctAnswer: 0,
                        hints: ["Yes! Speed is the rate of change of position, which is the derivative."]
                    },
                    advancedVariant: {
                        text: "What is the derivative of f(x) = x * ln(x) with respect to x?",
                        options: [
                            "ln(x) + 1",
                            "1 / x",
                            "ln(x)",
                            "x / ln(x)"
                        ],
                        correctAnswer: 0,
                        hints: ["Use the Product Rule: (u*v)' = u'*v + u*v'.", "u = x (derivative is 1). v = ln(x) (derivative is 1/x). Multiply and add."]
                    }
                }
            },
            algebra: {
                id: "algebra",
                title: "Linear Algebra & Equations",
                difficulty: "easy",
                explanations: {
                    standard: `**Algebra** uses letters (variables) to represent numbers in equations. In a linear equation:
$$y = mx + c$$
* **$y$ and $x$** are variables.
* **$m$** is the slope (the steepness of the line).
* **$c$** is the y-intercept (where the line crosses the vertical axis).`,
                    simplified: `Imagine renting a bike. It costs a flat fee of $5, plus $2 for every hour you ride. 
We can write this as: Cost = 2 * (Hours) + 5. 
In algebra, we write: $y = 2x + 5$. Here, $x$ is hours, and $y$ is cost. The '5' is your starting fee, and '2' is how fast the cost grows!`,
                    advanced: `Algebra generalizes arithmetic using abstract systems like vector spaces and fields. Linear equations represent hyperplanes in multi-dimensional vector systems, solved systematically using Gaussian elimination on matrix transforms.`
                },
                question: {
                    text: "In the equation y = -3x + 8, what is the slope of the line?",
                    options: [
                        "8",
                        "3",
                        "-3",
                        "There is no slope"
                    ],
                    correctAnswer: 2,
                    hints: ["Look at the linear formula: y = mx + c. Which value matches m?", "The slope is the coefficient next to x, which is -3."],
                    simplifiedVariant: {
                        text: "If a taxi charges a flat $10 fee plus $1 per mile, does the flat $10 represent the slope or the starting intercept?",
                        options: ["Slope", "Starting intercept"],
                        correctAnswer: 1,
                        hints: ["The flat fee is paid once at the start (intercept). The mileage charge increases (slope)."]
                    },
                    advancedVariant: {
                        text: "If two linear lines are parallel, what must be true about their equations?",
                        options: [
                            "They have identical slopes (m values)",
                            "They have identical y-intercepts (c values)",
                            "Their slopes are negative reciprocals of each other",
                            "They have no variables in common"
                        ],
                        correctAnswer: 0,
                        hints: ["Parallel lines run in the same direction, meaning they have the same steepness.", "If they have the same steepness, their slopes (m) must be equal."]
                    }
                }
            }
        }
    }
};

// Natural language keywords matching table to map search topics to course content nodes
export const KEYWORDS_MAP = {
    // Computer Science
    bst: { subjectId: "computer_science", conceptId: "bst_intro" },
    tree: { subjectId: "computer_science", conceptId: "bst_intro" },
    search: { subjectId: "computer_science", conceptId: "bst_intro" },
    binary: { subjectId: "computer_science", conceptId: "bst_intro" },
    recursion: { subjectId: "computer_science", conceptId: "recursion" },
    callstack: { subjectId: "computer_science", conceptId: "recursion" },
    stack: { subjectId: "computer_science", conceptId: "recursion" },
    database: { subjectId: "computer_science", conceptId: "databases" },
    sql: { subjectId: "computer_science", conceptId: "databases" },
    query: { subjectId: "computer_science", conceptId: "databases" },
    relation: { subjectId: "computer_science", conceptId: "databases" },
    code: { subjectId: "computer_science", conceptId: "bst_intro" },

    // Physics
    gravity: { subjectId: "physics", conceptId: "gravity" },
    spacetime: { subjectId: "physics", conceptId: "gravity" },
    einstein: { subjectId: "physics", conceptId: "gravity" },
    quantum: { subjectId: "physics", conceptId: "quantum" },
    wave: { subjectId: "physics", conceptId: "quantum" },
    schrodinger: { subjectId: "physics", conceptId: "quantum" },
    heisenberg: { subjectId: "physics", conceptId: "quantum" },
    photosynthesis: { subjectId: "physics", conceptId: "photosynthesis" },
    chlorophyll: { subjectId: "physics", conceptId: "photosynthesis" },
    plant: { subjectId: "physics", conceptId: "photosynthesis" },
    science: { subjectId: "physics", conceptId: "gravity" },

    // Mathematics
    calculus: { subjectId: "mathematics", conceptId: "calculus" },
    derivative: { subjectId: "mathematics", conceptId: "calculus" },
    integral: { subjectId: "mathematics", conceptId: "calculus" },
    algebra: { subjectId: "mathematics", conceptId: "algebra" },
    equation: { subjectId: "mathematics", conceptId: "algebra" },
    linear: { subjectId: "mathematics", conceptId: "algebra" },
    slope: { subjectId: "mathematics", conceptId: "algebra" },
    math: { subjectId: "mathematics", conceptId: "calculus" }
};
